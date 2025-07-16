import os
import pandas as pd
from dotenv import load_dotenv
import pymysql
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.document import Document
from langchain.schema.runnable import RunnablePassthrough, RunnableParallel

# .env 파일 로드
load_dotenv(dotenv_path=r'C:\Aicamp\7th-kDT-HACKATHON\.env')

print(f"DB_USER: {os.getenv('DB_USER')}")
print(f"DB_PASSWORD: {os.getenv('DB_PASSWORD')}")
print(f"OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY')[:5]}...") # 보안을 위해 일부만 출력

# --- 1. 데이터베이스 설정 및 데이터 로드 ---
def get_db_connection():
    """MySQL 데이터베이스 연결을 생성합니다."""
    try:
        conn = pymysql.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            db="hometown_on",
            charset="utf8"
        )
        return conn
    except pymysql.OperationalError as e:
        print(f"데이터베이스 연결 오류: {e}")
        print("DB 연결 정보를 확인하거나, hometown_on 데이터베이스가 실행 중인지 확인하세요.")
        return None

def load_data_from_db(conn):
    """데이터베이스에서 필요한 테이블들을 pandas DataFrame으로 로드합니다."""
    if not conn:
        return None, None, None, None
    try:
        users_df = pd.read_sql("SELECT * FROM users", conn)
        skills_df = pd.read_sql("SELECT * FROM user_skills", conn)
        missions_df = pd.read_sql("SELECT * FROM missions", conn)
        user_missions_df = pd.read_sql("SELECT * FROM user_missions", conn)
        return users_df, skills_df, missions_df, user_missions_df
    except Exception as e:
        print(f"데이터 로딩 중 오류 발생: {e}")
        return None, None, None, None

# --- 2. 데이터 전처리 및 문서 생성 ---
def create_documents(users_df, skills_df, missions_df, user_missions_df):
    """DataFrame을 LangChain Document 형식으로 변환합니다."""
    # 미션 정보를 Document로 변환
    mission_docs = []
    for _, row in missions_df.iterrows():
        content = f"미션명: {row['title']}\n유형: {row['type']}\n설명: {row['description']}"
        mission_docs.append(Document(page_content=content, metadata={'mission_id': row['id'], 'type': row['type']}))

    # 사용자 정보를 딕셔너리로 정리 (검색용)
    user_profiles = {}
    for _, user in users_df.iterrows():
        user_id = user['id']
        user_skills = skills_df[skills_df['user_id'] == user_id]['skill'].tolist()
        completed_missions = user_missions_df[
            (user_missions_df['user_id'] == user_id) & (user_missions_df['status'] == '완료')
        ]['mission_id'].tolist()
        
        user_profiles[user_id] = {
            "name": user['name'],
            "region": user['region'],
            "skills": ", ".join(user_skills) if user_skills else "없음",
            "completed_mission_ids": completed_missions
        }
    return mission_docs, user_profiles

# --- 3. RAG 파이프라인 구축 ---
def create_rag_pipeline(mission_docs, user_profiles):
    """ChromaDB와 LangChain을 사용하여 RAG 파이프라인을 생성합니다."""
    # OpenAI API 키 확인
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.")

    # 벡터 저장소 생성
    vectorstore = Chroma.from_documents(documents=mission_docs, embedding=OpenAIEmbeddings())
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    # 프롬프트 템플릿 정의
    template = """
    당신은 귀향자가 고향에 잘 정착하도록 돕는 AI 도우미 '고향으로ON'입니다.
    사용자의 프로필과 과거 미션 수행 이력을 바탕으로, 오늘 수행하면 좋을 새로운 미션을 3가지 추천해주세요.
    추천 시에는 각 미션이 왜 사용자에게 적합한지 간단하고 친절하게 설명해주세요.
    이미 완료한 미션은 추천하지 마세요.

    [사용자 프로필]
    - 이름: {name}
    - 거주 지역: {region}
    - 보유 기술: {skills}

    [과거 미션 수행 이력]
    - 완료한 미션 ID: {completed_mission_ids}

    [추천할 미션 후보]
    {context}

    [AI 추천]
    """
    prompt = ChatPromptTemplate.from_template(template)

    # LLM 모델 설정
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.7)

    # RAG 체인 구성
    rag_chain = (
        RunnablePassthrough.assign(
            context=(lambda x: x["user_id"]) | (lambda user_id: retriever.get_relevant_documents(user_profiles[user_id]['skills']))
        )
        | prompt
        | llm
    )
    return rag_chain

# --- 4. 메인 실행 로직 ---
if __name__ == "__main__":
    # 데이터베이스 연결 및 데이터 로드
    conn = get_db_connection()
    if conn:
        users_df, skills_df, missions_df, user_missions_df = load_data_from_db(conn)
        conn.close()

        if users_df is not None:
            # 문서 및 프로필 생성
            mission_docs, user_profiles = create_documents(users_df, skills_df, missions_df, user_missions_df)
            
            try:
                # RAG 파이프라인 생성
                rag_chain = create_rag_pipeline(mission_docs, user_profiles)

                # 추천받을 사용자 ID 선택 (예: 1번 사용자)
                target_user_id = 1
                user_info = user_profiles.get(target_user_id)

                if user_info:
                    print(f"--- 👤 {user_info['name']}님을 위한 오늘의 추천 미션 --- ")
                    
                    # RAG 체인 실행
                    result = rag_chain.invoke({
                        "user_id": target_user_id,
                        "name": user_info['name'],
                        "region": user_info['region'],
                        "skills": user_info['skills'],
                        "completed_mission_ids": user_info['completed_mission_ids']
                    })
                    
                    print(result.content)
                else:
                    print(f"{target_user_id}번 사용자를 찾을 수 없습니다.")

            except ValueError as e:
                print(f"오류: {e}")
            except Exception as e:
                print(f"미션 추천 중 예기치 않은 오류가 발생했습니다: {e}")
