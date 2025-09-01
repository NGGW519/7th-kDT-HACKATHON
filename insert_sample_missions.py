import pymysql
import os
from datetime import datetime

# Assuming db_config.py exists in Ai_llm/mission_suggest/
# If not, replace with actual credentials or create db_config.py
try:
    from Ai_llm.mission_suggest.db_config import DB_CONFIG
except ImportError:
    print("Warning: db_config.py not found or DB_CONFIG not defined. Using placeholder credentials.")
    DB_CONFIG = {
        'host': 'localhost',
        'user': 'your_mysql_user',
        'password': 'your_mysql_password',
        'db': 'your_database_name',
        'charset': 'utf8mb4',
        'cursorclass': pymysql.cursors.DictCursor
    }

def create_connection():
    """Establishes a database connection."""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        print("Database connection established successfully.")
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def insert_mission(cursor, mission_data):
    """Inserts a single mission into the missions table."""
    sql = """
    INSERT INTO missions (
        code, title, mission_type, difficulty, expected_minutes,
        tags, description, thumbnail_image, status
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    try:
        cursor.execute(sql, (
            mission_data['code'],
            mission_data['title'],
            mission_data['mission_type'],
            mission_data['difficulty'],
            mission_data['expected_minutes'],
            mission_data['tags'],
            mission_data['description'],
            mission_data['thumbnail_image'],
            mission_data['status']
        ))
        print(f"Mission '{mission_data['title']}' inserted successfully.")
    except Exception as e:
        print(f"Error inserting mission '{mission_data['title']}': {e}")

def generate_sample_missions():
    """Generates a list of sample mission data."""
    missions = [
        {
            'code': 'EXP001',
            'title': '함안군청 방문하기',
            'mission_type': 'exploration',
            'difficulty': 'easy',
            'expected_minutes': 30,
            'tags': '관공서,탐방,지역',
            'description': '함안군청을 방문하여 지역 행정의 중심을 느껴보세요.',
            'thumbnail_image': 'thumbnail_hamangun_office.png',
            'status': 'today'
        },
        {
            'code': 'BND001',
            'title': '가야시장 상인과 대화하기',
            'mission_type': 'bonding',
            'difficulty': 'medium',
            'expected_minutes': 45,
            'tags': '시장,교류,소통',
            'description': '가야시장을 방문하여 상인과 5분 이상 대화해보세요.',
            'thumbnail_image': 'thumbnail_gaya_market.png',
            'status': 'today'
        },
        {
            'code': 'CAR001',
            'title': '함안군립도서관에서 책 읽기',
            'mission_type': 'career',
            'difficulty': 'easy',
            'expected_minutes': 60,
            'tags': '학습,독서,문화',
            'description': '함안군립도서관에서 1시간 이상 책을 읽어보세요.',
            'thumbnail_image': 'thumbnail_library.png',
            'status': 'today'
        },
        {
            'code': 'EXP002',
            'title': '입곡군립공원 산책하기',
            'mission_type': 'exploration',
            'difficulty': 'easy',
            'expected_minutes': 90,
            'tags': '공원,자연,산책',
            'description': '입곡군립공원을 산책하며 자연을 만끽하세요.',
            'thumbnail_image': 'thumbnail_ipgok_park.png',
            'status': 'today'
        },
        {
            'code': 'BND002',
            'title': '경로당 어르신께 인사드리기',
            'mission_type': 'bonding',
            'difficulty': 'easy',
            'expected_minutes': 20,
            'tags': '경로당,어르신,인사',
            'description': '가까운 경로당을 방문하여 어르신께 공손히 인사드려보세요.',
            'thumbnail_image': 'thumbnail_senior_center.png',
            'status': 'today'
        },
        {
            'code': 'CAR002',
            'title': '함안군 농업기술센터 견학',
            'mission_type': 'career',
            'difficulty': 'medium',
            'expected_minutes': 120,
            'tags': '농업,기술,견학',
            'description': '함안군 농업기술센터를 방문하여 지역 농업 기술에 대해 알아보세요.',
            'thumbnail_image': 'thumbnail_agri_tech_center.png',
            'status': 'today'
        },
        {
            'code': 'EXP003',
            'title': '함안박물관 관람하기',
            'mission_type': 'exploration',
            'difficulty': 'medium',
            'expected_minutes': 75,
            'tags': '역사,문화,박물관',
            'description': '함안박물관을 관람하며 함안의 역사와 문화를 배워보세요.',
            'thumbnail_image': 'thumbnail_haman_museum.png',
            'status': 'today'
        },
        {
            'code': 'BND003',
            'title': '지역 동호회 참여하기',
            'mission_type': 'bonding',
            'difficulty': 'hard',
            'expected_minutes': 180,
            'tags': '동호회,취미,교류',
            'description': '관심 있는 지역 동호회에 참여하여 새로운 사람들을 만나보세요.',
            'thumbnail_image': 'thumbnail_club.png',
            'status': 'today'
        },
        {
            'code': 'CAR003',
            'title': '온라인 직업 교육 수강하기',
            'mission_type': 'career',
            'difficulty': 'hard',
            'expected_minutes': 240,
            'tags': '온라인,교육,직업',
            'description': '함안군에서 제공하는 온라인 직업 교육을 4시간 이상 수강해보세요.',
            'thumbnail_image': 'thumbnail_online_edu.png',
            'status': 'today'
        },
    ]
    return missions

def main():
    connection = create_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                sample_missions = generate_sample_missions()
                for mission in sample_missions:
                    insert_mission(cursor, mission)
            connection.commit()
            print("All sample missions inserted and committed.")
        except Exception as e:
            print(f"Transaction failed: {e}")
            connection.rollback()
        finally:
            connection.close()
            print("Database connection closed.")
    else:
        print("Could not establish database connection. Exiting.")

if __name__ == "__main__":
    main()
