import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from board.models import Category

def add_categories():
    categories_to_add = [
        ('자유 게시판', 1),
        ('만남/매칭 게시판', 2),
        ('정보 공유 게시판', 3),
        ('질문 답변 게시판', 4),
        ('건의사항 / 버그 제보', 5),
    ]

    for name, pk in categories_to_add:
        try:
            category, created = Category.objects.get_or_create(pk=pk, defaults={'name': name})
            if created:
                print(f"카테고리 '{name}' (ID: {pk}) 생성됨.")
            else:
                # 이미 존재하는 경우 이름 업데이트 (선택 사항)
                if category.name != name:
                    category.name = name
                    category.save()
                    print(f"카테고리 '{name}' (ID: {pk}) 이름 업데이트됨.")
                else:
                    print(f"카테고리 '{name}' (ID: {pk}) 이미 존재함.")
        except Exception as e:
            print(f"카테고리 '{name}' (ID: {pk}) 추가 중 오류 발생: {e}")

if __name__ == '__main__':
    add_categories()