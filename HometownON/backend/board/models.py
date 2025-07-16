from django.db import models

# TODO: 반복되는 created_at, updated_at 필드를 위한 BaseModel 추출 고려


class User(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    birth_year = models.IntegerField()
    region = models.CharField(max_length=100)
    adapt_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'birth_year', 'region']

    def __str__(self):
        return self.name

    @property
    def is_staff(self):
        return False # 또는 True로 설정하여 관리자 권한 부여

    @property
    def is_superuser(self):
        return False # 또는 True로 설정하여 관리자 권한 부여

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_active(self):
        return True


class SocialAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts')
    provider = models.CharField(max_length=50)
    provider_user_id = models.CharField(max_length=255)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]


class UserSkill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    skill = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'skill')
        indexes = [
            models.Index(fields=['user']),
        ]


class SkillCertification(models.Model):
    class Status(models.TextChoices):
        승인 = '승인'
        대기 = '대기'
        거절 = '거절'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    skill = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.대기)
    verified_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
        ]


class Mission(models.Model):
    class MissionType(models.TextChoices):
        탐색 = '탐색'
        유대 = '유대'
        기부 = '기부'

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=MissionType.choices)
    description = models.TextField(blank=True, null=True)
    start_at = models.DateTimeField(blank=True, null=True)
    end_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MissionPart(models.Model):
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE, related_name='parts')
    part_order = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['mission']),
        ]


class UserMissionProgress(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending'
        ACTIVE = 'active'
        COMPLETED = 'completed'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mission_progress')
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE, related_name='user_progress')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['mission']),
        ]


class UserPartProgress(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending'
        COMPLETED = 'completed'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='part_progress')
    part = models.ForeignKey(MissionPart, on_delete=models.CASCADE, related_name='user_progress')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['part']),
        ]


class UserMission(models.Model):
    class Status(models.TextChoices):
        완료 = '완료'
        진행중 = '진행중'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='missions')
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE, related_name='users')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.진행중)
    feedback = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'mission')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['mission']),
        ]


class Badge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    title = models.CharField(max_length=200)
    issued_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]


class LocationLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='location_logs')
    mission = models.ForeignKey(Mission, on_delete=models.SET_NULL, null=True, blank=True, related_name='location_logs')
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['mission']),
        ]


class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    session_start = models.DateTimeField()
    session_end = models.DateTimeField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]


class ChatMessage(models.Model):
    class Sender(models.TextChoices):
        USER = 'user'
        AI = 'ai'

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=Sender.choices)
    message_text = models.TextField()
    message_order = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['session']),
        ]


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts')
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts', null=True, blank=True) # User 모델 참조
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0) # TODO: 최적화를 위해 signals 또는 batch update 고려
    likes = models.IntegerField(default=0) # TODO: 최적화를 위해 signals 또는 batch update 고려
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='comments') # User 모델 참조
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies') # 이 줄 추가
    content = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'Comment by {self.user.name} on {self.post.title}'


class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_likes')
    # session_id 대신 user 사용
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_posts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['post', 'user'], name='unique_post_like')
        ]
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['user']),
        ]

class PostView(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_views')
    # session_id 대신 user 사용
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='viewed_posts')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['post', 'user'], name='unique_post_view')
        ]
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['user']),
        ]

class CommentLike(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='comment_likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_comments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together는 deprecated 예정이므로 UniqueConstraint 사용 권장
        # unique_together = ('comment', 'user')
        constraints = [
            models.UniqueConstraint(fields=['comment', 'user'], name='unique_comment_like')
        ]
        indexes = [
            models.Index(fields=['comment']),
            models.Index(fields=['user']),
        ]

