"""Wallet repository.

Provides locking-aware lookups so :class:`services.wallet_service.WalletService`
can perform atomic balance mutations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select, update, func
from sqlalchemy.orm import with_for_update

from models.wallet import Wallet
from models.transaction import Transaction
from core.enums import WalletStatus, TransactionType
from .base import BaseRepository


class WalletRepository(BaseRepository[Wallet]):
    """CRUD + balance helpers for :class:`Wallet`."""

    def __init__(self) -> None:
        super().__init__(Wallet)

    # -----------------------------------------------------------------
    # Lookups
    # -----------------------------------------------------------------
    def get_by_user_id(self, user_id: str, *, lock: bool = False) -> Optional[Wallet]:
        """Return the wallet owned by ``user_id``.

        ``lock=True`` issues ``SELECT ... FOR UPDATE`` so concurrent
        balance mutations are serialised inside the same transaction.
        """
        stmt = select(Wallet).where(Wallet.user_id == user_id)
        if lock:
            stmt = stmt.with_for_update()
        return self.session.scalars(stmt).first()

    def get_by_id(self, wallet_id: str, *, lock: bool = False) -> Optional[Wallet]:
        """Return the wallet with the given ``wallet_id``."""
        stmt = select(Wallet).where(Wallet.wallet_id == wallet_id)
        if lock:
            stmt = stmt.with_for_update()
        return self.session.scalars(stmt).first()

    # -----------------------------------------------------------------
    # Aggregations (used for statistics / summaries)
    # -----------------------------------------------------------------
    def sum_earned_in_range(
        self,
        wallet_id: str,
        start,
        end,
        type_filter: Optional[str] = None,
    ) -> int:
        """Sum positive (credit) transactions in a time range."""
        conditions = [
            Transaction.wallet_id == wallet_id,
            Transaction.amount > 0,
            Transaction.created_at >= start,
            Transaction.created_at < end,
        ]
        if type_filter:
            conditions.append(Transaction.type == type_filter)
        stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(*conditions)
        return int(self.session.scalar(stmt) or 0)

    def sum_redeemed_in_range(
        self,
        wallet_id: str,
        start,
        end,
        type_filter: Optional[str] = None,
    ) -> int:
        """Sum negative (debit) transactions in a time range (returns abs)."""
        conditions = [
            Transaction.wallet_id == wallet_id,
            Transaction.amount < 0,
            Transaction.created_at >= start,
            Transaction.created_at < end,
        ]
        if type_filter:
            conditions.append(Transaction.type == type_filter)
        stmt = select(func.coalesce(func.sum(func.abs(Transaction.amount)), 0)).where(
            *conditions
        )
        return int(self.session.scalar(stmt) or 0)

    def count_transactions(
        self, wallet_id: str, type_filter: Optional[str] = None
    ) -> int:
        """Count ledger entries on the wallet."""
        conditions = [Transaction.wallet_id == wallet_id]
        if type_filter:
            conditions.append(Transaction.type == type_filter)
        stmt = select(func.count()).select_from(Transaction).where(*conditions)
        return int(self.session.scalar(stmt) or 0)
