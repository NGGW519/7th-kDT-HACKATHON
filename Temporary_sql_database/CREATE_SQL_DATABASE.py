# Python script to insert example data into “hometown_on” without errors

import pymysql
from datetime import datetime

def insert_example_data():
    conn = pymysql.connect(
        host='localhost', port=3306,
        user='gogimin', password='1111',
        db='hometown_on', charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )
    try:
        with conn.cursor() as cur:
            # users
            cur.execute("""
                INSERT IGNORE INTO users
                  (email,name,birth_year,region,adapt_score,created_at,updated_at)
                VALUES
                  (%s,%s,%s,%s,%s,%s,%s),
                  (%s,%s,%s,%s,%s,%s,%s),
                  (%s,%s,%s,%s,%s,%s,%s);
            """, [
                'chulsu@example.com','김철수',1970,'부산광역시',75.5,
                datetime(2025,6,1,10,0,0), datetime(2025,6,10,12,30,0),
                'younghee@example.com','이영희',1965,'대구광역시',82.0,
                datetime(2025,6,5,14,20,0), datetime(2025,6,15,9,45,0),
                'minsu@example.com','박민수',1972,'인천광역시',68.3,
                datetime(2025,6,10,8,15,0), datetime(2025,6,12,11,0,0)
            ])
            conn.commit()

            # social_accounts
            cur.execute("""
                INSERT INTO social_accounts
                  (user_id,provider,provider_user_id,access_token,refresh_token,expires_at,created_at)
                VALUES
                  (1,'google','113355','ya29.A0AR...','1//09b...',%s,%s),
                  (2,'kakao','7654321','A1B2C3D4...','E5F6G7H8...',%s,%s),
                  (3,'naver','NAVER123','xyz123token','refreshNavToken',%s,%s);
            """, [
                datetime(2025,7,1,9,0,0),  datetime(2025,6,1,10,0,0),
                datetime(2025,7,5,14,20,0), datetime(2025,6,5,14,20,0),
                datetime(2025,8,1,8,15,0),  datetime(2025,6,10,8,15,0)
            ])
            conn.commit()

            # user_skills
            cur.execute("""
                INSERT IGNORE INTO user_skills (user_id,skill,created_at,updated_at)
                VALUES
                  (1,'요리',%s,%s),(1,'목공',%s,%s),
                  (2,'재봉',%s,%s),(2,'원예',%s,%s),
                  (3,'컴퓨터',%s,%s);
            """, [
                datetime(2025,6,2,9,0,0), datetime(2025,6,2,9,0,0),
                datetime(2025,6,2,9,5,0), datetime(2025,6,2,9,5,0),
                datetime(2025,6,6,15,0,0),datetime(2025,6,6,15,0,0),
                datetime(2025,6,6,15,10,0),datetime(2025,6,6,15,10,0),
                datetime(2025,6,11,8,30,0),datetime(2025,6,11,8,30,0)
            ])
            conn.commit()

            # skill_certifications
            cur.execute("""
                INSERT INTO skill_certifications
                  (user_id,skill,status,verified_at,created_at,updated_at)
                VALUES
                  (1,'요리','승인',%s,%s,%s),
                  (2,'재봉','대기',NULL,%s,%s),
                  (3,'컴퓨터','거절',%s,%s,%s);
            """, [
                datetime(2025,6,15,10,0,0),datetime(2025,6,2,9,0,0),datetime(2025,6,15,10,0,0),
                datetime(2025,6,6,15,0,0), datetime(2025,6,6,15,0,0),
                datetime(2025,6,20,12,0,0),datetime(2025,6,11,8,30,0),datetime(2025,6,20,12,0,0)
            ])
            conn.commit()

            # missions
            cur.execute("""
                INSERT INTO missions
                  (title,type,description,start_at,end_at,created_at,updated_at)
                VALUES
                  (%s,%s,%s,%s,%s,%s,%s),
                  (%s,%s,%s,%s,%s,%s,%s),
                  (%s,%s,%s,%s,%s,%s,%s);
            """, [
                '지역 카페 탐방하기','탐색','동네 카페 탐방',
                datetime(2025,7,1), datetime(2025,7,31,23,59,59),
                datetime(2025,6,1), datetime(2025,6,1),
                '이웃과 인사하기','유대','이웃과 인사',
                datetime(2025,7,1), datetime(2025,7,31,23,59,59),
                datetime(2025,6,5), datetime(2025,6,5),
                '지역 봉사활동 참여','기부','사회 봉사 참여',
                datetime(2025,7,1), datetime(2025,7,31,23,59,59),
                datetime(2025,6,10),datetime(2025,6,10)
            ])
            conn.commit()

            # mission_parts
            cur.execute("""
                INSERT INTO mission_parts
                  (mission_id,part_order,title,description,created_at,updated_at)
                VALUES
                  (1,1,'카페 선택하기','카페 리스트 확인',%s,%s),
                  (1,2,'사진 찍기','카페 사진 찍기',%s,%s),
                  (2,1,'인사말 연습','인삿말 연습',%s,%s);
            """, [
                datetime(2025,6,1),datetime(2025,6,1),
                datetime(2025,6,1,0,5),datetime(2025,6,1,0,5),
                datetime(2025,6,5),datetime(2025,6,5)
            ])
            conn.commit()

            # user_mission_progress
            cur.execute("""
                INSERT INTO user_mission_progress
                  (user_id,mission_id,status,started_at,completed_at)
                VALUES
                  (1,1,'active',%s,NULL),
                  (1,2,'pending',NULL,NULL),
                  (2,1,'completed',%s,%s);
            """, [
                datetime(2025,7,2,9), datetime(2025,7,1,10), datetime(2025,7,1,12)
            ])
            conn.commit()

            # user_part_progress
            cur.execute("""
                INSERT INTO user_part_progress
                  (user_id,part_id,status,started_at,completed_at)
                VALUES
                  (1,1,'completed',%s,%s),
                  (1,2,'pending',NULL,NULL),
                  (2,1,'completed',%s,%s);
            """, [
                datetime(2025,7,2,9,30),datetime(2025,7,2,10),
                datetime(2025,7,1,10,20),datetime(2025,7,1,10,40)
            ])
            conn.commit()

            # user_missions (수정)
            cur.execute("""
                INSERT IGNORE INTO user_missions
                  (user_id,mission_id,status,feedback,completed_at,created_at,updated_at)
                VALUES
                  (1,1,'진행중','카페 분위기가 좋았어요.',NULL,%s,%s),
                  (2,1,'완료','커피 맛 훌륭함',%s,%s,%s);
            """, [
                # 첫 행 created_at, updated_at
                datetime(2025,7,2,9), datetime(2025,7,2,9),
                # 둘째 행 completed_at, created_at, updated_at
                datetime(2025,7,1,12), datetime(2025,7,1,10), datetime(2025,7,1,12)
            ])
            conn.commit()

            # badges
            cur.execute("""
                INSERT INTO badges
                  (user_id,title,issued_at,created_at,updated_at)
                VALUES
                  (1,'첫 카페 탐방',%s,%s,%s),
                  (2,'첫 인사',%s,%s,%s);
            """, [
                datetime(2025,7,2,9,30),datetime(2025,7,2,9,30),datetime(2025,7,2,9,30),
                datetime(2025,7,1,10,20),datetime(2025,7,1,10,20),datetime(2025,7,1,10,20)
            ])
            conn.commit()

            # location_logs
            cur.execute("""
                INSERT INTO location_logs
                  (user_id,mission_id,latitude,longitude,recorded_at)
                VALUES
                  (1,1,35.179554,129.075642,%s),
                  (2,1,35.179600,129.075700,%s);
            """, [
                datetime(2025,7,2,9,5), datetime(2025,7,1,10,5)
            ])
            conn.commit()

            # chat_sessions
            cur.execute("""
                INSERT INTO chat_sessions
                  (user_id,session_start,session_end)
                VALUES
                  (1,%s,%s),(2,%s,%s);
            """, [
                datetime(2025,7,2,9,10),datetime(2025,7,2,9,20),
                datetime(2025,7,1,10,25),datetime(2025,7,1,10,35)
            ])
            conn.commit()

            # chat_messages
            cur.execute("""
                INSERT INTO chat_messages
                  (session_id,sender,message_text,message_order,created_at)
                VALUES
                  (1,'user','안녕하세요!',1,%s),
                  (1,'ai','무엇을 도와드릴까요?',2,%s),
                  (2,'user','인사말 추천해줘',1,%s),
                  (2,'ai','안녕하세요, 반갑습니다!',2,%s);
            """, [
                datetime(2025,7,2,9,10,5),
                datetime(2025,7,2,9,10,10),
                datetime(2025,7,1,10,25,5),
                datetime(2025,7,1,10,25,10)
            ])
            conn.commit()

        print("Example data inserted successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    insert_example_data()
