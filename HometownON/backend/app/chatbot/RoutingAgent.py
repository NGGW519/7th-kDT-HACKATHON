from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings

# This defines the structured output format for our router.
class RouteQuery(BaseModel):
    """Routes the user's request to the appropriate agent."""
    intent: str = Field(..., description="The user's intent. One of [DatabaseSearchAgent, GeneralChatAgent, GeneratePostAgent, GenerateMissionAgent]")

def run_routing_agent(state: AgentState) -> dict:
    """Determines the user's intent and the next agent to route to."""
    print("--- Running Routing Agent ---")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.ROUTING_PROMPT),
        ("human", state["prompt"])
    ])
    
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
    
    # Use structured output to force the LLM to choose a route
    structured_llm = llm.with_structured_output(RouteQuery)
    
    try:
        route = structured_llm.invoke(prompt.format_prompt(prompt=state["prompt"]).to_messages())
        print(f"Routing decision: {route.intent}")
        return {"intent": route.intent}
    except Exception as e:
        print(f"Error during routing: {e}")
        # Default to general chat on error
        return {"intent": "GeneralChatAgent"}