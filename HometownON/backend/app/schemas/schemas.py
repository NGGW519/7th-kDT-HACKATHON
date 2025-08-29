
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime, date
import enum

# =======================================
# Base Schemas & Common Schemas
# =======================================

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# =======================================
# 1. User Management Schemas
# =======================================

class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileBase(BaseModel):
    display_name: str
    birth_year: int
    gender: Optional[str] = None
    home_region: str
    target_region: str
    bio: Optional[str] = None
    mentor_available: bool = False
    mentor_hourly_rate: Optional[int] = None
    preferences: Optional[dict] = None
    profile_image: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    birth_year: Optional[int] = None
    gender: Optional[str] = None
    home_region: Optional[str] = None
    target_region: Optional[str] = None
    bio: Optional[str] = None
    mentor_available: Optional[bool] = None
    mentor_hourly_rate: Optional[int] = None
    preferences: Optional[dict] = None
    profile_image: Optional[str] = None

class UserProfile(UserProfileBase):
    user_id: int

    class Config:
        from_attributes = True

class UserWithProfile(User):
    profile: Optional[UserProfile] = None


# =======================================
# 2. Mission Schemas
# =======================================

class MissionBase(BaseModel):
    title: str
    mission_type: str
    difficulty: int
    expected_minutes: Optional[int] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None

class Mission(MissionBase):
    id: int
    code: str

    class Config:
        from_attributes = True

class MissionAssignmentBase(BaseModel):
    user_id: int
    mission_id: int
    status: str = 'assigned'
    due_date: Optional[date] = None

class MissionAssignment(MissionAssignmentBase):
    id: int
    assigned_at: datetime
    mission: Mission # Include mission details

    class Config:
        from_attributes = True

# ... (We can add more schemas as we build the APIs)
