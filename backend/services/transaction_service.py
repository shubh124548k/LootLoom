"""Transaction service — read-side history, filters, pagination.

Mutations go through :class:`WalletService` / :class:`LedgerService`;
this service is the read-side counterpart that powers the wallet
history / detail / search APIs.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from core.exceptions import NotFoundError
from core.logging import get_logger
from models.transaction import Transaction
from repositories.transaction_repository import TransactionRepository
from repositories.wallet_repository import WalletRepository

log = get_logger("transaction_service")


class TransactionService:
    """Read-side queries over the transaction ledger."""

    def __init__(
        self,
        tx_repo: Optional[TransactionRepository] = None,
        wallet_repo: Optional[WalletRepository] = None,
    ) -> None:
        self.tx_repo = tx_repo or TransactionRepository()
        self.wallet_repo = wallet_repo or WalletRepository()

    def list_for_user(
        self,
        user_id: str,
        *,
        type_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        start: Optional[datetime] = None,
        end: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Transaction], int]:
        """Paginated transaction history for a user."""
        wallet = self.wallet_repo.get_by_user_id(user_id)
        if wallet is None:
            return [], 0
        return self.tx_repo.list_by_wallet(
            wallet.id,
            type_filter=type_filter,
            status_filter=status_filter,
            start=start,
            end=end,
            page=page,
            page_size=page_size,
        )

    def get_detail(self, user_id: str, transaction_id: str) -> Transaction:
        """Return a single transaction by its public ``transaction_id``.

        The transaction must belong to ``user_id``.
        """
        tx = self.tx_repo.get_by_transaction_id(transaction_id)
        if tx is None or tx.user_id != user_id:
            raise NotFoundError(
                "Transaction not found", code="transaction_not_found"
            )
        return tx

    def search(
        self,
        user_id: str,
        *,
        query: str,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Transaction], int]:
        """Free-text search over the user's transactions.

        Searches the ``reference`` and ``description`` columns.
        """
        wallet = self.wallet_repo.get_by_user_id(user_id)
        if wallet is None:
            return [], 0
        # Delegate to the repo's paginate with search_fields
        items, total = self.tx_repo.paginate(
            page=page,
            page_size=page_size,
            filters={"wallet_id": wallet.id},
            search=query,
            search_fields=("reference", "description"),
            order_by="created_at",
            desc_order=True,
        )
        return items, total
