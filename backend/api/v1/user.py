"""User Profile & Account Management API blueprint (Prompt 29).

Endpoints
---------
GET    /api/v1/user/profile                 — Retrieve current user profile
PUT    /api/v1/user/profile                 — Update profile
GET    /api/v1/user/profile/public/<username> — Public profile
GET    /api/v1/user/settings                — Retrieve settings
PUT    /api/v1/user/settings                — Update settings
GET    /api/v1/user/security                — Security info
PUT    /api/v1/user/password                — Change password
GET    /api/v1/user/sessions                — Active sessions
DELETE /api/v1/user/sessions/current        — Logout current session
DELETE /api/v1/user/sessions/all            — Logout all sessions
GET    /api/v1/user/preferences             — Retrieve preferences
PUT    /api/v1/user/preferences             — Update preferences
GET    /api/v1/user/status                  — Account status

All routes require authentication.
"""
from __future__ import annotations

from flask import Blueprint, request

from core.responses import success, error
from middlewares.auth import require_auth
from security.decorators import get_current_user

bp = Blueprint("user", __name__)


# ──────────────────────────────────────────────────────────────────────────────
# Profile
# ──────────────────────────────────────────────────────────────────────────────
@bp.get("/profile")
@require_auth
def get_profile():
    """Retrieve the current user's private profile."""
    user = get_current_user()
    from services.user_service import UserService

    profile = UserService.get_profile(user.id)
    return success(data=profile, message="Profile retrieved")


@bp.put("/profile")
@require_auth
def update_profile():
    """Update the current user's profile fields."""
    user = get_current_user()
    from services.user_service import UserService

    payload = request.get_json(silent=True) or {}
    updated = UserService.update_profile(user.id, payload)
    return success(data=updated, message="Profile updated")


@bp.get("/profile/public/<username>")
def get_public_profile(username: str):
    """Retrieve a user's public profile by username (no auth required)."""
    from services.user_service import UserService

    profile = UserService.get_public_profile(username)
    if profile is None:
        return error(message="User not found", code=404)
    return success(data=profile, message="Public profile retrieved")


# ──────────────────────────────────────────────────────────────────────────────
# Settings
# ──────────────────────────────────────────────────────────────────────────────
@bp.get("/settings")
@require_auth
def get_settings():
    """Retrieve the current user's settings."""
    user = get_current_user()
    from services.user_service import UserService

    settings = UserService.get_settings(user.id)
    return success(data=settings, message="Settings retrieved")


@bp.put("/settings")
@require_auth
def update_settings():
    """Update the current user's settings."""
    user = get_current_user()
    from services.user_service import UserService

    payload = request.get_json(silent=True) or {}
    updated = UserService.update_settings(user.id, payload)
    return success(data=updated, message="Settings updated")


# ──────────────────────────────────────────────────────────────────────────────
# Security
# ──────────────────────────────────────────────────────────────────────────────
@bp.get("/security")
@require_auth
def get_security():
    """Retrieve security information (verification status, sessions summary)."""
    user = get_current_user()
    from services.user_service import UserService

    info = UserService.get_security_info(user.id)
    return success(data=info, message="Security info retrieved")


@bp.put("/password")
@require_auth
def change_password():
    """Change the current user's password."""
    user = get_current_user()
    from services.user_service import UserService

    payload = request.get_json(silent=True) or {}
    UserService.change_password(user.id, payload)
    return success(message="Password changed")


# ──────────────────────────────────────────────────────────────────────────────
# Sessions
# ──────────────────────────────────────────────────────────────────────────────
@bp.get("/sessions")
@require_auth
def list_sessions():
    """List the current user's active sessions."""
    user = get_current_user()
    from services.session_service import SessionService

    sessions = SessionService.list_user_sessions(user.id)
    return success(data=sessions, message="Sessions retrieved")


@bp.delete("/sessions/current")
@require_auth
def logout_current():
    """Logout the current session only."""
    from security.decorators import get_current_session

    session = get_current_session()
    from services.session_service import SessionService

    SessionService.revoke(session.id)
    return success(message="Current session closed")


@bp.delete("/sessions/all")
@require_auth
def logout_all():
    """Logout all sessions for the current user."""
    user = get_current_user()
    from services.session_service import SessionService

    SessionService.revoke_all_for_user(user.id)
    return success(message="All sessions closed")


# ──────────────────────────────────────────────────────────────────────────────
# Preferences
# ──────────────────────────────────────────────────────────────────────────────
@bp.get("/preferences")
@require_auth
def get_preferences():
    """Retrieve the current user's notification/privacy preferences."""
    user = get_current_user()
    from services.user_service import UserService

    prefs = UserService.get_preferences(user.id)
    return success(data=prefs, message="Preferences retrieved")


@bp.put("/preferences")
@require_auth
def update_preferences():
    """Update the current user's notification/privacy preferences."""
    user = get_current_user()
    from services.user_service import UserService

    payload = request.get_json(silent=True) or {}
    updated = UserService.update_preferences(user.id, payload)
    return success(data=updated, message="Preferences updated")


# ──────────────────────────────────────────────────────────────────────────────
# Status
# ──────────────────────────────────────────────────────────────────────────────
@bp.get("/status")
@require_auth
def get_status():
    """Retrieve the current user's account status."""
    user = get_current_user()
    from services.user_service import UserService

    status = UserService.get_status(user.id)
    return success(data=status, message="Status retrieved")
