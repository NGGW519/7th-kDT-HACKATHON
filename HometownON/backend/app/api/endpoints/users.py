from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from ... import crud, models, schemas
from ...core import security
from ...core.database import get_db
from ...core.config import settings

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
        id=user.id,
        email=user.email,
        phone=user.phone,
        created_at=user.created_at,
        updated_at=user.updated_at,
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

@router.post("/google-login", response_model=schemas.Token)
async def google_login(
    request: schemas.GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            request.id_token, requests.Request(), settings.GOOGLE_CLIENT_ID_WEB
        )
        google_user_id = idinfo['sub']
        email = idinfo['email']
        display_name = idinfo.get('name')

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")

    # Check if social account already exists
    social_account = crud.crud_user.get_social_account_by_provider_uid(db, "google", google_user_id)

    if social_account:
        user = social_account.user # Assuming relationship is set up
    else:
        # If social account doesn't exist, create a new user and social account
        user = crud.crud_user.create_user_with_social_account(db, "google", google_user_id, email, display_name)

    # Generate and return backend JWT token
    access_token = security.create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserWithProfile)
def get_current_user(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user information with profile.
    """
    # Get user profile
    profile = crud.crud_user.get_user_profile(db, current_user.id)
    
    user_with_profile = schemas.UserWithProfile(
        id=current_user.id,
        email=current_user.email,
        phone=current_user.phone,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        profile=profile
    )
    return user_with_profile
