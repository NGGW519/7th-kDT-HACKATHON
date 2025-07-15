from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment, Category, PostLike, PostView, CommentLike
from .serializers import PostSerializer, CommentSerializer, CategorySerializer

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
        if not request.session.session_key:
            request.session.create()
        session_id = request.session.session_key
        if not PostView.objects.filter(post=instance, session_id=session_id).exists():
            instance.view_count += 1
            instance.save()
            PostView.objects.create(post=instance, session_id=session_id)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        if not request.session.session_key:
            request.session.create()
        session_id = request.session.session_key
        like, created = PostLike.objects.get_or_create(post=post, session_id=session_id)

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
        if not self.request.session.session_key:
            self.request.session.create()
        serializer.save(session_id=self.request.session.session_key)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        if not request.session.session_key:
            request.session.create()
        session_id = request.session.session_key
        like, created = CommentLike.objects.get_or_create(comment=comment, session_id=session_id)

        if created:
            comment.likes += 1
            comment.save()
            return Response({'status': 'like added'}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            comment.likes -= 1
            comment.save()
            return Response({'status': 'like removed'}, status=status.HTTP_204_NO_CONTENT)
