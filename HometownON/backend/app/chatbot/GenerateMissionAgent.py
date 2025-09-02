from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session
import json

from .AgentState import AgentState
from . import AgentSystemPrompt
from ..core.config import settings
from ..core.database import SessionLocal
from ..crud import crud_mission


def run_generate_and_save_mission_agent(state: AgentState):
    """Generates a mission, saves it to the DB, and returns a confirmation."""
    print("--- Running Generate and Save Mission Agent ---")

    location_info = state.get("location_info")

    if location_info:
        category = location_info.get("category", "place")
        name = location_info.get("name", "the location")
        prompt_text = f"Create a fun and engaging mission to visit the {category} '{name}'. Suggest a simple activity to do there. For example, if it's a cafe, suggest trying a signature drink."
        print(f"Generating mission with location: {name} (Category: {category})")
    else:
        print("No location info found, skipping mission generation.")
        return { "mission_saved": False, "generation": "어떤 장소에 대한 미션을 만들어 드릴까요? 구체적인 장소나 종류를 알려주세요." }

    prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.GENERATE_MISSION_PROMPT),
        ("human", "{prompt}")
    ])
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0.7, streaming=False)
    chain = prompt | llm
    
    response = chain.invoke({"prompt": prompt_text})
    mission_json_str = response.content

    print(f"--- Mission generation complete. Response: ---")
    print(mission_json_str)

    try:
        mission_data = json.loads(mission_json_str)
    except json.JSONDecodeError:
        print("Failed to decode mission JSON from LLM response.")
        return { "mission_saved": False, "generation": "미션을 만들다가 오류가 발생했어요. 다시 시도해 주세요." }

    user_id = 1 
    db = SessionLocal()
    try:
        assignment = crud_mission.create_mission_from_chatbot(db, user_id, mission_data)
        if assignment:
            print(f"Mission assigned with ID: {assignment.id}")
            final_response = f"새로운 미션 '{mission_data.get('title')}'이 추가되었어요! 지금 확인해 보세요."
            return { "mission_saved": True, "assignment_id": assignment.id, "generation": final_response }
        else:
            return { "mission_saved": False, "generation": "미션을 데이터베이스에 저장하는 데 실패했어요." }
    finally:
        db.close()