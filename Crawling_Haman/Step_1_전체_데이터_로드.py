
import csv
import pymysql
import os

# --- 설정 ---
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'your_password'  # 실제 비밀번호를 입력하세요.
DB_NAME = 'haman_db'
BASE_DIR = "C:\\Users\\Playdata\\SKN\\해커톤\\7th-kDT-HACKATHON\\Crawling_Haman"

def get_db_connection():
    """데이터베이스 연결을 생성하고 반환합니다."""
    return pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD,
        db=DB_NAME, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor
    )

def load_locations_data(cursor, file_name, category_main, category_sub, col_map):
    """공통 장소 데이터를 locations 테이블에 적재하는 함수"""
    file_path = os.path.join(BASE_DIR, file_name)
    print(f"\n--- '{file_name}' 파일 처리 시작 ---")
    
    try:
        with open(file_path, mode='r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            insert_count = 0
            for row in reader:
                try:
                    name = row[col_map['name']]
                    address = row[col_map['address']]
                    phone = row.get(col_map.get('phone')) # 전화번호는 없을 수 있음

                    # 위도, 경도 처리 (없는 경우 NULL로 처리)
                    lat = row.get(col_map.get('lat'))
                    lon = row.get(col_map.get('lon'))
                    
                    if lat and lon:
                        point_wkt = f"POINT({lon} {lat})"
                    else:
                        # TODO: 향후 주소를 기반으로 지오코딩하여 좌표를 얻는 로직 추가 필요
                        # 일단은 (0,0)으로 저장하거나, NULL로 처리할 수 있습니다.
                        # 여기서는 예시로 (0,0)을 사용합니다.
                        point_wkt = "POINT(0 0)"

                    sql = """
                        INSERT INTO locations (name, category_main, category_sub, address, phone, geom)
                        VALUES (%s, %s, %s, %s, %s, ST_PointFromText(%s))
                    """
                    cursor.execute(sql, (name, category_main, category_sub, address, phone, point_wkt))
                    insert_count += 1
                except (KeyError, ValueError) as e:
                    print(f"  경고: 행 처리 중 오류 발생 (건너뜁니다). 행: {row}, 오류: {e}")
            print(f"성공: {insert_count}개의 데이터를 '{category_sub}'로 추가했습니다.")
            return insert_count
    except FileNotFoundError:
        print(f"  오류: 파일을 찾을 수 없습니다 - {file_path}")
        return 0

def load_culture_data(cursor, file_name, category, col_map):
    """문화 데이터를 culture 테이블에 적재하는 함수"""
    file_path = os.path.join(BASE_DIR, file_name)
    print(f"\n--- '{file_name}' 파일 처리 시작 ---")
    
    try:
        with open(file_path, mode='r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            insert_count = 0
            for row in reader:
                try:
                    title = row[col_map['title']]
                    story = row[col_map['story']]
                    haman_url = row.get(col_map.get('url'))

                    sql = """
                        INSERT INTO culture (title, category, story, haman_url)
                        VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(sql, (title, category, story, haman_url))
                    insert_count += 1
                except (KeyError, ValueError) as e:
                    print(f"  경고: 행 처리 중 오류 발생 (건너뜁니다). 행: {row}, 오류: {e}")
            print(f"성공: {insert_count}개의 데이터를 '{category}'로 추가했습니다.")
            return insert_count
    except FileNotFoundError:
        print(f"  오류: 파일을 찾을 수 없습니다 - {file_path}")
        return 0

def main():
    """메인 실행 함수"""
    db_conn = None
    total_inserted = 0
    try:
        db_conn = get_db_connection()
        print("MySQL 데이터베이스에 성공적으로 연결되었습니다.")
        
        with db_conn.cursor() as cursor:
            # --- locations 테이블 데이터 적재 ---
            total_inserted += load_locations_data(cursor, '경상남도_함안군_맛집리스트.csv', '식음료', '맛집', 
                                                {'name': '음식점명', 'address': '주소', 'lat': '위도', 'lon': '경도'})
            total_inserted += load_locations_data(cursor, '경상남도_함안군_병의원정보.csv', '의료', '병원/의원', 
                                                {'name': '의료기관명', 'address': '의료기관주소(도로명)', 'phone': '의료기관전화번호'})
            total_inserted += load_locations_data(cursor, '경상남도_함안군_경로당 현황.csv', '공공시설', '경로당', 
                                                {'name': '경로당명', 'address': '주 소'})
            
            # --- culture 테이블 데이터 적재 ---
            total_inserted += load_culture_data(cursor, '경상남도_함안군_인물.csv', '인물', 
                                              {'title': '이름', 'story': '설명', 'url': '링크'})
            total_inserted += load_culture_data(cursor, '경상남도_함안군_전설.csv', '전설', 
                                              {'title': '제목', 'story': '상세정보', 'url': '링크'})

        db_conn.commit()
        print(f"\n--- 작업 완료 ---")
        print(f"총 {total_inserted}개의 레코드를 데이터베이스에 성공적으로 추가했습니다.")

    except pymysql.MySQLError as e:
        print(f"데이터베이스 처리 중 오류 발생: {e}")
    finally:
        if db_conn:
            db_conn.close()
            print("데이터베이스 연결을 닫았습니다.")

if __name__ == "__main__":
    main()
