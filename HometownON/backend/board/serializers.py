from rest_framework import serializers
from .models import Category, Post, Comment, User # User 모델 임포트 추가

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(read_only=True) # user 필드 추가

    class Meta:
        model = Comment
        fields = ['id', 'post', 'parent', 'user', 'is_anonymous', 'content', 'created_at', 'updated_at', 'replies'] # likes 제거
        read_only_fields = () # session_id 제거했으므로 read_only_fields도 변경

    def get_replies(self, obj): # 이 메서드 추가
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return None

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True) # 이 줄 추가

    class Meta:
        model = Post
        fields = ['id', 'category', 'user', 'is_anonymous', 'title', 'content', 'created_at', 'updated_at', 'view_count', 'likes', 'comments'] # 'user' 필드 추가
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
