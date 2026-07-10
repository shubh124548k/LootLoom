"""Mission + MissionProgress models.

A :class:`Mission` is an earning challenge (e.g. "Watch 10 ads today").
:class:`MissionProgress` records per-user progress toward the mission
and whether the reward was claimed.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import MissionDifficulty, MissionStatus, MissionRepeat


class Mission(BaseModel):
    """Catalog of earning missions."""

    __tablename__ = "missions"
    __table_args__ = (
        Index("ix_missions_status", "status"),
        Index("ix_missions_difficulty", "difficulty"),
        Index("ix_missions_category", "category"),
    )

    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(32), default="general")
    difficulty: Mapped[str] = mapped_column(
        String(16), default=MissionDifficulty.EASY.value, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(16), default=MissionStatus.DRAFT.value, nullable=False
    )
    repeat: Mapped[str] = mapped_column(
        String(16), default=MissionRepeat.ONCE.value, nullable=False
    )

    target_value: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    reward_coins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reward_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    estimated_minutes: Mapped[Optional[int]] = mapped_column(Integer)

    # --- Relationships --------------------------------------------------
    progress_records: Mapped[list["MissionProgress"]] = relationship(
        "MissionProgress", back_populates="mission"
    )


class MissionProgress(BaseModel):
    """Per-user progress on a mission."""

    __tablename__ = "mission_progress"
    __table_args__ = (
        Index("ix_mission_progress_user", "user_id"),
        Index("ix_mission_progress_mission", "mission_id"),
        Index("ix_mission_progress_claimed", "reward_claimed"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    mission_id: Mapped[str] = mapped_column(ForeignKey("missions.id"), nullable=False)

    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reward_claimed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    period_key: Mapped[Optional[str]] = mapped_column(String(32))
    # period_key supports daily/weekly missions (e.g. "2025-01-15").

    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    claimed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Relationships --------------------------------------------------
    mission: Mapped["Mission"] = relationship(
        "Mission", back_populates="progress_records"
    )
