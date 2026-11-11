"""기본 미션(모두에게 보이는 미션)을 PostgreSQL 에 넣는다. 같은 code 가 있으면 내용을 갱신한다.

사용법 (저장소 루트에서):  python scripts/insert_sample_missions.py
DB 접속 정보는 루트 .env 의 POSTGRES_* 를 쓴다. 미션 완료 여부는 사용자별(mission_assignments)이라
여기서는 미션 자체만 넣는다.
"""
import json
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def generate_sample_missions():
    """Generates a list of sample mission data."""
    missions = [
        {
            'code': 'EXP001',
            'title': '함안군청 방문하기',
            'mission_type': 'exploration',
            'difficulty': 1,
            'expected_minutes': 30,
            'tags': '관공서,탐방,지역',
            'description': '함안군청을 방문하여 지역 행정의 중심을 느껴보세요.',
            'thumbnail_image': 'thumbnail_hamangun_office.png'
        },
        {
            'code': 'BND001',
            'title': '가야시장 상인과 대화하기',
            'mission_type': 'bonding',
            'difficulty': 2,
            'expected_minutes': 45,
            'tags': '시장,교류,소통',
            'description': '가야시장을 방문하여 상인과 5분 이상 대화해보세요.',
            'thumbnail_image': 'thumbnail_gaya_market.png'
        },
        {
            'code': 'CAR001',
            'title': '함안군립도서관에서 책 읽기',
            'mission_type': 'career',
            'difficulty': 1,
            'expected_minutes': 60,
            'tags': '학습,독서,문화',
            'description': '함안군립도서관에서 1시간 이상 책을 읽어보세요.',
            'thumbnail_image': 'thumbnail_library.png'
        },
        {
            'code': 'EXP002',
            'title': '입곡군립공원 산책하기',
            'mission_type': 'exploration',
            'difficulty': 1,
            'expected_minutes': 90,
            'tags': '공원,자연,산책',
            'description': '입곡군립공원을 산책하며 자연을 만끽하세요.',
            'thumbnail_image': 'thumbnail_ipgok_park.png'
        },
        {
            'code': 'BND002',
            'title': '경로당 어르신께 인사드리기',
            'mission_type': 'bonding',
            'difficulty': 1,
            'expected_minutes': 20,
            'tags': '경로당,어르신,인사',
            'description': '가까운 경로당을 방문하여 어르신께 공손히 인사드려보세요.',
            'thumbnail_image': 'thumbnail_senior_center.png'
        },
        {
            'code': 'CAR002',
            'title': '함안군 농업기술센터 견학',
            'mission_type': 'career',
            'difficulty': 2,
            'expected_minutes': 120,
            'tags': '농업,기술,견학',
            'description': '함안군 농업기술센터를 방문하여 지역 농업 기술에 대해 알아보세요.',
            'thumbnail_image': 'thumbnail_agri_tech_center.png'
        },
        {
            'code': 'EXP003',
            'title': '함안박물관 관람하기',
            'mission_type': 'exploration',
            'difficulty': 2,
            'expected_minutes': 75,
            'tags': '역사,문화,박물관',
            'description': '함안박물관을 관람하며 함안의 역사와 문화를 배워보세요.',
            'thumbnail_image': 'thumbnail_haman_museum.png'
        },
        {
            'code': 'BND003',
            'title': '지역 동호회 참여하기',
            'mission_type': 'bonding',
            'difficulty': 3,
            'expected_minutes': 180,
            'tags': '동호회,취미,교류',
            'description': '관심 있는 지역 동호회에 참여하여 새로운 사람들을 만나보세요.',
            'thumbnail_image': 'thumbnail_club.png'
        },
        {
            'code': 'CAR003',
            'title': '온라인 직업 교육 수강하기',
            'mission_type': 'career',
            'difficulty': 3,
            'expected_minutes': 240,
            'tags': '온라인,교육,직업',
            'description': '함안군에서 제공하는 온라인 직업 교육을 4시간 이상 수강해보세요.',
            'thumbnail_image': 'thumbnail_online_edu.png'
        },
    ]
    return missions


def main():
    with psycopg.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"), port=int(os.getenv("POSTGRES_PORT", 5432)),
        user=os.getenv("POSTGRES_USER", "postgres"), password=os.getenv("POSTGRES_PASSWORD"),
        dbname=os.getenv("POSTGRES_DB", "hometown_on"),
    ) as conn:
        for m in generate_sample_missions():
            tags = [t.strip() for t in m["tags"].split(",") if t.strip()]
            conn.execute(
                """INSERT INTO missions (code, title, mission_type, difficulty, expected_minutes, tags, description, thumbnail_image)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, mission_type = EXCLUDED.mission_type,
                     difficulty = EXCLUDED.difficulty, expected_minutes = EXCLUDED.expected_minutes, tags = EXCLUDED.tags,
                     description = EXCLUDED.description, thumbnail_image = EXCLUDED.thumbnail_image""",
                (m["code"], m["title"], m["mission_type"], m["difficulty"], m["expected_minutes"],
                 json.dumps(tags, ensure_ascii=False), m["description"], m["thumbnail_image"]),
            )
        count = conn.execute("SELECT count(*) FROM missions WHERE created_by_user_id IS NULL").fetchone()[0]
    print(f"기본 미션 {len(generate_sample_missions())}개를 넣었습니다 (현재 기본 미션 {count}개).")


if __name__ == "__main__":
    main()
