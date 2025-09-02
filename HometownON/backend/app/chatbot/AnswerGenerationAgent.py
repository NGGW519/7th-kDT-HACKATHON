from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings


def run_answer_generation_agent(state: AgentState) -> dict:
    """Synthesizes a final answer based on the context and returns it."""
    print("--- Running Answer Generation Agent ---")

    # �����ϰ� intermediate_steps ��������
    intermediate_steps = state.get("intermediate_steps", [])
    if not isinstance(intermediate_steps, list):
        intermediate_steps = [str(intermediate_steps)]

    context = "\n".join(intermediate_steps)

    # prompt ����
    prompt_text = (
        f"User Question: {state.get('prompt', '')}\n\n"
        f"Database Search Results:\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.ANSWER_GENERATION_PROMPT),
        ("human", prompt_text)
    ])

    # LLM �ʱ�ȭ (streaming ��)
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.OPENAI_API_KEY,
        temperature=0.7,
        streaming=False,
    )

    # chain ����
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

    # Update task index for work plan progression
    current_index = state.get("current_task_index", 0)
    
    return {"generation": final_answer, "current_task_index": current_index + 1}
