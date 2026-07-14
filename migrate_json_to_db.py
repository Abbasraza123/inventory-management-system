import json
import os

from app import app
from models import db, Product


with app.app_context():

    if not os.path.exists("inventory.json"):
        print("inventory.json not found.")
        exit()

    with open("inventory.json", "r") as file:
        data = json.load(file)

    migrated = 0

    for item_data in data:

        existing_item = Product.query.filter_by(
            name=item_data["name"]
        ).first()

        if existing_item:
            continue

        new_item = Product(
            name=item_data["name"],
            quantity=item_data.get("quantity", 0),
            price=item_data.get("price", 0.0),
        )

        db.session.add(new_item)
        migrated += 1

    db.session.commit()

    print(f"{migrated} items migrated successfully.")