from . import AgentSystemPrompt
from .AgentState import AgentState
from . import llm


def generate_answer(prompt: str, intermediate_steps: list) -> str:
    """검색 결과(intermediate_steps)를 바탕으로 사용자 질문에 답한다."""
    context = "\n".join(map(str, intermediate_steps or []))
    response = llm.get_chat_llm(temperature=0.5).invoke([
        ("system", AgentSystemPrompt.ANSWER_GENERATION_PROMPT),
        ("human", f"User Question: {prompt}\n\nDatabase Search Results:\n{context}"),
    ])
    return response.content


def run_answer_generation_agent(state: AgentState) -> dict:
    try:
        answer = generate_answer(state.get("prompt", ""), state.get("intermediate_steps", []))
    except Exception:
        answer = "검색 결과를 정리하는 중에 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
    return {"generation": answer, "current_task_index": state.get("current_task_index", 0) + 1}
