import logging
from typing import Optional

from pydantic import BaseModel, Field

from ..core.database import SessionLocal
from ..crud.location import find_random_location
from . import AgentSystemPrompt
from .AgentState import AgentState
from .AnswerGenerationAgent import generate_answer
from . import llm

logger = logging.getLogger(__name__)


class LocationQuery(BaseModel):
    """Structured data extracted from the user's prompt for location search."""
    category: str = Field(..., description="One of: 맛집, 카페, 병원/의원, 경로당, 마을회관")
    region: Optional[str] = Field(None, description="Region mentioned by the user, e.g. 가야읍, 함안. null if none.")


def run_database_search_agent(state: AgentState) -> dict:
    """요청에서 장소 종류/지역을 뽑아 DB(PostGIS)에서 장소를 찾는다."""
    index = state.get("current_task_index", 0)
    is_last_task = index + 1 >= len(state.get("work_plan", []))

    try:
        query = llm.get_structured_llm(LocationQuery).invoke(
            [("system", AgentSystemPrompt.DATABASE_SEARCH_PROMPT), ("human", state["prompt"])]
        )
    except Exception as e:
        logger.warning("location query extraction failed: %s", e)
        return {"generation": "어떤 장소를 찾으시는지 조금 더 자세히 말씀해 주시겠어요?", "current_task_index": index + 1}

    with SessionLocal() as db:
        location = find_random_location(db, query.category, query.region)
        if location is None and query.region:  # 지역을 빼고 다시 찾기
            location = find_random_location(db, query.category)

    if location is None:
        step = f"'{query.region or '함안'}'에서 '{query.category}' 장소를 찾지 못했어요."
        update = {"intermediate_steps": [step], "current_task_index": index + 1}
    else:
        step = (f"{location['category']}: {location['name']} (주소: {location['address']}"
                + (f", 전화: {location['phone']}" if location.get("phone") else "") + ")")
        update = {"intermediate_steps": [step], "location_info": location, "current_task_index": index + 1}

    # 이 검색이 마지막 작업이면 검색 결과로 바로 답한다 (다음 작업이 있으면 그 에이전트가 결과를 이어서 쓴다)
    if is_last_task:
        try:
            update["generation"] = generate_answer(state["prompt"], update["intermediate_steps"])
        except Exception:
            update["generation"] = update["intermediate_steps"][0]
    return update
