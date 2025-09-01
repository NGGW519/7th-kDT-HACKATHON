from typing import Optional
from pydantic import BaseModel

class LocationBase(BaseModel):
    name: str
    category_id: int
    address: str
    phone: Optional[str] = None
    # geom will be handled as a string for simplicity in Pydantic, 
    # and parsed in the CRUD/endpoint layer
    geom: str # Representing POINT as WKT string (e.g., 'POINT(lon lat)')
    extra: Optional[dict] = None

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        orm_mode = True
