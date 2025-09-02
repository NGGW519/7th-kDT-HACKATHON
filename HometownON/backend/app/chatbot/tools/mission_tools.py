from langchain_core.tools import tool
from sqlalchemy.sql.expression import func
from pydantic import BaseModel, Field
import json

# Use absolute imports from the project root
from ...core.database import SessionLocal
from ...models import models
from ...crud import crud_mission
from ...core.config import settings
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI


# --- Tool 1: Find Location Category --- #
class CategoryFinderInput(BaseModel):
    user_prompt: str = Field(description="The user's original request, e.g., 'I'm sick', 'I'm hungry'.")


@tool("find_location_category_tool", args_schema=CategoryFinderInput)
def find_location_category_tool(user_prompt: str) -> str:
    """Analyzes the user's prompt to determine the relevant location category like 'hospital', 'restaurant', or 'park'."""
    # 간단한 키워드 매핑 먼저 시도
    if any(word in user_prompt for word in ["아파", "병원", "의원", "치료", "진료"]):
        return "병원/의원"
    elif any(word in user_prompt for word in ["배고", "밥", "음식", "식사", "맛집", "먹"]):
        return "맛집"
    elif any(word in user_prompt for word in ["커피", "카페", "음료"]):
        return "카페"
    elif any(word in user_prompt for word in ["경로당", "노인"]):
        return "경로당"
    elif any(word in user_prompt for word in ["마을회관", "모임"]):
        return "마을회관"

    # 키워드 매핑 실패시 LLM 사용
    mapper_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that maps user needs to location categories. Respond with a single Korean keyword that exactly matches a 'main' or 'sub' category in our database. Available categories: 병원/의원, 맛집, 카페, 경로당, 마을회관. Choose the most appropriate one."),
        ("human", "User need: {prompt}")
    ])
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
    chain = mapper_prompt | llm
    response = chain.invoke({"prompt": user_prompt})
    category_keyword = response.content.strip()
    print(f"[Tool] Mapped prompt '{user_prompt}' to category: {category_keyword}")
    return category_keyword


# --- Tool 2: Search Location by Category --- #
class LocationSearchInput(BaseModel):
    category: str = Field(description="The location category to search for. This should be a Korean keyword that exactly matches a 'main' or 'sub' category in the LocationCategory table, e.g., '병원/의원', '맛집', '카페', '경로당', '마을회관'.")


@tool("search_location_by_category_tool", args_schema=LocationSearchInput)
def search_location_by_category_tool(category: str) -> dict:
    """Searches the database for a random location matching the given category."""
    print(f"[Tool] Searching for a location in category: {category}")
    db = SessionLocal()
    try:
        # Find the category ID from the LocationCategory table
        location_category = db.query(models.LocationCategory).filter(
            (models.LocationCategory.main == category) |
            (models.LocationCategory.sub == category)
        ).first()

        if not location_category:
            print(f"[Tool] Category '{category}' not found in LocationCategory table.")
            return {"error": f"Category '{category}' is not a valid location type in our database."}

        # Use the found category ID to search in the Location table
        print(f"[Tool] Querying locations with category_id: {location_category.id}")
        location = db.query(models.Location).filter(
            models.Location.category_id == location_category.id
        ).order_by(func.rand()).first()

        if location:
            if not location.geom:
                return {"error": f"Found location '{location.name}' but it has invalid or missing geometry data."}

            try:
                from geoalchemy2 import functions as geo_func
                coords = db.execute(
                    db.query(
                        geo_func.ST_Y(location.geom).label('lat'),
                        geo_func.ST_X(location.geom).label('lng')
                    ).filter(models.Location.id == location.id)
                ).first()

                if coords:
                    latitude = coords.lng  # Swapped
                    longitude = coords.lat # Swapped
                else:
                    # geom 객체에서 직접 추출
                    if hasattr(location.geom, 'data'):
                        from geoalchemy2.shape import to_shape
                        point = to_shape(location.geom)
                        latitude = point.y
                        longitude = point.x
                    else:
                        return {"error": f"Could not extract coordinates for location '{location.name}'"}
            except Exception as e:
                return {"error": f"Could not parse coordinates for location '{location.name}': {str(e)}"}

            result = {
                "id": location.id,
                "name": location.name,
                "address": location.address,
                "phone": location.phone,
                "latitude": latitude,
                "longitude": longitude,
                "category": location_category.main
            }
            print(f"[Tool] Found location: {result['name']} with Lat: {latitude}, Lng: {longitude}")
            return result
        else:
            return {"error": f"No locations found for category '{category}'."}
    except Exception as e:
        print(f"[Tool] Database error: {e}")
        return {"error": f"Database error occurred: {str(e)}"}
    finally:
        db.close()


