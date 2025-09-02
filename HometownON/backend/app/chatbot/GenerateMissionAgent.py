from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_openai_tools_agent

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings
from .tools.mission_tools import (
    find_location_category_tool,
    search_location_by_category_tool,
    create_mission_and_save_tool
)


def run_mission_generation_agent(state: AgentState) -> dict:
    """Runs a tool-based agent to autonomously create and save a mission."""
    print("--- Running Mission Generation Tool-Based Agent ---")

    prompt = state["prompt"]
    tools = [
        find_location_category_tool, 
        search_location_by_category_tool, 
        create_mission_and_save_tool
    ]
    
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0.7)

    # System prompt to guide the agent
    agent_prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.GENERATE_MISSION_PROMPT),
        MessagesPlaceholder(variable_name="messages"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    # Create the agent
    agent = create_openai_tools_agent(llm, tools, agent_prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    # Invoke the agent to get the final result
    response = agent_executor.invoke({
        "messages": state["messages"],
        "prompt": prompt
    })

    # The final confirmation message is in the 'output' key
    final_response = response.get("output", "An unexpected error occurred.")
    print(f"--- Mission Generation Agent finished. Final Response: {final_response} ---")

    # Update task index for work plan progression
    current_index = state.get("current_task_index", 0)
    
    return {
        "generation": final_response, 
        "current_task_index": current_index + 1
    }