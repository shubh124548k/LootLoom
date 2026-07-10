"""Leaderboard model.

Snapshots a user's rank for a given :class:`LeaderboardPeriod`. The
table holds the latest snapshot per ``(user_id, period)`` pair — older
snapshots may be archived.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import LeaderboardPeriod


class Leaderboard(BaseModel):
    """Leaderboard snapshot for one user in one period."""

    __tablename__ = "leaderboards"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "period", name="uq_leaderboard_user_period"
        ),
        Index("ix_leaderboard_user", "user_id"),
        Index("ix_leaderboard_period", "period"),
        Index("ix_leaderboard_rank", "rank"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    period: Mapped[str] = mapped_column(
        String(16), default=LeaderboardPeriod.ALL_TIME.value, nullable=False
    )
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    coins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # --- Relationships --------------------------------------------------
    user: Mapped["User"] = relationship("User", back_populates="leaderboard_entries")
