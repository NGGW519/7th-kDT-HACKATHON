from faker import Faker
import random

# Faker 초기화
fake = Faker('ko_KR')

def create_dummy_chat_messages(num_sessions):
    """chat_messages 테이블에 더미 데이터를 생성하는 함수"""
    chat_messages_data = []
    for session_id in range(1, num_sessions + 1):
        num_messages = random.randint(5, 15)
        for message_order in range(1, num_messages + 1):
            sender = 'user' if message_order % 2 != 0 else 'ai'
            message_text = fake.text()
            created_at = fake.date_time_this_year()

            chat_messages_data.append((session_id, sender, message_text, message_order, created_at))
    return chat_messages_data

def generate_sql_insert_statements(data, table_name, columns):
    """SQL INSERT 문을 생성하여 파일에 저장하는 함수"""
    sql_statements = []
    for record in data:
        # 각 값을 SQL에 맞게 포맷팅
        formatted_values = []
        for value in record:
            if isinstance(value, str):
                # 문자열은 작은따옴표로 감싸고, 내부의 작은따옴표는 이스케이프 처리
                formatted_values.append(f"'{value.replace("'", "''")}'")
            elif value is None:
                formatted_values.append("NULL")
            else:
                formatted_values.append(str(value))
        
        placeholders = ', '.join(formatted_values)
        columns_str = ', '.join(columns)
        sql = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders});"
        sql_statements.append(sql)
    return "\n".join(sql_statements)

if __name__ == "__main__":
    # 12_insert_chat_sessions.sql 생성 로직에 따라 생성된 세션의 총 개수를 알아야 합니다.
    # 여기서는 100명의 유저가 1~3개의 세션을 가지므로, 평균 2개로 가정하여 200개의 세션이 있다고 가정합니다.
    num_chat_sessions = 200

    # chat_messages 테이블 더미 데이터 생성
    chat_messages_columns = ["session_id", "sender", "message_text", "message_order", "created_at"]
    chat_messages_data = create_dummy_chat_messages(num_chat_sessions)

    # SQL INSERT 문 생성
    sql_content = generate_sql_insert_statements(chat_messages_data, "chat_messages", chat_messages_columns)

    # 파일에 저장
    with open("C:\\Aicamp\\7th-kDT-HACKATHON\\DummyDB\\13_insert_chat_messages.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)
    
    print("DummyDB/13_insert_chat_messages.sql 파일이 생성되었습니다.")
