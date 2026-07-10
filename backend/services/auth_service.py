"""Authentication service — orchestrates registration, login, logout,
refresh, email verification (architecture), and forgot/reset password
(architecture).

Architecture notes:
* Registration creates a :class:`User`, an empty :class:`Wallet`, and
  issues an access + refresh token pair. The refresh token's ``jti`` is
  persisted via :class:`SessionService`.
* Login validates credentials, bumps ``last_login``, and issues tokens.
* Logout revokes the refresh-token session.
* Refresh validates the refresh token, rotates the pair, and revokes
  the old ``jti``.
* Email verification / forgot-password / reset-password are exposed as
  service methods that **schedule** the work but DO NOT actually send
  emails in this scaffold — they create the tokens / state and log the
  action. A future prompt can plug in a real mailer.
"""
from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Optional

from flask import current_app, request

from core.database import db
from core.enums import (
    UserStatus,
    VerificationStatus,
    Role,
    SessionType,
    SecurityEventType,
)
from core.exceptions import (
    AuthError,
    ConflictError,
    InvalidCredentialsError,
    NotFoundError,
    ValidationError,
    PermissionDeniedError,
)
from core.logging import get_logger
from models.user import User
from models.wallet import Wallet
from models.security_event import SecurityEvent
from repositories.user_repository import UserRepository
from repositories.wallet_repository import WalletRepository
from .password_service import PasswordService
from .jwt_service import JWTService
from .session_service import SessionService

log = get_logger("auth_service")


