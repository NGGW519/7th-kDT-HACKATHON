from sqlalchemy import (
    create_engine, Column, String, TIMESTAMP, Enum, JSON, TEXT, BOOLEAN, DATE, TIME,
    INT, DECIMAL, ForeignKey,
)
from sqlalchemy.dialects.mysql import TINYINT, SMALLINT, BIGINT, VARCHAR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry

from ..core.database import Base

# 1. User Management
class User(Base):
    __tablename__ = 'users'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    email = Column(VARCHAR(255), unique=True)
    password_hash = Column(VARCHAR(255))
    phone = Column(VARCHAR(30))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    social_accounts = relationship("SocialAccount", back_populates="user")
    skills = relationship("UserSkill", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")
    mission_assignments = relationship("MissionAssignment", back_populates="user")
    goals = relationship("UserGoal", back_populates="user")

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    user_id = Column(BIGINT, ForeignKey('users.id'), primary_key=True)
    display_name = Column(VARCHAR(80))
    profile_image = Column(VARCHAR(500), nullable=True)
    birth_year = Column(SMALLINT)
    gender = Column(Enum('male', 'female', 'other'), nullable=True)
    home_region = Column(VARCHAR(120))
    target_region = Column(VARCHAR(120))
    preferences = Column(JSON, nullable=True)
    bio = Column(TEXT, nullable=True)
    mentor_available = Column(BOOLEAN, default=False)
    mentor_hourly_rate = Column(INT, nullable=True)

    user = relationship("User", back_populates="profile")

class SocialAccount(Base):
    __tablename__ = 'social_accounts'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    provider = Column(Enum('google', 'kakao', 'naver', 'apple'), nullable=False)
    provider_uid = Column(VARCHAR(255), nullable=False)

    user = relationship("User", back_populates="social_accounts")

# 2. Skills and Badges
class Skill(Base):
    __tablename__ = 'skills'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    code = Column(VARCHAR(64), unique=True)
    name = Column(VARCHAR(120))
    category = Column(VARCHAR(80))

class UserSkill(Base):
    __tablename__ = 'user_skills'
    user_id = Column(BIGINT, ForeignKey('users.id'), primary_key=True)
    skill_id = Column(BIGINT, ForeignKey('skills.id'), primary_key=True)
    level = Column(TINYINT)
    certified = Column(BOOLEAN, default=False)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")

class Badge(Base):
    __tablename__ = 'badges'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    code = Column(VARCHAR(64), unique=True)
    name = Column(VARCHAR(120))
    description = Column(TEXT)

class UserBadge(Base):
    __tablename__ = 'user_badges'
    user_id = Column(BIGINT, ForeignKey('users.id'), primary_key=True)
    badge_id = Column(BIGINT, ForeignKey('badges.id'), primary_key=True)
    awarded_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")

# 3. Mission System
class Mission(Base):
    __tablename__ = 'missions'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    code = Column(VARCHAR(255), unique=True, index=True, nullable=False)
    title = Column(VARCHAR(255), nullable=False)
    mission_type = Column(VARCHAR(50), nullable=False)
    difficulty = Column(INT, nullable=False)
    expected_minutes = Column(SMALLINT, nullable=False)
    tags = Column(VARCHAR(255), nullable=True)
    description = Column(TEXT, nullable=True)
    thumbnail_image = Column(VARCHAR(500), nullable=True)
    status = Column(Enum('today','locked','completed'), default="today")

    parts = relationship("MissionPart", back_populates="mission")

class MissionPart(Base):
    __tablename__ = 'mission_parts'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    mission_id = Column(BIGINT, ForeignKey('missions.id'), nullable=False)
    step_no = Column(TINYINT, nullable=False)
    instruction = Column(TEXT)
    checklist = Column(JSON, nullable=True)

    mission = relationship("Mission", back_populates="parts")

class MissionAssignment(Base):
    __tablename__ = 'mission_assignments'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    mission_id = Column(BIGINT, ForeignKey('missions.id'), nullable=False)
    assigned_at = Column(TIMESTAMP, server_default=func.now())
    due_date = Column(DATE, nullable=True)
    status = Column(Enum('assigned', 'in_progress', 'completed', 'skipped', 'canceled'), default='assigned')
    context = Column(JSON, nullable=True)

    user = relationship("User", back_populates="mission_assignments")
    mission = relationship("Mission")
    progress = relationship("MissionProgress", back_populates="assignment", uselist=False)

class MissionProgress(Base):
    __tablename__ = 'mission_progress'
    assignment_id = Column(BIGINT, ForeignKey('mission_assignments.id'), primary_key=True)
    progress_pct = Column(TINYINT, default=0)
    started_at = Column(TIMESTAMP, nullable=True)
    completed_at = Column(TIMESTAMP, nullable=True)
    feedback = Column(TEXT, nullable=True)

    assignment = relationship("MissionAssignment", back_populates="progress")

class MissionPartProgress(Base):
    __tablename__ = 'mission_part_progress'
    assignment_id = Column(BIGINT, ForeignKey('mission_assignments.id'), primary_key=True)
    part_id = Column(BIGINT, ForeignKey('mission_parts.id'), primary_key=True)
    done = Column(BOOLEAN, default=False)
    memo = Column(TEXT, nullable=True)
    done_at = Column(TIMESTAMP, nullable=True)

# 4. Location & Culture
class LocationCategory(Base):
    __tablename__ = 'location_categories'
    id = Column(INT, primary_key=True, autoincrement=True)
    main = Column(VARCHAR(50))
    sub = Column(VARCHAR(80))

class Location(Base):
    __tablename__ = 'locations'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    name = Column(VARCHAR(200), nullable=False)
    category_id = Column(INT, ForeignKey('location_categories.id'), nullable=False)
    address = Column(VARCHAR(300), nullable=False)
    phone = Column(VARCHAR(40), nullable=True)
    geom = Column(Geometry('POINT', srid=4326), nullable=False)
    extra = Column(JSON, nullable=True)

    category = relationship("LocationCategory")

class LocationHours(Base):
    __tablename__ = 'location_hours'
    location_id = Column(BIGINT, ForeignKey('locations.id'), primary_key=True)
    weekday = Column(TINYINT, primary_key=True) # 0(일)~6(토)
    open_time = Column(TIME, nullable=True)
    close_time = Column(TIME, nullable=True)
    is_24h = Column(BOOLEAN, default=False)

class LocationTag(Base):
    __tablename__ = 'location_tags'
    location_id = Column(BIGINT, ForeignKey('locations.id'), primary_key=True)
    tag = Column(VARCHAR(60), primary_key=True)

class Culture(Base):
    __tablename__ = 'culture'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    category = Column(Enum('인물', '전설', '유래', '역사', '문화재'), nullable=False)
    title = Column(VARCHAR(300), nullable=False)
    story = Column(TEXT, nullable=False) # MEDIUMTEXT -> TEXT
    haman_url = Column(VARCHAR(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

# 5. Community System
class BoardPost(Base):
    __tablename__ = 'board_posts'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    author_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    category = Column(Enum('의뢰', '멘토', '자유'), nullable=False)
    title = Column(VARCHAR(200), nullable=False)
    content = Column(TEXT, nullable=False) # MEDIUMTEXT -> TEXT
    images = Column(JSON, nullable=True)
    likes_count = Column(INT, default=0)
    comments_count = Column(INT, default=0)
    status = Column(Enum('active', 'hidden', 'deleted'), default='active')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    author = relationship("User")
    comments = relationship("BoardComment", back_populates="post")

class BoardComment(Base):
    __tablename__ = 'board_comments'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    post_id = Column(BIGINT, ForeignKey('board_posts.id'), nullable=False)
    author_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    content = Column(TEXT, nullable=False)
    parent_comment_id = Column(BIGINT, ForeignKey('board_comments.id'), nullable=True)
    likes_count = Column(INT, default=0)
    status = Column(Enum('active', 'hidden', 'deleted'), default='active')

    post = relationship("BoardPost", back_populates="comments")
    author = relationship("User")
    parent = relationship("BoardComment", remote_side=[id])

class Like(Base):
    __tablename__ = 'likes'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    target_type = Column(Enum('post', 'comment'), nullable=False)
    target_id = Column(BIGINT, nullable=False)

# 6. Mentoring & Matching
class CommunityRequest(Base):
    __tablename__ = 'community_requests'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    author_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=True)
    title = Column(VARCHAR(200), nullable=False)
    detail = Column(TEXT, nullable=False)
    region = Column(VARCHAR(120))
    required_skills = Column(JSON, nullable=True)
    budget = Column(INT, nullable=True)
    deadline = Column(DATE, nullable=True)
    status = Column(Enum('open', 'matched', 'closed', 'canceled'), default='open')

    author = relationship("User")

class MentoringOffer(Base):
    __tablename__ = 'mentoring_offers'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    mentor_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    title = Column(VARCHAR(200))
    intro = Column(TEXT)
    skills = Column(JSON, nullable=True)
    status = Column(Enum('open', 'full', 'closed'), default='open')

    mentor = relationship("User")

class Match(Base):
    __tablename__ = 'matches'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    request_id = Column(BIGINT, ForeignKey('community_requests.id'), nullable=True)
    offer_id = Column(BIGINT, ForeignKey('mentoring_offers.id'), nullable=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=True)
    status = Column(Enum('proposed', 'accepted', 'rejected', 'completed'), default='proposed')

class MentorReview(Base):
    __tablename__ = 'mentor_reviews'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    mentor_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    reviewer_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    match_id = Column(BIGINT, ForeignKey('matches.id'), nullable=True)
    rating = Column(TINYINT, nullable=False)
    comment = Column(TEXT, nullable=True)

# 7. Messenger System
class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user1_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    user2_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    last_message_at = Column(TIMESTAMP, server_default=func.now())
    user1_unread_count = Column(INT, default=0)
    user2_unread_count = Column(INT, default=0)
    status = Column(Enum('active', 'blocked', 'deleted'), default='active')

class ConversationMessage(Base):
    __tablename__ = 'conversation_messages'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    conversation_id = Column(BIGINT, ForeignKey('conversations.id'), nullable=False)
    sender_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    message_type = Column(Enum('text', 'image', 'file', 'system'), default='text')
    content = Column(TEXT, nullable=False)
    is_read = Column(BOOLEAN, default=False)

# 8. Notification System
class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    type = Column(Enum('mission_complete', 'badge_earned', 'mentor_match', 'request_match', 'comment', 'like', 'weather', 'system'), nullable=False)
    title = Column(VARCHAR(200), nullable=False)
    message = Column(TEXT, nullable=False)
    data = Column(JSON, nullable=True)
    is_read = Column(BOOLEAN, default=False)

# 9. Goal Management
class UserGoal(Base):
    __tablename__ = 'user_goals'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    goal_type = Column(Enum('mission_count', 'skill_level', 'community_participation', 'mentor_sessions'), nullable=False)
    target_value = Column(INT, nullable=False)
    current_value = Column(INT, default=0)
    period = Column(Enum('daily', 'weekly', 'monthly', 'yearly'), nullable=False)
    start_date = Column(DATE, nullable=False)
    end_date = Column(DATE, nullable=False)
    status = Column(Enum('active', 'completed', 'paused', 'canceled'), default='active')

    user = relationship("User", back_populates="goals")

# 10. AI Chatbot System
class ChatSession(Base):
    __tablename__ = 'chat_sessions'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=True)
    started_at = Column(TIMESTAMP, server_default=func.now())
    session_data = Column("metadata", JSON, nullable=True)

class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    session_id = Column(BIGINT, ForeignKey('chat_sessions.id'), nullable=False)
    role = Column(Enum('user', 'assistant', 'tool'), nullable=False)
    content = Column(TEXT, nullable=False) # MEDIUMTEXT -> TEXT
    tokens = Column(INT, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

# 11. Activity Logs
class ActivityLog(Base):
    __tablename__ = 'activity_logs'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'), nullable=True)
    event_type = Column(VARCHAR(80), nullable=False)
    payload = Column(JSON, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class LocationLog(Base):
    __tablename__ = 'location_logs'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey('users.id'))
    geom = Column(Geometry('POINT', srid=4326), nullable=False)
    recorded_at = Column(TIMESTAMP, server_default=func.now())

# 12. RAG and AI Search
class DataSource(Base):
    __tablename__ = 'data_sources'
    id = Column(INT, primary_key=True, autoincrement=True)
    name = Column(VARCHAR(120), unique=True)
    description = Column(TEXT)

class RagDocument(Base):
    __tablename__ = 'rag_documents'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    source_table = Column(Enum('culture', 'locations'), nullable=False)
    source_id = Column(BIGINT, nullable=False)
    collection_name = Column(VARCHAR(120), nullable=False)
    chroma_doc_id = Column(VARCHAR(120), nullable=False)
    embedding_model = Column(VARCHAR(160), nullable=False)

# 13. Other Services
class WeatherCache(Base):
    __tablename__ = 'weather_cache'
    id = Column(INT, primary_key=True, autoincrement=True)
    region = Column(VARCHAR(100), nullable=False)
    date = Column(DATE, nullable=False)
    temperature_min = Column(DECIMAL(4, 1))
    temperature_max = Column(DECIMAL(4, 1))
    weather_condition = Column(VARCHAR(50))
    description = Column(VARCHAR(200))

class Announcement(Base):
    __tablename__ = 'announcements'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    title = Column(VARCHAR(200), nullable=False)
    content = Column(TEXT, nullable=False) # MEDIUMTEXT -> TEXT
    type = Column(Enum('notice', 'update', 'event', 'maintenance'), nullable=False)
    is_important = Column(BOOLEAN, default=False)
    start_date = Column(TIMESTAMP, nullable=False)
    end_date = Column(TIMESTAMP, nullable=True)
    status = Column(Enum('active', 'inactive'), default='active')

# Request Board (의뢰 게시판)
class RequestPost(Base):
    __tablename__ = 'request_posts'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    author_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    category = Column(Enum('repair', 'agriculture', 'it', 'cleaning', 'installation'), nullable=False)
    title = Column(VARCHAR(200), nullable=False)
    content = Column(TEXT, nullable=False)
    budget = Column(VARCHAR(50), nullable=True)
    location = Column(VARCHAR(120), nullable=True)
    status = Column(Enum('pending', 'completed', 'cancelled'), default='pending')
    accepted_by = Column(VARCHAR(100), nullable=True)
    likes_count = Column(INT, default=0)
    comments_count = Column(INT, default=0)
    views = Column(INT, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    author = relationship("User")
    comments = relationship("RequestComment", back_populates="post")

class RequestComment(Base):
    __tablename__ = 'request_comments'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    post_id = Column(BIGINT, ForeignKey('request_posts.id'), nullable=False)
    author_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    content = Column(TEXT, nullable=False)
    parent_comment_id = Column(BIGINT, ForeignKey('request_comments.id'), nullable=True)
    likes_count = Column(INT, default=0)
    status = Column(Enum('active', 'hidden', 'deleted'), default='active')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    post = relationship("RequestPost", back_populates="comments")
    author = relationship("User")
    parent = relationship("RequestComment", remote_side=[id])

# Mentor Board (멘토 게시판)
class MentorPost(Base):
    __tablename__ = 'mentor_posts'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    author_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    category = Column(Enum('technical', 'lifestyle', 'business', 'seeking', 'offering'), nullable=False)
    title = Column(VARCHAR(200), nullable=False)
    content = Column(TEXT, nullable=False)
    experience = Column(VARCHAR(50), nullable=True)
    hourly_rate = Column(VARCHAR(50), nullable=True)
    location = Column(VARCHAR(120), nullable=True)
    likes_count = Column(INT, default=0)
    comments_count = Column(INT, default=0)
    views = Column(INT, default=0)
    status = Column(Enum('active', 'hidden', 'deleted'), default='active')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    author = relationship("User")
    comments = relationship("MentorComment", back_populates="post")

class MentorComment(Base):
    __tablename__ = 'mentor_comments'
    id = Column(BIGINT, primary_key=True, autoincrement=True)
    post_id = Column(BIGINT, ForeignKey('mentor_posts.id'), nullable=False)
    author_user_id = Column(BIGINT, ForeignKey('users.id'), nullable=False)
    content = Column(TEXT, nullable=False)
    parent_comment_id = Column(BIGINT, ForeignKey('mentor_comments.id'), nullable=True)
    likes_count = Column(INT, default=0)
    status = Column(Enum('active', 'hidden', 'deleted'), default='active')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    post = relationship("MentorPost", back_populates="comments")
    author = relationship("User")
    parent = relationship("MentorComment", remote_side=[id])
