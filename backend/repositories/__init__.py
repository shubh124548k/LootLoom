"""Repository layer.

Re-exports the concrete repository classes used by services. The base
class :class:`BaseRepository` is generic and reusable; subclasses add
domain-specific queries.
"""
from __future__ import annotations

from .base import BaseRepository
from .user_repository import UserRepository
from .admin_repository import AdministratorRepository
from .wallet_repository import WalletRepository
from .transaction_repository import TransactionRepository
from .session_repository import SessionRepository
from .redeem_repository import RedeemRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "AdministratorRepository",
    "WalletRepository",
    "TransactionRepository",
    "SessionRepository",
    "RedeemRepository",
]
