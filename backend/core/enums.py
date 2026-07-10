"""LootLoom domain enums.

A single module collects every ``enum.Enum`` so that models, services,
repositories, and API schemas all reference the same canonical value.
Use ``StrEnum`` where the wire-format is a string.
"""
from __future__ import annotations

from enum import Enum, StrEnum


# ---------------------------------------------------------------------
# User domain
# ---------------------------------------------------------------------
class UserStatus(StrEnum):
    """Lifecycle status of a regular user account."""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"
    DELETED = "deleted"
    PENDING = "pending"


class VerificationStatus(StrEnum):
    """Verification state for user contact info / identity."""

    UNVERIFIED = "unverified"
    EMAIL_PENDING = "email_pending"
    EMAIL_VERIFIED = "email_verified"
    PHONE_PENDING = "phone_pending"
    PHONE_VERIFIED = "phone_verified"
    FULLY_VERIFIED = "fully_verified"
    REJECTED = "rejected"


# ---------------------------------------------------------------------
# Administrator / CEO domain
# ---------------------------------------------------------------------
class AdminRole(StrEnum):
    """Roles in the CEO/admin subsystem."""

    CEO = "ceo"               # Super-administrator
    ADMIN = "admin"           # Senior administrator
    MODERATOR = "moderator"   # Day-to-day moderation
    ANALYST = "analyst"       # Read-only analytics
    SUPPORT = "support"       # Support engineer


class AdminStatus(StrEnum):
    """Lifecycle status of an admin account."""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    DISABLED = "disabled"


class Permission(StrEnum):
    """Granular permission flags used by the RBAC matrix."""

    # User management
    USER_VIEW = "user:view"
    USER_CREATE = "user:create"
    USER_UPDATE = "user:update"
    USER_SUSPEND = "user:suspend"
    USER_BAN = "user:ban"
    USER_DELETE = "user:delete"

    # Wallet / transactions
    WALLET_VIEW = "wallet:view"
    WALLET_ADJUST = "wallet:adjust"
    WALLET_FREEZE = "wallet:freeze"
    WALLET_AUDIT = "wallet:audit"

    # Redeem management
    REDEEM_VIEW = "redeem:view"
    REDEEM_APPROVE = "redeem:approve"
    REDEEM_REJECT = "redeem:reject"
    REDEEM_COMPLETE = "redeem:complete"

    # Rewards catalog
    REWARD_VIEW = "reward:view"
    REWARD_CREATE = "reward:create"
    REWARD_UPDATE = "reward:update"
    REWARD_DELETE = "reward:delete"

    # Support
    TICKET_VIEW = "ticket:view"
    TICKET_REPLY = "ticket:reply"
    TICKET_CLOSE = "ticket:close"

    # Communication / broadcasts
    ANNOUNCEMENT_CREATE = "announcement:create"
    ANNOUNCEMENT_PUBLISH = "announcement:publish"
    ANNOUNCEMENT_DELETE = "announcement:delete"

    # System / config
    SETTINGS_VIEW = "settings:view"
    SETTINGS_UPDATE = "settings:update"
    FEATUREFLAG_MANAGE = "featureflag:manage"
    AUDIT_VIEW = "audit:view"

    # CEO only
    ADMIN_MANAGE = "admin:manage"          # create/suspend admins
    ROLE_ASSIGN = "role:assign"
    SYSTEM_MAINTENANCE = "system:maintenance"


class Severity(StrEnum):
    """Severity levels for audit logs and security events."""

    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ---------------------------------------------------------------------
# Wallet / Transaction domain
# ---------------------------------------------------------------------
class WalletStatus(StrEnum):
    """Operational status of a user wallet."""

    ACTIVE = "active"
    FROZEN = "frozen"
    CLOSED = "closed"
    UNDER_REVIEW = "under_review"


class TransactionType(StrEnum):
    """Type of coin movement recorded on the ledger."""

    EARN = "earn"                 # Coins credited from earning activity
    REDEEM = "redeem"             # Coins debited to claim a reward
    BONUS = "bonus"               # Promotional / daily bonus credit
    REFERRAL = "referral"         # Referral payout
    ADMIN_CREDIT = "admin_credit"
    ADMIN_DEBIT = "admin_debit"
    REVERSAL = "reversal"         # Reversal of a prior transaction
    ADJUSTMENT = "adjustment"


class TransactionStatus(StrEnum):
    """Lifecycle status of a ledger entry."""

    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REVERSED = "reversed"
    CANCELLED = "cancelled"


# ---------------------------------------------------------------------
# Redeem domain
# ---------------------------------------------------------------------
class RedeemStatus(StrEnum):
    """Lifecycle status of a redeem request."""

    PENDING = "pending"
    APPROVED = "approved"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    FAILED = "failed"


class RewardCategory(StrEnum):
    """Reward catalog categories."""

    GIFT_CARD = "gift_card"
    CASH = "cash"
    UPI = "upi"
    CRYPTO = "crypto"
    MERCHANDISE = "merchandise"
    PREMIUM = "premium"
    DONATION = "donation"
    OTHER = "other"


