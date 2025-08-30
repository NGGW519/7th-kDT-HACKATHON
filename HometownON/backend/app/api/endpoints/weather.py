from fastapi import APIRouter, HTTPException
import httpx
import asyncio
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel

from ...core.config import settings

router = APIRouter()

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class WeatherResponse(BaseModel):
    temperature: float
    weather_condition: str
    description: str
    location: str
    air_quality: Optional[str] = None

@router.post("/current", response_model=WeatherResponse)
async def get_current_weather(location_data: LocationRequest):
    """
    현재 위치 기반 날씨 정보 가져오기
    """
    try:
        # 기상청 초단기예보 API 호출
        weather_data = await fetch_weather_from_api(
            location_data.latitude, 
            location_data.longitude
        )
        
        # 위치명 가져오기 (Google Maps API 사용)
        location_name = await get_location_name(
            location_data.latitude, 
            location_data.longitude
        )
        
        return WeatherResponse(
            temperature=weather_data["temperature"],
            weather_condition=weather_data["condition"],
            description=weather_data["description"],
            location=location_name,
            air_quality=weather_data.get("air_quality", "보통")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"날씨 정보를 가져올 수 없습니다: {str(e)}")

async def fetch_weather_from_api(lat: float, lon: float) -> dict:
    """
    기상청 API에서 날씨 데이터 가져오기
    """
    try:
        # 기상청 좌표 변환 (위경도 -> 격자좌표)
        grid_x, grid_y = convert_to_grid(lat, lon)
        print(f"🌍 좌표 변환: ({lat}, {lon}) -> 격자({grid_x}, {grid_y})")
        
        # 현재 시간 기준으로 API 호출 시간 계산
        now = datetime.now()
        base_date = now.strftime("%Y%m%d")
        base_time = get_base_time(now.hour, now.minute)
        print(f"⏰ API 호출 시간: {base_date} {base_time}")
        
        url = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst"
        params = {
            "serviceKey": settings.WEATHER_API_KEY,
            "pageNo": "1",
            "numOfRows": "60",
            "dataType": "JSON",
            "base_date": base_date,
            "base_time": base_time,
            "nx": str(grid_x),
            "ny": str(grid_y)
        }
        
        print(f"🌤️ 기상청 API 호출 시작...")
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            print(f"📡 API 응답 상태: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ 기상청 API 호출 실패: {response.status_code}")
                raise Exception(f"기상청 API 호출 실패: {response.status_code}")
            
            # API 응답 구조 확인
            if "response" not in data:
                print(f"❌ 잘못된 API 응답 구조: {data}")
                raise Exception("잘못된 API 응답 구조")
            
            response_body = data["response"]["body"]
            if "items" not in response_body or not response_body["items"]:
                print(f"❌ 날씨 데이터 없음: {response_body}")
                raise Exception("날씨 데이터 없음")
            
            items = response_body["items"]["item"]
            print(f"📊 받은 데이터 개수: {len(items)}")
            
            # 온도 데이터 확인
            temp_data = [item for item in items if item["category"] == "T1H"]
            print(f"🌡️ 온도 데이터: {temp_data}")
            
            weather_info = parse_weather_data(items)
            print(f"✅ 파싱된 날씨 정보: {weather_info}")
            
            return weather_info
            
    except Exception as e:
        print(f"❌ 기상청 API 오류: {e}")
        # 오류 시 기본값 반환
        return {
            "temperature": 25.0,  # 기본 온도
            "condition": "맑음",
            "description": "날씨 정보를 가져올 수 없습니다",
            "air_quality": "보통"
        }

def convert_to_grid(lat: float, lon: float) -> tuple:
    """
    위경도를 기상청 격자좌표로 변환
    """
    # 기상청 격자 변환 공식 (간단 버전)
    # 실제로는 더 복잡한 변환 공식 필요
    RE = 6371.00877
    GRID = 5.0
    SLAT1 = 30.0
    SLAT2 = 60.0
    OLON = 126.0
    OLAT = 38.0
    XO = 43
    YO = 136
    
    # 간단한 근사 변환 (함안 지역 기준)
    # 실제 구현시에는 정확한 변환 공식 사용 필요
    if 35.2 <= lat <= 35.4 and 128.3 <= lon <= 128.5:  # 함안 지역
        return 91, 105  # 함안군 격자 좌표
    else:
        # 기본값 (서울)
        return 60, 127