class AuthService:
    """User authentication flows."""

    def __init__(
        self,
        user_repo: Optional[UserRepository] = None,
        wallet_repo: Optional[WalletRepository] = None,
        session_service: Optional[SessionService] = None,
    ) -> None:
        self.user_repo = user_repo or UserRepository()
        self.wallet_repo = wallet_repo or WalletRepository()
        self.session_service = session_service or SessionService()

    # -----------------------------------------------------------------
    # Registration
    # -----------------------------------------------------------------
    def register(
        self,
        *,
        username: str,
        email: str,
        password: str,
        display_name: Optional[str] = None,
        referral_code: Optional[str] = None,
    ) -> tuple[User, str, str]:
        """Register a new user, create a wallet, and issue tokens.

        Returns ``(user, access_token, refresh_token)``.
        """
        # Strength
        PasswordService.validate_strength(password)

        # Uniqueness
        if self.user_repo.email_exists(email):
            raise ConflictError("Email is already registered", code="email_taken")
        if self.user_repo.username_exists(username):
            raise ConflictError("Username is already taken", code="username_taken")

        # Referral (optional)
        referrer_id: Optional[str] = None
        if referral_code:
            referrer = self.user_repo.get_by_referral_code(referral_code)
            if referrer is None:
                raise ValidationError(
                    "Invalid referral code", code="invalid_referral_code"
                )
            referrer_id = referrer.id

        # Create user
        password_hash = PasswordService.hash(password)
        new_referral_code = self._generate_referral_code(username)
        user = self.user_repo.create(
            {
                "username": username.lower(),
                "email": email.lower(),
                "password_hash": password_hash,
                "display_name": display_name or username,
                "status": UserStatus.ACTIVE.value,
                "verification_status": VerificationStatus.EMAIL_PENDING.value,
                "role": Role.USER.value,
                "referral_code": new_referral_code,
                "referral_by": referrer_id,
            }
        )

        # Create wallet
        wallet = self.wallet_repo.create(
            {
                "wallet_id": self._generate_wallet_id(),
                "user_id": user.id,
                "current_balance": 0,
                "pending_balance": 0,
                "lifetime_earned": 0,
                "lifetime_redeemed": 0,
            }
        )

        # Issue tokens
        access_token, _ = JWTService.create_access_token(
            subject=user.id,
            owner_type=SessionType.USER,
            role=user.role,
            permissions=[],
        )
        refresh_token, jti, refresh_ttl = JWTService.create_refresh_token(
            subject=user.id,
            owner_type=SessionType.USER,
            role=user.role,
        )
        self.session_service.create(
            jti=jti,
            owner_id=user.id,
            owner_type=SessionType.USER,
            ttl_seconds=refresh_ttl,
            ip_address=self._client_ip(),
            user_agent=self._user_agent(),
        )

        self.user_repo.commit()
        log.info(
            "auth.register",
            user_id=user.id,
            username=user.username,
            wallet_id=wallet.wallet_id,
        )
        return user, access_token, refresh_token

    # -----------------------------------------------------------------
    # Login
    # -----------------------------------------------------------------
    def login(self, identifier: str, password: str) -> tuple[User, str, str]:
        """Authenticate with username-or-email + password.

        Returns ``(user, access_token, refresh_token)``.
        """
        user = self.user_repo.get_by_identifier(identifier)
        if user is None or not PasswordService.verify(password, user.password_hash):
            self._record_security(
                user_id=user.id if user else None,
                event_type=SecurityEventType.LOGIN_FAILED.value,
                description=f"Failed login for identifier={identifier}",
            )
            raise InvalidCredentialsError("Invalid credentials")

        if user.status != UserStatus.ACTIVE.value:
            raise AuthError(
                f"Account is {user.status}",
                code="account_not_active",
                status_code=403,
            )

        # Bump last_login
        self.user_repo.update(
            user,
            {
                "last_login": datetime.now(timezone.utc),
                "last_login_ip": self._client_ip(),
            },
        )

        # Issue tokens
        access_token, _ = JWTService.create_access_token(
            subject=user.id,
            owner_type=SessionType.USER,
            role=user.role,
            permissions=[],
        )
        refresh_token, jti, refresh_ttl = JWTService.create_refresh_token(
            subject=user.id,
            owner_type=SessionType.USER,
            role=user.role,
        )
        self.session_service.create(
            jti=jti,
            owner_id=user.id,
            owner_type=SessionType.USER,
            ttl_seconds=refresh_ttl,
            ip_address=self._client_ip(),
            user_agent=self._user_agent(),
        )

        self.user_repo.commit()
        self._record_security(
            user_id=user.id,
            event_type=SecurityEventType.LOGIN_SUCCESS.value,
            description=f"User {user.username} logged in",
        )
        log.info("auth.login", user_id=user.id, username=user.username)
        return user, access_token, refresh_token

    # -----------------------------------------------------------------
    # Logout
    # -----------------------------------------------------------------
    def logout(self, refresh_token: Optional[str]) -> None:
        """Revoke the refresh-token session (logout)."""
        if not refresh_token:
            return
        try:
            claims = JWTService.validate_refresh(refresh_token)
            self.session_service.revoke(claims["jti"])
            log.info("auth.logout", user_id=claims.get("sub"))
        except Exception as exc:  # pragma: no cover - logout is best-effort
            log.warning("auth.logout.failed", error=str(exc))

    # -----------------------------------------------------------------
    # Refresh
    # -----------------------------------------------------------------
    def refresh(self, refresh_token: str) -> tuple[str, str, int]:
        """Rotate the refresh-token pair.

        Returns ``(new_access, new_refresh, access_ttl_seconds)``.
        """
        claims, new_access, access_ttl, new_refresh, new_jti, refresh_ttl = (
            JWTService.rotate(refresh_token)
        )

        # Validate the old session is still active (revocation check)
        self.session_service.validate(claims["jti"])

        # Persist new session, revoke old one
        self.session_service.create(
            jti=new_jti,
            owner_id=claims["sub"],
            owner_type=SessionType(claims.get("owner_type", SessionType.USER.value)),
            ttl_seconds=refresh_ttl,
            ip_address=self._client_ip(),
            user_agent=self._user_agent(),
        )
        self.session_service.revoke(claims["jti"])
        log.info("auth.refresh", user_id=claims.get("sub"))
        return new_access, new_refresh, access_ttl

    # -----------------------------------------------------------------
    # Logout-all
    # -----------------------------------------------------------------
    def logout_all(self, user_id: str) -> int:
        """Revoke every active session for ``user_id``."""
        return self.session_service.revoke_all(user_id, SessionType.USER)

    # -----------------------------------------------------------------
    # Email verification (architecture)
    # -----------------------------------------------------------------
    def send_verification_email(self, user: User) -> str:
        """Generate a verification code and (architecture) "send" it.

        Returns the generated code — in production this would be sent
        via the mailer and never returned to the caller. The scaffold
        logs the code so manual testing is possible.
        """
        code = secrets.token_hex(3).upper()  # 6-char hex
        # Persisting the code is left to a future prompt; for now we
        # just log it.
        log.info("auth.verify_email.queued", user_id=user.id, code=code)
        return code

    def verify_email(self, email: str, code: str) -> User:
        """Mark the user's email as verified.

        Architecture note: in production this validates ``code``
        against a persisted, time-boxed token. The scaffold accepts
        any non-empty code so the flow is testable.
        """
        user = self.user_repo.get_by_email(email)
        if user is None:
            raise NotFoundError("User not found", code="user_not_found")
        if not code:
            raise ValidationError("Verification code is required")
        self.user_repo.update(
            user,
            {"verification_status": VerificationStatus.EMAIL_VERIFIED.value},
        )
        self.user_repo.commit()
        self._record_security(
            user_id=user.id,
            event_type=SecurityEventType.EMAIL_VERIFIED.value,
            description=f"Email verified for {user.email}",
        )
        log.info("auth.verify_email.ok", user_id=user.id)
        return user

    # -----------------------------------------------------------------
    # Forgot / reset password (architecture)
    # -----------------------------------------------------------------
    def forgot_password(self, email: str) -> str:
        """Generate a reset token and (architecture) "send" it.

        Returns the token so callers / tests can complete the flow.
        """
        user = self.user_repo.get_by_email(email)
        if user is None:
            # Don't leak whether the email exists
            log.info("auth.forgot_password.no_account", email=email)
            return ""
        token = secrets.token_urlsafe(32)
        log.info("auth.forgot_password.queued", user_id=user.id, token=token)
        return token

    def reset_password(self, token: str, new_password: str) -> None:
        """Reset a user's password given a valid reset token.

        Architecture note: in production this validates ``token``
        against a persisted, time-boxed reset record. The scaffold
        requires a non-empty token and accepts any token for testing.
        """
        if not token:
            raise ValidationError("Reset token is required")
        PasswordService.validate_strength(new_password)
        # Token-to-user lookup is left to a future prompt.
        log.info("auth.reset_password.architecture_only")

    # -----------------------------------------------------------------
    # Authenticated password change
    # -----------------------------------------------------------------
    def change_password(
        self, user: User, current_password: str, new_password: str
    ) -> None:
        """Change the password for an already-authenticated user."""
        if not PasswordService.verify(current_password, user.password_hash):
            raise InvalidCredentialsError("Current password is incorrect")
        PasswordService.validate_strength(new_password)
        self.user_repo.update(
            user,
            {
                "password_hash": PasswordService.hash(new_password),
                "password_changed_at": datetime.now(timezone.utc),
            },
        )
        self.user_repo.commit()
        # Revoke all sessions so the user must re-login everywhere
        self.session_service.revoke_all(user.id, SessionType.USER)
        self._record_security(
            user_id=user.id,
            event_type=SecurityEventType.PASSWORD_CHANGE.value,
            description="User changed password",
        )
        log.info("auth.change_password", user_id=user.id)

    # -----------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------
    @staticmethod
    def _generate_referral_code(username: str) -> str:
        """Generate a unique-ish referral code for a new user."""
        suffix = secrets.token_hex(3).upper()
        return f"LOOT-{username[:4].upper()}-{suffix}"

    @staticmethod
    def _generate_wallet_id() -> str:
        return f"WLT-{secrets.token_hex(8).upper()}"

    @staticmethod
    def _client_ip() -> Optional[str]:
        try:
            return request.remote_addr if request else None
        except RuntimeError:
            return None

    @staticmethod
    def _user_agent() -> Optional[str]:
        try:
            return request.headers.get("User-Agent") if request else None
        except RuntimeError:
            return None

    def _record_security(
        self, *, user_id: Optional[str], event_type: str, description: str
    ) -> None:
        """Insert a :class:`SecurityEvent` row (best-effort)."""
        try:
            event = SecurityEvent(
                user_id=user_id,
                type=event_type,
                description=description,
                ip_address=self._client_ip(),
                user_agent=self._user_agent(),
            )
            db.session.add(event)
            db.session.commit()
        except Exception as exc:  # pragma: no cover - logging best-effort
            db.session.rollback()
            log.warning("security_event.record_failed", error=str(exc))
