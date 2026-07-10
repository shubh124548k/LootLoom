"""User model — the central account entity for regular users.

A :class:`User` owns a single :class:`Wallet`, has many
:class:`Transaction`s, :class:`RedeemRequest`s, :class:`Notification`s,
:class:`SupportTicket`s, etc. Password storage uses bcrypt via
:class:`services.password_service.PasswordService`; the raw password is
never stored.

Future-proofing (placeholder columns / fields marked with comments):
* currency preference
* frozen wallet toggle
* multi-factor authentication (TOTP / passkey)
* trusted devices
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    String,
    Integer,
    DateTime,
    Text,
    Index,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import UserStatus, VerificationStatus, Role


class User(BaseModel):
    """Regular LootLoom user account."""

    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("username", name="uq_users_username"),
        UniqueConstraint("email", name="uq_users_email"),
        UniqueConstraint("referral_code", name="uq_users_referral_code"),
        Index("ix_users_status", "status"),
        Index("ix_users_role", "role"),
        Index("ix_users_verification", "verification_status"),
        Index("ix_users_referral_by", "referral_by"),
    )

    # --- Identity -------------------------------------------------------
    username: Mapped[str] = mapped_column(String(64), nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(128))
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(32))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # --- Profile --------------------------------------------------------
    profile_image: Mapped[Optional[str]] = mapped_column(String(512))
    cover_image: Mapped[Optional[str]] = mapped_column(String(512))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    country: Mapped[Optional[str]] = mapped_column(String(64))
    language: Mapped[Optional[str]] = mapped_column(String(16), default="en")
    timezone: Mapped[Optional[str]] = mapped_column(String(64), default="UTC")
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Referral -------------------------------------------------------
    referral_code: Mapped[str] = mapped_column(String(32), nullable=False)
    referral_by: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )

    # --- Gamification state --------------------------------------------
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    daily_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_streak_date: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Status / verification / role ----------------------------------
    status: Mapped[str] = mapped_column(
        String(32), default=UserStatus.PENDING.value, nullable=False
    )
    verification_status: Mapped[str] = mapped_column(
        String(32),
        default=VerificationStatus.UNVERIFIED.value,
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        String(32), default=Role.USER.value, nullable=False
    )

    # --- Security / sessions -------------------------------------------
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_login_ip: Mapped[Optional[str]] = mapped_column(String(64))
    password_changed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    # Future: mfa_secret, passkey_credentials (JSON), trusted_devices (JSON)

    # --- Relationships --------------------------------------------------
    wallet: Mapped[Optional["Wallet"]] = relationship(
        "Wallet", uselist=False, back_populates="user", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="user"
    )
    redeems: Mapped[list["RedeemRequest"]] = relationship(
        "RedeemRequest", back_populates="user"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="user"
    )
    tickets: Mapped[list["SupportTicket"]] = relationship(
        "SupportTicket", back_populates="user"
    )
    achievements: Mapped[list["UserAchievement"]] = relationship(
        "UserAchievement", back_populates="user"
    )
    leaderboard_entries: Mapped[list["Leaderboard"]] = relationship(
        "Leaderboard", back_populates="user"
    )

    referrer: Mapped[Optional["User"]] = relationship(
        "User",
        remote_side="User.id",
        foreign_keys=[referral_by],
        backref="referred_users",
    )

    def to_dict(self, exclude: set[str] | None = None) -> dict:
        exclude = (exclude or set()) | {"password_hash"}
        data = super().to_dict(exclude=exclude)
        if data.get("last_login"):
            data["last_login"] = (
                data["last_login"].isoformat()
                if isinstance(data["last_login"], datetime)
                else data["last_login"]
            )
        return data
