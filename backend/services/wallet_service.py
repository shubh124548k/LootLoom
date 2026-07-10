"""Wallet service — atomic coin mutations backed by an immutable ledger.

Every public mutation (``credit_coins`` / ``debit_coins``) does:

1. ``SELECT ... FOR UPDATE`` the wallet row.
2. Validate (frozen state, sufficient balance for debits).
3. Compute the new balance.
4. Update the wallet row.
5. Append a :class:`models.transaction.Transaction` ledger entry.
6. Commit (or rollback on any error).

Because the wallet is locked for the duration, concurrent operations
are serialised — the ledger snapshot is always consistent with the
wallet balance.

Future prompts will add admin-side adjustments, freezes, and reward
payouts.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError

from core.database import db
from core.enums import (
    TransactionStatus,
    TransactionType,
    WalletStatus,
)
from core.exceptions import (
    DatabaseError,
    InsufficientBalanceError,
    NotFoundError,
    ValidationError,
    WalletFrozenError,
    WalletError,
)
from core.logging import get_logger
from models.wallet import Wallet
from models.transaction import Transaction
from repositories.wallet_repository import WalletRepository
from repositories.transaction_repository import TransactionRepository
from .ledger_service import LedgerService

log = get_logger("wallet_service")


class WalletService:
    """Atomic coin operations with an immutable ledger."""

    def __init__(
        self,
        wallet_repo: Optional[WalletRepository] = None,
        tx_repo: Optional[TransactionRepository] = None,
        ledger: Optional[LedgerService] = None,
    ) -> None:
        self.wallet_repo = wallet_repo or WalletRepository()
        self.tx_repo = tx_repo or TransactionRepository()
        self.ledger = ledger or LedgerService(tx_repo=self.tx_repo)

    # -----------------------------------------------------------------
    # Reads
    # -----------------------------------------------------------------
    def get_wallet(self, user_id: str) -> Wallet:
        """Return the wallet owned by ``user_id``."""
        wallet = self.wallet_repo.get_by_user_id(user_id)
        if wallet is None:
            raise NotFoundError("Wallet not found", code="wallet_not_found")
        return wallet

    def get_summary(self, user_id: str) -> dict:
        """Return aggregated wallet stats for the user."""
        wallet = self.get_wallet(user_id)
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        return {
            "wallet_id": wallet.wallet_id,
            "current_balance": wallet.current_balance,
            "pending_balance": wallet.pending_balance,
            "lifetime_earned": wallet.lifetime_earned,
            "lifetime_redeemed": wallet.lifetime_redeemed,
            "net_balance": wallet.current_balance + wallet.pending_balance,
            "today_earned": self.wallet_repo.sum_earned_in_range(
                wallet.id, today_start, now
            ),
            "week_earned": self.wallet_repo.sum_earned_in_range(
                wallet.id, week_start, now
            ),
            "month_earned": self.wallet_repo.sum_earned_in_range(
                wallet.id, month_start, now
            ),
            "today_redeemed": self.wallet_repo.sum_redeemed_in_range(
                wallet.id, today_start, now
            ),
            "week_redeemed": self.wallet_repo.sum_redeemed_in_range(
                wallet.id, week_start, now
            ),
            "month_redeemed": self.wallet_repo.sum_redeemed_in_range(
                wallet.id, month_start, now
            ),
            "transaction_count": self.wallet_repo.count_transactions(wallet.id),
        }

    def get_statistics(
        self,
        user_id: str,
        *,
        period: str = "monthly",
    ) -> dict:
        """Return per-period statistics for the wallet."""
        wallet = self.get_wallet(user_id)
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        period_deltas: dict[str, timedelta] = {
            "daily": timedelta(days=1),
            "weekly": timedelta(weeks=1),
            "monthly": timedelta(days=30),
            "yearly": timedelta(days=365),
        }
        delta = period_deltas.get(period, timedelta(days=30))
        start = now - delta

        total_earned = self.wallet_repo.sum_earned_in_range(wallet.id, start, now)
        total_redeemed = self.wallet_repo.sum_redeemed_in_range(wallet.id, start, now)
        count = self.wallet_repo.count_transactions(wallet.id)
        by_type = self.tx_repo.count_by_type(wallet.id)

        return {
            "wallet_id": wallet.wallet_id,
            "period": period,
            "total_earned": total_earned,
            "total_redeemed": total_redeemed,
            "net_change": total_earned - total_redeemed,
            "transaction_count": count,
            "by_type": by_type,
        }

    # -----------------------------------------------------------------
    # Writes (atomic)
    # -----------------------------------------------------------------
    def credit_coins(
        self,
        user_id: str,
        amount: int,
        *,
        type: str | TransactionType = TransactionType.BONUS,
        reference: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Transaction:
        """Atomically credit ``amount`` coins to the user's wallet.

        Returns the new :class:`Transaction` ledger entry.
        """
        if amount <= 0:
            raise ValidationError("Credit amount must be positive")

        try:
            # Lock the wallet row
            wallet = self.wallet_repo.get_by_user_id(user_id, lock=True)
            if wallet is None:
                raise NotFoundError("Wallet not found", code="wallet_not_found")
            if wallet.status == WalletStatus.FROZEN.value:
                raise WalletFrozenError()
            if wallet.status != WalletStatus.ACTIVE.value:
                raise WalletError(f"Wallet is {wallet.status}")

            previous_balance = wallet.current_balance
            new_balance = previous_balance + amount

            # Update wallet
            wallet.current_balance = new_balance
            wallet.lifetime_earned = (wallet.lifetime_earned or 0) + amount
            wallet.last_updated = datetime.now(timezone.utc)
            db.session.flush()

            # Append ledger entry
            tx = self.ledger.record_transaction(
                wallet=wallet,
                user_id=user_id,
                type=type,
                amount=amount,  # positive
                previous_balance=previous_balance,
                new_balance=new_balance,
                reference=reference,
                description=description,
                status=TransactionStatus.COMPLETED,
            )

            db.session.commit()
            log.info(
                "wallet.credit",
                user_id=user_id,
                amount=amount,
                prev=previous_balance,
                new=new_balance,
                tx_id=tx.transaction_id,
            )
            return tx
        except (NotFoundError, ValidationError, WalletFrozenError, WalletError):
            db.session.rollback()
            raise
        except SQLAlchemyError as exc:
            db.session.rollback()
            log.error("wallet.credit.failed", user_id=user_id, error=str(exc))
            raise DatabaseError("Credit failed") from exc

    def debit_coins(
        self,
        user_id: str,
        amount: int,
        *,
        type: str | TransactionType = TransactionType.REDEEM,
        reference: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Transaction:
        """Atomically debit ``amount`` coins from the user's wallet.

        Raises :class:`InsufficientBalanceError` if the balance is too
        low. Returns the new :class:`Transaction` ledger entry.
        """
        if amount <= 0:
            raise ValidationError("Debit amount must be positive")

        try:
            wallet = self.wallet_repo.get_by_user_id(user_id, lock=True)
            if wallet is None:
                raise NotFoundError("Wallet not found", code="wallet_not_found")
            if wallet.status == WalletStatus.FROZEN.value:
                raise WalletFrozenError()
            if wallet.status != WalletStatus.ACTIVE.value:
                raise WalletError(f"Wallet is {wallet.status}")

            previous_balance = wallet.current_balance
            if previous_balance < amount:
                raise InsufficientBalanceError(
                    f"Need {amount} coins, only {previous_balance} available"
                )

            new_balance = previous_balance - amount

            wallet.current_balance = new_balance
            wallet.lifetime_redeemed = (wallet.lifetime_redeemed or 0) + amount
            wallet.last_updated = datetime.now(timezone.utc)
            db.session.flush()

            # Ledger uses signed amount (negative for debits)
            tx = self.ledger.record_transaction(
                wallet=wallet,
                user_id=user_id,
                type=type,
                amount=-amount,  # negative
                previous_balance=previous_balance,
                new_balance=new_balance,
                reference=reference,
                description=description,
                status=TransactionStatus.COMPLETED,
            )

            db.session.commit()
            log.info(
                "wallet.debit",
                user_id=user_id,
                amount=amount,
                prev=previous_balance,
                new=new_balance,
                tx_id=tx.transaction_id,
            )
            return tx
        except (
            NotFoundError,
            ValidationError,
            WalletFrozenError,
            WalletError,
            InsufficientBalanceError,
        ):
            db.session.rollback()
            raise
        except SQLAlchemyError as exc:
            db.session.rollback()
            log.error("wallet.debit.failed", user_id=user_id, error=str(exc))
            raise DatabaseError("Debit failed") from exc

    # -----------------------------------------------------------------
    # Future hooks (architecture only)
    # -----------------------------------------------------------------
    def freeze_wallet(self, user_id: str, reason: Optional[str] = None) -> Wallet:
        """Mark the wallet as FROZEN (future admin tool)."""
        wallet = self.get_wallet(user_id)
        wallet.status = WalletStatus.FROZEN.value
        wallet.last_updated = datetime.now(timezone.utc)
        db.session.commit()
        log.warning("wallet.freeze", user_id=user_id, reason=reason)
        return wallet

    def unfreeze_wallet(self, user_id: str) -> Wallet:
        """Mark the wallet as ACTIVE again."""
        wallet = self.get_wallet(user_id)
        wallet.status = WalletStatus.ACTIVE.value
        wallet.last_updated = datetime.now(timezone.utc)
        db.session.commit()
        log.info("wallet.unfreeze", user_id=user_id)
        return wallet
