from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Enum for mission status
from enum import Enum as PyEnum

class MissionStatus(PyEnum):
    TODAY = "today"
    LOCKED = "locked"
    COMPLETED = "completed"

class MissionBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str # Changed from content
    difficulty: int
    mission_type: str = Field(..., max_length=50) # Changed from category
    status: MissionStatus = MissionStatus.TODAY # Default status
    created_by_user_id: Optional[int] = None

class MissionCreate(MissionBase):
    pass

class MissionUpdateStatus(BaseModel):
    status: MissionStatus

class Mission(MissionBase):
    id: int

    class Config:
        orm_mode = True
