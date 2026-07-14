import json
import os
import time

import pytest

# This must be set before app is imported; see tests/test_api.py.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app import app
from models import User, db


@pytest.fixture()
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SECRET_KEY"] = "test-secret-key-for-pytest"
    app.config["JWT_EXPIRATION_HOURS"] = 24
    app.config["_db_ready"] = True  # skip seed_demo_data

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def _register(client, **overrides):
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Str0ng!Pass",
    }
    data.update(overrides)
    return client.post(
        "/api/auth/register",
        data=json.dumps(data),
        content_type="application/json",
    )


def _login(client, email="test@example.com", password="Str0ng!Pass"):
    return client.post(
        "/api/auth/login",
        data=json.dumps({"email": email, "password": password}),
        content_type="application/json",
    )


class TestRegistration:

    def test_successful_registration(self, client):
        resp = _register(client)
        assert resp.status_code == 201
        body = resp.get_json()
        assert body["success"] is True
        assert "token" in body
        assert body["user"]["username"] == "testuser"
        assert body["user"]["email"] == "test@example.com"
        assert "password_hash" not in body["user"]

    def test_trims_whitespace(self, client):
        resp = _register(client, username="  padded  ", email="  PAD@Example.COM  ")
        assert resp.status_code == 201
        body = resp.get_json()
        assert body["user"]["username"] == "padded"
        assert body["user"]["email"] == "pad@example.com"

    def test_empty_username(self, client):
        resp = _register(client, username="")
        assert resp.status_code == 400
        body = resp.get_json()
        assert body["success"] is False
        assert "username" in body["details"]

    def test_short_username(self, client):
        resp = _register(client, username="ab")
        assert resp.status_code == 400
        assert "username" in resp.get_json()["details"]

    def test_long_username(self, client):
        resp = _register(client, username="a" * 31)
        assert resp.status_code == 400
        assert "username" in resp.get_json()["details"]

    def test_invalid_username_chars(self, client):
        resp = _register(client, username="bad user!")
        assert resp.status_code == 400
        assert "username" in resp.get_json()["details"]

    def test_valid_username_with_underscores(self, client):
        resp = _register(client, username="good_user_1")
        assert resp.status_code == 201

    def test_empty_email(self, client):
        resp = _register(client, email="")
        assert resp.status_code == 400
        assert "email" in resp.get_json()["details"]

    def test_invalid_email_format(self, client):
        resp = _register(client, email="not-an-email")
        assert resp.status_code == 400
        assert "email" in resp.get_json()["details"]

    def test_very_long_email(self, client):
        resp = _register(client, email="a" * 200 + "@example.com")
        assert resp.status_code == 400
        assert "email" in resp.get_json()["details"]

    def test_email_lowercased(self, client):
        resp = _register(client, email="USER@EXAMPLE.COM")
        assert resp.status_code == 201
        assert resp.get_json()["user"]["email"] == "user@example.com"

    def test_empty_password(self, client):
        resp = _register(client, password="")
        assert resp.status_code == 400
        assert "password" in resp.get_json()["details"]

    def test_short_password(self, client):
        resp = _register(client, password="Aa1!xyz")
        assert resp.status_code == 400
        assert "password" in resp.get_json()["details"]

    def test_password_no_uppercase(self, client):
        resp = _register(client, password="lowercase1!")
        assert resp.status_code == 400
        assert "uppercase" in resp.get_json()["details"]["password"]

    def test_password_no_lowercase(self, client):
        resp = _register(client, password="UPPERCASE1!")
        assert resp.status_code == 400
        assert "lowercase" in resp.get_json()["details"]["password"]

    def test_password_no_digit(self, client):
        resp = _register(client, password="NoDigits!!")
        assert resp.status_code == 400
        assert "number" in resp.get_json()["details"]["password"]

    def test_password_no_special(self, client):
        resp = _register(client, password="NoSpecial1")
        assert resp.status_code == 400
        assert "special" in resp.get_json()["details"]["password"]

    def test_duplicate_username(self, client):
        _register(client)
        resp = _register(client, email="other@example.com")
        assert resp.status_code == 409
        assert "username" in resp.get_json()["details"]

    def test_duplicate_email(self, client):
        _register(client)
        resp = _register(client, username="otheruser")
        assert resp.status_code == 409
        assert "email" in resp.get_json()["details"]

    def test_missing_json_body(self, client):
        resp = client.post("/api/auth/register", content_type="application/json")
        assert resp.status_code == 400
        assert resp.get_json()["success"] is False

    def test_invalid_json_body(self, client):
        resp = client.post(
            "/api/auth/register",
            data="not json",
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_multiple_validation_errors(self, client):
        resp = _register(client, username="", email="", password="")
        assert resp.status_code == 400
        details = resp.get_json()["details"]
        assert "username" in details
        assert "email" in details
        assert "password" in details


class TestLogin:

    def test_successful_login(self, client):
        _register(client)
        resp = _login(client)
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["success"] is True
        assert "token" in body
        assert body["user"]["email"] == "test@example.com"
        assert "password_hash" not in body["user"]

    def test_login_email_case_insensitive(self, client):
        _register(client)
        resp = _login(client, email="TEST@EXAMPLE.COM")
        assert resp.status_code == 200

    def test_login_trims_email(self, client):
        _register(client)
        resp = _login(client, email="  test@example.com  ")
        assert resp.status_code == 200

    def test_wrong_password(self, client):
        _register(client)
        resp = _login(client, password="WrongPass1!")
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "Invalid credentials"

    def test_wrong_email(self, client):
        _register(client)
        resp = _login(client, email="nobody@example.com")
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "Invalid credentials"

    def test_empty_email(self, client):
        resp = _login(client, email="")
        assert resp.status_code == 400
        assert "email" in resp.get_json()["details"]

    def test_empty_password(self, client):
        resp = _login(client, email="a@b.com", password="")
        assert resp.status_code == 400
        assert "password" in resp.get_json()["details"]

    def test_missing_json_body(self, client):
        resp = client.post("/api/auth/login", content_type="application/json")
        assert resp.status_code == 400


class TestJWT:

    def _auth_header(self, token):
        return {"Authorization": f"Bearer {token}"}

    def test_access_protected_route(self, client):
        resp = _register(client)
        token = resp.get_json()["token"]
        me = client.get("/api/auth/me", headers=self._auth_header(token))
        assert me.status_code == 200
        assert me.get_json()["success"] is True

    def test_missing_auth_header(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401
        assert "Missing Authorization header" in resp.get_json()["error"]

    def test_invalid_bearer_format(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Token abc"})
        assert resp.status_code == 401
        assert "Bearer" in resp.get_json()["error"]

    def test_empty_bearer_token(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer "})
        assert resp.status_code == 401

    def test_invalid_token(self, client):
        resp = client.get("/api/auth/me", headers=self._auth_header("garbage.token.here"))
        assert resp.status_code == 401

    def test_expired_token(self, client):
        app.config["JWT_EXPIRATION_HOURS"] = 0
        resp = _register(client)
        token = resp.get_json()["token"]
        time.sleep(1)
        me = client.get("/api/auth/me", headers=self._auth_header(token))
        assert me.status_code == 401
        app.config["JWT_EXPIRATION_HOURS"] = 24  # restore

    def test_user_deleted_after_token(self, client):
        resp = _register(client)
        token = resp.get_json()["token"]
        with app.app_context():
            user = User.query.first()
            db.session.delete(user)
            db.session.commit()
        me = client.get("/api/auth/me", headers=self._auth_header(token))
        assert me.status_code == 401
        assert "no longer exists" in me.get_json()["error"]

    def test_token_wrong_secret(self, client):
        import jwt as pyjwt

        token = pyjwt.encode({"sub": "1", "exp": 9999999999}, "wrong-secret", algorithm="HS256")
        resp = client.get("/api/auth/me", headers=self._auth_header(token))
        assert resp.status_code == 401


class TestErrorHandlers:

    def test_404_returns_json(self, client):
        resp = client.get("/api/nonexistent")
        assert resp.status_code == 404
        body = resp.get_json()
        assert body["success"] is False

    def test_405_returns_json(self, client):
        resp = client.delete("/api/health")
        assert resp.status_code == 405
        body = resp.get_json()
        assert body["success"] is False


class TestLogout:

    def test_logout_returns_success(self, client):
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True
