from typing import TypedDict, List, Optional, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    Represents the state of our agent graph.

    Attributes:
        messages: The list of messages that have been exchanged.
        next_node: The next node to route to.
    """
    # 사용자로부터 받은 최신 입력
    prompt: str

    # 전체 대화 기록 (LangGraph에 의해 관리됨)
    messages: Annotated[List[BaseMessage], add_messages]

    # 라우팅 결과
    intent: Optional[str]

    # 각 도구 실행 후 중간 결과물
    intermediate_steps: list
    
    # 최종 생성된 답변
    generation: Optional[str]