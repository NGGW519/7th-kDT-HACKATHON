from fastapi import FastAPI

# 실제 API 로직을 담을 앱
api_app = FastAPI(
    title="HometownON API", 
    version="0.1.0",
    docs_url="/docs", # API 문서 경로
    redoc_url="/redoc" # 다른 스타일의 API 문서
)

@api_app.get("/", tags=["Root"])
async def read_api_root():
    """API의 루트. 서비스 활성화 상태를 나타냅니다."""
    return {"message": "Welcome to the HometownON API!"}

# 라우터 임포트는 여기에 추가됩니다.
from app.api.endpoints import chat
# from .api.endpoints import users, missions
# api_app.include_router(users.router, prefix="/v1", tags=["Users"])
# api_app.include_router(missions.router, prefix="/v1", tags=["Missions"])
api_app.include_router(chat.router, prefix="/v1", tags=["Chat"])


# 전체 프로젝트의 진입점이 될 최상위 앱
app = FastAPI()

# /api 경로에 위에서 만든 api_app을 연결합니다.
app.mount("/api", api_app)

