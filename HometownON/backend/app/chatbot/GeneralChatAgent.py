from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings


async def run_general_chat_agent(state: AgentState) -> AgentState:
    """Generates a response for general conversation and appends it to the session memory."""

    print("--- Running General Chat Agent ---")

    # Prepare the prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.GENERAL_CHAT_PROMPT),
        MessagesPlaceholder(variable_name="messages"),
        ("human", "{prompt}")
    ])

    # Initialize the LLM
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.OPENAI_API_KEY,
        temperature=0.7,
        streaming=True
    )

    # Chain the prompt and LLM
    chain = prompt | llm

    # Find the last human message
    last_human_message = next(
        (msg for msg in reversed(state["messages"]) if isinstance(msg, HumanMessage)),
        None
    )
    if not last_human_message:
        raise ValueError("No human message found in state for prompt.")

    # Use the last human message as the current prompt
    current_prompt = last_human_message.content

    ai_message = await chain.ainvoke({"messages": state["messages"], "prompt": current_prompt})

    # ai_message가 문자열인지, AIMessage인지 확인
    # Append AIMessage to state and update generation
    if isinstance(ai_message, str):
        ai_msg_obj = AIMessage(content=ai_message)
    elif isinstance(ai_message, AIMessage):
        ai_msg_obj = ai_message
    else:
        raise ValueError(f"Unexpected type from chain: {type(ai_message)}")

    state["messages"].append(ai_msg_obj)
    state["generation"] = ai_msg_obj.content
    
    # Update task index for work plan progression
    current_index = state.get("current_task_index", 0)
    state["current_task_index"] = current_index + 1

    return state