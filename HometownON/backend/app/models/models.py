"""SQLAlchemy 모델 (PostgreSQL + PostGIS + pgvector).

Crawling_Haman/Hometown_on.sql 과 테이블/컬럼/기본값/제약 이름까지 1:1 로 맞춘다.
- ENUM 은 VARCHAR + CHECK 제약(native_enum=False)으로 저장한다. 값 추가/삭제 시 ALTER TYPE 이 필요 없다.
- 기본값은 DB 쪽(server_default)에 둬서 스크립트로 직접 INSERT 해도 같은 값이 들어간다.
- updated_at 은 DB 트리거(set_updated_at)가 갱신한다.
"""
from geoalchemy2 import Geometry
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    DDL, BigInteger, Boolean, Column, Date, DateTime, Enum, FetchedValue, ForeignKey, Identity,
    Index, Integer, Numeric, SmallInteger, String, Text, Time, UniqueConstraint, event, false, text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


# ---------------------------------------------------------------------
# 공통 컬럼 헬퍼
# ---------------------------------------------------------------------
def pk_bigint():
    return Column(BigInteger, Identity(), primary_key=True)


def pk_int():
    return Column(Integer, Identity(), primary_key=True)


def created_at_col():
    return Column(DateTime(timezone=True), server_default=func.now())


def updated_at_col():
    # 값은 트리거가 넣고, ORM 은 UPDATE 후 다시 읽어온다
    return Column(DateTime(timezone=True), server_default=func.now(), server_onupdate=FetchedValue())


def choice(name: str, *values: str) -> Enum:
    """VARCHAR + CHECK 제약. 제약 이름은 ck_<테이블>_<name> (naming convention)."""
    return Enum(*values, name=name, native_enum=False, create_constraint=True)


def default(value) -> text:
    return text(f"'{value}'") if isinstance(value, str) else text(str(value))


