"""Auth blueprint — ``/api/v1/auth/*``.

Thin Flask routes that delegate to :class:`AuthController`.
"""
from __future__ import annotations

from flask import Blueprint

from controllers.auth_controller import AuthController
from security.decorators import require_auth

bp = Blueprint("auth", __name__)
_controller = AuthController()


@bp.post("/register")
def register():
    return _controller.register()


@bp.post("/login")
def login():
    return _controller.login()


@bp.post("/logout")
def logout():
    return _controller.logout()


@bp.post("/refresh")
def refresh():
    return _controller.refresh()


@bp.get("/me")
@require_auth
def me():
    return _controller.me()


@bp.post("/forgot-password")
def forgot_password():
    return _controller.forgot_password()


@bp.post("/reset-password")
def reset_password():
    return _controller.reset_password()


@bp.post("/verify-email")
def verify_email():
    return _controller.verify_email()
