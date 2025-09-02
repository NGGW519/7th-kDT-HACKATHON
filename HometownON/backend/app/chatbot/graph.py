from langgraph.graph import StateGraph, END
from .AgentState import AgentState
from .RoutingAgent import run_routing_agent
from .GeneralChatAgent import run_general_chat_agent
from .GeneratePostAgent import run_generate_post_agent
# Import the new tool-based agent function
from .GenerateMissionAgent import run_mission_generation_agent 
from .AnswerGenerationAgent import run_answer_generation_agent
from .DatabaseSearchAgent import run_database_search_agent
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
        return "DatabaseSearchAgent" 
    else:
        return "GeneralChatAgent"

# Check what the next task should be based on the work plan
def get_next_task(state: AgentState):
    """Get the next task from the work plan"""
    work_plan = state.get("work_plan", [])
    current_index = state.get("current_task_index", 0)
    
    print(f"Current state: work_plan={work_plan}, current_index={current_index}")
    
    # The current_index should already be the next task index after agent completion
    if current_index < len(work_plan):
        next_task = work_plan[current_index]
        print(f"Next task: {next_task} (index {current_index})")
        return next_task
    else:
        print("All tasks completed")
        return "END"

workflow = StateGraph(AgentState)

# Define the nodes
workflow.add_node("RoutingAgent", run_routing_agent)
workflow.add_node("GeneralChatAgent", run_general_chat_agent)
workflow.add_node("GeneratePostAgent", run_generate_post_agent)
# The new, powerful, tool-based agent for missions
workflow.add_node("MissionGenerationAgent", run_mission_generation_agent)
# This agent can handle generic DB searches that don't result in missions
workflow.add_node("AnswerGenerationAgent", run_answer_generation_agent)
# Database search agent for location/information queries
workflow.add_node("DatabaseSearchAgent", run_database_search_agent)

# Set the entry point
workflow.set_entry_point("RoutingAgent")

# Add conditional edges from the router
workflow.add_conditional_edges(
    "RoutingAgent",
    should_continue,
    {
        "MissionGenerationAgent": "MissionGenerationAgent",
        "GeneratePostAgent": "GeneratePostAgent",
        "DatabaseSearchAgent": "DatabaseSearchAgent",
        "AnswerGenerationAgent": "AnswerGenerationAgent",
        "GeneralChatAgent": "GeneralChatAgent",
    },
)

# Add conditional edges for all agents to check for next tasks
for agent in ["MissionGenerationAgent", "GeneratePostAgent", "DatabaseSearchAgent", "AnswerGenerationAgent", "GeneralChatAgent"]:
    workflow.add_conditional_edges(
        agent,
        get_next_task,
        {
            "GenerateMission": "MissionGenerationAgent",
            "GeneratePost": "GeneratePostAgent", 
            "DatabaseSearch": "DatabaseSearchAgent",
            "GeneralChat": "GeneralChatAgent",
            "END": END,
        },
    )

# Compile the graph
app = workflow.compile(checkpointer=memory)