"""Notification model.

A user-targeted in-app notification. Categories include wallet, redeem,
referral, mission, achievement, support, announcement, security.

Future placeholders:
* expiration_time (auto-hide after a date)
* broadcast_id (link to an Announcement for bulk notifications)
* action_url (deep link)
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, ForeignKey, Index, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import NotificationCategory, NotificationPriority


class Notification(BaseModel):
    """In-app notification owned by a user."""

    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user", "user_id"),
        Index("ix_notifications_category", "category"),
        Index("ix_notifications_priority", "priority"),
        Index("ix_notifications_read", "read_status"),
        Index("ix_notifications_created", "created_time"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    category: Mapped[str] = mapped_column(
        String(32),
        default=NotificationCategory.SYSTEM.value,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(
        String(16), default=NotificationPriority.NORMAL.value, nullable=False
    )
    read_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # --- Future placeholders -------------------------------------------
    # expiration_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    # broadcast_id: Mapped[Optional[str]] = mapped_column(ForeignKey("announcements.id"))
    # action_url: Mapped[Optional[str]] = mapped_column(String(512))

    # --- Relationships --------------------------------------------------
    user: Mapped["User"] = relationship("User", back_populates="notifications")
