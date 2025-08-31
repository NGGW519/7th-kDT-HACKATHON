from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings

async def run_answer_generation_agent(state: AgentState):
    """Synthesizes a final answer and streams it token by token."""
    print("--- Running Answer Generation Agent ---")
    context = "\n".join(state["intermediate_steps"])
    prompt_text = f"User Question: {state['prompt']}\n\nDatabase Search Results:\n{context}"
    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.ANSWER_GENERATION_PROMPT),
        ("human", prompt_text)
    ])
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0.7, streaming=True)
    chain = prompt | llm
    async for chunk in chain.astream({"prompt": state["prompt"], "intermediate_steps": state["intermediate_steps"]}):
        yield chunk.content