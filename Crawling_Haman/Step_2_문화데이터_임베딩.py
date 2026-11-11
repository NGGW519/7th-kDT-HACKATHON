#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Step 2: culture 테이블의 이야기를 임베딩해 rag_documents(pgvector)에 저장한다.

임베딩은 미션 추천과 같은 OpenRouter 무료 모델(.env 의 EMBEDDING_MODEL)을 쓴다.
같은 모델이어야 백엔드 챗봇이 문화·미션 데이터를 한 번에 검색할 수 있다.

실행 전: Step 1 로 culture 데이터가 적재되어 있어야 합니다.
"""

import os
import sys

import psycopg
from dotenv import load_dotenv
from openai import OpenAI
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

load_dotenv()

# DB 접속 정보는 .env 의 POSTGRES_* 값을 사용 (비밀번호를 코드에 넣지 않음)
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', ''),
    'dbname': os.getenv('POSTGRES_DB', 'hometown_on'),
}

COLLECTION_NAME = "haman_culture"
BATCH_SIZE = 50
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nvidia/nemotron-3-embed-1b:free")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")


def to_pgvector(values) -> str:
    """임베딩(numpy 배열/리스트)을 pgvector 리터럴 '[...]' 로 변환한다."""
    return "[" + ",".join(str(float(v)) for v in values) + "]"


def get_db_connection() -> psycopg.Connection:
    try:
        # autocommit: 아래 `with connection.transaction()` 블록이 실제 BEGIN/COMMIT 이 되도록 함
        # (autocommit 이 아니면 앞선 SELECT 가 연 트랜잭션 안의 SAVEPOINT 가 되어 종료 시 롤백됨)
        connection = psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=True)
        print("✅ PostgreSQL 데이터베이스 연결 성공")
        return connection
    except psycopg.Error as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        sys.exit(1)


def get_embedding_client() -> OpenAI:
    """OpenRouter 클라이언트 (OpenAI 호환 API)."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ OPENROUTER_API_KEY 가 설정되지 않았습니다. 루트 .env 를 확인하세요.")
        sys.exit(1)
    return OpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)


def embed(client, texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in response.data]


def fetch_culture_data(connection) -> list[dict]:
    print("📚 culture 데이터 로딩...")
    rows = connection.execute(
        """
        SELECT id, title, story, category
        FROM culture
        WHERE story IS NOT NULL AND char_length(story) > 10
        ORDER BY id
        """
    ).fetchall()
    print(f"✅ 총 {len(rows)}개의 문화 데이터 로드 완료")
    return rows


def process_and_embed_data(connection, culture_data, client) -> int:
    """컬렉션을 새로 만들고(기존 데이터 삭제) 배치 단위로 임베딩해 저장한다. 실패 시 전체 롤백."""
    print("🔄 데이터 임베딩 및 저장 중...")
    documents = [f"제목: {item['title']}\n내용: {item['story']}" for item in culture_data]

    with connection.transaction():
        connection.execute("DELETE FROM rag_documents WHERE collection_name = %s", (COLLECTION_NAME,))
        total = len(documents)
        for start in range(0, total, BATCH_SIZE):
            batch_items = culture_data[start:start + BATCH_SIZE]
            batch_docs = documents[start:start + BATCH_SIZE]
            print(f"   📊 배치 {start // BATCH_SIZE + 1}/{(total - 1) // BATCH_SIZE + 1} 처리 중...")

            embeddings = embed(client, batch_docs)
            connection.cursor().executemany(
                """
                INSERT INTO rag_documents
                    (collection_name, source_table, source_id, content, doc_metadata, embedding, embedding_model)
                VALUES (%s, 'culture', %s, %s, %s, %s::vector, %s)
                """,
                [
                    (
                        COLLECTION_NAME, item['id'], doc,
                        Jsonb({"title": item['title'], "category": item['category']}),
                        to_pgvector(vec), EMBEDDING_MODEL,
                    )
                    for item, doc, vec in zip(batch_items, batch_docs, embeddings)
                ],
            )
            print(f"   ✅ {min(start + BATCH_SIZE, total)}/{total} 완료")

    print(f"🎉 총 {len(documents)}개 벡터 데이터 저장 완료")
    return len(documents)


def verify_data(connection) -> bool:
    print("🔍 저장된 데이터 검증 중...")
    count = connection.execute(
        "SELECT count(*) AS n FROM rag_documents WHERE collection_name = %s", (COLLECTION_NAME,)
    ).fetchone()["n"]
    print(f"✅ 저장된 문서 수: {count}")
    for row in connection.execute(
        """
        SELECT source_id, doc_metadata, vector_dims(embedding) AS dims
        FROM rag_documents WHERE collection_name = %s ORDER BY source_id LIMIT 3
        """,
        (COLLECTION_NAME,),
    ):
        meta = row["doc_metadata"]
        print(f"   - culture_{row['source_id']} | {meta['category']} | {meta['title']} ({row['dims']}차원)")
    return count > 0


def main():
    print("🚀 문화 데이터 임베딩 작업 시작 (OpenRouter → PostgreSQL pgvector)")
    print("=" * 50)
    connection = get_db_connection()
    try:
        culture_data = fetch_culture_data(connection)
        if not culture_data:
            print("⚠️  처리할 데이터가 없습니다. Step 1 을 먼저 실행하세요.")
            return

        print(f"🤖 임베딩 모델: {EMBEDDING_MODEL} (OpenRouter)")
        processed_count = process_and_embed_data(connection, culture_data, get_embedding_client())

        if not verify_data(connection):
            print("❌ 데이터 검증 실패")
            sys.exit(1)
        print("\n" + "=" * 50)
        print("🎉 임베딩 작업 완료!")
        print(f"📊 처리된 데이터: {processed_count}개")
        print(f"🤖 사용된 모델: {EMBEDDING_MODEL}")
        print(f"💾 저장 위치: rag_documents (collection='{COLLECTION_NAME}')")
        print("=" * 50)
    except Exception as e:
        print(f"❌ 작업 중 오류 발생: {e}")
        sys.exit(1)
    finally:
        connection.close()
        print("🔌 데이터베이스 연결 종료")


if __name__ == "__main__":
    main()
