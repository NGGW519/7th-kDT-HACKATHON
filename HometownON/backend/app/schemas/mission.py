from typing import Optional
from pydantic import BaseModel

class MissionBase(BaseModel):
    code: str
    title: str
    mission_type: str
    difficulty: str
    expected_minutes: int
    tags: Optional[str] = None
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None
    status: Optional[str] = "active"

class MissionCreate(MissionBase):
    pass

class Mission(MissionBase):
    id: int

    class Config:
        orm_mode = True
