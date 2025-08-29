from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import crud, models, schemas
from ...core import security
from ...core.database import get_db

router = APIRouter()

class UserSignupRequest(schemas.UserCreate):
    profile: schemas.UserProfileCreate

@router.post("/signup", response_model=schemas.UserWithProfile, status_code=status.HTTP_201_CREATED)
def create_user_with_profile(request: UserSignupRequest, db: Session = Depends(get_db)):
    """
    Create a new user and their profile.
    """
    db_user = crud.crud_user.get_user_by_email(db, email=request.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user = crud.crud_user.create_user(db=db, user=schemas.UserCreate(email=request.email, password=request.password, phone=request.phone))
    
    # Create user profile
    profile = crud.crud_user.create_user_profile(db=db, user_id=user.id, profile=request.profile)
    
    # Combine and return
    user_with_profile = schemas.UserWithProfile(
        **user.__dict__,
        profile=profile
    )
    return user_with_profile

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    """
    user = crud.crud_user.get_user_by_email(db, email=form_data.email)
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}
