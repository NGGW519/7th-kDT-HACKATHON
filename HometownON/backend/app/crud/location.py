from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from ..models.models import Location, LocationCategory
from ..schemas.location import LocationCreate, LocationsNearbyRequest
import math

def get_location(db: Session, location_id: int) -> Optional[Location]:
    """Get specific location information"""
    try:
        return db.query(Location).filter(Location.id == location_id).first()
    except Exception as e:
        print(f"Error in get_location: {e}")
        raise

def get_locations(db: Session, skip: int = 0, limit: int = 100) -> List[Location]:
    """Get all locations list"""
    try:
        return db.query(Location).offset(skip).limit(limit).all()
    except Exception as e:
        print(f"Error in get_locations: {e}")
        raise

def get_locations_by_category(db: Session, category_id: int, skip: int = 0, limit: int = 100) -> List[Location]:
    """Get locations by category"""
    return db.query(Location).filter(Location.category_id == category_id).offset(skip).limit(limit).all()

def get_nearby_locations(db: Session, request: LocationsNearbyRequest) -> List[Location]:
    """Search nearby locations using Haversine formula"""
    # Use MySQL ST_Distance_Sphere function to calculate distance
    # MySQL POINT format is POINT(longitude, latitude)
    query = text("""
        SELECT l.*, lc.name as category_name,
               ST_Distance_Sphere(
                   POINT(:user_lng, :user_lat),
                   l.geom
               ) / 1000 as distance_km
        FROM locations l
        LEFT JOIN location_categories lc ON l.category_id = lc.id
        WHERE l.geom IS NOT NULL
        HAVING distance_km <= :radius_km
        ORDER BY distance_km
        LIMIT :limit
    """)
    
    result = db.execute(query, {
        "user_lat": request.latitude,
        "user_lng": request.longitude,
        "radius_km": request.radius_km,
        "limit": request.limit
    })
    
    locations = []
    for row in result:
        location = Location(
            id=row.id,
            name=row.name,
            category_id=row.category_id,
            address=row.address,
            phone=row.phone,
            geom=row.geom,
            extra=row.extra
        )
        # Add category information
        if row.category_name:
            category = LocationCategory(id=row.category_id, name=row.category_name)
            location.category = category
            
        locations.append(location)
    
    return locations

def search_locations_by_name(db: Session, search_term: str, limit: int = 20) -> List[Location]:
    """Search locations by name"""
    return db.query(Location).filter(
        Location.name.contains(search_term)
    ).limit(limit).all()

def get_location_categories(db: Session) -> List[LocationCategory]:
    """Get location categories list"""
    return db.query(LocationCategory).all()