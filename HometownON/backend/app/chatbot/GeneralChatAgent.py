from langchain_core.messages import AIMessage, SystemMessage

from . import AgentSystemPrompt
from .AgentState import AgentState
from . import llm


async def run_general_chat_agent(state: AgentState) -> dict:
    """일반 대화. 대화 기록(messages)의 마지막이 현재 사용자 질문이다."""
    messages = [SystemMessage(content=AgentSystemPrompt.GENERAL_CHAT_PROMPT), *state.get("messages", [])]
    # 앞선 에이전트(장소 검색 등)가 찾은 정보가 있으면 참고하게 한다
    if state.get("intermediate_steps"):
        messages.append(SystemMessage(content="참고 정보:\n" + "\n".join(map(str, state["intermediate_steps"]))))
    ai = await llm.get_chat_llm(temperature=0.7).ainvoke(messages)
    return {
        "messages": [AIMessage(content=ai.content)],
        "generation": ai.content,
        "current_task_index": state.get("current_task_index", 0) + 1,
    }
