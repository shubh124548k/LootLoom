"""Reward catalog model.

Defines the redeemable rewards shown to users (gift cards, UPI cash,
crypto, merchandise, etc.). Each reward has a coin cost, category, and
processing-time estimate.

Future placeholders:
* inventory (limited-stock rewards)
* image / brand asset URL
* eligibility rules (country, level)
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import String, Integer, Text, Index
from sqlalchemy.orm import Mapped, mapped_column

from core.database import db
from core.base_model import BaseModel
from core.enums import RewardCategory, RewardStatus


class Reward(BaseModel):
    """A redeemable reward catalog entry."""

    __tablename__ = "rewards"
    __table_args__ = (
        Index("ix_rewards_category", "category"),
        Index("ix_rewards_status", "status"),
    )

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    category: Mapped[str] = mapped_column(
        String(32), default=RewardCategory.OTHER.value, nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(Text)
    required_coins: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default=RewardStatus.ACTIVE.value, nullable=False
    )
    estimated_processing_time: Mapped[Optional[str]] = mapped_column(String(128))

    # --- Future placeholders -------------------------------------------
    # inventory: Mapped[Optional[int]] = mapped_column(Integer)
    # image_url: Mapped[Optional[str]] = mapped_column(String(512))
    # brand: Mapped[Optional[str]] = mapped_column(String(128))
    # eligibility_rules: Mapped[Optional[dict]] (JSON column on PG)

    # --- Relationships --------------------------------------------------
    redeems: Mapped[list["RedeemRequest"]] = relationship(
        "RedeemRequest", back_populates="reward"
    )
