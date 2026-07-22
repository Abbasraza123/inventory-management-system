"""Role-Based Access Control decorators.

Usage in route handlers:

    from rbac import roles_required, permissions_required

    @app.route("/api/users")
    @roles_required("Super Admin")
    def list_users():
        ...

    @app.route("/api/products", methods=["POST"])
    @permissions_required("products:create")
    def create_product():
        ...

Both decorators build on top of ``auth_required`` from ``auth.py`` and
return 401/403 JSON responses when the check fails.
"""

from functools import wraps

from flask import jsonify, request

from auth import auth_required


def _forbidden(message="Forbidden: insufficient permissions"):
    return jsonify({"success": False, "error": message}), 403


def _unauthorized(message="Unauthorized: account is deactivated"):
    return jsonify({"success": False, "error": message}), 401


def roles_required(*role_names):
    """Allow access only if the current user has at least one of *role_names*.

    Example::

        @roles_required("Super Admin")
        def admin_only():
            ...
    """
    allowed = set(role_names)

    def decorator(fn):
        @wraps(fn)
        @auth_required
        def wrapper(*args, **kwargs):
            user = request.current_user

            if not user.is_active:
                return _unauthorized()

            if not user.role or user.role.name not in allowed:
                return _forbidden("Forbidden: you do not have the required role")

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def permissions_required(*permission_names):
    """Allow access only if the current user's role has ALL *permission_names*.

    Example::

        @permissions_required("products:create", "products:update")
        def complex_operation():
            ...
    """
    required = set(permission_names)

    def decorator(fn):
        @wraps(fn)
        @auth_required
        def wrapper(*args, **kwargs):
            user = request.current_user

            if not user.is_active:
                return _unauthorized()

            if not user.role:
                return _forbidden("Forbidden: no role assigned")

            user_permissions = {p.name for p in user.role.permissions}
            if not required.issubset(user_permissions):
                missing = required - user_permissions
                return _forbidden(
                    f"Forbidden: missing permission(s): {', '.join(sorted(missing))}"
                )

            return fn(*args, **kwargs)
        return wrapper
    return decorator
