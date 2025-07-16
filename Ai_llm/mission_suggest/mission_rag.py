# chromadb, openai 등은 실제 환경에서 pip install 필요
import pymysql
from pymysql.cursors import DictCursor
import chromadb  # type: ignore
from chromadb.config import Settings  # type: ignore
from openai import OpenAI  # type: ignore
import os
from typing import List, Dict, Any
from dotenv import load_dotenv  # type: ignore
load_dotenv()

MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
MYSQL_DB = os.getenv('MYSQL_DB', 'hometown_on')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

CHROMA_PATH = './chroma_missions'
chroma_client = chromadb.Client(Settings(persist_directory=CHROMA_PATH))
collection = chroma_client.get_or_create_collection('missions')
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# MySQL에서 미션/미션파트 id, description만 불러오기
def fetch_mission_descriptions() -> List[Dict[str, Any]]:
    conn = pymysql.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, db=MYSQL_DB, charset='utf8')
    cursor = conn.cursor(DictCursor)
    cursor.execute('SELECT id, description FROM missions')
    missions = [{'type': 'mission', 'id': row['id'], 'description': row['description']} for row in cursor.fetchall()]
    cursor.execute('SELECT id, description FROM mission_parts')
    parts = [{'type': 'part', 'id': row['id'], 'description': row['description']} for row in cursor.fetchall()]
    conn.close()
    return missions + parts

# 벡터DB에 id, description만 저장
def build_mission_vector_db():
    items = fetch_mission_descriptions()
    texts = [item['description'] for item in items]
    ids = [f"{item['type']}_{item['id']}" for item in items]
    embeddings = []
    for text in texts:
        response = openai_client.embeddings.create(
            input=text,
            model='text-embedding-3-small'
        )
        embeddings.append(response.data[0].embedding)
    collection.add(documents=texts, embeddings=embeddings, ids=ids)
    print(f"{len(texts)}개 미션/파트 임베딩 저장 완료.")

# 유저 프로필(스킬, 관심사 등) 벡터화 예시
def get_user_profile_vector(user_id: int) -> List[float]:
    profile_text = 'Python, 데이터 분석, 여행'  # TODO: DB에서 유저 정보 불러와 합치기
    response = openai_client.embeddings.create(
        input=profile_text,
        model='text-embedding-3-small'
    )
    return response.data[0].embedding

# 벡터DB에서 유사한 id만 top-k로 반환
def search_similar_mission_ids(user_id: int, top_k: int = 5) -> List[str]:
    user_vec = get_user_profile_vector(user_id)
    results = collection.query(query_embeddings=[user_vec], n_results=top_k)
    return results['ids'][0] if results['ids'] else []

# id 리스트로 MySQL에서 미션/파트 원본 정보 조회
def get_mission_details_by_ids(ids: List[str]) -> List[Dict[str, Any]]:
    conn = pymysql.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, db=MYSQL_DB, charset='utf8')
    cursor = conn.cursor(DictCursor)
    details = []
    for id_str in ids:
        if id_str.startswith('mission_'):
            mission_id = int(id_str.split('_')[1])
            cursor.execute('SELECT id, title, description FROM missions WHERE id=%s', (mission_id,))
            row = cursor.fetchone()
            if row:
                details.append({'type': 'mission', **row})
        elif id_str.startswith('part_'):
            part_id = int(id_str.split('_')[1])
            cursor.execute('SELECT id, mission_id, description FROM mission_parts WHERE id=%s', (part_id,))
            row = cursor.fetchone()
            if row:
                details.append({'type': 'part', **row})
    conn.close()
    return details

# LLM 프롬프트에 원본 정보(제목+설명 등)로 추천
def recommend_missions(user_id: int) -> str:
    ids = search_similar_mission_ids(user_id)
    details = get_mission_details_by_ids(ids)
    prompt_lines = []
    for d in details:
        if d['type'] == 'mission':
            prompt_lines.append(f"[미션] {d['title']}\n{d['description']}")
        elif d['type'] == 'part':
            prompt_lines.append(f"[미션 파트] (미션ID: {d['mission_id']})\n{d['description']}")
    prompt = f"""
    아래는 유저의 프로필과 유사한 미션/파트 원본 정보입니다. 유저에게 가장 적합한 미션 3개를 추천해 주세요.
    ---
    {chr(10).join(prompt_lines)}
    """
    response = openai_client.chat.completions.create(
        model='gpt-4o',
        messages=[{"role": "system", "content": "당신은 미션 추천 전문가입니다."},
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

if __name__ == '__main__':
    build_mission_vector_db()
    user_id = 1  # 예시 유저
    print(recommend_missions(user_id)) 