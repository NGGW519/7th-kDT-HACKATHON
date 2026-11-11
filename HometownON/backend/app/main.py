from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .api.api import api_router
from .core.config import settings
from .core.database import engine
from .models import models


@asynccontextmanager
async def lifespan(_: FastAPI):
    # 테이블이 없으면 생성 (import 시점이 아닌 서버 시작 시점에 실행)
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HometownON API",
    description="API for the HometownON project, supporting 귀향자 정착.",
    version="0.1.0",
    lifespan=lifespan,
)

origins = settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # "*" 와 credentials 를 함께 허용하는 것은 CORS 규격 위반이므로 특정 출처일 때만 허용
    allow_credentials=origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-Id"],
)


@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the HometownON API"}


@app.get("/health", tags=["Root"])
async def health():
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")
