from langgraph.graph import StateGraph, END
from .AgentState import AgentState
from .RoutingAgent import run_routing_agent
from .GeneralChatAgent import run_general_chat_agent
from .GeneratePostAgent import run_generate_post_agent
# Import the new tool-based agent function
from .GenerateMissionAgent import run_mission_generation_agent 
from .AnswerGenerationAgent import run_answer_generation_agent
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()

# The router now simply determines the initial intent.
def should_continue(state: AgentState):
    # The intent is now a simple string, not a node name.
    if state.get("intent") == "GenerateMission":
        return "MissionGenerationAgent"
    elif state.get("intent") == "GeneratePost":
        return "GeneratePostAgent"
    # Any other database search can go to a generic answer agent if needed
    elif state.get("intent") == "DatabaseSearch":
        return "AnswerGenerationAgent" 
    else:
        return "GeneralChatAgent"

workflow = StateGraph(AgentState)

# Define the nodes
workflow.add_node("RoutingAgent", run_routing_agent)
workflow.add_node("GeneralChatAgent", run_general_chat_agent)
workflow.add_node("GeneratePostAgent", run_generate_post_agent)
# The new, powerful, tool-based agent for missions
workflow.add_node("MissionGenerationAgent", run_mission_generation_agent)
# This agent can handle generic DB searches that don't result in missions
workflow.add_node("AnswerGenerationAgent", run_answer_generation_agent)

# Set the entry point
workflow.set_entry_point("RoutingAgent")

# Add conditional edges from the router
workflow.add_conditional_edges(
    "RoutingAgent",
    should_continue,
    {
        "MissionGenerationAgent": "MissionGenerationAgent",
        "GeneratePostAgent": "GeneratePostAgent",
        "AnswerGenerationAgent": "AnswerGenerationAgent",
        "GeneralChatAgent": "GeneralChatAgent",
    },
)

# All agents now lead directly to the end of the graph
workflow.add_edge("MissionGenerationAgent", END)
workflow.add_edge("GeneratePostAgent", END)
workflow.add_edge("AnswerGenerationAgent", END)
workflow.add_edge("GeneralChatAgent", END)

# Compile the graph
app = workflow.compile(checkpointer=memory)