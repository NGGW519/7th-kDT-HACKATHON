from .AgentState import AgentState

def run_database_search_agent(state: AgentState) -> dict:
    """Searches the database based on the user's prompt."""
    print("--- Running Database Search Agent ---")
    
    user_prompt = state["prompt"]
    
    # In a real implementation, you would have logic to:
    # 1. Parse the user's prompt to extract entities (e.g., location, topic).
    # 2. Decide whether to query the SQL or Vector DB.
    # 3. Call the appropriate DB and get results.
    
    # For now, we'll simulate a search result.
    print(f"Simulating DB search for: {user_prompt}")
    simulated_result = f"Found information about '{user_prompt}': It is a great place to visit in Haman."
    
    return {
        "intermediate_steps": [simulated_result]  # Store results
    }
