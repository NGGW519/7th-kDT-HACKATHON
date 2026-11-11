"""미션 생성 에이전트의 도구.

도구는 요청마다 make_mission_tools(user_id) 로 만든다. 사용자 정보는 서버가 넣으므로
LLM 이 다른 사용자 이름으로 미션을 만들 수 없다.
"""
import logging
from typing import Optional

from langchain_core.tools import tool
from pydantic import BaseModel, Field

from ...core.database import SessionLocal
from ...crud import crud_mission
from ...crud.location import find_random_location
from .. import llm

logger = logging.getLogger(__name__)

# 실제 DB 의 장소 분류 (Crawling_Haman/Step_1 이 넣는 소분류)
_KEYWORD_CATEGORIES = [
    (("아파", "병원", "의원", "치료", "진료", "약"), "병원/의원"),
    (("배고", "밥", "음식", "식사", "맛집", "먹", "식당"), "맛집"),
    (("커피", "카페", "음료", "차 한"), "카페"),
    (("경로당", "노인", "어르신"), "경로당"),
    (("마을회관", "모임", "마을"), "마을회관"),
]


class MissionDraft(BaseModel):
    """A mission for a person settling back in Haman."""
    title: str = Field(..., description="Korean title. MUST start with the exact place name followed by ', '")
    description: str = Field(..., description="Detailed Korean instructions for the mission")
    mission_type: str = Field(..., description="One of: exploration, bonding, career")
    difficulty: int = Field(..., description="1 (easy) to 3 (hard)")
    expected_minutes: int = Field(..., description="Estimated minutes")
    tags: list[str] = Field(default_factory=list, description="Korean keywords")


class CategoryInput(BaseModel):
    user_prompt: str = Field(description="The user's original request, e.g. '배고파', '아파요'")


class LocationSearchInput(BaseModel):
    category: str = Field(description="Place category: 맛집, 카페, 병원/의원, 경로당, 마을회관")
    region: Optional[str] = Field(None, description="Optional region such as 가야읍")


class MissionCreatorInput(BaseModel):
    location_info: dict = Field(description="The full result of search_location_by_category_tool")
    user_prompt: str = Field(description="The user's original request")


def pick_category(user_prompt: str) -> str:
    for keywords, category in _KEYWORD_CATEGORIES:
        if any(k in user_prompt for k in keywords):
            return category
    return "카페"  # 특별한 단서가 없으면 부담 없는 장소


def make_mission_tools(user_id: int, created: list | None = None):
    """created 리스트를 넘기면 저장한 미션 정보를 거기에 모은다 (테스트/응답용)."""

    @tool("find_location_category_tool", args_schema=CategoryInput)
    def find_location_category_tool(user_prompt: str) -> str:
        """Pick the place category that fits the user's request."""
        return pick_category(user_prompt)

    @tool("search_location_by_category_tool", args_schema=LocationSearchInput)
    def search_location_by_category_tool(category: str, region: Optional[str] = None) -> dict:
        """Find a random real place in Haman for the category."""
        with SessionLocal() as db:
            location = find_random_location(db, category, region) or find_random_location(db, category)
        if location is None:
            return {"error": f"'{category}' 장소를 찾지 못했습니다. 다른 카테고리를 시도하세요."}
        return {k: location.get(k) for k in ("id", "name", "address", "phone", "latitude", "longitude", "category")}

    @tool("create_mission_and_save_tool", args_schema=MissionCreatorInput)
    def create_mission_and_save_tool(location_info: dict, user_prompt: str) -> str:
        """Write a mission for the place and save it for the current user."""
        if not location_info.get("name") or not location_info.get("address"):
            return "Error: location_info must contain name and address from search_location_by_category_tool."
        try:
            draft = llm.get_structured_llm(MissionDraft, temperature=0.7).invoke([
                ("system", "You write warm, practical missions in Korean for people who moved back to their hometown Haman."),
                ("human", f"User request: {user_prompt}\nPlace: {location_info['name']} ({location_info['address']})\n"
                          f"The title must start with '{location_info['name']}, '."),
            ])
        except Exception as e:
            logger.warning("mission draft failed: %s", e)
            return f"Error: failed to write the mission ({e})"

        data = draft.model_dump()
        if not data["title"].startswith(location_info["name"]):
            data["title"] = f"{location_info['name']}, {data['title']}"  # 앱이 제목 앞부분으로 장소를 찾는다
        with SessionLocal() as db:
            assignment = crud_mission.create_mission_from_chatbot(db, user_id, {**data, "location": location_info})
        if assignment is None:
            return "Error: could not save the mission."
        if created is not None:
            created.append({"mission_id": assignment.mission_id, **data})
        return f"새로운 미션 '{data['title']}'이 추가되었어요! 미션 목록에서 확인해 보세요."

    return [find_location_category_tool, search_location_by_category_tool, create_mission_and_save_tool]
