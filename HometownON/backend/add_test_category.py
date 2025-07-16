from board.models import Category

# ID가 1인 카테고리가 없으면 '자유게시판'이라는 이름으로 생성
# 이미 존재하면 해당 객체를 가져옴
category, created = Category.objects.get_or_create(
    id=1, # 특정 ID를 지정
    defaults={'name': '자유게시판'}
)

if created:
    print(f"카테고리 '{category.name}' (ID: {category.id})가 성공적으로 생성되었습니다.")
else:
    print(f"카테고리 '{category.name}' (ID: {category.id})가 이미 존재합니다.")

# 현재 모든 카테고리 목록 확인 (선택 사항)
print("\n현재 모든 카테고리:")
for cat in Category.objects.all():
    print(f"- ID: {cat.id}, Name: {cat.name}")

