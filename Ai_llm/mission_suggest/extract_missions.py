import os
import pymysql
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

def extract_mission_data():
    db_name = os.getenv("POSTGRES_DB")
    db_user = os.getenv("POSTGRES_USER")
    db_password = os.getenv("POSTGRES_PASSWORD")
    db_host = os.getenv("POSTGRES_HOST", "localhost")
    db_port = os.getenv("POSTGRES_PORT", "5432")

    conn = None
    try:
        conn = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            db=db_name,
            charset='utf8'
        )
        cur = conn.cursor()

        # 미션 데이터를 쿼리합니다.
        # 필요에 따라 JOIN을 통해 mission_parts 등 다른 테이블의 정보를 가져올 수 있습니다.
        cur.execute("""
            SELECT
                id,
                mission_name,
                description,
                category,
                difficulty,
                required_skills,
                estimated_time,
                points,
                status
            FROM missions
            ORDER BY id;
        """)
        missions = cur.fetchall()

        # 데이터를 LangChain Document 형태로 변환하거나, 임베딩에 적합한 텍스트로 포맷팅합니다.
        # 여기서는 간단한 텍스트 포맷으로 변환합니다.
        formatted_missions = []
        for mission in missions:
            mission_id, name, desc, category, difficulty, skills, time, points, status = mission
            formatted_text = (
                f"미션 ID: {mission_id}\n"
                f"미션 이름: {name}\n"
                f"설명: {desc}\n"
                f"카테고리: {category}\n"
                f"난이도: {difficulty}\n"
                f"필요 기술: {skills if skills else '없음'}\n"
                f"예상 시간: {time if time else '정보 없음'}\n"
                f"포인트: {points}\n"
                f"상태: {status}"
            )
            formatted_missions.append({"id": mission_id, "content": formatted_text})

        print(f"총 {len(formatted_missions)}개의 미션 데이터를 추출했습니다.")
        return formatted_missions

    except Exception as e:
        print(f"데이터베이스 연결 또는 쿼리 중 오류 발생: {e}")
        return None
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    mission_data = extract_mission_data()
    if mission_data:
        # 추출된 데이터를 파일로 저장하거나 다음 단계로 전달할 수 있습니다.
        # 예: JSON 파일로 저장
        import json
        output_path = "C:/Aicamp/7th-kDT-HACKATHON/Ai_llm/mission_suggest/extracted_missions.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(mission_data, f, ensure_ascii=False, indent=4)
        print(f"추출된 미션 데이터를 {output_path}에 저장했습니다.")