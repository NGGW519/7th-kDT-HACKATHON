from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .core.database import engine
from .models import models
from .api.api import api_router

# The following line is commented out for debugging DB connection issues.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HometownON API",
    description="API for the HometownON project, supporting 귀향자 정착.",
    version="0.1.0"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be a list of allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the HometownON API"}

app.include_router(api_router, prefix="/api")