
import pymysql
import chromadb
from sentence_transformers import SentenceTransformer
import os

# --- 설정 ---
# MySQL DB 정보
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'your_password'  # 실제 비밀번호를 입력하세요.
DB_NAME = 'haman_db'

# ChromaDB 설정
CHROMA_PERSIST_DIR = os.path.join(os.getcwd(), "chroma_db")
CHROMA_COLLECTION_NAME = "haman_culture"

# 사용할 임베딩 모델 설정 (한국어 특화 모델)
EMBEDDING_MODEL = 'jhgan/ko-sroberta-multitask'

def embed_and_load_to_chroma():
    """
    MySQL의 `culture` 테이블에서 데이터를 읽어와 임베딩한 후,
    ChromaDB 컬렉션에 저장합니다.
    """
    
    # 1. MySQL에서 데이터 가져오기
    print("1. MySQL에서 `culture` 데이터 로딩 시작...")
    try:
        db_conn = pymysql.connect(
            host=DB_HOST, user=DB_USER, password=DB_PASSWORD, 
            db=DB_NAME, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor
        )
        with db_conn.cursor() as cursor:
            sql = "SELECT id, title, story, category FROM culture WHERE story IS NOT NULL AND story != ''"
            cursor.execute(sql)
            culture_data = cursor.fetchall()
        db_conn.close()
        print(f"성공: 총 {len(culture_data)}개의 문화 데이터를 MySQL에서 가져왔습니다.")
    except pymysql.MySQLError as e:
        print(f"오류: MySQL에서 데이터를 가져오는 데 실패했습니다. {e}")
        return

    if not culture_data:
        print("처리할 데이터가 없습니다. 스크립트를 종료합니다.")
        return

    # 2. 임베딩 모델 불러오기
    print(f"2. 임베딩 모델({EMBEDDING_MODEL}) 로딩 시작...")
    try:
        model = SentenceTransformer(EMBEDDING_MODEL)
        print("성공: 임베딩 모델을 성공적으로 불러왔습니다.")
    except Exception as e:
        print(f"오류: 임베딩 모델을 불러오는 데 실패했습니다. {e}")
        return

    # 3. ChromaDB 클라이언트 및 컬렉션 준비
    print("3. ChromaDB 준비 시작...")
    try:
        # 파일 시스템에 데이터를 저장하는 Persistent Client 사용
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        # 컬렉션 가져오기 또는 생성하기
        collection = client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)
        print(f"성공: ChromaDB 클라이언트가 준비되었고, '{CHROMA_COLLECTION_NAME}' 컬렉션을 사용합니다.")
    except Exception as e:
        print(f"오류: ChromaDB를 준비하는 데 실패했습니다. {e}")
        return

    # 4. 데이터 임베딩 및 ChromaDB에 추가
    print("4. 데이터 임베딩 및 ChromaDB에 저장 시작...")
    
    # ChromaDB에 저장할 데이터 리스트 준비
    documents = []
    metadatas = []
    ids = []

    for item in culture_data:
        # 임베딩할 텍스트 조합 (제목과 이야기를 합쳐서 의미를 풍부하게 함)
        full_text = f"{item['title']}: {item['story']}"
        documents.append(full_text)
        
        # 메타데이터: 나중에 어떤 데이터인지 식별하기 위한 정보
        metadatas.append({
            "source": "culture",
            "category": item['category'],
            "mysql_id": item['id']
        })
        
        # ChromaDB의 ID는 문자열이어야 함
        ids.append(f"culture_{item['id']}")

    # 텍스트 임베딩 실행 (리스트 전체를 한 번에 처리하여 속도 향상)
    print("텍스트를 벡터로 변환 중입니다... (데이터 양에 따라 시간이 걸릴 수 있습니다)")
    embeddings = model.encode(documents, show_progress_bar=True)
    print("텍스트 벡터 변환 완료.")

    # ChromaDB 컬렉션에 데이터 추가
    try:
        collection.add(
            embeddings=embeddings.tolist(), # 넘파이 배열을 리스트로 변환
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"성공: 총 {len(ids)}개의 벡터 데이터를 ChromaDB에 저장했습니다.")
    except Exception as e:
        print(f"오류: ChromaDB에 데이터를 저장하는 데 실패했습니다. {e}")

if __name__ == "__main__":
    embed_and_load_to_chroma()
