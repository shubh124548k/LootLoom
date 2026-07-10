"""Wallet & Financial Transaction API blueprint (Prompt 30).

Endpoints
---------
GET /api/v1/wallet                    — Current user's wallet
GET /api/v1/wallet/summary            — Wallet summary (balances + totals)
GET /api/v1/wallet/history            — Paginated transaction history
GET /api/v1/wallet/transactions       — Alias for /history (with filters)
GET /api/v1/wallet/transaction/<id>   — Single transaction detail
GET /api/v1/wallet/statistics         — Wallet statistics (daily/weekly/monthly)

All routes require authentication.
"""
from __future__ import annotations

from flask import Blueprint, request

from core.responses import success, error, paginate
from middlewares.auth import require_auth
from security.decorators import get_current_user

bp = Blueprint("wallet", __name__)


@bp.get("")
@bp.get("/")
@require_auth
def get_wallet():
    """Retrieve the current user's wallet (balance, status)."""
    user = get_current_user()
    from services.wallet_service import WalletService

    wallet = WalletService.get_or_create_wallet(user.id)
    return success(data=wallet.to_dict(), message="Wallet retrieved")


@bp.get("/summary")
@require_auth
def get_summary():
    """Retrieve a summary of the wallet (available, pending, lifetime)."""
    user = get_current_user()
    from services.wallet_service import WalletService

    summary = WalletService.get_summary(user.id)
    return success(data=summary, message="Wallet summary retrieved")


@bp.get("/history")
@require_auth
def get_history():
    """Paginated transaction history with optional filters.

    Query params:
        page, page_size, sort, status, type, date_from, date_to
    """
    user = get_current_user()
    from services.transaction_service import TransactionService

    page = int(request.args.get("page", 1))
    page_size = min(int(request.args.get("page_size", 20)), 100)
    filters = {
        "status": request.args.get("status"),
        "type": request.args.get("type"),
        "date_from": request.args.get("date_from"),
        "date_to": request.args.get("date_to"),
        "sort": request.args.get("sort", "-created_at"),
    }

    result = TransactionService.get_history(
        user_id=user.id,
        page=page,
        page_size=page_size,
        filters=filters,
    )
    return paginate(
        items=result["items"],
        total=result["total"],
        page=page,
        page_size=page_size,
        message="History retrieved",
    )


@bp.get("/transactions")
@require_auth
def get_transactions():
    """Alias for /history — same filtering/pagination."""
    return get_history()


@bp.get("/transaction/<transaction_id>")
@require_auth
def get_transaction(transaction_id: str):
    """Retrieve a single transaction by ID (must belong to the user)."""
    user = get_current_user()
    from services.transaction_service import TransactionService

    txn = TransactionService.get_by_id(transaction_id, user_id=user.id)
    if txn is None:
        return error(message="Transaction not found", code=404)
    return success(data=txn.to_dict(), message="Transaction retrieved")


@bp.get("/statistics")
@require_auth
def get_statistics():
    """Wallet statistics (today/weekly/monthly earnings, etc.)."""
    user = get_current_user()
    from services.wallet_service import WalletService

    period = request.args.get("period", "weekly")
    stats = WalletService.get_statistics(user.id, period=period)
    return success(data=stats, message="Statistics retrieved")
