"""자유(/api/board)·의뢰(/api/requests)·멘토(/api/mentors) 게시판 API.

세 게시판이 같은 코드를 쓰고, 저장은 board_posts 테이블 하나에 board_type 으로 구분한다.
주소와 요청/응답 형식은 앱이 쓰던 그대로다.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core import security
from ...core.database import get_db
from ...crud import crud_board
from ...models import models
from ...schemas import board as s


def build_router(board_type: str, out_model, create_model, update_model) -> APIRouter:
    router = APIRouter()

    def _get_or_404(db: Session, post_id: int) -> models.BoardPost:
        post = crud_board.get_post(db, board_type, post_id)
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")
        return post

    def _get_own_or_403(db: Session, post_id: int, user: models.User) -> models.BoardPost:
        post = _get_or_404(db, post_id)
        if post.author_user_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this post")
        return post

    @router.get("/", response_model=List[out_model])
    def read_posts(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
        return crud_board.get_posts(db, board_type, skip=skip, limit=limit)

    @router.post("/", response_model=out_model)
    def create_post(
        post: create_model,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_user),
    ):
        return crud_board.create_post(db, board_type, post.model_dump(), user_id=current_user.id)

    @router.get("/{post_id}", response_model=out_model)
    def read_post(post_id: int, db: Session = Depends(get_db)):
        return _get_or_404(db, post_id)

    @router.put("/{post_id}", response_model=out_model)
    def update_post(
        post_id: int,
        post: update_model,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_user),
    ):
        db_post = _get_own_or_403(db, post_id, current_user)
        return crud_board.update_post(db, db_post, post.model_dump(exclude_unset=True))

    @router.delete("/{post_id}", response_model=out_model)
    def delete_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_user),
    ):
        db_post = _get_own_or_403(db, post_id, current_user)
        return crud_board.delete_post(db, db_post)

    @router.post("/{post_id}/comments", response_model=s.Comment)
    def create_comment(
        post_id: int,
        comment: s.CommentCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_user),
    ):
        db_post = _get_or_404(db, post_id)
        try:
            return crud_board.create_comment(
                db, db_post, comment.content, current_user.id, comment.parent_comment_id
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @router.post("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
    def like_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_user),
    ):
        _get_or_404(db, post_id)
        crud_board.like_post(db, post_id, current_user.id)

    @router.post("/{post_id}/unlike", status_code=status.HTTP_204_NO_CONTENT)
    def unlike_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_user),
    ):
        _get_or_404(db, post_id)
        crud_board.unlike_post(db, post_id, current_user.id)

    return router


free_router = build_router("free", s.FreePost, s.FreePostCreate, s.FreePostUpdate)
request_router = build_router("request", s.RequestPost, s.RequestPostCreate, s.RequestPostUpdate)
mentor_router = build_router("mentor", s.MentorPost, s.MentorPostCreate, s.MentorPostUpdate)
