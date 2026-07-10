"""Pytest fixtures for the LootLoom backend test suite.

Provides:
- ``app`` — Flask app configured for testing (in-memory SQLite)
- ``client`` — Flask test client
- ``db_session`` — Clean database session per test
- ``auth_headers`` — JWT auth headers for a test user
"""
from __future__ import annotations

import pytest
from flask import Flask

from config import TestingConfig


@pytest.fixture(scope="session")
def app() -> Flask:
    """Create a Flask app with the testing config."""
    from app import create_app

    app = create_app(config_class=TestingConfig)
    yield app


@pytest.fixture(scope="function")
def client(app: Flask):
    """Flask test client with a fresh DB per test."""
    from core.database import db

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def db_session(app: Flask):
    """Clean database session."""
    from core.database import db

    with app.app_context():
        yield db.session
        db.session.rollback()


@pytest.fixture(scope="function")
def test_user(app: Flask):
    """Create a test user and return (user_dict, password)."""
    from services.auth_service import AuthService

    with app.app_context():
        result = AuthService.register(
            username="testuser",
            email="test@lootloom.test",
            password="TestPass!2025",
        )
        return result


@pytest.fixture(scope="function")
def auth_headers(client, test_user) -> dict:
    """Get JWT auth headers for the test user."""
    resp = client.post(
        "/api/v1/auth/login",
        json={
            "identifier": "test@lootloom.test",
            "password": "TestPass!2025",
        },
    )
    tokens = resp.get_json()["data"]
    access = tokens.get("access_token") or tokens.get("accessToken")
    return {"Authorization": f"Bearer {access}"}
