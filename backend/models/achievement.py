"""Achievement + UserAchievement models.

:class:`Achievement` is a catalog of unlockable badges (e.g. "First
Redeem", "7-Day Streak"). :class:`UserAchievement` is a per-user
progress / unlock record linking a user to an achievement with current
progress and status.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import (
    AchievementRarity,
    AchievementCategory,
    UserAchievementStatus,
)


class Achievement(BaseModel):
    """Catalog of unlockable achievements."""

    __tablename__ = "achievements"
    __table_args__ = (
        Index("ix_achievements_category", "category"),
        Index("ix_achievements_rarity", "rarity"),
    )

    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[str] = mapped_column(
        String(32), default=AchievementCategory.EARNING.value, nullable=False
    )
    rarity: Mapped[str] = mapped_column(
        String(16), default=AchievementRarity.COMMON.value, nullable=False
    )
    icon: Mapped[Optional[str]] = mapped_column(String(255))
    target_value: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    reward_coins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # --- Relationships --------------------------------------------------
    user_links: Mapped[list["UserAchievement"]] = relationship(
        "UserAchievement", back_populates="achievement"
    )


class UserAchievement(BaseModel):
    """Per-user progress / unlock record for an achievement."""

    __tablename__ = "user_achievements"
    __table_args__ = (
        Index("ix_user_achievements_user", "user_id"),
        Index("ix_user_achievements_achievement", "achievement_id"),
        Index("ix_user_achievements_status", "status"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    achievement_id: Mapped[str] = mapped_column(
        ForeignKey("achievements.id"), nullable=False
    )

    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32),
        default=UserAchievementStatus.IN_PROGRESS.value,
        nullable=False,
    )
    unlocked_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    claimed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Relationships --------------------------------------------------
    user: Mapped["User"] = relationship("User", back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(
        "Achievement", back_populates="user_links"
    )
