"""RAG 기반 미션 추천 (PostgreSQL + pgvector).

1) build_mission_vector_db(): 미션(+단계)을 임베딩(OpenRouter)으로 변환해 rag_documents 테이블에 저장
2) search_candidate_missions(): 사용자 프로필(지역/선호/보유 기술)과 유사한 미션을 검색 (완료한 미션 제외)
3) generate_recommendation(): 후보 미션을 근거로 LLM 이 3개를 추천하고 이유를 설명

실행:  python mission_rag.py [user_id]
"""
import json
import os
import sys
from functools import lru_cache

from openai import OpenAI
from psycopg.types.json import Jsonb

from db_config import get_connection, to_pgvector
from extract_missions import extract_mission_data

COLLECTION_NAME = "missions"
# OpenRouter 무료(:free) 모델 사용. 모델 이름은 '제공사/모델' 형식
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nvidia/nemotron-3-embed-1b:free")  # 2048차원
CHAT_MODEL = os.getenv("LLM_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")
# 무료 모델이 혼잡(429)할 때 OpenRouter 가 순서대로 대신 시도할 모델
FALLBACK_MODELS = [m.strip() for m in os.getenv(
    "LLM_FALLBACK_MODELS", "google/gemma-4-31b-it:free,dots-studio/dots-3-note-preview:free").split(",") if m.strip()]
# 지정하지 않으면 OpenRouter 가 모델 최대치 기준으로 잔액을 확인해 402 로 거절할 수 있음
MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", 1024))
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")


@lru_cache(maxsize=1)
def get_openai_client() -> OpenAI:
    """OpenRouter 클라이언트 (OpenAI 호환 API 라서 openai SDK 에 주소와 키만 지정)."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY 환경 변수가 설정되지 않았습니다. 루트 .env 를 확인하세요.")
    return OpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)


def embed(texts: list[str]) -> list[list[float]]:
    response = get_openai_client().embeddings.create(input=texts, model=EMBEDDING_MODEL)
    return [item.embedding for item in response.data]


def count_mission_documents() -> int:
    """현재 임베딩 모델로 만든 미션 벡터 수. 모델을 바꾸면 0 이 되어 다시 생성하게 된다
    (모델마다 벡터 차원이 달라 섞어서 비교할 수 없음)."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT count(*) AS n FROM rag_documents WHERE collection_name = %s AND embedding_model = %s",
            (COLLECTION_NAME, EMBEDDING_MODEL),
        ).fetchone()
    return row["n"]


def build_mission_vector_db(batch_size: int = 100) -> int:
    """미션 전체를 임베딩해 저장한다. 같은 미션은 덮어쓰고, DB 에서 사라진 미션은 지우므로 여러 번 실행해도 안전하다."""
    missions = extract_mission_data()
    with get_connection() as conn:
        for start in range(0, len(missions), batch_size):
            batch = missions[start:start + batch_size]
            embeddings = embed([m["content"] for m in batch])
            conn.cursor().executemany(
                """
                INSERT INTO rag_documents
                    (collection_name, source_table, source_id, content, doc_metadata, embedding, embedding_model)
                VALUES (%s, 'missions', %s, %s, %s, %s::vector, %s)
                ON CONFLICT (collection_name, source_table, source_id) DO UPDATE SET
                    content = EXCLUDED.content,
                    doc_metadata = EXCLUDED.doc_metadata,
                    embedding = EXCLUDED.embedding,
                    embedding_model = EXCLUDED.embedding_model
                """,
                [
                    (
                        COLLECTION_NAME, m["id"], m["content"],
                        Jsonb({"title": m["title"], "mission_type": m["mission_type"]}),
                        to_pgvector(vec), EMBEDDING_MODEL,
                    )
                    for m, vec in zip(batch, embeddings)
                ],
            )
        conn.execute(
            "DELETE FROM rag_documents WHERE collection_name = %s AND NOT (source_id = ANY(%s::bigint[]))",
            (COLLECTION_NAME, [m["id"] for m in missions]),
        )
    print(f"{len(missions)}개 미션 임베딩 저장 완료 (rag_documents, collection='{COLLECTION_NAME}')")
    return len(missions)


