from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings

async def run_generate_post_agent(state: AgentState):
    """Generates a post and streams it token by token."""
    print("--- Running Generate Post Agent ---")
    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.GENERATE_POST_PROMPT),
        ("human", "{prompt}")
    ])
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0.7, streaming=True)
    chain = prompt | llm
    async for chunk in chain.astream({"prompt": state["prompt"]}):
        yield chunk.content