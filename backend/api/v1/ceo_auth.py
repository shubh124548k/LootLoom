"""CEO auth blueprint — ``/api/v1/ceo/auth/*``.

Completely separate from user auth — different controller, different
session domain.
"""
from __future__ import annotations

from flask import Blueprint

from controllers.ceo_auth_controller import CEOAuthController
from security.decorators import require_ceo

bp = Blueprint("ceo_auth", __name__)
_controller = CEOAuthController()


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
@require_ceo
def me():
    return _controller.me()
