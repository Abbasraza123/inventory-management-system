"""Seed roles, permissions, and the initial Super Admin user.

Run once during deployment:
    python -c "from app import app; from seed_rbac import seed_rbac; seed_rbac(app)"

For a fresh database the Super Admin credentials are read from environment
variables (ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD).  When those are not
set the script falls back to safe development defaults.
"""

import os

from werkzeug.security import generate_password_hash

from models import Role, Permission, User, db

PERMISSIONS = [
    ("products:create",       "products",   "create",   "Create products"),
    ("products:read",         "products",   "read",     "View products"),
    ("products:update",       "products",   "update",   "Edit products"),
    ("products:delete",       "products",   "delete",   "Delete products"),
    ("categories:create",     "categories", "create",   "Create categories"),
    ("categories:read",       "categories", "read",     "View categories"),
    ("categories:update",     "categories", "update",   "Edit categories"),
    ("categories:delete",     "categories", "delete",   "Delete categories"),
    ("suppliers:create",      "suppliers",  "create",   "Create suppliers"),
    ("suppliers:read",        "suppliers",  "read",     "View suppliers"),
    ("suppliers:update",      "suppliers",  "update",   "Edit suppliers"),
    ("suppliers:delete",      "suppliers",  "delete",   "Delete suppliers"),
    ("users:create",          "users",      "create",   "Create users"),
    ("users:read",            "users",      "read",     "View users"),
    ("users:update",          "users",      "update",   "Edit users"),
    ("users:delete",          "users",      "delete",   "Delete users"),
    ("users:activate",        "users",      "activate", "Activate/deactivate users"),
    ("roles:read",            "roles",      "read",     "View roles"),
    ("roles:assign",          "roles",      "assign",   "Assign roles to users"),
    ("inventory:stock_in",    "inventory",  "stock_in",      "Receive stock"),
    ("inventory:stock_out",   "inventory",  "stock_out",     "Issue stock"),
    ("inventory:adjust",      "inventory",  "adjust",        "Adjust stock levels"),
    ("inventory:read_history","inventory",  "read_history",  "View stock movement history"),
    ("inventory:mark_damaged","inventory",  "mark_damaged",  "Mark products as damaged"),
    ("dashboard:read",        "dashboard",  "read",     "View dashboard"),
    ("reports:read",          "reports",    "read",     "View reports"),
    ("reports:sales",         "reports",    "sales",    "View sales reports"),
    ("reports:purchases",     "reports",    "purchases","View purchase reports"),
    ("reports:profit",        "reports",    "profit",   "View profit reports"),
    ("settings:read",         "settings",   "read",     "View system settings"),
    ("settings:update",       "settings",   "update",   "Update system settings"),
    ("audit_logs:read",       "audit_logs", "read",     "View audit logs"),
]

SUPER_ADMIN_PERMISSIONS = [p[0] for p in PERMISSIONS]

INVENTORY_MANAGER_PERMISSIONS = [
    "products:create", "products:read", "products:update", "products:delete",
    "categories:create", "categories:read", "categories:update",
    "suppliers:create", "suppliers:read", "suppliers:update",
    "inventory:stock_in", "inventory:stock_out", "inventory:adjust",
    "inventory:read_history", "inventory:mark_damaged",
    "dashboard:read",
]

SALES_PURCHASE_MANAGER_PERMISSIONS = [
    "products:read",
    "categories:read",
    "suppliers:read",
    "dashboard:read",
    "reports:read", "reports:sales", "reports:purchases", "reports:profit",
]

STORE_KEEPER_PERMISSIONS = [
    "products:read",
    "categories:read",
    "suppliers:read",
    "inventory:stock_in", "inventory:stock_out", "inventory:adjust",
    "inventory:read_history", "inventory:mark_damaged",
    "dashboard:read",
]

ROLES = [
    ("Super Admin",               "Full system access",                     SUPER_ADMIN_PERMISSIONS),
    ("Inventory Manager",         "Inventory management access",            INVENTORY_MANAGER_PERMISSIONS),
    ("Sales & Purchase Manager",  "Sales and purchase operations",         SALES_PURCHASE_MANAGER_PERMISSIONS),
    ("Store Keeper",              "Daily warehouse operations",             STORE_KEEPER_PERMISSIONS),
]


def seed_rbac(app=None):
    """Create roles, permissions, and the initial Super Admin.

    Safe to call multiple times — skips existing data.
    """
    if app is not None:
        with app.app_context():
            _do_seed()
    else:
        _do_seed()


def _do_seed():
    existing = {p.name for p in Permission.query.all()}
    for name, resource, action, description in PERMISSIONS:
        if name not in existing:
            db.session.add(Permission(
                name=name, resource=resource, action=action, description=description,
            ))
    db.session.flush()

    perm_map = {p.name: p for p in Permission.query.all()}

    existing_roles = {r.name for r in Role.query.all()}
    for name, description, _ in ROLES:
        if name not in existing_roles:
            db.session.add(Role(name=name, description=description))
    db.session.flush()

    role_map = {r.name: r for r in Role.query.all()}

    for name, _, perm_names in ROLES:
        role = role_map[name]
        role.permissions = [perm_map[pn] for pn in perm_names if pn in perm_map]

    db.session.flush()

    default_role = role_map.get("Store Keeper")
    if default_role:
        for user in User.query.filter(User.role_id.is_(None)).all():
            user.role_id = default_role.id
        db.session.flush()

    super_admin_role = role_map.get("Super Admin")
    if super_admin_role and not User.query.filter_by(role_id=super_admin_role.id).first():
        username = os.getenv("ADMIN_USERNAME", "admin")
        email = os.getenv("ADMIN_EMAIL", "admin@ims.local")
        password = os.getenv("ADMIN_PASSWORD", "Admin@12345")

        if not User.query.filter_by(username=username).first() and \
           not User.query.filter_by(email=email).first():
            admin = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
                role_id=super_admin_role.id,
                is_active=True,
            )
            db.session.add(admin)
            print(f"[seed_rbac] Created Super Admin: {username} ({email})")

    db.session.commit()
    print("[seed_rbac] RBAC seeding complete.")
