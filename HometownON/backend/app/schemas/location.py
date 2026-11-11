from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class LocationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category_id: int
    address: str = Field(..., min_length=1, max_length=300)
    phone: Optional[str] = Field(None, max_length=40)
    # WKT 문자열, 순서는 경도(lng) 위도(lat): 예) 'POINT(128.4064 35.2723)'
    geom: str = Field(..., pattern=r"^POINT\(\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s*\)$")
    extra: Optional[dict] = None


class LocationCreate(LocationBase):
    pass


class Location(LocationBase):
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class LocationCategory(BaseModel):
    id: int
    main: Optional[str] = None
    sub: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class NearbyRequest(BaseModel):
    """POST /api/locations/nearby 요청. 좌표는 위도/경도(도 단위), 반경은 km."""
    latitude: float = Field(..., ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(..., ge=-180, le=180, allow_inf_nan=False)
    radius_km: float = Field(5.0, gt=0, le=50, allow_inf_nan=False)
    limit: int = Field(20, ge=1, le=100)
    # location_categories 의 main 또는 sub 와 정확히 같은 값만 고른다 (빈 값이면 전체)
    category: Optional[str] = Field(None, max_length=80)


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class NearbyLocation(BaseModel):
    id: int
    name: str
    category_id: int
    category: Optional[str] = None  # 소분류(없으면 대분류) 이름
    address: str
    phone: Optional[str] = None
    latitude: float
    longitude: float
    coordinates: Coordinates  # 앱(ExplorationMission)은 coordinates.latitude/longitude 를 읽는다
    distance_km: float
