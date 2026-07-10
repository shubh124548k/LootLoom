"""LootLoom backend configuration package.

Exposes the active :class:`Config` subclass for the current ``FLASK_ENV``
via :data:`config.get_config` so the Flask app factory can pick the right
settings without circular imports.
"""
from __future__ import annotations

from .settings import (
    Config,
    DevelopmentConfig,
    TestingConfig,
    ProductionConfig,
    get_config,
)

__all__ = [
    "Config",
    "DevelopmentConfig",
    "TestingConfig",
    "ProductionConfig",
    "get_config",
]
