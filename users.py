"""User management endpoints — Super Admin only.

Endpoints:
    GET    /api/users            List users (paginated)
    POST   /api/users            Create a new user with a specific role
    GET    /api/users/<id>       Get single user details
    PUT    /api/users/<id>       Edit user (username, email, role, is_active)
    DELETE /api/users/<id>       Delete a user
    PATCH  /api/users/<id>/toggle-active  Activate/deactivate a user
    GET    /api/roles            List all roles with permissions
"""

import logging
import re

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from models import Role, User, db
from rbac import roles_required

logger = logging.getLogger(__name__)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]+$")


def _success(payload, status=200):
    return jsonify({"success": True, **payload}), status


def _error(message, status=400, details=None):
    body = {"success": False, "error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


def _validate_user_payload(payload, is_create=True):
    """Validate user creation/edit payload."""
    errors = {}

    username = (payload.get("username") or "").strip()
    if is_create or "username" in payload:
        if not username:
            errors["username"] = "Username is required"
        elif len(username) < 3:
            errors["username"] = "Username must be at least 3 characters"
        elif len(username) > 80:
            errors["username"] = "Username must be at most 80 characters"
        elif not USERNAME_PATTERN.match(username):
            errors["username"] = "Username can only contain letters, numbers, and underscores"

    email = (payload.get("email") or "").strip().lower()
    if is_create or "email" in payload:
        if not email:
            errors["email"] = "Email is required"
        elif len(email) > 160:
            errors["email"] = "Email must be at most 160 characters"
        elif not EMAIL_PATTERN.match(email):
            errors["email"] = "Invalid email format"

    if is_create:
        password = payload.get("password") or ""
        if not password:
            errors["password"] = "Password is required"
        elif len(password) < 8:
            errors["password"] = "Password must be at least 8 characters"

    if "role_id" in payload or is_create:
        role_id = payload.get("role_id")
        if not role_id:
            errors["role_id"] = "Role is required"
        else:
            try:
                role_id = int(role_id)
            except (TypeError, ValueError):
                errors["role_id"] = "Invalid role"
            else:
                if not db.session.get(Role, role_id):
                    errors["role_id"] = "Invalid role"

    return errors


def create_users_blueprint():
    users_bp = Blueprint("users", __name__)

    @users_bp.route("", methods=["GET"])
    @roles_required("Super Admin")
    def list_users():
        try:
            page = int(request.args.get("page", 1))
            limit = int(request.args.get("limit", 20))
        except (TypeError, ValueError):
            page, limit = 1, 20

        page = max(1, page)
        limit = max(1, min(100, limit))

        query = User.query.order_by(User.id.desc())
        paginated = query.paginate(page=page, per_page=limit, error_out=False)

        return _success({
            "users": [u.to_dict() for u in paginated.items],
            "pagination": {
                "page": page,
                "per_page": limit,
                "total_items": paginated.total,
                "total_pages": paginated.pages,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev,
            },
        })

    @users_bp.route("", methods=["POST"])
    @roles_required("Super Admin")
    def create_user():
        payload = request.get_json(silent=True) or {}
        errors = _validate_user_payload(payload, is_create=True)
        if errors:
            return _error("Validation failed", 400, details=errors)

        username = payload["username"].strip()
        email = payload["email"].strip().lower()
        password = payload["password"]
        role_id = payload["role_id"]

        if User.query.filter_by(username=username).first():
            return _error("Validation failed", 409, details={"username": "Username already exists"})
        if User.query.filter_by(email=email).first():
            return _error("Validation failed", 409, details={"email": "Email already exists"})

        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            role_id=role_id,
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

        logger.info("Admin created user: %s (role_id=%s)", username, role_id)
        return _success({"message": "User created successfully", "user": user.to_dict()}, status=201)

    @users_bp.route("/<int:user_id>", methods=["GET"])
    @roles_required("Super Admin")
    def get_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return _error("User not found", 404)
        return _success({"user": user.to_dict()})

    @users_bp.route("/<int:user_id>", methods=["PUT"])
    @roles_required("Super Admin")
    def update_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return _error("User not found", 404)

        payload = request.get_json(silent=True) or {}
        errors = _validate_user_payload(payload, is_create=False)
        if errors:
            return _error("Validation failed", 400, details=errors)

        if "username" in payload:
            new_username = payload["username"].strip()
            existing = User.query.filter(User.username == new_username, User.id != user_id).first()
            if existing:
                return _error("Validation failed", 409, details={"username": "Username already exists"})
            user.username = new_username

        if "email" in payload:
            new_email = payload["email"].strip().lower()
            existing = User.query.filter(User.email == new_email, User.id != user_id).first()
            if existing:
                return _error("Validation failed", 409, details={"email": "Email already exists"})
            user.email = new_email

        if "role_id" in payload:
            user.role_id = payload["role_id"]

        if "is_active" in payload:
            user.is_active = bool(payload["is_active"])

        if "password" in payload and payload["password"]:
            user.password_hash = generate_password_hash(payload["password"])

        db.session.commit()
        logger.info("Admin updated user: %s (id=%s)", user.username, user_id)
        return _success({"message": "User updated successfully", "user": user.to_dict()})

    @users_bp.route("/<int:user_id>", methods=["DELETE"])
    @roles_required("Super Admin")
    def delete_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return _error("User not found", 404)

        if user.id == request.current_user.id:
            return _error("Cannot delete your own account", 400)

        if user.role and user.role.name == "Super Admin":
            admin_count = User.query.filter(
                User.role_id == user.role_id,
                User.is_active == True,
            ).count()
            if admin_count <= 1:
                return _error("Cannot delete the last Super Admin", 400)

        username = user.username
        db.session.delete(user)
        db.session.commit()
        logger.info("Admin deleted user: %s (id=%s)", username, user_id)
        return _success({"message": "User deleted successfully"})

    @users_bp.route("/<int:user_id>/toggle-active", methods=["PATCH"])
    @roles_required("Super Admin")
    def toggle_active(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return _error("User not found", 404)

        if user.id == request.current_user.id:
            return _error("Cannot deactivate your own account", 400)

        if user.role and user.role.name == "Super Admin" and user.is_active:
            active_admin_count = User.query.filter(
                User.role_id == user.role_id,
                User.is_active == True,
                User.id != user_id,
            ).count()
            if active_admin_count < 1:
                return _error("Cannot deactivate the last active Super Admin", 400)

        user.is_active = not user.is_active
        db.session.commit()

        status_text = "activated" if user.is_active else "deactivated"
        logger.info("Admin %s user: %s (id=%s)", status_text, user.username, user_id)
        return _success({
            "message": f"User {status_text} successfully",
            "user": user.to_dict(),
        })

    @users_bp.route("/roles", methods=["GET"])
    @roles_required("Super Admin")
    def list_roles():
        roles = Role.query.order_by(Role.id).all()
        return _success({"roles": [r.to_dict() for r in roles]})

    return users_bp
