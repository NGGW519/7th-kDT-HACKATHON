from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings

# This defines the structured output format for our router.
class WorkPlan(BaseModel):
    """Creates a work plan to handle the user's request."""
    tasks: list[str] = Field(..., description="""List of tasks to execute in order. Each task is one of ["GeneralChat", "GeneratePost", "GenerateMission", "DatabaseSearch"]""")
    reasoning: str = Field(..., description="Brief explanation of why these tasks were chosen")

def run_routing_agent(state: AgentState) -> dict:
    """Determines the user's intent and the next agent to route to."""
    print("--- Running Routing Agent ---")
    
    # Get chat history for context
    messages = state.get("messages", [])
    chat_context = ""
    
    # Include last few messages for context
    if len(messages) > 1:
        recent_messages = messages[-3:]  # Last 3 messages for context
        context_parts = []
        for msg in recent_messages[:-1]:  # Exclude current message
            if hasattr(msg, 'content'):
                role = "사용자" if hasattr(msg, '__class__') and "Human" in str(msg.__class__) else "어시스턴트"
                context_parts.append(f"{role}: {msg.content}")
        
        if context_parts:
            chat_context = f"\n\n이전 대화:\n" + "\n".join(context_parts) + "\n\n현재 요청: "
    
    full_prompt = chat_context + state["prompt"]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.ROUTING_PROMPT),
        ("human", full_prompt)
    ])
    
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0, timeout=30)
    
    # Use structured output to get a work plan
    structured_llm = llm.with_structured_output(WorkPlan)
    
    try:
        print("Invoking LLM for routing...")
        work_plan = structured_llm.invoke(prompt.format_prompt(prompt=full_prompt).to_messages())
        print(f"Work plan received: {work_plan.tasks} - {work_plan.reasoning}")
        return {
            "work_plan": work_plan.tasks,
            "current_task_index": 0,
            "intent": work_plan.tasks[0] if work_plan.tasks else "GeneralChat"
        }
    except Exception as e:
        print(f"Error during routing: {e}")
        import traceback
        traceback.print_exc()
        # Default to general chat on error
        return {"work_plan": ["GeneralChat"], "current_task_index": 0, "intent": "GeneralChat"}