from fastapi import APIRouter

from fastapi import APIRouter

from .endpoints import users, chat

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(chat.router, prefix="/chatbot", tags=["Chatbot"])

