"""Ledger service — append-only transaction writer.

Every coin movement MUST go through this service so the prev/new
balance snapshot stays consistent with the wallet row.

The service is intentionally minimal — it writes a
:class:`models.transaction.Transaction` row and assumes the caller has
already locked the wallet row (``SELECT ... FOR UPDATE``).
"""
from __future__ import annotations

import secrets
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError

from core.database import db
from core.enums import TransactionStatus, TransactionType
from core.exceptions import DatabaseError
from core.logging import get_logger
from models.transaction import Transaction
from models.wallet import Wallet
from repositories.transaction_repository import TransactionRepository

log = get_logger("ledger_service")


class LedgerService:
    """Immutable ledger writer."""

    def __init__(
        self, tx_repo: Optional[TransactionRepository] = None
    ) -> None:
        self.tx_repo = tx_repo or TransactionRepository()

    def record_transaction(
        self,
        *,
        wallet: Wallet,
        user_id: str,
        type: str | TransactionType,
        amount: int,
        previous_balance: int,
        new_balance: int,
        reference: Optional[str] = None,
        description: Optional[str] = None,
        status: str | TransactionStatus = TransactionStatus.COMPLETED,
    ) -> Transaction:
        """Append a ledger entry.

        ``amount`` is signed: positive for credits, negative for debits.
        The caller is responsible for the actual wallet balance update;
        this method only records what happened.
        """
        type_value = type.value if isinstance(type, TransactionType) else type
        status_value = (
            status.value if isinstance(status, TransactionStatus) else status
        )

        try:
            tx = self.tx_repo.create(
                {
                    "transaction_id": self._generate_transaction_id(),
                    "wallet_id": wallet.id,
                    "user_id": user_id,
                    "type": type_value,
                    "amount": int(amount),
                    "previous_balance": int(previous_balance),
                    "new_balance": int(new_balance),
                    "reference": reference,
                    "description": description,
                    "status": status_value,
                }
            )
            log.info(
                "ledger.record",
                transaction_id=tx.transaction_id,
                wallet_id=wallet.id,
                user_id=user_id,
                type=type_value,
                amount=amount,
                prev=previous_balance,
                new=new_balance,
            )
            return tx
        except SQLAlchemyError as exc:
            db.session.rollback()
            log.error("ledger.record.failed", error=str(exc))
            raise DatabaseError("Failed to write ledger entry") from exc

    @staticmethod
    def _generate_transaction_id() -> str:
        return f"TXN-{secrets.token_hex(10).upper()}"
