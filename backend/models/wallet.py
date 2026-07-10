"""Wallet model — tracks a user's coin balance and lifetime stats.

Each user has exactly one wallet. Mutations to ``current_balance`` or
``pending_balance`` MUST happen via :class:`services.wallet_service.WalletService`
so a matching :class:`models.transaction.Transaction` ledger entry is
created atomically.

Future-proofing fields (placeholders / commented):
* currency preference (multi-currency support)
* frozen_amount (portion of balance temporarily locked)
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import WalletStatus


class Wallet(BaseModel):
    """User coin wallet.

    Balance fields are stored as integers because coins are discrete.
    """

    __tablename__ = "wallets"
    __table_args__ = (
        Index("ix_wallets_user", "user_id"),
        Index("ix_wallets_status", "status"),
    )

    wallet_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), nullable=False, unique=True
    )

    # --- Balances (coins are integer units) ----------------------------
    current_balance: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    pending_balance: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    lifetime_earned: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    lifetime_redeemed: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    # --- Status ---------------------------------------------------------
    status: Mapped[str] = mapped_column(
        String(32), default=WalletStatus.ACTIVE.value, nullable=False
    )
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # --- Future placeholders -------------------------------------------
    # currency: Mapped[str] = mapped_column(String(8), default="LOOT")
    # frozen_amount: Mapped[int] = mapped_column(Integer, default=0)

    # --- Relationships --------------------------------------------------
    user: Mapped["User"] = relationship("User", back_populates="wallet")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="wallet"
    )
    redeems: Mapped[list["RedeemRequest"]] = relationship(
        "RedeemRequest", back_populates="wallet"
    )

    def to_dict(self, exclude: set[str] | None = None) -> dict:
        data = super().to_dict(exclude=exclude)
        if isinstance(data.get("last_updated"), datetime):
            data["last_updated"] = data["last_updated"].isoformat()
        return data
