
import csv
import pymysql
import os

# --- 설정 ---
# 보안을 위해 환경 변수나 별도의 설정 파일에서 DB 정보를 불러오는 것이 좋습니다.
# 예: os.environ.get('DB_HOST')
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'your_password'  # 실제 비밀번호를 입력하세요.
DB_NAME = 'haman_db'

# 처리할 CSV 파일 경로
CSV_FILE_PATH = 'C:\Users\Playdata\SKN\해커톤\7th-kDT-HACKATHON\Crawling_Haman\경상남도_함안군_맛집리스트.csv'

def load_restaurants_to_mysql():
    """
    '경상남도_함안군_맛집리스트.csv' 파일의 데이터를 읽어
    MySQL `locations` 테이블에 적재합니다.
    """
    db_conn = None
    try:
        # 데이터베이스 연결
        db_conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            db=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("MySQL 데이터베이스에 성공적으로 연결되었습니다.")

        with db_conn.cursor() as cursor:
            # CSV 파일 열기
            with open(CSV_FILE_PATH, mode='r', encoding='utf-8-sig') as csvfile:
                reader = csv.DictReader(csvfile)
                
                insert_count = 0
                for row in reader:
                    try:
                        # CSV의 각 행에서 데이터 추출
                        restaurant_name = row['음식점명']
                        address = row['주소']
                        # 좌표값이 비어있거나 유효하지 않은 경우 건너뛰기
                        if not row['위도'] or not row['경도']:
                            print(f"경고: '{restaurant_name}'의 좌표 정보가 없어 건너뜁니다.")
                            continue
                        
                        latitude = float(row['위도'])
                        longitude = float(row['경도'])

                        # INSERT 쿼리 생성
                        # MySQL의 POINT는 경도(longitude), 위도(latitude) 순서입니다.
                        sql = """
                            INSERT INTO locations 
                                (name, category_main, category_sub, address, geom)
                            VALUES 
                                (%s, %s, %s, %s, ST_PointFromText(%s))
                        """
                        # ST_PointFromText 함수를 사용하여 POINT 객체 생성
                        point_wkt = f"POINT({longitude} {latitude})"
                        
                        # 쿼리 실행
                        cursor.execute(sql, (
                            restaurant_name, 
                            '식음료',
                            '맛집',
                            address,
                            point_wkt
                        ))
                        insert_count += 1

                    except (ValueError, KeyError) as e:
                        print(f"오류: 행 처리 중 문제 발생. {row}. 오류: {e}")
                    except Exception as e:
                        print(f"데이터베이스 삽입 중 오류 발생: {e}")

        # 변경사항 커밋
        db_conn.commit()
        print(f"총 {insert_count}개의 맛집 데이터를 성공적으로 `locations` 테이블에 추가했습니다.")

    except pymysql.MySQLError as e:
        print(f"데이터베이스 연결 또는 쿼리 실행 중 오류 발생: {e}")
    finally:
        # 데이터베이스 연결 닫기
        if db_conn:
            db_conn.close()
            print("데이터베이스 연결을 닫았습니다.")

if __name__ == "__main__":
    load_restaurants_to_mysql()
