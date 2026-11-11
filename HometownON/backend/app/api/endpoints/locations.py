from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...core import security
from ...core.database import get_db
from ...crud import location as crud
from ...schemas.location import Location, LocationCategory, LocationCreate, NearbyLocation, NearbyRequest

router = APIRouter()


@router.get("/", response_model=List[Location])
def read_locations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category_id: Optional[int] = Query(None, description="이 카테고리의 장소만"),
    search: Optional[str] = Query(None, max_length=100, description="이름 또는 주소 부분 일치 (대소문자 무시)"),
    db: Session = Depends(get_db),
):
    return crud.get_locations(db, skip=skip, limit=limit, category_id=category_id, search=search)


# 고정 경로(categories, nearby, by_name)는 /{location_id} 보다 먼저 정의해야 한다 (뒤에 두면 정수 변환 실패로 422)
@router.get("/categories/", response_model=List[LocationCategory])
@router.get("/categories", response_model=List[LocationCategory], include_in_schema=False)
def read_location_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@router.post("/nearby", response_model=List[NearbyLocation])
def read_nearby_locations(body: NearbyRequest, db: Session = Depends(get_db)):
    """현재 위치에서 반경 안의 장소를 가까운 순으로 돌려준다 (탐색형 미션)."""
    return crud.get_nearby_locations(
        db, latitude=body.latitude, longitude=body.longitude,
        radius_km=body.radius_km, limit=body.limit, category=body.category,
    )


@router.get("/by_name/{location_name}", response_model=Location)
def read_location_by_name(location_name: str, db: Session = Depends(get_db)):
    location = crud.get_location_by_name(db, name=location_name)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@router.get("/{location_id}", response_model=Location)
def read_location(location_id: int, db: Session = Depends(get_db)):
    location = crud.get_location(db, location_id=location_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@router.post("/", response_model=Location)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    _user=Depends(security.get_current_user),  # 로그인한 사용자만 장소를 추가할 수 있다
):
    return crud.create_location(db, location.model_dump())
