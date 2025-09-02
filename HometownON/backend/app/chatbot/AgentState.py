from typing import TypedDict, List, Optional, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    Represents the state of our agent graph.
    """
    prompt: str
    messages: Annotated[List[BaseMessage], add_messages]
    intent: Optional[str]
    intermediate_steps: list
    generation: Optional[str]
    user_id: Optional[int]
    token: Optional[str]