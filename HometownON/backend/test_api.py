#!/usr/bin/env python3
"""
API 테스트 스크립트
"""
import requests
import json

def test_locations_api():
    base_url = "http://localhost:8000/api"
    
    print("🧪 위치 API 테스트 시작...")
    
    try:
        # 1. 전체 위치 목록 조회 (처음 5개만)
        print("\n1. 전체 위치 목록 조회 (limit=5)")
        response = requests.get(f"{base_url}/locations/?limit=5")
        if response.status_code == 200:
            locations = response.json()
            print(f"✅ 성공: {len(locations)}개 위치 조회됨")
            if locations:
                # 좌표가 있는 위치 찾기
                location_with_coords = None
                for loc in locations:
                    if loc.get('coordinates'):
                        location_with_coords = loc
                        break
                
                if location_with_coords:
                    coords = location_with_coords['coordinates']
                    print(f"   좌표가 있는 위치: {location_with_coords['name']}")
                    print(f"   좌표: 위도={coords['latitude']}, 경도={coords['longitude']}")
                    
                    # 이 좌표로 근처 검색 테스트
                    print(f"   이 좌표로 근처 검색 테스트...")
                    test_nearby_data = {
                        "latitude": coords['latitude'],
                        "longitude": coords['longitude'],
                        "radius_km": 5.0,
                        "limit": 5
                    }
                    test_response = requests.post(f"{base_url}/locations/nearby", json=test_nearby_data)
                    if test_response.status_code == 200:
                        test_nearby = test_response.json()
                        print(f"   -> {len(test_nearby)}개 근처 위치 발견")
                        if test_nearby:
                            for loc in test_nearby[:2]:  # 처음 2개만 출력
                                print(f"      - {loc['name']}: {loc.get('distance_km', 'N/A')}km")
                    else:
                        print(f"   -> 테스트 실패: {test_response.status_code}")
                else:
                    print("   좌표가 있는 위치를 찾을 수 없음")
        else:
            print(f"❌ 실패: {response.status_code} - {response.text}")
            
        # 2. 카테고리 목록 조회
        print("\n2. 카테고리 목록 조회")
        response = requests.get(f"{base_url}/locations/categories/")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ 성공: {len(categories)}개 카테고리 조회됨")
            for cat in categories[:3]:  # 처음 3개만 출력
                print(f"   - {cat}")
        else:
            print(f"❌ 실패: {response.status_code} - {response.text}")
            
        # 3. 근처 위치 검색 테스트 (함안군 좌표)
        print("\n3. 근처 위치 검색 테스트")
        nearby_data = {
            "latitude": 35.2722,   # 함안군 위도
            "longitude": 128.4061, # 함안군 경도
            "radius_km": 50.0,     # 반경을 50km로 확대
            "limit": 10
        }
        response = requests.post(f"{base_url}/locations/nearby", json=nearby_data)
        if response.status_code == 200:
            nearby_locations = response.json()
            print(f"✅ 성공: {len(nearby_locations)}개 근처 위치 발견")
            
            # 응답 데이터 구조 확인
            print(f"   응답 데이터 타입: {type(nearby_locations)}")
            
            # 에러 응답인지 확인
            if isinstance(nearby_locations, dict) and 'error' in nearby_locations:
                print(f"   ❌ API 에러: {nearby_locations['error']}")
            elif isinstance(nearby_locations, list):
                if nearby_locations:
                    print(f"   첫 번째 항목: {nearby_locations[0]}")
                    for loc in nearby_locations:
                        if isinstance(loc, dict):
                            distance = loc.get('distance_km', 'N/A')
                            print(f"   - {loc['name']}: {loc['address']} ({distance}km)")
                        else:
                            print(f"   - 잘못된 데이터 형식: {loc}")
                else:
                    print("   빈 목록 반환됨")
            else:
                print(f"   예상치 못한 응답 형식: {nearby_locations}")
        else:
            print(f"❌ 실패: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 연결 실패: 서버가 실행 중인지 확인하세요 (http://localhost:8000)")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    test_locations_api()