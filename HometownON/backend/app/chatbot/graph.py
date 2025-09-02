from langgraph.graph import StateGraph, END
from .AgentState import AgentState
from .RoutingAgent import run_routing_agent
from .GeneralChatAgent import run_general_chat_agent
from .GeneratePostAgent import run_generate_post_agent
# The agent function has been renamed
from .GenerateMissionAgent import run_generate_and_save_mission_agent 
from .DatabaseSearchAgent import run_database_search_agent
from .AnswerGenerationAgent import run_answer_generation_agent
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()

def should_continue(state: AgentState):
    return state["intent"]

def decide_after_db_search(state: AgentState):
    if state.get("location_info"):
        # Route to the unified agent
        return "GenerateAndSaveMissionAgent"
    else:
        return "AnswerGenerationAgent"

workflow = StateGraph(AgentState)

# Define the nodes
workflow.add_node("RoutingAgent", run_routing_agent)
workflow.add_node("DatabaseSearchAgent", run_database_search_agent)
workflow.add_node("AnswerGenerationAgent", run_answer_generation_agent)
workflow.add_node("GeneralChatAgent", run_general_chat_agent)
workflow.add_node("GeneratePostAgent", run_generate_post_agent)
# Rename the node for clarity and use the new function
workflow.add_node("GenerateAndSaveMissionAgent", run_generate_and_save_mission_agent)

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
        # Point to the DB search agent for mission-related queries
        "GenerateMissionAgent": "DatabaseSearchAgent", 
    },
)

# Conditional edge after database search
workflow.add_conditional_edges(
    "DatabaseSearchAgent",
    decide_after_db_search,
    {
        "GenerateAndSaveMissionAgent": "GenerateAndSaveMissionAgent",
        "AnswerGenerationAgent": "AnswerGenerationAgent",
    }
)

# Edges for the rest of the flow
workflow.add_edge("AnswerGenerationAgent", END)
workflow.add_edge("GeneralChatAgent", END)
workflow.add_edge("GeneratePostAgent", END)
# The unified agent now directly ends the flow
workflow.add_edge("GenerateAndSaveMissionAgent", END)

# Compile the graph
app = workflow.compile(checkpointer=memory)