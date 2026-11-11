"""챗봇 에이전트 그래프.

RoutingAgent 가 작업 순서(work_plan)를 정하면 각 에이전트가 차례로 실행된다.
대화 기록은 DB(chat_messages)에 저장하므로 그래프 체크포인터(메모리 저장)는 쓰지 않는다.
"""
from langgraph.graph import END, StateGraph

from .AgentState import AgentState
from .DatabaseSearchAgent import run_database_search_agent
from .GeneralChatAgent import run_general_chat_agent
from .GenerateMissionAgent import run_mission_generation_agent
from .GeneratePostAgent import run_generate_post_agent
from .RoutingAgent import run_routing_agent

NODES = {
    "GeneralChat": ("GeneralChatAgent", run_general_chat_agent),
    "GeneratePost": ("GeneratePostAgent", run_generate_post_agent),
    "GenerateMission": ("MissionGenerationAgent", run_mission_generation_agent),
    "DatabaseSearch": ("DatabaseSearchAgent", run_database_search_agent),
}


def next_task(state: AgentState) -> str:
    plan = state.get("work_plan", [])
    index = state.get("current_task_index", 0)
    return plan[index] if index < len(plan) else "END"


workflow = StateGraph(AgentState)
workflow.add_node("RoutingAgent", run_routing_agent)
for node_name, fn in NODES.values():
    workflow.add_node(node_name, fn)
workflow.set_entry_point("RoutingAgent")

routes = {task: node_name for task, (node_name, _) in NODES.items()} | {"END": END}
for source in ["RoutingAgent", *(node_name for node_name, _ in NODES.values())]:
    workflow.add_conditional_edges(source, next_task, routes)

app = workflow.compile()
