"""Migrate an existing database to the RBAC schema.

Handles:
  1. Creating new tables (role, permission, role_permissions, stock_movement)
  2. Adding role_id and is_active columns to the user table (SQLite)
  3. Running the RBAC seed (roles, permissions, default Super Admin)

Usage:
    python migrate_rbac.py

Safe to run multiple times — skips already-applied changes.
"""

import sys
import os

from sqlalchemy import inspect, text

sys.path.insert(0, os.path.dirname(__file__))

from app import app
from models import db
from seed_rbac import seed_rbac


def _table_exists(inspector, table_name):
    return table_name in inspector.get_table_names()


def _column_exists(inspector, table_name, column_name):
    columns = [col["name"] for col in inspector.get_columns(table_name)]
    return column_name in columns


def migrate():
    with app.app_context():
        inspector = inspect(db.engine)

        print("[migrate] Creating new tables if missing ...")
        db.create_all()

        if _table_exists(inspector, "user"):
            if not _column_exists(inspector, "user", "role_id"):
                print("[migrate] Adding role_id column to user table ...")
                db.session.execute(text(
                    "ALTER TABLE user ADD COLUMN role_id INTEGER REFERENCES role(id)"
                ))
                db.session.commit()

            if not _column_exists(inspector, "user", "is_active"):
                print("[migrate] Adding is_active column to user table ...")
                db.session.execute(text(
                    "ALTER TABLE user ADD COLUMN is_active BOOLEAN DEFAULT 1"
                ))
                db.session.commit()
        else:
            print("[migrate] No existing user table found — fresh database.")

        print("[migrate] Seeding roles and permissions ...")
        seed_rbac()

        from models import User, Role
        default_role = Role.query.filter_by(name="Store Keeper").first()
        if default_role:
            users_without_role = User.query.filter(
                (User.role_id.is_(None)) | (User.role_id == 0)
            ).all()
            if users_without_role:
                print(f"[migrate] Assigning default role to {len(users_without_role)} users ...")
                for user in users_without_role:
                    user.role_id = default_role.id
                db.session.commit()

        print("[migrate] Migration complete.")


if __name__ == "__main__":
    try:
        migrate()
    except Exception as exc:
        db.session.rollback()
        print(f"[migrate] FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
