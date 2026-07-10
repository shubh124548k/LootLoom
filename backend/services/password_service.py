"""Password hashing & strength validation.

Uses ``bcrypt`` with configurable cost factor. Password strength is
checked via a simple policy: minimum length, mixed case, digit, symbol.
"""
from __future__ import annotations

import re
from typing import ClassVar

import bcrypt
from flask import current_app

from core.exceptions import ValidationError


class PasswordService:
    """Hash / verify passwords and check strength."""

    MIN_LENGTH: ClassVar[int] = 8
    MAX_LENGTH: ClassVar[int] = 128

    # -----------------------------------------------------------------
    # Hashing
    # -----------------------------------------------------------------
    @staticmethod
    def hash(password: str) -> str:
        """Return a bcrypt hash of ``password``."""
        rounds = current_app.config.get("BCRYPT_ROUNDS", 12)
        salt = bcrypt.gensalt(rounds=rounds)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify(password: str, password_hash: str) -> bool:
        """Return ``True`` if ``password`` matches ``password_hash``."""
        if not password or not password_hash:
            return False
        try:
            return bcrypt.checkpw(
                password.encode("utf-8"),
                password_hash.encode("utf-8"),
            )
        except (ValueError, TypeError):
            return False

    # -----------------------------------------------------------------
    # Strength
    # -----------------------------------------------------------------
    @classmethod
    def validate_strength(cls, password: str) -> None:
        """Raise :class:`ValidationError` if password is too weak.

        Policy: ≥ 8 chars, ≥ 1 upper, ≥ 1 lower, ≥ 1 digit.
        """
        if not isinstance(password, str):
            raise ValidationError("Password must be a string")
        if len(password) < cls.MIN_LENGTH:
            raise ValidationError(
                f"Password must be at least {cls.MIN_LENGTH} characters"
            )
        if len(password) > cls.MAX_LENGTH:
            raise ValidationError(
                f"Password must be at most {cls.MAX_LENGTH} characters"
            )
        if not re.search(r"[A-Z]", password):
            raise ValidationError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", password):
            raise ValidationError("Password must contain a lowercase letter")
        if not re.search(r"\d", password):
            raise ValidationError("Password must contain a digit")

    @classmethod
    def strength_score(cls, password: str) -> int:
        """Return a 0-5 score for password strength (UI hint)."""
        score = 0
        if len(password) >= cls.MIN_LENGTH:
            score += 1
        if len(password) >= 12:
            score += 1
        if re.search(r"[A-Z]", password):
            score += 1
        if re.search(r"[a-z]", password):
            score += 1
        if re.search(r"\d", password):
            score += 1
        if re.search(r"[^A-Za-z0-9]", password):
            score += 1
        return min(score, 5)
