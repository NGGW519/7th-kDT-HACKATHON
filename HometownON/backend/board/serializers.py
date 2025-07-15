from rest_framework import serializers
from .models import Category, Post, Comment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'parent', 'session_id', 'is_anonymous', 'content', 'created_at', 'updated_at', 'likes', 'replies']
        read_only_fields = ('session_id',)

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return None

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'category', 'is_anonymous', 'title', 'content', 'created_at', 'updated_at', 'view_count', 'likes', 'comments']
        read_only_fields = ()
