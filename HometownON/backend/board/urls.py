from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, CategoryViewSet, test_user_login, UserDetailView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('test-login/', test_user_login, name='test_user_login'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
]
