from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from .schemas import UserProfile

class BoardPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: str = Field(..., max_length=50)

class BoardPostCreate(BoardPostBase):
    pass

class BoardPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=20)

class Author(BaseModel):
    id: int
    profile: UserProfile

    class Config:
        from_attributes = True

class BoardPost(BoardPostBase):
    id: int
    author: Author
    likes_count: int
    comments_count: int
    status: str
    created_at: datetime
    updated_at: datetime
    comments: List['BoardComment'] = []

    class Config:
        from_attributes = True

class BoardCommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class BoardCommentCreate(BoardCommentBase):
    post_id: int
    parent_comment_id: Optional[int] = None

class BoardCommentCreateApi(BoardCommentBase):
    parent_comment_id: Optional[int] = None

class BoardComment(BoardCommentBase):
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