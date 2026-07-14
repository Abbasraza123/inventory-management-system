import os
import sys
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///inventory.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

    # ── Validation constants ──────────────────────────────────────────
    USERNAME_MIN_LENGTH = 3
    USERNAME_MAX_LENGTH = 30
    PASSWORD_MIN_LENGTH = 8
    EMAIL_MAX_LENGTH = 160

    @classmethod
    def validate(cls):
        """Abort early if critical configuration is missing."""
        if not cls.SECRET_KEY:
            print("FATAL: SECRET_KEY is not set. Refusing to start.", file=sys.stderr)
            sys.exit(1)
