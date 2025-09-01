from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...crud.location import get_location, get_location_by_name, get_locations, create_location # Import specific CRUD functions
from ...schemas.location import Location, LocationCreate
from ...core.database import get_db

router = APIRouter()

@router.get("/", response_model=List[Location])
def read_locations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    locations = get_locations(db, skip=skip, limit=limit) # Use imported get_locations
    return locations

@router.get("/{location_id}", response_model=Location)
def read_location(
    location_id: int,
    db: Session = Depends(get_db)
):
    db_location = get_location(db, location_id=location_id) # Use imported get_location
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@router.get("/by_name/{location_name}", response_model=Location)
def read_location_by_name(
    location_name: str,
    db: Session = Depends(get_db)
):
    db_location = get_location_by_name(db, name=location_name) # Use imported get_location_by_name
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@router.post("/", response_model=Location)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db)
):
    return create_location(db=db, location_data=location.dict()) # Use imported create_location
