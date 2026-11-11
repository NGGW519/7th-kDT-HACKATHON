import logging

from langchain_core.messages import SystemMessage

from . import AgentSystemPrompt
from .AgentState import AgentState
from . import llm
from .tools.post_tools import make_post_tools

logger = logging.getLogger(__name__)


def run_generate_post_agent(state: AgentState) -> dict:
    """대화 내용을 바탕으로 자유게시판 글을 써서 현재 사용자 이름으로 저장한다."""
    index = state.get("current_task_index", 0)
    user_id = state.get("user_id")
    if not user_id:
        return {"generation": "게시글을 올리려면 로그인이 필요해요.", "current_task_index": index + 1}

    messages = list(state.get("messages", []))
    if state.get("intermediate_steps"):  # 앞서 찾은 장소 정보 등을 글에 쓸 수 있게 전달
        messages.append(SystemMessage(content="참고 정보:\n" + "\n".join(map(str, state["intermediate_steps"]))))

    created: list = []
    try:
        answer = llm.run_tool_agent(
            AgentSystemPrompt.GENERATE_POST_PROMPT, messages, make_post_tools(user_id, created), temperature=0.7
        )
    except Exception as e:
        logger.warning("post agent failed: %s", e)
        answer = ""
    if created and (not answer or created[-1]["title"] not in answer):
        answer = (answer + "\n\n" if answer else "") + f"✅ 게시글 '{created[-1]['title']}'을 자유게시판에 올렸어요."
    if not answer:
        answer = "게시글을 올리는 중에 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
    return {"generation": answer, "current_task_index": index + 1}
