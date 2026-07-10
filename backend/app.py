"""Flask application factory.

``create_app(config_class=None)`` wires up every cross-cutting concern:

* Configuration (env-driven)
* Database (Flask-SQLAlchemy + Flask-Migrate)
* CORS, rate-limiting, request-id, auth, logging middlewares
* Centralised error handling
* API blueprints under ``/api/v1``
* CEO bootstrap (creates a default CEO admin on first run when enabled)

Importing this module does NOT create an app — call :func:`create_app`
explicitly so the configuration can be picked per environment.
"""
from __future__ import annotations

from typing import Type

from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate

from config import Config, get_config
from core.database import db
from core.logging import configure_logging, get_logger
from core.exceptions import AppError


def create_app(config_class: Type[Config] | None = None) -> Flask:
    """Application factory entry point.

    Parameters
    ----------
    config_class:
        Optional explicit config class. Defaults to whatever
        ``get_config()`` returns for the current ``FLASK_ENV``.
    """
    config_class = config_class or get_config()
    app = Flask(__name__)
    app.config.from_object(config_class)

    # --- Logging ---------------------------------------------------------
    configure_logging(
        level=app.config.get("LOG_LEVEL", "INFO"),
        fmt=app.config.get("LOG_FORMAT", "json"),
    )
    log = get_logger("app")
    log.info("boot.start", env=app.config.get("FLASK_ENV"))

    # --- Extensions ------------------------------------------------------
    db.init_app(app)
    Migrate(app, db, directory="migrations")

    CORS(
        app,
        origins=app.config.get("CORS_ORIGINS", ["*"]),
        supports_credentials=app.config.get("CORS_ALLOW_CREDENTIALS", True),
        allow_headers=["*"],
        methods=["*"],
    )

    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[app.config.get("RATELIMIT_DEFAULT", "200 per hour")],
        storage_uri=app.config.get("RATELIMIT_STORAGE_URI", "memory://"),
        enabled=app.config.get("RATELIMIT_ENABLED", True),
    )
    app.extensions["limiter"] = limiter  # type: ignore[attr-defined]

    # --- Middlewares (before/after request hooks) -----------------------
    _register_middlewares(app)

    # --- Blueprints ------------------------------------------------------
    _register_blueprints(app)

    # --- Routes (health) -------------------------------------------------
    @app.get("/")
    def index() -> tuple[any, int]:  # type: ignore[valid-type]
        from core.responses import success

        return success(
            data={
                "name": app.config.get("APP_NAME"),
                "version": app.config.get("APP_VERSION"),
                "env": app.config.get("FLASK_ENV"),
            },
            message="LootLoom backend is running",
        )

    # --- Create tables (dev/test convenience; prod uses Alembic) --------
    if app.config.get("FLASK_ENV") in {"development", "testing"}:
        with app.app_context():
            # Import models so SQLAlchemy registers them on the metadata.
            import models  # noqa: F401  (side-effect: register tables)
            db.create_all()
            _bootstrap_ceo(app)

    log.info("boot.complete", env=app.config.get("FLASK_ENV"))
    return app


def _register_middlewares(app: Flask) -> None:
    """Wire up all before/after request middlewares."""
    from middlewares.request_id import register as register_request_id
    from middlewares.logging import register as register_logging
    from middlewares.error_handler import register as register_error_handler
    from middlewares.auth import register as register_auth

    register_request_id(app)
    register_logging(app)
    register_auth(app)
    register_error_handler(app)


def _register_blueprints(app: Flask) -> None:
    """Register every v1 API blueprint under ``/api/v1``."""
    from api.v1.health import bp as health_bp
    from api.v1.auth import bp as auth_bp
    from api.v1.ceo_auth import bp as ceo_auth_bp
    from api.v1.user import bp as user_bp
    from api.v1.wallet import bp as wallet_bp

    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(ceo_auth_bp, url_prefix="/api/v1/ceo/auth")
    app.register_blueprint(user_bp, url_prefix="/api/v1/user")
    app.register_blueprint(wallet_bp, url_prefix="/api/v1/wallet")


def _bootstrap_ceo(app: Flask) -> None:
    """Create a default CEO admin on first run when enabled.

    Uses :data:`CEO_BOOTSTRAP_*` env vars. Idempotent — skips if a CEO
    already exists.
    """
    if not app.config.get("CEO_BOOTSTRAP_ENABLED", True):
        return

    from services.ceo_auth_service import CEOAuthService

    username = app.config.get("CEO_BOOTSTRAP_USERNAME", "admin")
    email = app.config.get("CEO_BOOTSTRAP_EMAIL", "admin@lootloom.local")
    password = app.config.get("CEO_BOOTSTRAP_PASSWORD", "ChangeMe!2025")

    try:
        CEOAuthService.bootstrap_ceo(
            username=username, email=email, password=password
        )
    except Exception as exc:  # pragma: no cover - bootstrap best-effort
        get_logger("bootstrap").warning("ceo.bootstrap.failed", error=str(exc))
