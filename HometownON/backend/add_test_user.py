from board.models import User

test_user_data = {
    'email': 'testuser2@example.com',
    'name': '테스트유저2',
    'birth_year': 1991,
    'region': '부산',
    'adapt_score': 80.0
}

try:
    user = User.objects.create(**test_user_data)
    print(f"테스트 유저 '{user.name}' (ID: {user.id})가 성공적으로 추가되었습니다.")
except Exception as e:
    print(f"테스트 유저 추가 중 오류 발생: {e}")