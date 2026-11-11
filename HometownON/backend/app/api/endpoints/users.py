from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from ... import crud, schemas
from ...core import security
from ...core.config import settings
from ...core.database import get_db

router = APIRouter()


@router.post("/signup", response_model=schemas.UserWithProfile, status_code=status.HTTP_201_CREATED)
def signup(request: schemas.UserSignupRequest, db: Session = Depends(get_db)):
    """사용자와 프로필을 함께 생성한다."""
    if crud.crud_user.get_user_by_email(db, email=request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    return crud.crud_user.create_user_with_profile(
        db=db,
        user=schemas.UserCreate(email=request.email, password=request.password, phone=request.phone),
        profile=request.profile,
    )


@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """이메일/비밀번호로 인증하고 JWT 를 발급한다."""
    user = crud.crud_user.get_user_by_email(db, email=form_data.email)
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": security.create_access_token(subject=user.email), "token_type": "bearer"}


def verify_google_id_token(token: str) -> dict:
    """Google ID 토큰을 검증하고 내용(sub, email, name ...)을 돌려준다. 실패하면 ValueError."""
    if not settings.GOOGLE_CLIENT_ID_WEB:
        raise RuntimeError("GOOGLE_CLIENT_ID_WEB is not configured")
    return id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID_WEB)


@router.post("/google-login", response_model=schemas.Token)
def google_login(request: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    """앱이 받은 Google ID 토큰을 검증하고 서버 JWT 를 발급한다."""
    try:
        idinfo = verify_google_id_token(request.id_token)
    except RuntimeError:
        raise HTTPException(status_code=503, detail="Google 로그인이 설정되지 않았습니다 (GOOGLE_CLIENT_ID_WEB).")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")

    email = idinfo.get("email")
    if not email or not idinfo.get("email_verified", False):
        raise HTTPException(status_code=401, detail="Google 계정의 이메일이 확인되지 않았습니다.")

    user = crud.crud_user.get_or_create_social_user(db, "google", idinfo["sub"], email, idinfo.get("name"))
    return {"access_token": security.create_access_token(subject=user.email), "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserWithProfile)
def read_me(current_user=Depends(security.get_current_user)):
    """토큰의 주인(현재 로그인 사용자) 정보를 반환한다."""
    return current_user


@router.patch("/me/profile", response_model=schemas.UserWithProfile)
def update_my_profile(
    changes: schemas.UserProfileUpdate,
    current_user=Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    """로그인 사용자의 프로필에서 보낸 칸만 바꾼다. 프로필이 없으면 만든다. 응답은 GET /me 와 같다."""
    return crud.crud_user.update_user_profile(db, current_user, changes)
