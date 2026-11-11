import logging
from typing import Literal

from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field

from . import AgentSystemPrompt
from .AgentState import AgentState
from . import llm

logger = logging.getLogger(__name__)

TASKS = ("GeneralChat", "GeneratePost", "GenerateMission", "DatabaseSearch")


class WorkPlan(BaseModel):
    """Creates a work plan to handle the user's request."""
    tasks: list[Literal["GeneralChat", "GeneratePost", "GenerateMission", "DatabaseSearch"]] = Field(
        ..., description="Tasks to execute in order (1 to 3 items)")
    reasoning: str = Field(..., description="Brief explanation of why these tasks were chosen")


def run_routing_agent(state: AgentState) -> dict:
    """사용자 요청을 보고 실행할 작업 순서(work_plan)를 정한다."""
    # 최근 대화 2개를 함께 보여 '그 게시글 올려줘' 같은 요청을 이해하게 한다
    recent = [m for m in state.get("messages", [])][-3:-1]
    context = "\n".join(
        f"{'사용자' if isinstance(m, HumanMessage) else '어시스턴트'}: {m.content}" for m in recent
    )
    request = (f"이전 대화:\n{context}\n\n현재 요청: " if context else "") + state["prompt"]

    try:
        plan = llm.get_structured_llm(WorkPlan).invoke(
            [("system", AgentSystemPrompt.ROUTING_PROMPT), ("human", request)]
        )
        tasks = [t for t in plan.tasks if t in TASKS][:3] or ["GeneralChat"]
        logger.info("work plan %s (%s)", tasks, plan.reasoning)
    except Exception as e:
        logger.warning("routing failed, falling back to GeneralChat: %s", e)
        tasks = ["GeneralChat"]
    return {"work_plan": tasks, "current_task_index": 0, "intent": tasks[0]}
