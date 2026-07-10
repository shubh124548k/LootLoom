"""Wallet + transaction schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field


class WalletResponseSchema(BaseModel):
    """Returned by ``GET /api/v1/wallet``."""

    wallet_id: str
    user_id: str
    current_balance: int
    pending_balance: int
    lifetime_earned: int
    lifetime_redeemed: int
    status: str
    last_updated: datetime


class WalletSummarySchema(BaseModel):
    """Aggregated wallet summary."""

    wallet_id: str
    current_balance: int
    pending_balance: int
    lifetime_earned: int
    lifetime_redeemed: int
    net_balance: int
    today_earned: int = 0
    week_earned: int = 0
    month_earned: int = 0
    today_redeemed: int = 0
    week_redeemed: int = 0
    month_redeemed: int = 0
    transaction_count: int = 0


class TransactionResponseSchema(BaseModel):
    """Returned by ``GET /api/v1/wallet/transactions``."""

    id: str
    transaction_id: str
    wallet_id: str
    user_id: str
    type: str
    amount: int
    previous_balance: int
    new_balance: int
    reference: Optional[str] = None
    description: Optional[str] = None
    status: str
    created_at: datetime


class CreditCoinsSchema(BaseModel):
    """Body for ``POST /api/v1/wallet/credit`` (admin / internal)."""

    amount: int = Field(gt=0, description="Coins to credit")
    type: str = Field(default="bonus")
    reference: Optional[str] = None
    description: Optional[str] = None


class DebitCoinsSchema(BaseModel):
    """Body for ``POST /api/v1/wallet/debit`` (admin / internal)."""

    amount: int = Field(gt=0, description="Coins to debit")
    type: str = Field(default="redeem")
    reference: Optional[str] = None
    description: Optional[str] = None


class WalletStatisticsSchema(BaseModel):
    """Returned by ``GET /api/v1/wallet/statistics``."""

    wallet_id: str
    period: str
    total_earned: int
    total_redeemed: int
    net_change: int
    transaction_count: int
    by_type: dict[str, int]
