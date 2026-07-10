"""Referral model.

A :class:`Referral` row is created when a user signs up using another
user's referral code. Once the invited user meets the reward criteria
(e.g. earns their first coins), the referral transitions to
``REWARDED`` and the referrer receives a bonus.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import ReferralStatus


class Referral(BaseModel):
    """A referral link between a referrer and an invited user."""

    __tablename__ = "referrals"
    __table_args__ = (
        Index("ix_referrals_referrer", "referrer_id"),
        Index("ix_referrals_invited", "invited_user_id"),
        Index("ix_referrals_status", "status"),
        Index("ix_referrals_created", "created_time"),
    )

    referrer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    invited_user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    referral_code_used: Mapped[Optional[str]] = mapped_column(String(32))

    reward: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default=ReferralStatus.PENDING.value, nullable=False
    )
    created_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    rewarded_time: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Relationships --------------------------------------------------
    referrer: Mapped["User"] = relationship(
        "User", foreign_keys=[referrer_id], backref="referrals_made"
    )
    invited_user: Mapped["User"] = relationship(
        "User", foreign_keys=[invited_user_id], backref="referral_record"
    )
