from fastapi import APIRouter

from .endpoints import users, chat, weather, locations, missions

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(chat.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(missions.router, prefix="/missions", tags=["Missions"])