# =====================================================================
# 1. 사람/계정/역량/배지
# =====================================================================
class User(Base):
    __tablename__ = 'users'
    id = pk_bigint()
    email = Column(String(255), unique=True)
    password_hash = Column(String(255))
    phone = Column(String(30))
    created_at = created_at_col()
    updated_at = updated_at_col()

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    social_accounts = relationship("SocialAccount", back_populates="user")
    skills = relationship("UserSkill", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")
    mission_assignments = relationship("MissionAssignment", back_populates="user")
    goals = relationship("UserGoal", back_populates="user")


class UserProfile(Base):
    __tablename__ = 'user_profiles'
    user_id = Column(BigInteger, ForeignKey('users.id'), primary_key=True)
    display_name = Column(String(80))
    profile_image = Column(String(500))
    birth_year = Column(SmallInteger)
    gender = Column(choice('gender', 'male', 'female', 'other'))
    home_region = Column(String(120))
    target_region = Column(String(120))
    preferences = Column(JSONB)
    bio = Column(Text)
    mentor_available = Column(Boolean, server_default=false())
    mentor_hourly_rate = Column(Integer)

    user = relationship("User", back_populates="profile")


class SocialAccount(Base):
    __tablename__ = 'social_accounts'
    __table_args__ = (
        UniqueConstraint('provider', 'provider_uid', name='uq_social_accounts_provider_uid'),
        Index('ix_social_accounts_user_id', 'user_id'),
    )
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    provider = Column(choice('provider', 'google', 'kakao', 'naver', 'apple'), nullable=False)
    provider_uid = Column(String(255), nullable=False)

    user = relationship("User", back_populates="social_accounts")


class Skill(Base):
    __tablename__ = 'skills'
    id = pk_bigint()
    code = Column(String(64), unique=True)
    name = Column(String(120))
    category = Column(String(80))


class UserSkill(Base):
    __tablename__ = 'user_skills'
    user_id = Column(BigInteger, ForeignKey('users.id'), primary_key=True)
    skill_id = Column(BigInteger, ForeignKey('skills.id'), primary_key=True)
    level = Column(SmallInteger)
    certified = Column(Boolean, server_default=false())

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")


class Badge(Base):
    __tablename__ = 'badges'
    id = pk_bigint()
    code = Column(String(64), unique=True)
    name = Column(String(120))
    description = Column(Text)


class UserBadge(Base):
    __tablename__ = 'user_badges'
    user_id = Column(BigInteger, ForeignKey('users.id'), primary_key=True)
    badge_id = Column(BigInteger, ForeignKey('badges.id'), primary_key=True)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")


# =====================================================================
# 2. 미션(추천/수행)
# =====================================================================
class Mission(Base):
    __tablename__ = 'missions'
    id = pk_bigint()
    code = Column(String(64), unique=True)
    title = Column(String(200))
    # exploration(탐색형) / bonding(사회유대형) / career(커리어형) - 앱과 챗봇이 쓰는 키
    mission_type = Column(choice('mission_type', 'exploration', 'bonding', 'career'), nullable=False)
    difficulty = Column(SmallInteger, server_default=default(1))
    expected_minutes = Column(SmallInteger)
    tags = Column(JSONB)
    description = Column(Text)
    thumbnail_image = Column(String(500))
    # 챗봇이 특정 사용자를 위해 만든 미션이면 그 사용자, 모두에게 보이는 기본 미션이면 NULL
    # (완료 여부는 사용자별로 mission_assignments.status 에 저장한다)
    created_by_user_id = Column(BigInteger, ForeignKey('users.id'), index=True)

    parts = relationship("MissionPart", back_populates="mission")


class MissionPart(Base):
    __tablename__ = 'mission_parts'
    __table_args__ = (UniqueConstraint('mission_id', 'step_no', name='uq_mission_parts_mission_step'),)
    id = pk_bigint()
    mission_id = Column(BigInteger, ForeignKey('missions.id'), nullable=False)
    step_no = Column(SmallInteger, nullable=False)
    instruction = Column(Text)
    checklist = Column(JSONB)

    mission = relationship("Mission", back_populates="parts")


class MissionAssignment(Base):
    __tablename__ = 'mission_assignments'
    __table_args__ = (
        Index('ix_mission_assignments_user_status', 'user_id', 'status'),
        Index('ix_mission_assignments_mission_id', 'mission_id'),
    )
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    mission_id = Column(BigInteger, ForeignKey('missions.id'), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(Date)
    status = Column(
        choice('status', 'assigned', 'in_progress', 'completed', 'skipped', 'canceled'),
        server_default=default('assigned'),
    )
    context = Column(JSONB)

    user = relationship("User", back_populates="mission_assignments")
    mission = relationship("Mission")
    progress = relationship("MissionProgress", back_populates="assignment", uselist=False)


class MissionProgress(Base):
    __tablename__ = 'mission_progress'
    assignment_id = Column(BigInteger, ForeignKey('mission_assignments.id'), primary_key=True)
    progress_pct = Column(SmallInteger, server_default=default(0))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    feedback = Column(Text)

    assignment = relationship("MissionAssignment", back_populates="progress")


class MissionPartProgress(Base):
    __tablename__ = 'mission_part_progress'
    assignment_id = Column(BigInteger, ForeignKey('mission_assignments.id'), primary_key=True)
    part_id = Column(BigInteger, ForeignKey('mission_parts.id'), primary_key=True)
    done = Column(Boolean, server_default=false())
    memo = Column(Text)
    done_at = Column(DateTime(timezone=True))


# =====================================================================
# 3. 지역 데이터 (PostGIS: 좌표는 POINT(경도 위도), SRID 4326)
# =====================================================================
class LocationCategory(Base):
    __tablename__ = 'location_categories'
    __table_args__ = (UniqueConstraint('main', 'sub', name='uq_location_categories_main_sub'),)
    id = pk_int()
    main = Column(String(50))
    sub = Column(String(80))


class Location(Base):
    __tablename__ = 'locations'
    __table_args__ = (
        Index('ix_locations_geom', 'geom', postgresql_using='gist'),
        # 근처 검색(crud/location.get_nearby_locations)은 geom::geography 로 거리를 재므로
        # 위 geometry 인덱스를 못 쓴다. 같은 식으로 만든 인덱스가 따로 있어야 ST_DWithin 이 인덱스를 탄다.
        Index('ix_locations_geom_geography', text('(geom::geography)'), postgresql_using='gist'),
        Index('ix_locations_category_id', 'category_id'),
        Index('ix_locations_name', 'name'),
    )
    id = pk_bigint()
    name = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey('location_categories.id'), nullable=False)
    address = Column(String(300), nullable=False)
    phone = Column(String(40))
    geom = Column(Geometry('POINT', srid=4326, spatial_index=False), nullable=False)
    extra = Column(JSONB)

    category = relationship("LocationCategory")


class LocationHours(Base):
    __tablename__ = 'location_hours'
    location_id = Column(BigInteger, ForeignKey('locations.id'), primary_key=True)
    weekday = Column(SmallInteger, primary_key=True)  # 0(일)~6(토)
    open_time = Column(Time)
    close_time = Column(Time)
    is_24h = Column(Boolean, server_default=false())


class LocationTag(Base):
    __tablename__ = 'location_tags'
    __table_args__ = (Index('ix_location_tags_tag', 'tag'),)
    location_id = Column(BigInteger, ForeignKey('locations.id'), primary_key=True)
    tag = Column(String(60), primary_key=True)


class Culture(Base):
    __tablename__ = 'culture'
    id = pk_bigint()
    category = Column(choice('category', '인물', '전설', '유래', '역사', '문화재'), nullable=False)
    title = Column(String(300), nullable=False)
    story = Column(Text, nullable=False)
    haman_url = Column(String(500))
    created_at = created_at_col()


# =====================================================================
# 4. 상호작용/로그
# =====================================================================
class ChatSession(Base):
    __tablename__ = 'chat_sessions'
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    session_data = Column(JSONB)


class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    __table_args__ = (Index('ix_chat_messages_session_created', 'session_id', 'created_at'),)
    id = pk_bigint()
    session_id = Column(BigInteger, ForeignKey('chat_sessions.id'), nullable=False)
    role = Column(choice('role', 'user', 'assistant', 'tool'), nullable=False)
    content = Column(Text, nullable=False)
    tokens = Column(Integer)
    created_at = created_at_col()


class ActivityLog(Base):
    __tablename__ = 'activity_logs'
    __table_args__ = (Index('ix_activity_logs_event_created', 'event_type', 'created_at'),)
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'))
    event_type = Column(String(80), nullable=False)
    payload = Column(JSONB)
    created_at = created_at_col()


class LocationLog(Base):
    __tablename__ = 'location_logs'
    __table_args__ = (
        Index('ix_location_logs_geom', 'geom', postgresql_using='gist'),
        Index('ix_location_logs_user_recorded', 'user_id', 'recorded_at'),
    )
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'))
    geom = Column(Geometry('POINT', srid=4326, spatial_index=False), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


# =====================================================================
# 5. RAG/임베딩 (pgvector, 기존 ChromaDB 대체)
# =====================================================================
class DataSource(Base):
    __tablename__ = 'data_sources'
    id = pk_int()
    name = Column(String(120), unique=True)
    description = Column(Text)


class RagDocument(Base):
    """검색 대상 문서 + 임베딩. collection_name 이 기존 Chroma 컬렉션 역할을 한다.

    임베딩 모델은 .env 의 EMBEDDING_MODEL 하나로 통일한다 (현재 MonoGPT text-embedding-3-small, 1536차원).
    모델을 바꿔도 테이블을 고치지 않도록 차원 없는 vector 를 쓰고,
    검색은 같은 collection_name·같은 embedding_model 벡터끼리만 한다.
    """
    __tablename__ = 'rag_documents'
    __table_args__ = (
        UniqueConstraint('collection_name', 'source_table', 'source_id', name='uq_rag_documents_source'),
    )
    id = pk_bigint()
    collection_name = Column(String(120), nullable=False)
    source_table = Column(choice('source_table', 'culture', 'locations', 'missions'), nullable=False)
    source_id = Column(BigInteger, nullable=False)
    content = Column(Text, nullable=False)
    doc_metadata = Column(JSONB)
    embedding = Column(Vector(), nullable=False)
    embedding_model = Column(String(160), nullable=False)
    created_at = created_at_col()


# =====================================================================
# 6. 커뮤니티 (게시판/매칭/댓글/좋아요/알림/메신저/평가)
# =====================================================================
class BoardPost(Base):
    """자유·의뢰·멘토 게시판 통합 테이블 (API 주소는 /api/board, /api/requests, /api/mentors 그대로).

    category 는 앱이 보내는 값을 그대로 저장한다 (게시판별로 쓰이는 값은 BOARD_CATEGORIES 참고).
    게시판별 추가 정보는 attributes(JSONB)에 둔다.
      request: budget, location, accepted_by
      mentor : experience, hourly_rate, location
    """
    __tablename__ = 'board_posts'
    __table_args__ = (
        Index('ix_board_posts_board_category_created', 'board_type', 'category', 'created_at'),
        Index('ix_board_posts_author_user_id', 'author_user_id'),
        Index('ix_board_posts_board_match_status', 'board_type', 'match_status'),
    )
    id = pk_bigint()
    author_user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    board_type = Column(choice('board_type', 'free', 'request', 'mentor'), nullable=False)
    category = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    images = Column(JSONB)
    attributes = Column(JSONB)
    # 의뢰 글의 진행 상태 (앱의 의뢰 상태 값과 동일). 자유·멘토 글은 NULL
    match_status = Column(choice('match_status', 'pending', 'matched', 'completed', 'cancelled'))
    views_count = Column(Integer, server_default=default(0))
    likes_count = Column(Integer, server_default=default(0))
    comments_count = Column(Integer, server_default=default(0))
    status = Column(choice('status', 'active', 'hidden', 'deleted'), server_default=default('active'))
    created_at = created_at_col()
    updated_at = updated_at_col()

    author = relationship("User")
    comments = relationship("BoardComment", back_populates="post")
    matches = relationship("Match", back_populates="post")

    # ---- API 응답용: attributes 안의 게시판별 값을 속성처럼 읽는다 ----
    def _attr(self, key):
        return (self.attributes or {}).get(key)

    budget = property(lambda self: self._attr('budget'))
    location = property(lambda self: self._attr('location'))
    accepted_by = property(lambda self: self._attr('accepted_by'))
    experience = property(lambda self: self._attr('experience'))
    hourly_rate = property(lambda self: self._attr('hourly_rate'))
    views = property(lambda self: self.views_count or 0)


# 게시판별로 앱/챗봇이 쓰는 카테고리 값 (참고용. DB 와 API 는 값을 제한하지 않는다)
BOARD_CATEGORIES = {
    'free': ('자유', '일상', '맛집', '추억', '기타'),  # 앱 글쓰기 화면은 '자유', 챗봇은 나머지
    'request': ('repair', 'agriculture', 'it', 'cleaning', 'installation'),
    'mentor': ('technical', 'agriculture', 'lifestyle', 'business', 'education', 'seeking', 'offering'),
}


class Match(Base):
    """의뢰·멘토 글과 사용자의 매칭 (의뢰 수락, 멘토링 신청)."""
    __tablename__ = 'matches'
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uq_matches_post_user'),
        Index('ix_matches_user_id', 'user_id'),
    )
    id = pk_bigint()
    post_id = Column(BigInteger, ForeignKey('board_posts.id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    status = Column(
        choice('status', 'proposed', 'accepted', 'rejected', 'completed'),
        server_default=default('proposed'),
    )
    created_at = created_at_col()

    post = relationship("BoardPost", back_populates="matches")


class BoardComment(Base):
    __tablename__ = 'board_comments'
    __table_args__ = (Index('ix_board_comments_post_created', 'post_id', 'created_at'),)
    id = pk_bigint()
    post_id = Column(BigInteger, ForeignKey('board_posts.id'), nullable=False)
    author_user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    parent_comment_id = Column(BigInteger, ForeignKey('board_comments.id'))
    likes_count = Column(Integer, server_default=default(0))
    status = Column(choice('status', 'active', 'hidden', 'deleted'), server_default=default('active'))
    created_at = created_at_col()
    updated_at = updated_at_col()

    post = relationship("BoardPost", back_populates="comments")
    author = relationship("User")
    parent = relationship("BoardComment", remote_side=[id])


class Like(Base):
    __tablename__ = 'likes'
    __table_args__ = (
        UniqueConstraint('user_id', 'target_type', 'target_id', name='uq_likes_user_target'),
        Index('ix_likes_target', 'target_type', 'target_id'),
    )
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    target_type = Column(choice('target_type', 'post', 'comment'), nullable=False)
    target_id = Column(BigInteger, nullable=False)
    created_at = created_at_col()


class Notification(Base):
    __tablename__ = 'notifications'
    __table_args__ = (Index('ix_notifications_user_read_created', 'user_id', 'is_read', 'created_at'),)
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    type = Column(
        choice('type', 'mission_complete', 'badge_earned', 'mentor_match', 'request_match',
               'comment', 'like', 'weather', 'system'),
        nullable=False,
    )
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSONB)
    is_read = Column(Boolean, server_default=false())
    created_at = created_at_col()


class Conversation(Base):
    __tablename__ = 'conversations'
    __table_args__ = (
        UniqueConstraint('user1_id', 'user2_id', name='uq_conversations_users'),
        Index('ix_conversations_user1_last', 'user1_id', 'last_message_at'),
        Index('ix_conversations_user2_last', 'user2_id', 'last_message_at'),
    )
    id = pk_bigint()
    user1_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    user2_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    last_message_at = Column(DateTime(timezone=True), server_default=func.now())
    user1_unread_count = Column(Integer, server_default=default(0))
    user2_unread_count = Column(Integer, server_default=default(0))
    status = Column(choice('status', 'active', 'blocked', 'deleted'), server_default=default('active'))
    created_at = created_at_col()


class ConversationMessage(Base):
    __tablename__ = 'conversation_messages'
    __table_args__ = (Index('ix_conversation_messages_conv_created', 'conversation_id', 'created_at'),)
    id = pk_bigint()
    conversation_id = Column(BigInteger, ForeignKey('conversations.id'), nullable=False)
    sender_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    message_type = Column(
        choice('message_type', 'text', 'image', 'file', 'system'), server_default=default('text')
    )
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, server_default=false())
    created_at = created_at_col()


