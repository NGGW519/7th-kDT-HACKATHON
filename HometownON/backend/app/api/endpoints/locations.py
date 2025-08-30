from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from pydantic import BaseModel
import re

from ...core.database import get_db
from ...models.models import Location, LocationCategory

router = APIRouter()

class LocationsNearbyRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 5.0
    limit: int = 20

def parse_geom_to_coordinates(geom):
    """POINT 문자열을 위도/경도 좌표로 변환"""
    if not geom:
        return None
    
    try:
        # geom이 bytes인 경우 처리
        if isinstance(geom, bytes):
            # MySQL POINT는 바이너리 형태로 저장될 수 있음
            return None
            
        geom_str = str(geom)
        # 다양한 POINT 형식에 대응
        patterns = [
            r'POINT\s*\(([0-9.-]+)\s+([0-9.-]+)\)',  # POINT (x y)
            r'\(([0-9.-]+),\s*([0-9.-]+)\)',         # (x,y)
            r'([0-9.-]+),\s*([0-9.-]+)'              # x,y
        ]
        
        for pattern in patterns:
            match = re.search(pattern, geom_str)
            if match:
                longitude = float(match.group(1))
                latitude = float(match.group(2))
                return {"latitude": latitude, "longitude": longitude}
                
    except (ValueError, AttributeError):
        pass
    
    return None

@router.get("/")
def get_locations(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """위치 목록 조회"""
    try:
        # geom을 텍스트로 변환하여 가져오기
        query = text("""
            SELECT id, name, address, phone, category_id,
                   ST_AsText(geom) as geom_text,
                   ST_X(geom) as lng,
                   ST_Y(geom) as lat
            FROM locations
            WHERE geom IS NOT NULL
            LIMIT :limit OFFSET :skip
        """)
        
        result_set = db.execute(query, {"limit": limit, "skip": skip})
        
        result = []
        for row in result_set:
            coordinates = None
            if row.lng is not None and row.lat is not None:
                coordinates = {
                    "latitude": float(row.lng),    # ST_X = 실제로는 위도 (35도)
                    "longitude": float(row.lat)    # ST_Y = 실제로는 경도 (128도)
                }
            
            result.append({
                "id": row.id,
                "name": row.name,
                "address": row.address,
                "phone": row.phone,
                "category_id": row.category_id,
                "coordinates": coordinates
            })
        
        return result
    except Exception as e:
        return {"error": str(e)}

@router.post("/nearby")
def get_nearby_locations(
    request: LocationsNearbyRequest,
    db: Session = Depends(get_db)
):
    """근처 위치 검색"""
    try:
        # SRID를 맞춰서 거리 계산
        query = text("""
            SELECT l.*, lc.main as category_name,
                   ST_X(l.geom) as lng,
                   ST_Y(l.geom) as lat,
                   (6371 * acos(
                       cos(radians(:user_lat)) * cos(radians(ST_X(l.geom))) *
                       cos(radians(ST_Y(l.geom)) - radians(:user_lng)) +
                       sin(radians(:user_lat)) * sin(radians(ST_X(l.geom)))
                   )) as distance_km
            FROM locations l
            LEFT JOIN location_categories lc ON l.category_id = lc.id
            WHERE l.geom IS NOT NULL
            HAVING distance_km <= :radius_km
            ORDER BY distance_km
            LIMIT :limit
        """)
        
        result = db.execute(query, {
            "user_lng": float(request.longitude),  # 경도가 먼저
            "user_lat": float(request.latitude),   # 위도가 나중
            "radius_km": float(request.radius_km),
            "limit": int(request.limit)
        })
        
        locations = []
        for row in result:
            # ST_X, ST_Y를 사용하여 좌표 생성 (데이터베이스에서 위도/경도가 바뀌어 저장됨)
            coordinates = None
            if row.lng is not None and row.lat is not None:
                coordinates = {
                    "latitude": float(row.lng),    # ST_X = 실제로는 위도
                    "longitude": float(row.lat)    # ST_Y = 실제로는 경도
                }
            
            locations.append({
                "id": row.id,
                "name": row.name,
                "address": row.address,
                "phone": row.phone,
                "category_id": row.category_id,
                "category_name": row.category_name,
                "coordinates": coordinates,
                "distance_km": round(row.distance_km, 2)
            })
        
        return locations
    except Exception as e:
        return {"error": str(e)}

@router.get("/categories/")
def get_location_categories(db: Session = Depends(get_db)):
    """위치 카테고리 목록 조회"""
    try:
        categories = db.query(LocationCategory).all()
        return [{"id": cat.id, "main": cat.main, "sub": cat.sub} for cat in categories]
    except Exception as e:
        return {"error": str(e)}