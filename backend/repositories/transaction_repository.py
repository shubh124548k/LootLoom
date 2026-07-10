"""Transaction / ledger repository.

Append-only by convention — provides queries for history, filtering,
and aggregation. Inserts happen via :class:`services.ledger_service.LedgerService`
so the prev/new balance snapshot is always consistent.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import select, func

from models.transaction import Transaction
from .base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """CRUD + history queries for :class:`Transaction`."""

    def __init__(self) -> None:
        super().__init__(Transaction)

    def get_by_transaction_id(self, transaction_id: str) -> Optional[Transaction]:
        """Return the row with the given ``transaction_id``."""
        return self.get_by(transaction_id=transaction_id)

    def list_by_wallet(
        self,
        wallet_id: str,
        *,
        type_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        start: Optional[datetime] = None,
        end: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Transaction], int]:
        """Paginated transaction history for a wallet."""
        filters: dict = {"wallet_id": wallet_id}
        stmt = select(Transaction)
        count_stmt = select(func.count()).select_from(Transaction)
        stmt = stmt.filter_by(wallet_id=wallet_id)
        count_stmt = count_stmt.filter(Transaction.wallet_id == wallet_id)

        if type_filter:
            stmt = stmt.filter(Transaction.type == type_filter)
            count_stmt = count_stmt.filter(Transaction.type == type_filter)
        if status_filter:
            stmt = stmt.filter(Transaction.status == status_filter)
            count_stmt = count_stmt.filter(Transaction.status == status_filter)
        if start:
            stmt = stmt.filter(Transaction.created_at >= start)
            count_stmt = count_stmt.filter(Transaction.created_at >= start)
        if end:
            stmt = stmt.filter(Transaction.created_at < end)
            count_stmt = count_stmt.filter(Transaction.created_at < end)

        stmt = stmt.order_by(Transaction.created_at.desc())
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)

        items = list(self.session.scalars(stmt).all())
        total = int(self.session.scalar(count_stmt) or 0)
        return items, total

    def count_by_type(self, wallet_id: str) -> dict[str, int]:
        """Return ``{type: count}`` for a wallet."""
        stmt = (
            select(Transaction.type, func.count())
            .where(Transaction.wallet_id == wallet_id)
            .group_by(Transaction.type)
        )
        return {t: int(c) for t, c in self.session.execute(stmt).all()}
