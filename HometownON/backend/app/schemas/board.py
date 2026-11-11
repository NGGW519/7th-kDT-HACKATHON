"""자유·의뢰·멘토 게시판 스키마.

세 게시판은 DB 에서 board_posts 테이블 하나를 쓰지만, 앱이 쓰던 요청/응답 형식은 그대로 유지한다.
  - 의뢰(request): budget, location, accepted_by 를 받고, status 는 의뢰 진행 상태(pending/matched/completed/cancelled)
  - 멘토(mentor) : experience, hourly_rate, location 을 받는다
"""
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from .schemas import UserProfile

PostStatus = Literal["active", "hidden", "deleted"]
RequestStatus = Literal["pending", "matched", "completed", "cancelled"]


# ---------------- 작성자 / 댓글 ----------------
class Author(BaseModel):
    id: int
    profile: Optional[UserProfile] = None  # Google 로그인 직후처럼 프로필이 없는 사용자도 있다

    model_config = ConfigDict(from_attributes=True)


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    parent_comment_id: Optional[int] = None


class Comment(BaseModel):
    id: int
    post_id: int
    content: str
    author: Author
    parent_comment_id: Optional[int] = None
    likes_count: int = 0
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- 글 작성 / 수정 ----------------
class _PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=30)

    # 앱이 예산·요금을 숫자로 보내도 문자열로 받는다
    model_config = ConfigDict(coerce_numbers_to_str=True)


class _PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1, max_length=30)

    model_config = ConfigDict(coerce_numbers_to_str=True)


class FreePostCreate(_PostCreate):
    pass


class FreePostUpdate(_PostUpdate):
    status: Optional[PostStatus] = None


class RequestPostCreate(_PostCreate):
    budget: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)


class RequestPostUpdate(_PostUpdate):
    budget: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)
    status: Optional[RequestStatus] = None
    accepted_by: Optional[str] = Field(None, max_length=100)


class MentorPostCreate(_PostCreate):
    experience: Optional[str] = Field(None, max_length=50)
    hourly_rate: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)


class MentorPostUpdate(_PostUpdate):
    experience: Optional[str] = Field(None, max_length=50)
    hourly_rate: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)


# ---------------- 응답 ----------------
class _PostOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    author: Author
    likes_count: int = 0
    comments_count: int = 0
    created_at: datetime
    updated_at: datetime
    comments: List[Comment] = []

    model_config = ConfigDict(from_attributes=True, coerce_numbers_to_str=True)


class FreePost(_PostOut):
    status: str


class RequestPost(_PostOut):
    budget: Optional[str] = None
    location: Optional[str] = None
    accepted_by: Optional[str] = None
    views: int = 0
    # 의뢰 게시판의 status 는 글 공개 상태가 아니라 의뢰 진행 상태다
    status: str = Field(validation_alias="match_status")


class MentorPost(_PostOut):
    experience: Optional[str] = None
    hourly_rate: Optional[str] = None
    location: Optional[str] = None
    views: int = 0
    status: str
