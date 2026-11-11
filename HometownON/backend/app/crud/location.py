"""장소 CRUD (PostGIS). 좌표는 POINT(경도 위도), SRID 4326 으로 저장한다."""
from geoalchemy2.elements import WKTElement
from geoalchemy2.functions import ST_AsText, ST_X, ST_Y
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..models.models import Location, LocationCategory

_COLUMNS = (
    Location.id,
    Location.name,
    Location.category_id,
    Location.address,
    Location.phone,
    ST_AsText(Location.geom).label("geom"),  # 'POINT(경도 위도)'
    ST_X(Location.geom).label("longitude"),
    ST_Y(Location.geom).label("latitude"),
    Location.extra,
)


def _to_dict(row):
    return dict(row._mapping) if row is not None else None


def get_location(db: Session, location_id: int):
    return _to_dict(db.query(*_COLUMNS).filter(Location.id == location_id).first())


def get_location_by_name(db: Session, name: str):
    return _to_dict(db.query(*_COLUMNS).filter(Location.name == name).order_by(Location.id).first())


def get_locations(db: Session, skip: int = 0, limit: int = 100):
    rows = db.query(*_COLUMNS).order_by(Location.id).offset(skip).limit(limit).all()
    return [_to_dict(r) for r in rows]


def create_location(db: Session, location_data: dict):
    """location_data['geom'] 은 WKT 문자열 'POINT(경도 위도)'."""
    data = dict(location_data)
    data["geom"] = WKTElement(data["geom"], srid=4326)
    location = Location(**data)
    db.add(location)
    db.commit()
    return get_location(db, location.id)


def find_random_location(db: Session, category: str, region: str | None = None):
    """카테고리(대분류 또는 소분류, 예: '맛집', '병원/의원')에 맞는 장소 하나를 무작위로 고른다."""
    query = (
        db.query(*_COLUMNS, LocationCategory.main, LocationCategory.sub)
        .join(LocationCategory, LocationCategory.id == Location.category_id)
        .filter(or_(LocationCategory.main == category, LocationCategory.sub == category))
    )
    if region:
        query = query.filter(Location.address.ilike(f"%{region}%"))
    row = query.order_by(func.random()).first()
    if row is None:
        return None
    data = _to_dict(row)
    data["category"] = data.pop("sub") or data.pop("main", None)
    data.pop("main", None)
    return data
