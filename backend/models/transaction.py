"""Transaction / Ledger model — the immutable coin ledger.

Every coin movement MUST be recorded here with the previous and new
balances so the ledger can be replayed / audited. Rows should be
append-only — never edited or deleted (use a ``REVERSAL`` entry to
correct mistakes).

Future placeholders:
* external_ref (payment provider / payout reference)
* related_transaction_id (for reversals)
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import TransactionType, TransactionStatus


class Transaction(BaseModel):
    """Immutable ledger entry for a single coin movement."""

    __tablename__ = "transactions"
    __table_args__ = (
        Index("ix_tx_wallet", "wallet_id"),
        Index("ix_tx_user", "user_id"),
        Index("ix_tx_type", "type"),
        Index("ix_tx_status", "status"),
        Index("ix_tx_created", "created_at"),
        Index("ix_tx_reference", "reference"),
    )

    transaction_id: Mapped[str] = mapped_column(
        String(36), nullable=False, unique=True
    )
    wallet_id: Mapped[str] = mapped_column(
        ForeignKey("wallets.id"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

    # --- Movement -------------------------------------------------------
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    # Positive = credit, negative = debit. The ``amount`` sign follows
    # the convention of the operation (credit >0, debit <0).

    # --- Ledger snapshot -----------------------------------------------
    previous_balance: Mapped[int] = mapped_column(Integer, nullable=False)
    new_balance: Mapped[int] = mapped_column(Integer, nullable=False)

    # --- Reference / description ---------------------------------------
    reference: Mapped[Optional[str]] = mapped_column(String(128))
    description: Mapped[Optional[str]] = mapped_column(Text)

    # --- Status ---------------------------------------------------------
    status: Mapped[str] = mapped_column(
        String(32), default=TransactionStatus.COMPLETED.value, nullable=False
    )

    # --- Future placeholders -------------------------------------------
    # external_ref: Mapped[Optional[str]] = mapped_column(String(255))
    # related_transaction_id: Mapped[Optional[str]] = mapped_column(ForeignKey("transactions.id"))

    # --- Relationships --------------------------------------------------
    wallet: Mapped["Wallet"] = relationship("Wallet", back_populates="transactions")
    user: Mapped["User"] = relationship("User", back_populates="transactions")
