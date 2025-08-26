from fastapi import FastAPI

app = FastAPI(title="HometownON API", version="0.1.0")

# 라우터 임포트는 여기에 추가됩니다.
# from .api.endpoints import users, missions
# app.include_router(users.router, prefix="/api/v1", tags=["Users"])
# app.include_router(missions.router, prefix="/api/v1", tags=["Missions"])

@app.get("/", tags=["Root"])
async def read_root():
    """
    API 서버의 상태를 확인하는 기본 엔드포인트입니다.
    """
    return {"message": "Welcome to the HometownON API!"}

