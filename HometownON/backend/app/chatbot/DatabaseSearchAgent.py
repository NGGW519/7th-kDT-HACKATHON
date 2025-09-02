from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from pydantic import BaseModel, Field
from typing import Optional

from ..core.database import SessionLocal
from ..models import models
from .AgentState import AgentState
from ..core.config import settings
from langchain_core.prompts import ChatPromptTemplate
from . import AgentSystemPrompt
from langchain_openai import ChatOpenAI

class LocationQuery(BaseModel):
    """Structured data extracted from the user's prompt for location search."""
    category: str = Field(..., description="The category of the location, e.g., 병원, 음식점, 공원, 카페, 문화/관광.")
    region: Optional[str] = Field(None, description="The geographical region to search in, e.g., 함안, 서울.")

def run_database_search_agent(state: AgentState) -> dict:
    """Extracts location query from prompt using an LLM and searches the database."""
    print("--- Running Database Search Agent (LLM-Powered) ---")
    user_prompt = state["prompt"]

    # 1. Use LLM to extract structured query from prompt
    extractor_prompt = ChatPromptTemplate.from_messages([
        ("system", AgentSystemPrompt.DATABASE_SEARCH_PROMPT),
        ("human", "{prompt}")
    ])
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
    structured_llm = llm.with_structured_output(LocationQuery)

    try:
        query = structured_llm.invoke({"prompt": user_prompt})
        print(f"LLM extracted query: Category='{query.category}', Region='{query.region}'")
    except Exception as e:
        print(f"LLM extraction failed: {e}")
        current_index = state.get("current_task_index", 0)
        return {"intermediate_steps": ["위치 정보를 파악하는 데 실패했어요. 좀 더 명확하게 말씀해 주시겠어요?"], "current_task_index": current_index + 1}

    # 2. Search the database with the extracted query
    db = SessionLocal()
    try:
        db_query = db.query(models.Location).join(models.LocationCategory).filter(models.LocationCategory.main == query.category)
        
        if query.region:
            db_query = db_query.filter(models.Location.address.like(f"%{query.region}%"))
            
        random_location = db_query.order_by(func.rand()).first()

        if random_location:
            location_info = {
                "name": random_location.name,
                "address": random_location.address,
                "latitude": random_location.geom.y,
                "longitude": random_location.geom.x,
                "category": query.category
            }
            print(f"Found location: {location_info['name']}")
            current_index = state.get("current_task_index", 0)
            return {
                "intermediate_steps": [f"Found {query.category}: {location_info['name']}"],
                "location_info": location_info,
                "current_task_index": current_index + 1
            }
        else:
            current_index = state.get("current_task_index", 0)
            return {"intermediate_steps": [f"'{query.region or '어떤 지역'}'에서 '{query.category}' 카테고리에 해당하는 장소를 찾지 못했어요. 다른 지역이나 카테고리를 시도해 보시겠어요?"], "current_task_index": current_index + 1}

    finally:
        db.close()
