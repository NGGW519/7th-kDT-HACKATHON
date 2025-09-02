from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from pydantic import BaseModel, Field
from typing import Optional

from ..core.database import SessionLocal
from ..models import models
from .AgentState import AgentState
from ..core.config import settings
from langchain_core.prompts import ChatPromptTemplate
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
        ("system", 
         """You are an expert at extracting location information from user requests. 
         Your goal is to identify the most relevant location category and an optional region from the user's prompt. 
         
         Here are the valid categories you can extract:
         - '병원' (for health-related requests like 'sick', 'hospital', 'pharmacy')
         - '음식점' (for food-related requests like 'hungry', 'restaurant', 'delicious food')
         - '공원' (for outdoor/leisure requests like 'bored', 'park', 'walk')
         - '카페' (for coffee/cafe-related requests)
         - '문화/관광' (for cultural or tourist attractions like 'museum', 'gallery', 'historical site', 'tour')
         
         If the user's request implies a need for a specific type of place, map it to one of these categories. 
         If no clear category is implied, try to infer the most suitable one. 
         If a region is mentioned (e.g., '함안', '서울'), extract it. Otherwise, leave it null.
         
         Respond with a JSON object containing 'category' and 'region'.
         Example 1: User: "나 아픈데 미션 만들어줘" -> {"category": "병원", "region": null}
         Example 2: User: "함안에 맛있는 식당 추천해줘" -> {"category": "음식점", "region": "함안"}
         Example 3: User: "심심한데 갈만한 공원 있어?" -> {"category": "공원", "region": null}
         Example 4: User: "오늘 날씨 어때?" -> (This intent should not reach here, but if it does, infer a general category like '공원' or '문화/관광')
         """),
        ("human", "{prompt}")
    ])
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
    structured_llm = llm.with_structured_output(LocationQuery)

    try:
        query = structured_llm.invoke({"prompt": user_prompt})
        print(f"LLM extracted query: Category='{query.category}', Region='{query.region}'")
    except Exception as e:
        print(f"LLM extraction failed: {e}")
        return {"intermediate_steps": ["위치 정보를 파악하는 데 실패했어요. 좀 더 명확하게 말씀해 주시겠어요?"]}

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
            return {
                "intermediate_steps": [f"Found {query.category}: {location_info['name']}"],
                "location_info": location_info
            }
        else:
            return {"intermediate_steps": [f"'{query.region or '어떤 지역'}'에서 '{query.category}' 카테고리에 해당하는 장소를 찾지 못했어요. 다른 지역이나 카테고리를 시도해 보시겠어요?"]}

    finally:
        db.close()
