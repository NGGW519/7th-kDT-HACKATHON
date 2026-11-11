from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...core import security
from ...core.database import get_db
from ...crud import location as crud
from ...schemas.location import Location, LocationCreate

router = APIRouter()


@router.get("/", response_model=List[Location])
def read_locations(
    skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)
):
    return crud.get_locations(db, skip=skip, limit=limit)


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
