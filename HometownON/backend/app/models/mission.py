from sqlalchemy import Column, Integer, String, Text, Enum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    mission_type = Column(String(50), nullable=False) # exploration, bonding, career
    difficulty = Column(String(50), nullable=False) # easy, medium, hard
    expected_minutes = Column(Integer, nullable=False)
    tags = Column(String(255))
    description = Column(Text)
    thumbnail_image = Column(String(255))
    status = Column(Enum("today", "completed", "locked", name="mission_status_enum"), default="today") # today, completed, locked
