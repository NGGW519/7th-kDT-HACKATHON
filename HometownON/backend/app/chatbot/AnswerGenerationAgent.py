from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings


def run_answer_generation_agent(state: AgentState) -> dict:
    """Synthesizes a final answer based on the context and returns it."""
    print("--- Running Answer Generation Agent ---")

    # 안전하게 intermediate_steps 가져오기
    intermediate_steps = state.get("intermediate_steps", [])
    if not isinstance(intermediate_steps, list):
        intermediate_steps = [str(intermediate_steps)]

    context = "\n".join(intermediate_steps)

    # prompt 구성
    prompt_text = (
        f"User Question: {state.get('prompt', '')}\n\n"
        f"Database Search Results:\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.ANSWER_GENERATION_PROMPT),
        ("human", prompt_text)
    ])

    # LLM 초기화 (streaming 끔)
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.OPENAI_API_KEY,
        temperature=0.7,
        streaming=False,
    )

    # chain 실행
    try:
        response = (prompt | llm).invoke({
            "prompt": state.get("prompt", ""),
            "intermediate_steps": intermediate_steps
        })
        final_answer = response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        print(f"[ERROR] Answer generation failed: {e}")
        final_answer = "An error occurred during answer generation."

    print("--- Answer Generation complete. Response: ---")
    print(final_answer)

    return {"generation": final_answer}
