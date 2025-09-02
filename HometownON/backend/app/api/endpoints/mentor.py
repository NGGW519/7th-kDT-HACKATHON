from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ... import models
from ...schemas import mentor
from ...crud import crud_mentor
from ...core.database import get_db
from ...core import security

router = APIRouter()

@router.get("/", response_model=List[mentor.MentorPost])
def read_posts(db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    posts = crud_mentor.get_posts(db, skip=skip, limit=limit)
    return posts

@router.post("/", response_model=mentor.MentorPost)
def create_post(post: mentor.MentorPostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    return crud_mentor.create_post(db=db, post=post, user_id=current_user.id)

@router.get("/{post_id}", response_model=mentor.MentorPost)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = crud_mentor.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@router.put("/{post_id}", response_model=mentor.MentorPost)
def update_post(post_id: int, post: mentor.MentorPostUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    db_post = crud_mentor.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    return crud_mentor.update_post(db=db, post_id=post_id, post=post)

@router.delete("/{post_id}", response_model=mentor.MentorPost)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    db_post = crud_mentor.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    return crud_mentor.delete_post(db=db, post_id=post_id)

@router.post("/{post_id}/comments", response_model=mentor.MentorComment)
def create_comment(
    post_id: int,
    comment: mentor.MentorCommentCreateApi,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    comment_data = comment.model_dump()
    comment_data['post_id'] = post_id
    comment_create = mentor.MentorCommentCreate(**comment_data)
    return crud_mentor.create_comment(db=db, comment=comment_create, user_id=current_user.id)

@router.post("/{post_id}/like", status_code=204)
def like_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    crud_mentor.like_post(db, post_id=post_id, user_id=current_user.id)
    return

@router.post("/{post_id}/unlike", status_code=204)
def like_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    crud_mentor.unlike_post(db, post_id=post_id, user_id=current_user.id)
    return