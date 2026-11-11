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
