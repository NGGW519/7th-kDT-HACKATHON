from langgraph.graph import StateGraph, END
from .AgentState import AgentState
from .RoutingAgent import run_routing_agent
from .GeneralChatAgent import run_general_chat_agent
from .GeneratePostAgent import run_generate_post_agent
from .GenerateMissionAgent import run_generate_mission_agent
from .DatabaseSearchAgent import run_database_search_agent
from .AnswerGenerationAgent import run_answer_generation_agent

# Define the function that determines which node to route to
def should_continue(state: AgentState):
    return state["intent"]

# Create a new graph
workflow = StateGraph(AgentState)

# Define the nodes
workflow.add_node("RoutingAgent", run_routing_agent)
workflow.add_node("DatabaseSearchAgent", run_database_search_agent)
workflow.add_node("AnswerGenerationAgent", run_answer_generation_agent)
workflow.add_node("GeneralChatAgent", run_general_chat_agent)
workflow.add_node("GeneratePostAgent", run_generate_post_agent)
workflow.add_node("GenerateMissionAgent", run_generate_mission_agent)

# Set the entry point
workflow.set_entry_point("RoutingAgent")

# Add conditional edges from the router
workflow.add_conditional_edges(
    "RoutingAgent",
    should_continue,
    {
        "DatabaseSearchAgent": "DatabaseSearchAgent",
        "GeneralChatAgent": "GeneralChatAgent",
        "GeneratePostAgent": "GeneratePostAgent",
        "GenerateMissionAgent": "GenerateMissionAgent",
    },
)

# Add edges for the rest of the flow
workflow.add_edge("DatabaseSearchAgent", "AnswerGenerationAgent")
workflow.add_edge("AnswerGenerationAgent", END)
workflow.add_edge("GeneralChatAgent", END)
workflow.add_edge("GeneratePostAgent", END)
workflow.add_edge("GenerateMissionAgent", END)

# Compile the graph into a runnable object
app = workflow.compile()