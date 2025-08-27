#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
함안군 지역 데이터를 MySQL 데이터베이스에 로드하는 스크립트
- locations 테이블: 위치 기반 정보 (맛집, 병원, 경로당 등)
- culture 테이블: 문화/역사 정보 (인물, 전설 등)
"""

import csv
import pymysql
import os
import sys
from pathlib import Path

# === 설정 ===
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1111',  # 실제 비밀번호로 변경하세요
    'database': 'haman_db',
    'charset': 'utf8mb4'
}

# 현재 스크립트 위치 기준으로 CSV 파일 경로 설정
BASE_DIR = Path(__file__).parent

def get_db_connection():
    """데이터베이스 연결을 생성하고 반환"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        print("✅ MySQL 데이터베이스 연결 성공")
        return connection
    except pymysql.Error as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        sys.exit(1)

def check_csv_file(file_path):
    """CSV 파일 존재 여부 확인"""
    if not file_path.exists():
        print(f"⚠️  파일을 찾을 수 없습니다: {file_path}")
        return False
    return True

def load_locations_data(cursor, file_name, category_main, category_sub, col_mapping):
    """위치 기반 데이터를 locations 테이블에 로드"""
    file_path = BASE_DIR / file_name
    
    if not check_csv_file(file_path):
        return 0
    
    print(f"\n📍 '{file_name}' 처리 중...")
    
    insert_count = 0
    error_count = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, 1):
                try:
                    # 필수 필드 확인
                    name = row.get(col_mapping['name'], '').strip()
                    address = row.get(col_mapping['address'], '').strip()
                    
                    if not name or not address:
                        print(f"   ⚠️  행 {row_num}: 이름 또는 주소가 비어있음 - 건너뜀")
                        error_count += 1
                        continue
                    
                    # 선택적 필드
                    phone = row.get(col_mapping.get('phone', ''), '').strip() or None
                    
                    # 좌표 처리
                    lat = row.get(col_mapping.get('lat', ''), '').strip()
                    lon = row.get(col_mapping.get('lon', ''), '').strip()
                    
                    if lat and lon:
                        try:
                            lat_float = float(lat)
                            lon_float = float(lon)
                            # 한국 좌표 범위 검증
                            if 33 <= lat_float <= 39 and 124 <= lon_float <= 132:
                                point_wkt = f"POINT({lon_float} {lat_float})"
                            else:
                                print(f"   ⚠️  행 {row_num}: 좌표가 한국 범위를 벗어남 - 기본값 사용")
                                point_wkt = "POINT(128.4 35.5)"  # 함안군 대략적 중심
                        except ValueError:
                            print(f"   ⚠️  행 {row_num}: 좌표 형식 오류 - 기본값 사용")
                            point_wkt = "POINT(128.4 35.5)"
                    else:
                        point_wkt = "POINT(128.4 35.5)"  # 기본 좌표
                    
                    # 데이터 삽입
                    sql = """
                        INSERT INTO locations (name, category_main, category_sub, address, phone, geom)
                        VALUES (%s, %s, %s, %s, %s, ST_PointFromText(%s))
                    """
                    cursor.execute(sql, (name, category_main, category_sub, address, phone, point_wkt))
                    insert_count += 1
                    
                except Exception as e:
                    print(f"   ❌ 행 {row_num} 처리 오류: {e}")
                    error_count += 1
                    continue
    
    except Exception as e:
        print(f"❌ 파일 읽기 오류: {e}")
        return 0
    
    print(f"   ✅ 성공: {insert_count}개 삽입, {error_count}개 오류")
    return insert_count

def load_culture_data(cursor, file_name, category, col_mapping):
    """문화 데이터를 culture 테이블에 로드"""
    file_path = BASE_DIR / file_name
    
    if not check_csv_file(file_path):
        return 0
    
    print(f"\n📚 '{file_name}' 처리 중...")
    
    insert_count = 0
    error_count = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, 1):
                try:
                    # 필수 필드 확인
                    title = row.get(col_mapping['title'], '').strip()
                    story = row.get(col_mapping['story'], '').strip()
                    
                    if not title or not story:
                        print(f"   ⚠️  행 {row_num}: 제목 또는 내용이 비어있음 - 건너뜀")
                        error_count += 1
                        continue
                    
                    # 선택적 필드
                    url = row.get(col_mapping.get('url', ''), '').strip() or None
                    
                    # 데이터 삽입
                    sql = """
                        INSERT INTO culture (title, category, story, haman_url)
                        VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(sql, (title, category, story, url))
                    insert_count += 1
                    
                except Exception as e:
                    print(f"   ❌ 행 {row_num} 처리 오류: {e}")
                    error_count += 1
                    continue
    
    except Exception as e:
        print(f"❌ 파일 읽기 오류: {e}")
        return 0
    
    print(f"   ✅ 성공: {insert_count}개 삽입, {error_count}개 오류")
    return insert_count

def main():
    """메인 실행 함수"""
    print("🚀 함안군 데이터 로딩 시작")
    print("=" * 50)
    
    connection = get_db_connection()
    total_inserted = 0
    
    try:
        with connection.cursor() as cursor:
            # === locations 테이블 데이터 로드 ===
            print("\n📍 위치 기반 데이터 로딩...")
            
            # 맛집 데이터
            total_inserted += load_locations_data(
                cursor, '경상남도_함안군_맛집리스트.csv', '식음료', '맛집',
                {'name': '음식점명', 'address': '주소', 'lat': '위도', 'lon': '경도'}
            )
            
            # 카페 데이터
            total_inserted += load_locations_data(
                cursor, '경상남도_함안군_카페리스트.csv', '식음료', '카페',
                {'name': '업소명', 'address': '주소'}
            )
            
            # 병원 데이터
            total_inserted += load_locations_data(
                cursor, '경상남도_함안군_병의원정보.csv', '의료', '병원/의원',
                {'name': '의료기관명', 'address': '의료기관주소(도로명)', 'phone': '의료기관전화번호'}
            )
            
            # 경로당 데이터
            total_inserted += load_locations_data(
                cursor, '경상남도_함안군_경로당 현황.csv', '공공시설', '경로당',
                {'name': '경로당명', 'address': '주 소'}
            )
            
            # 마을회관 데이터
            total_inserted += load_locations_data(
                cursor, '경상남도_함안군_마을회관 현황.csv', '공공시설', '마을회관',
                {'name': '마을회관명', 'address': '주 소'}
            )
            
            # === culture 테이블 데이터 로드 ===
            print("\n📚 문화 데이터 로딩...")
            
            # 인물 데이터
            total_inserted += load_culture_data(
                cursor, '경상남도_함안군_인물.csv', '인물',
                {'title': '이름', 'story': '설명', 'url': '링크'}
            )
            
            # 전설 데이터
            total_inserted += load_culture_data(
                cursor, '경상남도_함안군_전설.csv', '전설',
                {'title': '제목', 'story': '상세정보', 'url': '링크'}
            )
        
        # 변경사항 커밋
        connection.commit()
        
        print("\n" + "=" * 50)
        print(f"🎉 작업 완료! 총 {total_inserted}개 레코드 삽입")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ 작업 중 오류 발생: {e}")
        connection.rollback()
        sys.exit(1)
        
    finally:
        connection.close()
        print("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()