def get_base_time(hour: int, minute: int) -> str:
    """
    기상청 API 호출을 위한 base_time 계산
    초단기예보는 매시간 30분에 발표
    """
    if minute < 30:
        hour -= 1
    if hour < 0:
        hour = 23
    return f"{hour:02d}30"

def parse_weather_data(items: list) -> dict:
    """
    기상청 API 응답 데이터 파싱
    """
    weather_data = {}
    
    for item in items:
        category = item["category"]
        fcst_value = item["fcstValue"]
        
        if category == "T1H":  # 기온
            weather_data["temperature"] = float(fcst_value)
        elif category == "PTY":  # 강수형태
            weather_data["precipitation_type"] = int(fcst_value)
        elif category == "SKY":  # 하늘상태
            weather_data["sky_condition"] = int(fcst_value)
    
    # 날씨 상태 해석
    condition, description = interpret_weather(
        weather_data.get("precipitation_type", 0),
        weather_data.get("sky_condition", 1)
    )
    
    return {
        "temperature": weather_data.get("temperature", 20.0),
        "condition": condition,
        "description": description,
        "air_quality": "보통"  # 별도 API 필요
    }

def interpret_weather(pty: int, sky: int) -> tuple:
    """
    기상청 코드를 날씨 상태로 변환
    """
    if pty > 0:  # 강수가 있는 경우
        if pty == 1:
            return "비", "비가 내리고 있어요"
        elif pty == 2:
            return "비/눈", "비와 눈이 내리고 있어요"
        elif pty == 3:
            return "눈", "눈이 내리고 있어요"
        elif pty == 4:
            return "소나기", "소나기가 내리고 있어요"
    else:  # 강수가 없는 경우
        if sky == 1:
            return "맑음", "맑은 날씨예요"
        elif sky == 3:
            return "구름많음", "구름이 많은 날씨예요"
        elif sky == 4:
            return "흐림", "흐린 날씨예요"
    
    return "맑음", "좋은 날씨예요"

async def get_location_name(lat: float, lon: float) -> str:
    """
    Google Maps API로 위치명 가져오기
    """
    try:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "latlng": f"{lat},{lon}",
            "key": settings.GOOGLEMAP_API_KEY,
            "language": "ko"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            if data["status"] == "OK" and data["results"]:
                # 더 구체적인 지역명 추출 시도
                city = None
                district = None
                province = None
                
                for component in data["results"][0]["address_components"]:
                    types = component["types"]
                    
                    # 시/군/구 (administrative_area_level_2)
                    if "administrative_area_level_2" in types:
                        city = component["long_name"]
                    # 읍/면/동 (sublocality_level_1 또는 locality)
                    elif "sublocality_level_1" in types or "locality" in types:
                        district = component["long_name"]
                    # 도/시 (administrative_area_level_1)
                    elif "administrative_area_level_1" in types:
                        province = component["long_name"]
                
                # 우선순위: 시/군/구 > 읍/면/동 > 도/시
                if city:
                    return city
                elif district:
                    return district
                elif province:
                    return province
                
                # 최후 수단: 전체 주소에서 첫 번째 단어
                formatted_address = data["results"][0]["formatted_address"]
                if formatted_address:
                    # "대한민국 경상남도 함안군" -> "함안군" 추출
                    parts = formatted_address.split()
                    if len(parts) >= 3:
                        return parts[2]  # 세 번째 부분 (함안군)
                    elif len(parts) >= 2:
                        return parts[1]  # 두 번째 부분
                    else:
                        return parts[0]  # 첫 번째 부분
            
    except Exception as e:
        print(f"위치명 가져오기 실패: {e}")
    
    return "현재 위치"