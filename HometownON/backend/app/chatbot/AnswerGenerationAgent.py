from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings

def run_answer_generation_agent(state: AgentState) -> dict:
    """Synthesizes a final answer based on the context and returns it."""
    print("--- Running Answer Generation Agent ---")
    context = "\n".join(state["intermediate_steps"])
    prompt_text = f"User Question: {state['prompt']}\n\nDatabase Search Results:\n{context}"
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.ANSWER_GENERATION_PROMPT),
        ("human", prompt_text)
    ])
    
    # Streaming is disabled to return a dict
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0.7, streaming=False)
    chain = prompt | llm
    
    response = chain.invoke({"prompt": state["prompt"], "intermediate_steps": state["intermediate_steps"]})
    final_answer = response.content
    
    print(f"--- Answer Generation complete. Response: ---")
    print(final_answer)

    return {"generation": final_answer}