class RewardStatus(StrEnum):
    """Availability state of a reward catalog entry."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"


# ---------------------------------------------------------------------
# Notification domain
# ---------------------------------------------------------------------
class NotificationPriority(StrEnum):
    """Priority of a notification item."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCategory(StrEnum):
    """Logical category of a notification."""

    SYSTEM = "system"
    WALLET = "wallet"
    REDEEM = "redeem"
    REFERRAL = "referral"
    MISSION = "mission"
    ACHIEVEMENT = "achievement"
    SUPPORT = "support"
    ANNOUNCEMENT = "announcement"
    SECURITY = "security"


# ---------------------------------------------------------------------
# Support domain
# ---------------------------------------------------------------------
class SupportStatus(StrEnum):
    """Lifecycle status of a support ticket."""

    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_USER = "waiting_user"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"


class SupportCategory(StrEnum):
    """Category of a support ticket."""

    ACCOUNT = "account"
    WALLET = "wallet"
    REDEEM = "redeem"
    TECHNICAL = "technical"
    PAYMENT = "payment"
    BUG = "bug"
    FEEDBACK = "feedback"
    OTHER = "other"


class SupportPriority(StrEnum):
    """Priority of a support ticket."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class TicketMessageSender(StrEnum):
    """Who authored a ticket message."""

    USER = "user"
    ADMIN = "admin"
    SYSTEM = "system"


# ---------------------------------------------------------------------
# Referral domain
# ---------------------------------------------------------------------
class ReferralStatus(StrEnum):
    """Lifecycle of a referral record."""

    PENDING = "pending"
    COMPLETED = "completed"
    REWARDED = "rewarded"
    EXPIRED = "expired"
    FRAUD = "fraud"


# ---------------------------------------------------------------------
# Gamification
# ---------------------------------------------------------------------
class MissionDifficulty(StrEnum):
    """Difficulty tier of a mission."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXTREME = "extreme"


class MissionStatus(StrEnum):
    """Availability state of a mission."""

    ACTIVE = "active"
    SCHEDULED = "scheduled"
    PAUSED = "paused"
    ENDED = "ended"
    DRAFT = "draft"


class MissionRepeat(StrEnum):
    """Repeat policy for a mission."""

    ONCE = "once"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class AchievementRarity(StrEnum):
    """Rarity tier of an achievement."""

    COMMON = "common"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"


class AchievementCategory(StrEnum):
    """Category of an achievement."""

    EARNING = "earning"
    STREAK = "streak"
    SOCIAL = "social"
    REDEEM = "redeem"
    WALLET = "wallet"
    SPECIAL = "special"


class UserAchievementStatus(StrEnum):
    """Lifecycle of a user-achievement link."""

    IN_PROGRESS = "in_progress"
    UNLOCKED = "unlocked"
    CLAIMED = "claimed"


# ---------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------
class LeaderboardPeriod(StrEnum):
    """Time-window for leaderboard snapshots."""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    ALL_TIME = "all_time"


# ---------------------------------------------------------------------
# Sessions / auth
# ---------------------------------------------------------------------
class SessionStatus(StrEnum):
    """Lifecycle status of an auth session."""

    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    LOGGED_OUT = "logged_out"


class SessionType(StrEnum):
    """What kind of actor owns the session."""

    USER = "user"
    ADMIN = "admin"
    API_KEY = "api_key"


# ---------------------------------------------------------------------
# Security events
# ---------------------------------------------------------------------
class SecurityEventType(StrEnum):
    """Types of security-relevant events."""

    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFIED = "email_verified"
    PHONE_VERIFIED = "phone_verified"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    SESSION_HIJACK_SUSPECTED = "session_hijack_suspected"
    RATE_LIMIT_HIT = "rate_limit_hit"
    PERMISSION_DENIED = "permission_denied"


# ---------------------------------------------------------------------
# System / platform
# ---------------------------------------------------------------------
class PlatformStatusLevel(StrEnum):
    """Overall platform health level."""

    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    PARTIAL_OUTAGE = "partial_outage"
    MAJOR_OUTAGE = "major_outage"
    MAINTENANCE = "maintenance"


class FeatureFlagStatus(StrEnum):
    """State of a feature flag."""

    ON = "on"
    OFF = "off"
    RAMP_UP = "ramp_up"
    INTERNAL = "internal"


class AnnouncementAudience(StrEnum):
    """Target audience of an announcement."""

    ALL = "all"
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    NEW = "new"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ADMIN = "admin"


class AnnouncementPriority(StrEnum):
    """Priority of an announcement."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


# ---------------------------------------------------------------------
# Generic
# ---------------------------------------------------------------------
class Role(StrEnum):
    """Convenience roles used by RBAC (alias of :class:`AdminRole`)."""

    USER = "user"
    CEO = "ceo"
    ADMIN = "admin"
    MODERATOR = "moderator"
    ANALYST = "analyst"
    SUPPORT = "support"


class AuditAction(StrEnum):
    """Canonical audit log actions."""

    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    IMPERSONATE = "impersonate"
    EXPORT = "export"
    CONFIG_CHANGE = "config_change"
    WALLET_ADJUST = "wallet_adjust"
    ROLE_CHANGE = "role_change"
