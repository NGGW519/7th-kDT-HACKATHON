from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

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
    password: str = Field(min_length=6, max_length=128)  # 프론트 회원가입 규칙(6자 이상)과 동일

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


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

class UserProfile(UserProfileUpdate):
    """응답용 프로필. Google 로그인 직후처럼 이름만 있는 프로필도 있어 모든 값이 비어 있을 수 있다."""
    user_id: int
    mentor_available: bool = False

    model_config = ConfigDict(from_attributes=True)

class UserWithProfile(User):
    profile: Optional[UserProfile] = None

class UserSignupRequest(UserCreate):
    profile: UserProfileCreate


class GoogleLoginRequest(BaseModel):
    id_token: str = Field(min_length=1)


# =======================================
# 2. Chatbot Schemas
# =======================================

class ChatRequest(BaseModel):
    session_id: Optional[int] = None
    message: str = Field(min_length=1, max_length=2000)

class ChatMessage(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatSession(BaseModel):
    id: int
    user_id: Optional[int] = None
    started_at: datetime

    model_config = ConfigDict(from_attributes=True)

