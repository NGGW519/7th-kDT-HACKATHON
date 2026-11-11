from typing import Annotated, List, Optional, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    """챗봇 그래프 상태 (요청 1번마다 새로 만든다. 대화 기록은 DB 에서 읽어 messages 로 넣는다)."""
    prompt: str
    messages: Annotated[List[BaseMessage], add_messages]
    user_id: Optional[int]
    work_plan: List[str]          # RoutingAgent 가 정한 작업 순서
    current_task_index: int
    intent: Optional[str]
    intermediate_steps: list      # 장소 검색 결과 등 다음 에이전트에 넘길 정보
    location_info: Optional[dict]
    generation: Optional[str]     # 이번 에이전트가 사용자에게 보여줄 답
