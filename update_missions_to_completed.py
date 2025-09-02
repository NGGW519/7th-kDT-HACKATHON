import pymysql
import os
from datetime import datetime

# Database configuration
try:
    from Ai_llm.mission_suggest.db_config import DB_CONFIG
except ImportError:
    print("Warning: db_config.py not found. Using default configuration.")
    DB_CONFIG = {
        'host': 'localhost',
        'user': 'root',
        'password': 'password',
        'db': 'hometown_on',
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

def update_missions_to_completed(cursor, mission_codes):
    """Updates specified missions to completed status."""
    for code in mission_codes:
        sql = "UPDATE missions SET status = 'completed' WHERE code = %s"
        try:
            cursor.execute(sql, (code,))
            print(f"Mission '{code}' updated to completed status.")
        except Exception as e:
            print(f"Error updating mission '{code}': {e}")

def main():
    connection = create_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                # 테스트를 위해 몇 개의 미션을 완료 상태로 변경
                # 난이도 1 미션 2개 (100 EXP), 난이도 2 미션 1개 (100 EXP), 난이도 3 미션 1개 (150 EXP)
                # 총 350 EXP = 레벨 1 (350/1000)
                completed_missions = [
                    'EXP001',  # 난이도 1 (50 EXP)
                    'BND002',  # 난이도 1 (50 EXP)
                    'EXP003',  # 난이도 2 (100 EXP)
                    'BND001',  # 난이도 2 (100 EXP)
                    'CAR003'   # 난이도 3 (150 EXP)
                ]
                
                update_missions_to_completed(cursor, completed_missions)
                
            connection.commit()
            print("All missions updated and committed.")
            print("Total expected EXP: 450 (Level 1, 450/1000 to next level)")
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