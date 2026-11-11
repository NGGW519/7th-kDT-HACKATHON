from fastapi import APIRouter

from .endpoints import board, chat, locations, missions, users, weather

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(chat.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(missions.router, prefix="/missions", tags=["Missions"])
# 자유·의뢰·멘토 게시판: 같은 코드, 같은 테이블(board_posts)을 board_type 으로 구분
api_router.include_router(board.free_router, prefix="/board", tags=["Board"])
api_router.include_router(board.request_router, prefix="/requests", tags=["Requests"])
api_router.include_router(board.mentor_router, prefix="/mentors", tags=["Mentors"])