def get_user_profile(user_id: int) -> dict:
    """user_profiles / user_skills / mission_assignments 에서 추천에 필요한 정보를 모은다."""
    with get_connection() as conn:
        profile = conn.execute(
            """
            SELECT display_name, home_region, target_region, preferences, bio
            FROM user_profiles WHERE user_id = %s
            """,
            (user_id,),
        ).fetchone() or {}
        skills = conn.execute(
            """
            SELECT s.name, s.category, us.level
            FROM user_skills us JOIN skills s ON s.id = us.skill_id
            WHERE us.user_id = %s
            """,
            (user_id,),
        ).fetchall()
        completed = [
            row["mission_id"]
            for row in conn.execute(
                "SELECT mission_id FROM mission_assignments WHERE user_id = %s AND status = 'completed'",
                (user_id,),
            )
        ]

    preferences = profile.get("preferences")
    if isinstance(preferences, str):  # JSONB 는 dict 로 오지만, 문자열로 저장된 경우도 허용
        try:
            preferences = json.loads(preferences)
        except json.JSONDecodeError:
            pass

    return {
        "name": profile.get("display_name") or f"사용자 {user_id}",
        "home_region": profile.get("home_region") or "",
        "target_region": profile.get("target_region") or "",
        "preferences": preferences or {},
        "bio": profile.get("bio") or "",
        "skills": [f"{s['name']}({s['category']}, Lv.{s['level']})" for s in skills],
        "completed_mission_ids": completed,
    }


def profile_to_text(profile: dict) -> str:
    return "\n".join([
        f"고향: {profile['home_region']}",
        f"정착 희망 지역: {profile['target_region']}",
        f"관심사/선호: {json.dumps(profile['preferences'], ensure_ascii=False)}",
        f"보유 기술: {', '.join(profile['skills']) or '없음'}",
        f"자기소개: {profile['bio']}",
    ])


def search_candidate_missions(user_id: int, top_k: int = 5, profile: dict | None = None) -> list[dict]:
    """사용자 프로필과 의미상 가까운 미션 후보를 반환한다 (이미 완료한 미션은 SQL 에서 제외)."""
    profile = profile or get_user_profile(user_id)
    if count_mission_documents() == 0:
        raise RuntimeError(
            f"'{EMBEDDING_MODEL}' 로 만든 미션 임베딩이 없습니다. 먼저 build_mission_vector_db() 를 실행하세요."
        )

    query_vector = to_pgvector(embed([profile_to_text(profile)])[0])
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT source_id AS mission_id, content, embedding <=> %s::vector AS distance
            FROM rag_documents
            WHERE collection_name = %s
              AND embedding_model = %s
              AND NOT (source_id = ANY(%s::bigint[]))
            ORDER BY distance
            LIMIT %s
            """,
            (query_vector, COLLECTION_NAME, EMBEDDING_MODEL, profile["completed_mission_ids"], top_k),
        ).fetchall()
    return [dict(row) for row in rows]


def generate_recommendation(user_id: int, candidates: list[dict], profile: dict | None = None) -> str:
    profile = profile or get_user_profile(user_id)
    if not candidates:
        return "추천할 새 미션이 없습니다. 모든 후보 미션을 이미 완료하셨어요!"

    context = "\n\n".join(f"[후보 미션 ID {c['mission_id']}]\n{c['content']}" for c in candidates)
    prompt = f"""당신은 귀향자가 고향에 잘 정착하도록 돕는 AI 도우미 '고향으로 ON' 입니다.
아래 사용자 프로필과 후보 미션을 보고, 오늘 수행하면 좋을 미션 3개를 추천해주세요.
- 각 미션이 왜 이 사용자에게 적합한지 한두 문장으로 쉽고 친절하게 설명하세요.
- 가능하면 탐색형/사회유대형/커리어형이 골고루 섞이도록 하세요.
- 후보에 없는 미션은 만들지 마세요.

[사용자 프로필]
이름: {profile['name']}
{profile_to_text(profile)}

[후보 미션]
{context}
"""
    response = get_openai_client().chat.completions.create(
        model=CHAT_MODEL,
        temperature=0.7,
        max_tokens=MAX_TOKENS,
        # OpenRouter 는 models 배열을 3개까지만 허용 (넘으면 400)
        extra_body={"models": [CHAT_MODEL, *[m for m in FALLBACK_MODELS if m != CHAT_MODEL]][:3]},
        messages=[
            {"role": "system", "content": "당신은 귀향자 정착 미션 추천 전문가입니다."},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content


def recommend_missions(user_id: int, top_k: int = 5) -> str:
    profile = get_user_profile(user_id)
    candidates = search_candidate_missions(user_id, top_k=top_k, profile=profile)
    return generate_recommendation(user_id, candidates, profile=profile)


if __name__ == "__main__":
    target_user_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    if count_mission_documents() == 0:
        build_mission_vector_db()
    print(recommend_missions(target_user_id))
