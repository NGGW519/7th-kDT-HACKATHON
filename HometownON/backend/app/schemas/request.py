from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from .schemas import UserProfile

class RequestPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: str = Field(..., max_length=50)
    budget: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)

class RequestPostCreate(RequestPostBase):
    pass

class RequestPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, max_length=50)
    budget: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=120)
    status: Optional[str] = Field(None, max_length=20)
    accepted_by: Optional[str] = Field(None, max_length=100)

class Author(BaseModel):
    id: int
    profile: UserProfile

    class Config:
        from_attributes = True

class RequestPost(RequestPostBase):
    id: int
    author: Author
    status: str
    accepted_by: Optional[str]
    likes_count: int
    comments_count: int
    views: int
    created_at: datetime
    updated_at: datetime
    comments: List['RequestComment'] = []

    class Config:
        from_attributes = True

class RequestCommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class RequestCommentCreate(RequestCommentBase):
    post_id: int
    parent_comment_id: Optional[int] = None

class RequestCommentCreateApi(RequestCommentBase):
    parent_comment_id: Optional[int] = None

class RequestComment(RequestCommentBase):
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