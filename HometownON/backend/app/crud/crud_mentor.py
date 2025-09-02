from sqlalchemy.orm import Session
from .. import models
from ..schemas import mentor as schemas

def get_post(db: Session, post_id: int):
    return db.query(models.models.MentorPost).filter(models.models.MentorPost.id == post_id).first()

def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.models.MentorPost).offset(skip).limit(limit).all()

def create_post(db: Session, post: schemas.MentorPostCreate, user_id: int):
    db_post = models.models.MentorPost(**post.model_dump(), author_user_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post_id: int, post: schemas.MentorPostUpdate):
    db_post = get_post(db, post_id)
    if db_post:
        update_data = post.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_post, key, value)
        db.commit()
        db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    db_post = get_post(db, post_id)
    if db_post:
        db.delete(db_post)
        db.commit()
    return db_post

def create_comment(db: Session, comment: schemas.MentorCommentCreate, user_id: int):
    db_comment = models.models.MentorComment(**comment.model_dump(), author_user_id=user_id)
    db.add(db_comment)
    db.query(models.models.MentorPost).filter(models.models.MentorPost.id == comment.post_id).update({'comments_count': models.models.MentorPost.comments_count + 1})
    db.commit()
    db.refresh(db_comment)
    return db_comment

def like_post(db: Session, post_id: int, user_id: int):
    db_like = db.query(models.models.Like).filter(models.models.Like.target_id == post_id, models.models.Like.user_id == user_id, models.models.Like.target_type == 'post').first()
    if not db_like:
        db_like = models.models.Like(target_id=post_id, user_id=user_id, target_type='post')
        db.add(db_like)
        db.query(models.models.MentorPost).filter(models.models.MentorPost.id == post_id).update({'likes_count': models.models.MentorPost.likes_count + 1})
        db.commit()
        db.refresh(db_like)
    return db_like

def unlike_post(db: Session, post_id: int, user_id: int):
    db_like = db.query(models.models.Like).filter(models.models.Like.target_id == post_id, models.models.Like.user_id == user_id, models.models.Like.target_type == 'post').first()
    if db_like:
        db.delete(db_like)
        db.query(models.models.MentorPost).filter(models.models.MentorPost.id == post_id).update({'likes_count': models.models.MentorPost.likes_count - 1})
        db.commit()
    return db_like