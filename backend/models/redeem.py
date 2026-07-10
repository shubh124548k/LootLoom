"""RedeemRequest model — a user's claim against a reward.

Lifecycle: ``PENDING → APPROVED → PROCESSING → COMPLETED``
(or ``REJECTED`` / ``CANCELLED`` / ``FAILED``).

The administrator who handled the request is recorded via
``admin_id``. ``coins_used`` is debited atomically from the wallet
when the request is approved.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import RedeemStatus


class RedeemRequest(BaseModel):
    """A user's request to redeem coins for a reward."""

    __tablename__ = "redeem_requests"
    __table_args__ = (
        Index("ix_redeems_user", "user_id"),
        Index("ix_redeems_reward", "reward_id"),
        Index("ix_redeems_wallet", "wallet_id"),
        Index("ix_redeems_admin", "admin_id"),
        Index("ix_redeems_status", "status"),
        Index("ix_redeems_requested", "requested_time"),
    )

    redeem_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    reward_id: Mapped[str] = mapped_column(ForeignKey("rewards.id"), nullable=False)
    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.id"), nullable=False)

    # --- Coins ----------------------------------------------------------
    coins_used: Mapped[int] = mapped_column(Integer, nullable=False)

    # --- Lifecycle timestamps ------------------------------------------
    requested_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    approved_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    completed_time: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Admin / state --------------------------------------------------
    admin_id: Mapped[Optional[str]] = mapped_column(ForeignKey("administrators.id"))
    status: Mapped[str] = mapped_column(
        String(32), default=RedeemStatus.PENDING.value, nullable=False
    )
    internal_notes: Mapped[Optional[str]] = mapped_column(Text)

    # --- Future placeholders -------------------------------------------
    # payout_reference: Mapped[Optional[str]] = mapped_column(String(255))
    # payout_method: Mapped[Optional[str]] = mapped_column(String(64))

    # --- Relationships --------------------------------------------------
    user: Mapped["User"] = relationship("User", back_populates="redeems")
    reward: Mapped["Reward"] = relationship("Reward", back_populates="redeems")
    wallet: Mapped["Wallet"] = relationship("Wallet", back_populates="redeems")
    admin: Mapped[Optional["Administrator"]] = relationship(
        "Administrator", back_populates="handled_redeems"
    )
