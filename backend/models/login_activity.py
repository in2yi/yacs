from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone

from .database import Base


class LoginActivity(Base):
    __tablename__ = "login_activity"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    action = Column(String(32), nullable=False)  # "login" or "logout"
    timestamp = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(255), nullable=True)
