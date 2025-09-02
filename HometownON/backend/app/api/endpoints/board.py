from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from ...models import models
from ...schemas import board
from ...crud import crud_board
from ...core.database import get_db
from ...core import security

router = APIRouter()

@router.get("/", response_model=List[board.BoardPost])
def read_posts(db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    posts = crud_board.get_posts(db, skip=skip, limit=limit)
    return posts

@router.post("/", response_model=board.BoardPost)
def create_post(post: board.BoardPostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    print(f"Creating board post: {post.model_dump()}")
    print(f"User ID: {current_user.id}")
    try:
        result = crud_board.create_post(db=db, post=post, user_id=current_user.id)
        print(f"Created post: {result}")
        return result
    except Exception as e:
        print(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{post_id}", response_model=board.BoardPost)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = crud_board.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@router.put("/{post_id}", response_model=board.BoardPost)
def update_post(post_id: int, post: board.BoardPostUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    db_post = crud_board.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    return crud_board.update_post(db=db, post_id=post_id, post=post)

@router.delete("/{post_id}", response_model=board.BoardPost)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    db_post = crud_board.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    return crud_board.delete_post(db=db, post_id=post_id)

@router.post("/{post_id}/comments", response_model=board.BoardComment)
def create_comment(
    post_id: int,
    comment: board.BoardCommentCreateApi,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    comment_data = comment.model_dump()
    comment_data['post_id'] = post_id
    comment_create = board.BoardCommentCreate(**comment_data)
    return crud_board.create_comment(db=db, comment=comment_create, user_id=current_user.id)

@router.post("/{post_id}/like", status_code=204)
def like_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    crud_board.like_post(db, post_id=post_id, user_id=current_user.id)
    return

@router.post("/{post_id}/unlike", status_code=204)
def unlike_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    crud_board.unlike_post(db, post_id=post_id, user_id=current_user.id)
    return