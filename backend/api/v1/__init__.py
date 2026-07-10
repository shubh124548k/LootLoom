"""v1 API blueprints.

Each blueprint module declares a ``bp`` symbol that the Flask app
factory mounts under its URL prefix.
"""
from __future__ import annotations

from .health import bp as health_bp
from .auth import bp as auth_bp
from .ceo_auth import bp as ceo_auth_bp
from .user import bp as user_bp
from .wallet import bp as wallet_bp

__all__ = ["health_bp", "auth_bp", "ceo_auth_bp", "user_bp", "wallet_bp"]
