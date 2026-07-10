"""User profile + settings schemas."""
from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class ProfileUpdateSchema(BaseModel):
    """Body for ``PUT /api/v1/user/profile``."""

    display_name: Optional[str] = Field(default=None, max_length=128)
    bio: Optional[str] = Field(default=None, max_length=1000)
    profile_image: Optional[str] = Field(default=None, max_length=512)
    cover_image: Optional[str] = Field(default=None, max_length=512)
    country: Optional[str] = Field(default=None, max_length=64)
    language: Optional[str] = Field(default=None, max_length=16)
    timezone: Optional[str] = Field(default=None, max_length=64)
    date_of_birth: Optional[date] = None
    phone: Optional[str] = Field(default=None, max_length=32)


class SettingsSchema(BaseModel):
    """Body for ``PUT /api/v1/user/settings``.

    Settings are stored as JSON in the user profile; this schema
    validates the wire format.
    """

    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    public_profile: Optional[bool] = None
    show_in_leaderboard: Optional[bool] = None
    language: Optional[str] = Field(default=None, max_length=16)
    theme: Optional[str] = Field(default=None, pattern="^(light|dark|system)$")


class ProfileResponseSchema(BaseModel):
    """Returned by ``GET /api/v1/user/profile``."""

    id: str
    username: str
    display_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    cover_image: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    date_of_birth: Optional[date] = None
    referral_code: str
    level: int
    xp: int
    daily_streak: int
    status: str
    verification_status: str
    role: str
    last_login: Optional[str] = None
