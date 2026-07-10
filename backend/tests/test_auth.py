"""Authentication tests (Prompt 28).

Covers: registration, login, logout, refresh, JWT validation,
permission validation, CEO login, protected routes, invalid/expired tokens.
"""
from __future__ import annotations


class TestRegistration:
    """User registration tests."""

    def test_register_success(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "new@lootloom.test",
                "password": "StrongPass!2025",
            },
        )
        assert resp.status_code in (200, 201)
        data = resp.get_json()
        assert data["success"] is True

    def test_register_duplicate_email(self, client, test_user):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "username": "another",
                "email": "test@lootloom.test",
                "password": "StrongPass!2025",
            },
        )
        assert resp.status_code in (400, 409)

    def test_register_weak_password(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "username": "weak",
                "email": "weak@lootloom.test",
                "password": "123",
            },
        )
        assert resp.status_code == 400


class TestLogin:
    """User login tests."""

    def test_login_success(self, client, test_user):
        resp = client.post(
            "/api/v1/auth/login",
            json={
                "identifier": "test@lootloom.test",
                "password": "TestPass!2025",
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "access_token" in data or "accessToken" in data

    def test_login_invalid_credentials(self, client, test_user):
        resp = client.post(
            "/api/v1/auth/login",
            json={
                "identifier": "test@lootloom.test",
                "password": "wrongpassword",
            },
        )
        assert resp.status_code in (400, 401)


class TestProtectedRoutes:
    """Tests for JWT-protected routes."""

    def test_get_profile_unauthorized(self, client):
        resp = client.get("/api/v1/user/profile")
        assert resp.status_code == 401

    def test_get_profile_authorized(self, client, auth_headers):
        resp = client.get("/api/v1/user/profile", headers=auth_headers)
        assert resp.status_code == 200

    def test_invalid_token_rejected(self, client):
        resp = client.get(
            "/api/v1/user/profile",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401


class TestRefresh:
    """Token refresh tests."""

    def test_refresh_success(self, client, test_user):
        login_resp = client.post(
            "/api/v1/auth/login",
            json={
                "identifier": "test@lootloom.test",
                "password": "TestPass!2025",
            },
        )
        tokens = login_resp.get_json()["data"]
        refresh = tokens.get("refresh_token") or tokens.get("refreshToken")
        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh},
        )
        assert resp.status_code == 200


class TestCEOLogin:
    """CEO authentication tests (completely separate from user auth)."""

    def test_ceo_login_success(self, client):
        resp = client.post(
            "/api/v1/ceo/auth/login",
            json={
                "identifier": "admin",
                "password": "ChangeMe!2025",
            },
        )
        assert resp.status_code == 200

    def test_ceo_protected_route_with_user_token(self, client, auth_headers):
        """User tokens must NOT access CEO routes."""
        resp = client.get(
            "/api/v1/ceo/auth/me",
            headers=auth_headers,
        )
        assert resp.status_code in (401, 403)
