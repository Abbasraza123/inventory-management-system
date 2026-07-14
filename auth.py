import datetime as dt
import re
from functools import wraps

import jwt
from flask import Blueprint, current_app, has_app_context, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from config import Config
from models import User, db


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]+$")
PASSWORD_UPPER = re.compile(r"[A-Z]")
PASSWORD_LOWER = re.compile(r"[a-z]")
PASSWORD_DIGIT = re.compile(r"[0-9]")
PASSWORD_SPECIAL = re.compile(r"[^a-zA-Z0-9]")




def _success(payload: dict, status: int = 200):
    return jsonify({"success": True, **payload}), status


def _error(message: str, status: int, details: dict | None = None):
    body: dict = {"success": False, "error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


def _get_auth_config():
    if has_app_context():
        return current_app.config
    return {
        "SECRET_KEY": Config.SECRET_KEY,
        "JWT_ALGORITHM": Config.JWT_ALGORITHM,
        "JWT_EXPIRATION_HOURS": Config.JWT_EXPIRATION_HOURS,
    }




def generate_token(user_id: int) -> str:
    config = _get_auth_config()
    now = dt.datetime.now(dt.timezone.utc)
    expiration = now + dt.timedelta(hours=int(config["JWT_EXPIRATION_HOURS"]))
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(expiration.timestamp()),
    }
    return jwt.encode(payload, config["SECRET_KEY"], algorithm=config["JWT_ALGORITHM"])


def decode_token(token: str) -> dict | None:
    try:
        config = _get_auth_config()
        return jwt.decode(
            token,
            config["SECRET_KEY"],
            algorithms=[config["JWT_ALGORITHM"]],
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None




def _extract_current_user():
    header = request.headers.get("Authorization", "")

    if not header:
        return None, _error("Missing Authorization header", 401)

    token_str = header[7:].strip() if header.startswith("Bearer ") else ""
    if not token_str:
        return None, _error("Invalid Bearer token format", 401)

    payload = decode_token(token_str)
    if payload is None:
        return None, _error("Invalid or expired token", 401)

    user_id = payload.get("sub")
    if not user_id:
        return None, _error("Invalid token payload", 401)

    user = db.session.get(User, user_id)
    if not user:
        return None, _error("User no longer exists", 401)

    return user, None


def auth_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        user, err = _extract_current_user()
        if err:
            return err
        request.current_user = user
        return func(*args, **kwargs)
    return decorated




def _validate_registration(payload: dict) -> dict:
    errors: dict[str, str] = {}


    username = (payload.get("username") or "").strip()
    if not username:
        errors["username"] = "Username is required"
    elif len(username) < Config.USERNAME_MIN_LENGTH:
        errors["username"] = (
            f"Username must be at least {Config.USERNAME_MIN_LENGTH} characters"
        )
    elif len(username) > Config.USERNAME_MAX_LENGTH:
        errors["username"] = (
            f"Username must be at most {Config.USERNAME_MAX_LENGTH} characters"
        )
    elif not USERNAME_PATTERN.match(username):
        errors["username"] = (
            "Username can only contain letters, numbers, and underscores"
        )


    email = (payload.get("email") or "").strip().lower()
    if not email:
        errors["email"] = "Email is required"
    elif len(email) > Config.EMAIL_MAX_LENGTH:
        errors["email"] = (
            f"Email must be at most {Config.EMAIL_MAX_LENGTH} characters"
        )
    elif not EMAIL_PATTERN.match(email):
        errors["email"] = "Invalid email format"


    password = payload.get("password") or ""
    if not password:
        errors["password"] = "Password is required"
    elif len(password) < Config.PASSWORD_MIN_LENGTH:
        errors["password"] = (
            f"Password must be at least {Config.PASSWORD_MIN_LENGTH} characters"
        )
    else:
        missing: list[str] = []
        if not PASSWORD_UPPER.search(password):
            missing.append("one uppercase letter")
        if not PASSWORD_LOWER.search(password):
            missing.append("one lowercase letter")
        if not PASSWORD_DIGIT.search(password):
            missing.append("one number")
        if not PASSWORD_SPECIAL.search(password):
            missing.append("one special character")
        if missing:
            errors["password"] = (
                "Password must contain at least " + ", ".join(missing)
            )

    return errors


def _validate_login(payload: dict) -> dict:
    errors: dict[str, str] = {}

    email = (payload.get("email") or "").strip()
    if not email:
        errors["email"] = "Email is required"

    password = payload.get("password") or ""
    if not password:
        errors["password"] = "Password is required"

    return errors




def create_auth_blueprint() -> Blueprint:
    auth_bp = Blueprint("auth", __name__)

    
    @auth_bp.route("/register", methods=["POST"])
    def register():
        try:
            payload = request.get_json(silent=True)
            if payload is None:
                return _error("Request body must be valid JSON", 400)

            errors = _validate_registration(payload)
            if errors:
                return _error("Validation failed", 400, details=errors)

            username = payload["username"].strip()
            email = payload["email"].strip().lower()
            password = payload["password"]

            
            if User.query.filter_by(username=username).first():
                return _error(
                    "Validation failed", 409,
                    details={"username": "Username already exists"},
                )
            if User.query.filter_by(email=email).first():
                return _error(
                    "Validation failed", 409,
                    details={"email": "Email already exists"},
                )

            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
            )
            db.session.add(user)
            db.session.commit()

            token = generate_token(user.id)
            return _success(
                {
                    "message": "Registration successful",
                    "token": token,
                    "user": user.to_dict(),
                },
                status=201,
            )

        except Exception:
            db.session.rollback()
            return _error("An unexpected error occurred", 500)


    @auth_bp.route("/login", methods=["POST"])
    def login():
        try:
            payload = request.get_json(silent=True)
            if payload is None:
                return _error("Request body must be valid JSON", 400)

            errors = _validate_login(payload)
            if errors:
                return _error("Validation failed", 400, details=errors)

            email = payload["email"].strip().lower()
            password = payload["password"]

            user = User.query.filter_by(email=email).first()
            if not user or not check_password_hash(user.password_hash, password):
                return _error("Invalid credentials", 401)

            token = generate_token(user.id)
            return _success(
                {
                    "message": "Login successful",
                    "token": token,
                    "user": user.to_dict(),
                },
            )

        except Exception:
            return _error("An unexpected error occurred", 500)

    
    @auth_bp.route("/me", methods=["GET"])
    @auth_required
    def me():
        return _success({"user": request.current_user.to_dict()})

    
    @auth_bp.route("/logout", methods=["POST"])
    def logout():
        return _success({"message": "Logged out successfully"})

    return auth_bp
