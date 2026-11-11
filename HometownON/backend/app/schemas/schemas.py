from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

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

class UserProfileFields(BaseModel):
    """프로필 칸 목록(검증 없음). 응답용 UserProfile 이 상속한다.

    응답은 DB 에 이미 있는 값을 그대로 보여 줘야 하므로 여기에는 입력 검증을 넣지 않는다.
    (검증을 넣으면 규칙 이전에 저장된 값 때문에 GET /me, 게시판 목록이 500 이 난다)
    """
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

class UserProfileUpdate(BaseModel):
    """PATCH /api/users/me/profile 요청. 모든 칸 선택, 보낸 칸만 바꾼다(exclude_unset).

    길이 제한은 DB 컬럼 크기와 같다(넘으면 DB 오류로 500 이 나므로 422 로 먼저 막는다).
    null 을 보내면 그 칸을 비운다. 단 display_name, mentor_available 은 비울 수 없다(422).
    preferences 는 통째로 바뀐다(키 단위 병합 아님).
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    display_name: Optional[str] = Field(None, min_length=1, max_length=80)
    birth_year: Optional[int] = None
    gender: Optional[Literal["male", "female", "other"]] = None
    home_region: Optional[str] = Field(None, max_length=120)
    target_region: Optional[str] = Field(None, max_length=120)
    bio: Optional[str] = None
    mentor_available: Optional[bool] = None
    mentor_hourly_rate: Optional[int] = Field(None, ge=0, le=2_147_483_647)  # INTEGER 범위
    preferences: Optional[dict] = None
    profile_image: Optional[str] = Field(None, max_length=500)

    @field_validator("display_name", "mentor_available")
    @classmethod
    def _not_null(cls, value):
        # 기본값(None)에는 실행되지 않고, 요청에 null 을 직접 보냈을 때만 실행된다
        if value is None:
            raise ValueError("이 값은 비울 수 없습니다")
        return value

    @field_validator("birth_year")
    @classmethod
    def _birth_year_range(cls, value):
        this_year = date.today().year
        if value is not None and not 1900 <= value <= this_year:
            raise ValueError(f"출생연도는 1900~{this_year} 사이여야 합니다")
        return value

class UserProfile(UserProfileFields):
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

