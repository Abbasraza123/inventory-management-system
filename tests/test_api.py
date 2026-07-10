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


def test_login_returns_token(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["token"]
    assert payload["user"]["username"] == "admin"


def test_products_can_be_updated(client):
    product_response = client.post(
        "/api/products",
        json={"name": "Cable", "price": 20, "stock": 7, "category": "Accessories"},
    )
    product_id = product_response.get_json()["id"]

    update_response = client.put(
        f"/api/products/{product_id}",
        json={"stock": 9, "price": 25},
    )

    assert update_response.status_code == 200
    assert update_response.get_json()["stock"] == 9
    assert update_response.get_json()["price"] == 25
