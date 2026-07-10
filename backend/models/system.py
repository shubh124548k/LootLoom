"""System models — global platform configuration & state.

Holds:
* :class:`AppSettings`  — key/value application settings
* :class:`FeatureFlag`  — per-feature on/off / ramp-up switches
* :class:`PlatformStatus` — overall platform health snapshot
* :class:`Announcement` — broadcast announcements
* :class:`UserSession`  — auth sessions (user + admin)
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, Index, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from core.database import db
from core.base_model import BaseModel
from core.enums import (
    FeatureFlagStatus,
    PlatformStatusLevel,
    AnnouncementAudience,
    AnnouncementPriority,
    SessionStatus,
    SessionType,
)


class AppSettings(BaseModel):
    """Key/value application settings editable by admins."""

    __tablename__ = "app_settings"
    __table_args__ = (Index("ix_settings_key", "key"),)

    key: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    value: Mapped[Optional[str]] = mapped_column(Text)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(64))


class FeatureFlag(BaseModel):
    """Per-feature toggle with optional ramp-up percentage."""

    __tablename__ = "feature_flags"
    __table_args__ = (
        Index("ix_feature_flags_key", "key"),
        Index("ix_feature_flags_status", "status"),
    )

    key: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(16), default=FeatureFlagStatus.OFF.value, nullable=False
    )
    rollout_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(64))


class PlatformStatus(BaseModel):
    """Latest platform health snapshot (single-row by convention)."""

    __tablename__ = "platform_status"
    __table_args__ = (Index("ix_platform_status_level", "level"),)

    level: Mapped[str] = mapped_column(
        String(32),
        default=PlatformStatusLevel.OPERATIONAL.value,
        nullable=False,
    )
    message: Mapped[Optional[str]] = mapped_column(Text)
    updated_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )


class Announcement(BaseModel):
    """Broadcast announcement targeting a user audience."""

    __tablename__ = "announcements"
    __table_args__ = (
        Index("ix_announcements_status", "status"),
        Index("ix_announcements_priority", "priority"),
        Index("ix_announcements_audience", "audience"),
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    audience: Mapped[str] = mapped_column(
        String(32), default=AnnouncementAudience.ALL.value, nullable=False
    )
    priority: Mapped[str] = mapped_column(
        String(16),
        default=AnnouncementPriority.NORMAL.value,
        nullable=False,
    )
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft")
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


class UserSession(BaseModel):
    """Persistent auth session — supports users AND administrators.

    A refresh-token ``jti`` lives here so the auth service can revoke
    sessions independently of the JWT itself.
    """

    __tablename__ = "user_sessions"
    __table_args__ = (
        Index("ix_sessions_owner", "owner_id"),
        Index("ix_sessions_type", "owner_type"),
        Index("ix_sessions_status", "status"),
        Index("ix_sessions_jti", "jti"),
    )

    jti: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    owner_id: Mapped[str] = mapped_column(String(36), nullable=False)
    owner_type: Mapped[str] = mapped_column(
        String(16), default=SessionType.USER.value, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(16), default=SessionStatus.ACTIVE.value, nullable=False
    )

    ip_address: Mapped[Optional[str]] = mapped_column(String(64))
    user_agent: Mapped[Optional[str]] = mapped_column(String(255))

    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime)
