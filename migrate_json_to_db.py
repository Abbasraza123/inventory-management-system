import json
from pathlib import Path

from app import app
from models import Category, Product, Supplier, db


DATA_FILE = Path(__file__).with_name("inventory.json")


def find_or_create(model, name):
    name = str(name or "").strip()
    if not name:
        return None

    record = model.query.filter_by(name=name).first()
    if record is None:
        record = model(name=name)
        db.session.add(record)
        db.session.flush()
    return record


def migrate(file_path=DATA_FILE):
    if not file_path.exists():
        raise FileNotFoundError(f"Data file not found: {file_path}")

    with file_path.open(encoding="utf-8") as file:
        items = json.load(file)

    migrated = 0
    skipped = 0

    for item in items:
        name = str(item.get("name", "")).strip()
        if not name or Product.query.filter_by(name=name).first():
            skipped += 1
            continue

        product = Product(
            name=name,
            quantity=max(0, int(item.get("quantity", 0))),
            price=max(0, float(item.get("price", 0))),
            category=find_or_create(Category, item.get("category")),
            supplier=find_or_create(Supplier, item.get("supplier")),
        )
        db.session.add(product)
        migrated += 1

    db.session.commit()
    return migrated, skipped


if __name__ == "__main__":
    with app.app_context():
        try:
            migrated, skipped = migrate()
            print(f"Migration complete: {migrated} added, {skipped} skipped.")
        except (FileNotFoundError, json.JSONDecodeError, TypeError, ValueError) as error:
            db.session.rollback()
            raise SystemExit(f"Migration failed: {error}") from error
