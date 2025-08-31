from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings

async def run_general_chat_agent(state: AgentState) -> dict:
    """Generates a response for general conversation and streams it token by token."""
    print("--- Running General Chat Agent ---")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.GENERAL_CHAT_PROMPT),
        MessagesPlaceholder(variable_name="messages"),
        ("human", "{prompt}")
    ])
    
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0.7, streaming=True)
    
    chain = prompt | llm
    
    # Invoke the LLM to get the full AI message, which might contain tool calls
    # Extract the latest human message as the current prompt
    current_prompt = state["messages"][-1].content if isinstance(state["messages"][-1], HumanMessage) else state["messages"][-1][1]

    # Pass the full message history and the current prompt to the chain
    print("--- Before ainvoke ---")
    ai_message = await chain.ainvoke({"messages": state["messages"], "prompt": current_prompt})
    print("--- After ainvoke ---")
    return {"messages": [ai_message]}

    # The graph state needs the full message object
    # We'll update the state after the stream is complete in the main endpoint
    # For now, let's just signal completion.
    # In a more complex graph, you might save the full response here.