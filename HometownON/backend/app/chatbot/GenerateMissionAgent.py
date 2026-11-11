import logging

from . import AgentSystemPrompt
from .AgentState import AgentState
from . import llm
from .tools.mission_tools import make_mission_tools

logger = logging.getLogger(__name__)


def run_mission_generation_agent(state: AgentState) -> dict:
    """장소를 찾아 미션을 만들고 현재 사용자에게 저장하는 도구 기반 에이전트."""
    index = state.get("current_task_index", 0)
    user_id = state.get("user_id")
    if not user_id:
        return {"generation": "미션을 만들려면 로그인이 필요해요.", "current_task_index": index + 1}

    created: list = []
    try:
        answer = llm.run_tool_agent(
            AgentSystemPrompt.GENERATE_MISSION_PROMPT,
            state.get("messages", []),
            make_mission_tools(user_id, created),
            temperature=0.3,
        )
    except Exception as e:
        logger.warning("mission agent failed: %s", e)
        answer = ""
    if not answer:
        answer = (f"새로운 미션 '{created[-1]['title']}'이 추가되었어요!" if created
                  else "미션을 만드는 중에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.")
    return {"generation": answer, "current_task_index": index + 1}
