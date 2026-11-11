"""장소 CRUD (PostGIS). 좌표는 POINT(경도 위도), SRID 4326 으로 저장한다."""
from geoalchemy2 import Geography
from geoalchemy2.elements import WKTElement
from geoalchemy2.functions import ST_AsText, ST_X, ST_Y
from sqlalchemy import cast, func, or_
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

# geometry_type=None 이어야 'CAST(... AS geography)' 로 나간다 (기본값은 geography(GEOMETRY,-1))
_GEOGRAPHY = Geography(geometry_type=None)


def _to_dict(row):
    return dict(row._mapping) if row is not None else None


def _like_pattern(text: str) -> str:
    """사용자 입력의 %, _ 를 글자 그대로 찾도록 이스케이프한 부분 일치 패턴."""
    escaped = text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def get_location(db: Session, location_id: int):
    return _to_dict(db.query(*_COLUMNS).filter(Location.id == location_id).first())


def get_location_by_name(db: Session, name: str):
    return _to_dict(db.query(*_COLUMNS).filter(Location.name == name).order_by(Location.id).first())


def get_locations(
    db: Session, skip: int = 0, limit: int = 100, category_id: int | None = None, search: str | None = None
):
    query = db.query(*_COLUMNS)
    if category_id is not None:
        query = query.filter(Location.category_id == category_id)
    search = (search or "").strip()
    if search:
        pattern = _like_pattern(search)
        query = query.filter(
            or_(Location.name.ilike(pattern, escape="\\"), Location.address.ilike(pattern, escape="\\"))
        )
    rows = query.order_by(Location.id).offset(skip).limit(limit).all()
    return [_to_dict(r) for r in rows]


def get_categories(db: Session):
    return db.query(LocationCategory).order_by(LocationCategory.id).all()


def get_nearby_locations(
    db: Session, latitude: float, longitude: float, radius_km: float = 5.0, limit: int = 20,
    category: str | None = None,
):
    """(latitude, longitude) 에서 radius_km 안의 장소를 가까운 순으로 돌려준다.

    PostGIS geography 로 계산하므로 거리는 미터 단위(지구 타원체 기준)다.
    """
    origin = cast(func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326), _GEOGRAPHY)  # POINT(경도 위도)
    place = cast(Location.geom, _GEOGRAPHY)
    distance_m = func.ST_Distance(place, origin)

    query = (
        db.query(
            Location.id,
            Location.name,
            Location.category_id,
            LocationCategory.main,
            LocationCategory.sub,
            Location.address,
            Location.phone,
            ST_X(Location.geom).label("longitude"),
            ST_Y(Location.geom).label("latitude"),
            distance_m.label("distance_m"),
        )
        .join(LocationCategory, LocationCategory.id == Location.category_id)
        .filter(func.ST_DWithin(place, origin, radius_km * 1000.0))
    )
    category = (category or "").strip()
    if category:
        query = query.filter(or_(LocationCategory.main == category, LocationCategory.sub == category))

    results = []
    for row in query.order_by(distance_m, Location.id).limit(limit).all():
        results.append({
            "id": row.id,
            "name": row.name,
            "category_id": row.category_id,
            "category": row.sub or row.main,
            "address": row.address,
            "phone": row.phone,
            "latitude": row.latitude,
            "longitude": row.longitude,
            "coordinates": {"latitude": row.latitude, "longitude": row.longitude},
            "distance_km": round(row.distance_m / 1000.0, 3),
        })
    return results


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
