"""SQLAlchemy domain models for LootLoom.

Importing this package registers every table on the shared SQLAlchemy
``Base`` metadata. The package is imported for its side effects by the
Flask app factory before ``db.create_all()`` is invoked.

Relationship map (high level)::

    User ─┬─ Wallet ──── Transaction
          ├─ RedeemRequest ─ Reward
          ├─ Notification
          ├─ SupportTicket ─ TicketMessage
          ├─ Referral (referrer / invited_user)
          ├─ UserAchievement ─ Achievement
          ├─ MissionProgress ─ Mission
          └─ Leaderboard

    Administrator ──── AuditLog, SupportTicket (admin), RedeemRequest (admin)
    SecurityEvent (user or admin)
    AppSettings / FeatureFlag / PlatformStatus / Announcement (system)
"""
from __future__ import annotations

from .user import User
from .administrator import Administrator
from .wallet import Wallet
from .transaction import Transaction
from .reward import Reward
from .redeem import RedeemRequest
from .notification import Notification
from .support import SupportTicket, TicketMessage
from .referral import Referral
from .achievement import Achievement, UserAchievement
from .mission import Mission, MissionProgress
from .leaderboard import Leaderboard
from .audit import AuditLog
from .security_event import SecurityEvent
from .system import (
    AppSettings,
    FeatureFlag,
    PlatformStatus,
    Announcement,
    UserSession,
)

__all__ = [
    "User",
    "Administrator",
    "Wallet",
    "Transaction",
    "Reward",
    "RedeemRequest",
    "Notification",
    "SupportTicket",
    "TicketMessage",
    "Referral",
    "Achievement",
    "UserAchievement",
    "Mission",
    "MissionProgress",
    "Leaderboard",
    "AuditLog",
    "SecurityEvent",
    "AppSettings",
    "FeatureFlag",
    "PlatformStatus",
    "Announcement",
    "UserSession",
]
