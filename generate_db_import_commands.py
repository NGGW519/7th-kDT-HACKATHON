import glob
import os

def generate_psql_commands(db_name, db_user, db_host='localhost', db_port='5432'):
    dummy_db_path = "C:/Aicamp/7th-kDT-HACKATHON/DummyDB"
    sql_files = sorted(glob.glob(os.path.join(dummy_db_path, "0*.sql")))

    if not sql_files:
        print(f"Error: No SQL files found in {dummy_db_path} matching '0*.sql'")
        return

    print("# 다음 명령어를 터미널에 복사하여 실행하십시오.")
    print("# psql이 비밀번호를 요청하면 직접 입력하십시오.")
    print(f"# 데이터베이스 이름: {db_name}, 사용자: {db_user}, 호스트: {db_host}, 포트: {db_port}")
    print("\n")

    for sql_file in sql_files:
        print(f"psql -h {db_host} -p {db_port} -U {db_user} -d {db_name} -f {sql_file}")

if __name__ == "__main__":
    # TODO: 실제 데이터베이스 이름과 사용자 이름을 여기에 입력하십시오.
    # 예시:
    # DB_NAME = "hometown_on_db"
    # DB_USER = "hometown_user"
    DB_NAME = "hometown_on" # 여기에 실제 DB 이름을 입력하세요
    DB_USER = "postgres"   # 여기에 실제 DB 사용자 이름을 입력하세요

    if DB_NAME == "your_db_name" or DB_USER == "your_user":
        print("경고: DB_NAME 또는 DB_USER를 실제 값으로 업데이트해야 합니다.")
        print("스크립트 파일을 열어 'your_db_name'과 'your_user'를 수정하십시오.")
    else:
        generate_psql_commands(DB_NAME, DB_USER)