# --- Tool 3: Create and Save Mission --- #
class MissionCreatorInput(BaseModel):
    location_info: dict = Field(description="A dictionary containing the location's name, address, and coordinates.")
    user_prompt: str = Field(description="The user's original request to provide context.")


@tool("create_mission_and_save_tool", args_schema=MissionCreatorInput)
def create_mission_and_save_tool(location_info: dict, user_prompt: str) -> str:
    """Creates a mission based on location info and user context, saves it to the database, and returns a confirmation message."""
    print(f"[Tool] Creating mission for location: {location_info.get('name')}")

    # 입력 데이터 검증
    required_fields = ['name', 'address', 'latitude', 'longitude']
    if not all(field in location_info for field in required_fields):
        return "Error: Missing required location information."

    mission_gen_prompt_template = ChatPromptTemplate.from_template(
        """Based on the user's request ('{user_prompt}') and the chosen location ('{location_name}' at '{location_address}'), create a mission. 
        The mission should be a JSON object with the following keys:
        - 'title': A creative and empathetic title for the mission. **Crucially, the title MUST start with the exact location name (e.g., '{location_name}'), followed by ", ", and then a creative and empathetic mission description generated by you.**
        - 'description': A detailed instruction for the mission.
        - 'icon': A single emoji representing the mission.
        - 'mission_type': One of 'exploration', 'bonding', or 'career'.
        - 'difficulty': An integer from 1 (easy) to 3 (hard).
        - 'expected_minutes': An integer representing the estimated time in minutes.
        - 'tags': A comma-separated string of keywords.
        - 'thumbnail_image': A URL for a relevant thumbnail.
        - 'status': Always 'today' for new missions.
        
        All text in the JSON object, including title, description, and tags, MUST be in Korean.
        Respond ONLY with the JSON object, no markdown, no extra text.
        """
    )
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0.7)
    chain = mission_gen_prompt_template | llm

    try:
        response = chain.invoke({
            "user_prompt": user_prompt,
            "location_name": location_info["name"],
            "location_address": location_info["address"]
        })

        # Log raw content for debugging
        print(f"[Tool] Raw LLM response content: {response.content}")

        # Robustly extract JSON, handling markdown fences
        content = response.content.strip()
        if content.startswith("```json") and content.endswith("```"):
            json_str = content[len("```json"): -len("```")].strip()
        else:
            json_str = content
            
        mission_details = json.loads(json_str)

        # 필수 필드 확인
        required_keys = ['title', 'description', 'icon', 'mission_type', 'difficulty',
                         'expected_minutes', 'tags', 'thumbnail_image', 'status']
        if not all(key in mission_details for key in required_keys):
            missing = [key for key in required_keys if key not in mission_details]
            return f"Error: Generated mission is missing fields: {', '.join(missing)}."

    except json.JSONDecodeError:
        return "Error: Failed to generate valid mission details. Ensure response is JSON."
    except Exception as e:
        return f"Error: Failed to generate mission: {str(e)}"

    full_mission_data = {**location_info, **mission_details}

    user_id = 1  # Placeholder
    db = SessionLocal()
    try:
        assignment = crud_mission.create_mission_from_chatbot(db, user_id, full_mission_data)
        if assignment:
            confirmation_message = f"새로운 미션 '{mission_details.get('title')}'이 추가되었어요! 지금 확인해 보세요."
            print(f"[Tool] Mission saved. Assignment ID: {assignment.id}")
            return confirmation_message
        else:
            return "Error: Could not save the mission to the database."
    except Exception as e:
        print(f"[Tool] Database error while saving mission: {e}")
        return f"Error: Database error occurred while saving mission: {str(e)}"
    finally:
        db.close()
