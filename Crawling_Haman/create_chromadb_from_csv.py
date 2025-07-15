import pandas as pd
import chromadb
import os
import shutil

# 프로젝트 루트 디렉토리 경로 (7th-kDT-HACKATHON)
PROJECT_ROOT_DIR = "C:/SKN13_Documnet/SKN_KDT/7th-kDT-HACKATHON/"

# CSV 파일들이 위치한 기본 디렉토리 경로
BASE_DIR = os.path.join(PROJECT_ROOT_DIR, "Crawling_Haman/")

# ChromaDB 클라이언트 초기화
# 데이터를 영구적으로 저장하도록 설정
# ChromaDB 데이터는 '7th-kDT-HACKATHON' 폴더 바로 아래에 'chroma_db_data' 폴더로 저장됩니다.
CHROMA_DB_PATH = os.path.join(PROJECT_ROOT_DIR, "chroma_db_data")

print(f"ChromaDB 데이터가 저장될 경로: {CHROMA_DB_PATH}\n")

# 기존 ChromaDB 데이터 폴더 삭제 (선택 사항: 완전히 새로 시작하고 싶을 때)
# 이 코드를 활성화하면 스크립트 실행 시마다 기존 데이터가 삭제됩니다.
# if os.path.exists(CHROMA_DB_PATH):
#     print(f"기존 ChromaDB 데이터 폴더를 삭제합니다: {CHROMA_DB_PATH}")
#     shutil.rmtree(CHROMA_DB_PATH)

client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

# ChromaDB 컬렉션 이름
collection_name = "haman_local_data"

# 컬렉션 가져오기 또는 생성하기
try:
    collection = client.get_collection(name=collection_name)
    print(f"컬렉션 '{collection_name}'이(가) 이미 존재합니다. 새 데이터를 추가합니다.")
except:
    collection = client.create_collection(name=collection_name)
    print(f"컬렉션 '{collection_name}'이(가) 생성되었습니다.")

def process_csv(filepath, file_type):
    """
    CSV 파일을 읽어 ChromaDB에 저장할 documents, metadatas, ids를 생성하고 추가합니다.

    Args:
        filepath (str): 처리할 CSV 파일의 절대 경로.
        file_type (str): CSV 파일의 유형 ('sikdang', 'cafe_matjip', 'sitemap_full', 'sitemap_links', 'persons', 'legends').
    """
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        print(f"오류: {filepath} 파일을 읽을 수 없습니다. {e}")
        return

    documents = []
    metadatas = []
    ids = []
    filename = os.path.basename(filepath)

    for index, row in df.iterrows():
        doc_content = ""
        meta_data = {'source_file': filename}
        unique_id = f"{filename}_{index}"

        if file_type == "sikdang": # ansim_sikdang.csv, mobum_sikdang.csv
            업소명 = str(row.get('업소명', ''))
            소재지 = str(row.get('소재지', ''))
            업종 = str(row.get('업종', ''))
            업태 = str(row.get('업태', ''))
            전화번호 = str(row.get('전화번호', ''))

            doc_content = f"{업소명}은 {소재지}에 위치한 {업종} {업태} 음식점입니다."
            meta_data.update({
                '연번': row.get('연번', ''),
                '업종': 업종,
                '업태': 업태,
                '소재지': 소재지,
                '전화번호': 전화번호
            })
        elif file_type == "cafe_matjip": # hanan_cafe_list.csv, hanan_matjip_detailed.csv
            name_col = '카페명' if '카페명' in df.columns else '음식점명'
            이름 = str(row.get(name_col, ''))
            주소 = str(row.get('주소', ''))
            유형 = '카페' if '카페명' in df.columns else '음식점'
            상세페이지_링크 = str(row.get('상세페이지 링크', ''))
            위도 = row.get('위도', '')
            경도 = row.get('경도', '')

            doc_content = f"{이름}은 {주소}에 위치한 {유형}입니다."
            meta_data.update({
                '순번': row.get('순번', ''),
                '상세페이지 링크': 상세페이지_링크,
                '주소': 주소,
                '위도': 위도,
                '경도': 경도
            })
        elif file_type == "sitemap_full": # sitemap_full_contents.csv
            대주제 = str(row.get('대주제', ''))
            중주제 = str(row.get('중주제', ''))
            소주제 = str(row.get('소주제', ''))
            상세정보 = str(row.get('상세정보', ''))
            링크 = str(row.get('링크', ''))

            doc_content = f"{대주제} > {중주제} > {소주제}에 대한 정보입니다. 상세 내용: {상세정보}"
            meta_data.update({
                '대주제': 대주제,
                '중주제': 중주제,
                '소주제': 소주제,
                '링크': 링크
            })
        elif file_type == "sitemap_links": # sitemap_links.csv (이제 사용하지 않음)
            # 이 부분은 더 이상 사용되지 않지만, 혹시 모를 경우를 대비해 남겨둡니다.
            print(f"경고: sitemap_links.csv 파일은 더 이상 처리되지 않습니다. {filename} 파일은 건너뛰겠습니다.")
            continue
        elif file_type == "persons": # persons.csv
            이름 = str(row.get('이름', ''))
            링크 = str(row.get('링크', ''))
            특칭 = str(row.get('특칭', ''))
            설명 = str(row.get('설명', ''))

            doc_content = f"{이름} ({특칭}): {설명}"
            meta_data.update({
                '이름': 이름,
                '링크': 링크,
                '특칭': 특칭
            })
        elif file_type == "legends": # legends_with_details.csv
            제목 = str(row.get('제목', ''))
            링크 = str(row.get('링크', ''))
            상세정보 = str(row.get('상세정보', ''))

            doc_content = f"전설/이야기: {제목}. 상세 내용: {상세정보}"
            meta_data.update({
                '제목': 제목,
                '링크': 링크
            })
        else:
            print(f"경고: 알 수 없는 파일 타입 '{file_type}'입니다. {filename} 파일은 건너뛰겠습니다.")
            continue

        # 메타데이터의 None 값 또는 NaN 값을 빈 문자열로 변환
        cleaned_meta_data = {}
        for key, value in meta_data.items():
            if pd.isna(value) or value is None:
                cleaned_meta_data[key] = ""
            else:
                cleaned_meta_data[key] = value

        documents.append(doc_content)
        metadatas.append(cleaned_meta_data)
        ids.append(unique_id)

    if documents:
        print(f"'{filename}' 파일에서 {len(documents)}개의 문서를 ChromaDB에 추가 중...")
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"'{filename}' 파일의 데이터가 성공적으로 추가되었습니다.")
    else:
        print(f"'{filename}' 파일에서 추가할 문서가 없습니다.")

