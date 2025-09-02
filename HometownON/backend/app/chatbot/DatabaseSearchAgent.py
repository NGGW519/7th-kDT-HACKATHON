from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from ..core.database import SessionLocal
from ..models import models
from .AgentState import AgentState
import re

def get_location_categories(db: Session):
    """Fetches all main location categories from the database."""
    return [category.main for category in db.query(models.LocationCategory.main).distinct().all()]

def get_random_location_by_category(db: Session, category: str):
    """Gets a random location for a given category from the database."""
    return db.query(models.Location).join(models.LocationCategory).filter(models.LocationCategory.main == category).order_by(func.rand()).first()

def run_database_search_agent(state: AgentState) -> dict:
    """Searches the database based on the user's prompt to find a location."""
    print("--- Running Database Search Agent ---")
    
    db = SessionLocal()
    try:
        user_prompt = state["prompt"]
        all_categories = get_location_categories(db)

        # Find which category is mentioned in the prompt
        found_category = None
        for category in all_categories:
            if re.search(rf'\b{re.escape(category)}\b', user_prompt):
                found_category = category
                break

        if found_category:
            print(f"Category '{found_category}' found in prompt.")
            random_location = get_random_location_by_category(db, found_category)
            
            if random_location:
                location_info = {
                    "name": random_location.name,
                    "address": random_location.address,
                    "latitude": random_location.geom.y,
                    "longitude": random_location.geom.x,
                    "category": found_category
                }
                print(f"Found location: {location_info['name']}")
                return {
                    "intermediate_steps": [f"Found {found_category}: {location_info['name']}"],
                    "location_info": location_info
                }
            else:
                return {"intermediate_steps": [f"No locations found for category '{found_category}'."]}
        else:
            # If no specific category is mentioned, simulate a general search.
            print(f"No specific location category found. Simulating general search for: {user_prompt}")
            simulated_result = f"Found general information about '{user_prompt}': It is a great place to visit in Haman."
            return {
                "intermediate_steps": [simulated_result]
            }

    finally:
        db.close()
