from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from .schemas import UserProfile

class MentorPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: str = Field(..., max_length=50)
    experience: Optional[str] = Field(None, max_length=50)
    hourly_rate: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)

class MentorPostCreate(MentorPostBase):
    pass

class MentorPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, max_length=50)
    experience: Optional[str] = Field(None, max_length=50)
    hourly_rate: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)

class Author(BaseModel):
    id: int
    profile: UserProfile

    class Config:
        from_attributes = True

class MentorPost(MentorPostBase):
    id: int
    author: Author
    likes_count: int
    comments_count: int
    views: int
    status: str
    created_at: datetime
    updated_at: datetime
    comments: List['MentorComment'] = []

    class Config:
        from_attributes = True

class MentorCommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class MentorCommentCreate(MentorCommentBase):
    post_id: int
    parent_comment_id: Optional[int] = None

class MentorCommentCreateApi(MentorCommentBase):
    parent_comment_id: Optional[int] = None

class MentorComment(MentorCommentBase):
    id: int
    author: Author
    post_id: int
    created_at: datetime
    updated_at: datetime
    likes_count: int
    status: str
    parent_comment_id: Optional[int] = None

    class Config:
        from_attributes = True