# 각 CSV 파일 처리
print("CSV 파일들을 ChromaDB에 추가하는 작업을 시작합니다...\n")

process_csv(os.path.join(BASE_DIR, "ansim_sikdang.csv"), "sikdang")
process_csv(os.path.join(BASE_DIR, "mobum_sikdang.csv"), "sikdang")
process_csv(os.path.join(BASE_DIR, "hanan_cafe_list.csv"), "cafe_matjip")
process_csv(os.path.join(BASE_DIR, "hanan_matjip_detailed.csv"), "cafe_matjip")
process_csv(os.path.join(BASE_DIR, "sitemap_full_contents.csv"), "sitemap_full")
# process_csv(os.path.join(BASE_DIR, "sitemap_links.csv"), "sitemap_links") # 이 라인을 주석 처리하여 제외
process_csv(os.path.join(BASE_DIR, "persons.csv"), "persons")
process_csv(os.path.join(BASE_DIR, "legends_with_details.csv"), "legends")

print("지정된 모든 CSV 파일이 처리되어 ChromaDB에 추가되었습니다.\n")
print(f"컬렉션 '{collection_name}'의 총 문서 수: {collection.count()}")

# # 예시 쿼리 (선택 사항: 데이터가 잘 추가되었는지 확인용)
# print("--- 예시 쿼리 실행 ---\n")
# query_results = collection.query(
#     query_texts=["함안 맛집 추천", "함안 관광 프로그램"],
#     n_results=5 # 상위 5개 결과 반환
# )

# for i, query_text in enumerate(query_results['query_texts']):
#     print(f"쿼리: '{query_text}'에 대한 결과:\n")
#     if query_results['documents'] and query_results['documents'][i]:
#         for j, doc in enumerate(query_results['documents'][i]):
#             print(f"  문서: {doc}")
#             print(f"  메타데이터: {query_results['metadatas'][i][j]}")
#             print("-" * 20)
#     else:
#         print("  결과를 찾을 수 없습니다.")