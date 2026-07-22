import os
import sys

import pytest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app import app, db, seed_demo_data
from models import Role, User
from seed_rbac import seed_rbac


@pytest.fixture
def client():
    app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI="sqlite:///:memory:")
    with app.app_context():
        db.drop_all()
        db.create_all()
        seed_rbac()
        seed_demo_data()

    with app.test_client() as client:
        yield client


def _create_user_with_role(client, username, email, password, role_name="Store Keeper"):
    """Register a user then elevate their role via DB (simulates admin creation)."""
    resp = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    assert resp.status_code == 201
    token = resp.get_json()["token"]

    with app.app_context():
        user = User.query.filter_by(email=email).first()
        role = Role.query.filter_by(name=role_name).first()
        user.role_id = role.id
        db.session.commit()

    return token


def test_register_and_login_flow(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "alice", "email": "alice@example.com", "password": "SecurePass1!"},
    )

    assert register_response.status_code == 201
    body = register_response.get_json()
    assert body["user"]["username"] == "alice"
    assert body["user"]["role"] == "Store Keeper"

    login_response = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "SecurePass1!"},
    )

    assert login_response.status_code == 200
    payload = login_response.get_json()
    assert payload["token"]
    assert payload["user"]["email"] == "alice@example.com"
    assert payload["user"]["role"] == "Store Keeper"


def test_products_require_authentication(client):
    response = client.post(
        "/api/products",
        json={"name": "Cable", "price": 20, "stock": 7, "category": "Accessories"},
    )

    assert response.status_code == 401


def test_products_require_create_permission(client):
    """Store Keeper cannot create products."""
    token = _create_user_with_role(
        client, "keeper1", "keeper1@example.com", "SecurePass1!", "Store Keeper"
    )
    response = client.post(
        "/api/products",
        json={"name": "Cable", "price": 20, "stock": 7, "category": "Accessories"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_inventory_manager_can_manage_products(client):
    """Inventory Manager has full product CRUD."""
    token = _create_user_with_role(
        client, "inv_mgr", "inv_mgr@example.com", "SecurePass1!", "Inventory Manager"
    )

    create_resp = client.post(
        "/api/products",
        json={"name": "Cable", "price": 20, "stock": 7, "category": "Accessories"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_resp.status_code == 201
    product_id = create_resp.get_json()["id"]

    update_resp = client.put(
        f"/api/products/{product_id}",
        json={"stock": 9, "price": 25},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_resp.status_code == 200
    assert update_resp.get_json()["stock"] == 9

    delete_resp = client.delete(
        f"/api/products/{product_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert delete_resp.status_code == 200


def test_super_admin_can_manage_users(client):
    """Only Super Admin can access user management."""
    admin_token = _create_user_with_role(
        client, "admin1", "admin1@example.com", "SecurePass1!", "Super Admin"
    )

    list_resp = client.get(
        "/api/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert list_resp.status_code == 200
    assert "users" in list_resp.get_json()


def test_non_admin_cannot_manage_users(client):
    """Inventory Manager cannot access user management."""
    token = _create_user_with_role(
        client, "inv_mgr2", "inv_mgr2@example.com", "SecurePass1!", "Inventory Manager"
    )

    list_resp = client.get(
        "/api/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_resp.status_code == 403


def test_roles_endpoint(client):
    """Roles listing is available to Super Admin."""
    admin_token = _create_user_with_role(
        client, "admin2", "admin2@example.com", "SecurePass1!", "Super Admin"
    )

    resp = client.get(
        "/api/users/roles",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    roles = resp.get_json()["roles"]
    assert len(roles) == 4
    role_names = [r["name"] for r in roles]
    assert "Super Admin" in role_names
    assert "Store Keeper" in role_names


def test_dashboard_role_based(client):
    """Dashboard returns role info."""
    token = _create_user_with_role(
        client, "keeper2", "keeper2@example.com", "SecurePass1!", "Store Keeper"
    )
    resp = client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["role"] == "Store Keeper"


def test_inventory_report_requires_permission(client):
    """Store Keeper lacks reports:read and is forbidden."""
    token = _create_user_with_role(
        client, "keeper3", "keeper3@example.com", "SecurePass1!", "Store Keeper"
    )
    resp = client.get(
        "/api/reports/inventory",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_inventory_report_returns_aggregates(client):
    """Sales & Purchase Manager can read the inventory report."""
    token = _create_user_with_role(
        client, "sales1", "sales1@example.com", "SecurePass1!", "Sales & Purchase Manager"
    )
    resp = client.get(
        "/api/reports/inventory",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True

    summary = data["summary"]
    # Seeded demo data: Laptop(25), Keyboard(5), Monitor(15) = 3 products, 45 units.
    assert summary["total_products"] == 3
    assert summary["total_stock"] == 45
    # 1200*25 + 50*5 + 300*15 = 34750
    assert summary["inventory_value"] == 34750.0
    # Keyboard qty 5 <= threshold 5
    assert summary["low_stock_count"] == 1
    assert summary["low_stock_threshold"] == 5

    assert isinstance(data["by_category"], list)
    assert len(data["by_category"]) >= 1
    assert {"category", "product_count", "stock", "value"} <= set(data["by_category"][0].keys())


def test_inventory_report_custom_threshold(client):
    token = _create_user_with_role(
        client, "sales2", "sales2@example.com", "SecurePass1!", "Sales & Purchase Manager"
    )
    resp = client.get(
        "/api/reports/inventory?low_stock_threshold=20",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    summary = resp.get_json()["summary"]
    # threshold 20 → Keyboard(5) and Monitor(15) qualify
    assert summary["low_stock_count"] == 2
    assert summary["low_stock_threshold"] == 20


def test_inventory_report_invalid_threshold(client):
    token = _create_user_with_role(
        client, "sales3", "sales3@example.com", "SecurePass1!", "Sales & Purchase Manager"
    )
    resp = client.get(
        "/api/reports/inventory?low_stock_threshold=-1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


def test_inventory_report_csv_export(client):
    token = _create_user_with_role(
        client, "sales4", "sales4@example.com", "SecurePass1!", "Sales & Purchase Manager"
    )
    resp = client.get(
        "/api/reports/inventory/export",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert "text/csv" in resp.content_type
    assert "attachment" in resp.headers.get("Content-Disposition", "")

    body = resp.get_data(as_text=True)
    lines = [line for line in body.splitlines() if line.strip()]
    # Header row + one row per seeded product (3)
    assert lines[0].startswith("Product,Category,Supplier,Stock,Unit Price,Stock Value")
    assert len(lines) == 4


def test_inventory_report_csv_export_forbidden(client):
    token = _create_user_with_role(
        client, "keeper4", "keeper4@example.com", "SecurePass1!", "Store Keeper"
    )
    resp = client.get(
        "/api/reports/inventory/export",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403