class MentorReview(Base):
    __tablename__ = 'mentor_reviews'
    __table_args__ = (Index('ix_mentor_reviews_mentor_rating', 'mentor_user_id', 'rating'),)
    id = pk_bigint()
    mentor_user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    reviewer_user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    match_id = Column(BigInteger, ForeignKey('matches.id'))
    rating = Column(SmallInteger, nullable=False)
    comment = Column(Text)
    created_at = created_at_col()


# =====================================================================
# 7. 목표/날씨/공지
# =====================================================================
class UserGoal(Base):
    __tablename__ = 'user_goals'
    __table_args__ = (Index('ix_user_goals_user_status', 'user_id', 'status'),)
    id = pk_bigint()
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    goal_type = Column(
        choice('goal_type', 'mission_count', 'skill_level', 'community_participation', 'mentor_sessions'),
        nullable=False,
    )
    target_value = Column(Integer, nullable=False)
    current_value = Column(Integer, server_default=default(0))
    period = Column(choice('period', 'daily', 'weekly', 'monthly', 'yearly'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(
        choice('status', 'active', 'completed', 'paused', 'canceled'), server_default=default('active')
    )
    created_at = created_at_col()

    user = relationship("User", back_populates="goals")


class WeatherCache(Base):
    __tablename__ = 'weather_cache'
    __table_args__ = (UniqueConstraint('region', 'date', name='uq_weather_cache_region_date'),)
    id = pk_int()
    region = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    temperature_min = Column(Numeric(4, 1))
    temperature_max = Column(Numeric(4, 1))
    weather_condition = Column(String(50))
    description = Column(String(200))
    updated_at = updated_at_col()


class Announcement(Base):
    __tablename__ = 'announcements'
    id = pk_bigint()
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(choice('type', 'notice', 'update', 'event', 'maintenance'), nullable=False)
    is_important = Column(Boolean, server_default=false())
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    status = Column(choice('status', 'active', 'inactive'), server_default=default('active'))
    created_at = created_at_col()


# =====================================================================
# DDL: 확장 모듈, updated_at 트리거 (Hometown_on.sql 과 동일)
# =====================================================================
event.listen(Base.metadata, "before_create", DDL("CREATE EXTENSION IF NOT EXISTS postgis"))
event.listen(Base.metadata, "before_create", DDL("CREATE EXTENSION IF NOT EXISTS vector"))
event.listen(
    Base.metadata,
    "before_create",
    DDL(
        "CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$ "
        "BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql"
    ),
)
for _table in (User.__table__, BoardPost.__table__, BoardComment.__table__, WeatherCache.__table__):
    event.listen(
        _table,
        "after_create",
        DDL(
            f"CREATE TRIGGER trg_{_table.name}_updated_at BEFORE UPDATE ON {_table.name} "
            "FOR EACH ROW EXECUTE FUNCTION set_updated_at()"
        ),
    )
