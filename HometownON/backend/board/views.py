from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment, Category, PostLike, PostView, CommentLike
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers import PostSerializer, CommentSerializer, CategorySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
import logging

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_queryset(self):
        queryset = Post.objects.all()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category__id=category_id)
        return queryset

    def perform_create(self, serializer):
        category_id = self.request.data.get('category')
        print(f"[DEBUG] Received category_id: {category_id} (type: {type(category_id)})")
        if not category_id:
            raise serializers.ValidationError({"category": "카테고리가 선택되지 않았습니다."})

        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            raise serializers.ValidationError({"category": "존재하지 않는 카테고리입니다."})

        if serializer.validated_data.get('is_anonymous'):
            serializer.save(user=None, category=category)
        else:
            if self.request.user.is_authenticated:
                serializer.save(user=self.request.user, category=category)
            else:
                raise serializers.ValidationError("로그인하지 않은 사용자는 익명으로만 게시글을 작성할 수 있습니다.")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_authenticated and not PostView.objects.filter(post=instance, user=request.user).exists(): # user 사용
            instance.view_count += 1
            instance.save()
            PostView.objects.create(post=instance, user=request.user) # user 사용
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        like, created = PostLike.objects.get_or_create(post=post, user=request.user)

        if created:
            likes_count = PostLike.objects.filter(post=post).count()
            return Response({'status': 'like added', 'likes_count': likes_count}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            likes_count = PostLike.objects.filter(post=post).count()
            return Response({'status': 'like removed', 'likes_count': likes_count}, status=status.HTTP_200_OK) # 200 OK로 변경하고 likes_count 포함

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated: # 인증된 사용자만 댓글 작성 가능
            parent_comment_id = serializer.validated_data.get('parent')
            if parent_comment_id:
                # 부모 댓글이 존재하는지 확인
                try:
                    parent_comment = Comment.objects.get(id=parent_comment_id.id) # parent_comment_id는 Comment 인스턴스
                except Comment.DoesNotExist:
                    raise serializers.ValidationError("부모 댓글이 존재하지 않습니다.")

                # 부모 댓글이 이미 다른 댓글의 답글인지 확인 (즉, parent 필드가 None이 아닌지)
                if parent_comment.parent is not None:
                    raise serializers.ValidationError("답글에는 답글을 달 수 없습니다.")

            serializer.save(user=self.request.user)
        else:
            # 익명 댓글 허용 여부에 따라 로직 변경
            # 현재는 익명 댓글을 허용하지 않는 것으로 가정
            raise serializers.ValidationError("로그인하지 않은 사용자는 댓글을 작성할 수 없습니다.")

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        like, created = CommentLike.objects.get_or_create(comment=comment, user=request.user) # user 사용

        if created:
            return Response({'status': 'like added', 'likes_count': comment.comment_likes.count()}, status=status.HTTP_201_CREATED) # 좋아요 수 반환
        else:
            like.delete()
            return Response({'status': 'like removed', 'likes_count': comment.comment_likes.count()}, status=status.HTTP_204_NO_CONTENT) # 좋아요 수 반환

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def test_user_login(request):
    User = get_user_model()
    email = "testuser@example.com"
    name = "테스트유저"
    birth_year = 1990
    region = "서울"
    adapt_score = 75.5

    try:
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'name': name, 'birth_year': birth_year, 'region': region, 'adapt_score': adapt_score}
        )
        token, token_created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user_id': user.id, 'email': user.email}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"test_user_login error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
