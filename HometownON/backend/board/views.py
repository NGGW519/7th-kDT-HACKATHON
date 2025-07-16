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

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_anonymous'):
            serializer.save(user=None) # 익명 게시글은 user를 None으로 설정
        else:
            if self.request.user.is_authenticated:
                serializer.save(user=self.request.user)
            else:
                # 로그인하지 않은 사용자가 익명으로 작성하지 않은 경우
                # 여기서는 에러를 발생시키도록 합니다.
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

        like, created = PostLike.objects.get_or_create(post=post, user=request.user) # user 사용

        if created:
            post.likes += 1
            post.save()
            return Response({'status': 'like added'}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            post.likes -= 1
            post.save()
            return Response({'status': 'like removed'}, status=status.HTTP_204_NO_CONTENT)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated: # 인증된 사용자만 댓글 작성 가능
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
            comment.likes += 1
            comment.save()
            return Response({'status': 'like added'}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            comment.likes -= 1
            comment.save()
            return Response({'status': 'like removed'}, status=status.HTTP_204_NO_CONTENT)

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
