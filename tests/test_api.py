import os
import sys

import pytest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app, db, seed_demo_data


@pytest.fixture
def client():
    app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI="sqlite:///:memory:")
    with app.app_context():
        db.drop_all()
        db.create_all()
        seed_demo_data()

    with app.test_client() as client:
        yield client


def test_register_and_login_flow(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "alice", "email": "alice@example.com", "password": "SecurePass1!"},
    )

    assert register_response.status_code == 201
    assert register_response.get_json()["user"]["username"] == "alice"

    login_response = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "SecurePass1!"},
    )

    assert login_response.status_code == 200
    payload = login_response.get_json()
    assert payload["token"]
    assert payload["user"]["email"] == "alice@example.com"


def test_products_require_authentication(client):
    response = client.post(
        "/api/products",
        json={"name": "Cable", "price": 20, "stock": 7, "category": "Accessories"},
    )

    assert response.status_code == 401


def test_products_can_be_updated_with_valid_token(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "bob", "email": "bob@example.com", "password": "SecurePass1!"},
    )
    token = register_response.get_json()["token"]

    product_response = client.post(
        "/api/products",
        json={"name": "Cable", "price": 20, "stock": 7, "category": "Accessories"},
        headers={"Authorization": f"Bearer {token}"},
    )
    product_id = product_response.get_json()["id"]

    update_response = client.put(
        f"/api/products/{product_id}",
        json={"stock": 9, "price": 25},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert update_response.status_code == 200
    assert update_response.get_json()["stock"] == 9
    assert update_response.get_json()["price"] == 25
