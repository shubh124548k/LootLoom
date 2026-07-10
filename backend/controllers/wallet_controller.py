"""Wallet controller — HTTP layer for the wallet engine.

All endpoints require an authenticated user token (``@require_auth``).
Admin-only credit/debit endpoints will be added in later prompts; the
``credit`` / ``debit`` endpoints here are scaffolds guarded by
:func:`require_auth` so the engine is testable.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from flask import g, request

from core.responses import success, error, paginated
from core.exceptions import AppError
from core.logging import get_logger
from schemas.wallet import CreditCoinsSchema, DebitCoinsSchema
from services.wallet_service import WalletService
from services.transaction_service import TransactionService

log = get_logger("wallet_controller")


class WalletController:
    """HTTP handlers for ``/api/v1/wallet/*``."""

    def __init__(
        self,
        wallet_service: WalletService | None = None,
        tx_service: TransactionService | None = None,
    ) -> None:
        self.wallet_service = wallet_service or WalletService()
        self.tx_service = tx_service or TransactionService()

    def _user_id(self) -> str | None:
        return getattr(g, "current_user_id", None)

    # -----------------------------------------------------------------
    # GET /api/v1/wallet
    # -----------------------------------------------------------------
    def get_wallet(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            wallet = self.wallet_service.get_wallet(user_id)
            return success({"wallet": wallet.to_dict()})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # GET /api/v1/wallet/summary
    # -----------------------------------------------------------------
    def get_summary(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            return success({"summary": self.wallet_service.get_summary(user_id)})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # GET /api/v1/wallet/statistics
    # -----------------------------------------------------------------
    def get_statistics(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        period = request.args.get("period", "monthly")
        try:
            stats = self.wallet_service.get_statistics(user_id, period=period)
            return success({"statistics": stats})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # GET /api/v1/wallet/history  (alias for transactions)
    # GET /api/v1/wallet/transactions
    # -----------------------------------------------------------------
    def list_transactions(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)

        page = max(int(request.args.get("page", 1)), 1)
        page_size = max(min(int(request.args.get("page_size", 20)), 100), 1)
        type_filter = request.args.get("type") or None
        status_filter = request.args.get("status") or None
        start_str = request.args.get("start") or None
        end_str = request.args.get("end") or None

        start = self._parse_dt(start_str)
        end = self._parse_dt(end_str)

        try:
            items, total = self.tx_service.list_for_user(
                user_id,
                type_filter=type_filter,
                status_filter=status_filter,
                start=start,
                end=end,
                page=page,
                page_size=page_size,
            )
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

        return paginated(
            [tx.to_dict() for tx in items],
            page=page,
            page_size=page_size,
            total=total,
        )

    # -----------------------------------------------------------------
    # GET /api/v1/wallet/transactions/<transaction_id>
    # -----------------------------------------------------------------
    def get_transaction_detail(self, transaction_id: str) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            tx = self.tx_service.get_detail(user_id, transaction_id)
            return success({"transaction": tx.to_dict()})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # GET /api/v1/wallet/transactions/search?q=...
    # -----------------------------------------------------------------
    def search_transactions(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        query = request.args.get("q", "").strip()
        if not query:
            return error("validation_error", "Query 'q' is required", 422)
        page = max(int(request.args.get("page", 1)), 1)
        page_size = max(min(int(request.args.get("page_size", 20)), 100), 1)
        try:
            items, total = self.tx_service.search(
                user_id, query=query, page=page, page_size=page_size
            )
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)
        return paginated(
            [tx.to_dict() for tx in items],
            page=page,
            page_size=page_size,
            total=total,
        )

    # -----------------------------------------------------------------
    # POST /api/v1/wallet/credit   (admin / internal scaffold)
    # POST /api/v1/wallet/debit    (admin / internal scaffold)
    # -----------------------------------------------------------------
    def credit_coins(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            payload = CreditCoinsSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            tx = self.wallet_service.credit_coins(
                user_id,
                amount=payload.amount,
                type=payload.type,
                reference=payload.reference,
                description=payload.description,
            )
            return success(
                {"transaction": tx.to_dict()},
                message="Coins credited",
            )
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    def debit_coins(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            payload = DebitCoinsSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            tx = self.wallet_service.debit_coins(
                user_id,
                amount=payload.amount,
                type=payload.type,
                reference=payload.reference,
                description=payload.description,
            )
            return success(
                {"transaction": tx.to_dict()},
                message="Coins debited",
            )
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------
    @staticmethod
    def _parse_dt(value: Optional[str]) -> Optional[datetime]:
        if not value:
            return None
        try:
            # ISO-8601 (with optional Z)
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
