from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.elements import WKTElement
from geoalchemy2.functions import ST_AsText # Import ST_AsText

from ..models.models import Location

# Helper function to convert Row to dict
def row_to_dict(row):
    if row is None:
        return None
    # Iterate over the field names (column names) of the Row object
    return {field: getattr(row, field) for field in row._fields}

def get_location(db: Session, location_id: int):
    # Select Location and convert geom to WKT string
    result = db.query(
        Location.id,
        Location.name,
        Location.category_id,
        Location.address,
        Location.phone,
        ST_AsText(Location.geom).label('geom'), # Convert geom to WKT
        Location.extra
    ).filter(Location.id == location_id).first()
    return result.to_dict() if result else None # Convert Row to dict

def get_location_by_name(db: Session, name: str):
    # Select Location and convert geom to WKT string
    result = db.query(
        Location.id,
        Location.name,
        Location.category_id,
        Location.address,
        Location.phone,
        ST_AsText(Location.geom).label('geom'), # Convert geom to WKT
        Location.extra
    ).filter(Location.name == name).first()
    return result.to_dict() if result else None # Convert Row to dict

def get_location(db: Session, location_id: int):
    # Select Location and convert geom to WKT string
    result = db.query(
        Location.id,
        Location.name,
        Location.category_id,
        Location.address,
        Location.phone,
        ST_AsText(Location.geom).label('geom'), # Convert geom to WKT
        Location.extra
    ).filter(Location.id == location_id).first()
    return row_to_dict(result) # Convert Row to dict

def get_location_by_name(db: Session, name: str):
    # Select Location and convert geom to WKT string
    result = db.query(
        Location.id,
        Location.name,
        Location.category_id,
        Location.address,
        Location.phone,
        ST_AsText(Location.geom).label('geom'), # Convert geom to WKT
        Location.extra
    ).filter(Location.name == name).first()
    return row_to_dict(result) # Convert Row to dict

def get_locations(db: Session, skip: int = 0, limit: int = 100):
    # Select Location and convert geom to WKT string
    results = db.query(
        Location.id,
        Location.name,
        Location.category_id,
        Location.address,
        Location.phone,
        ST_AsText(Location.geom).label('geom'), # Convert geom to WKT
        Location.extra
    ).offset(skip).limit(limit).all()
    return [row_to_dict(r) for r in results]

def create_location(db: Session, location_data: dict):
    # Assuming location_data contains 'geom' as a WKT string (e.g., 'POINT(lon lat)')
    geom_wkt = location_data.pop('geom', None)
    if geom_wkt:
        location_data['geom'] = WKTElement(geom_wkt, srid=4326)

    db_location = Location(**location_data)
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location
