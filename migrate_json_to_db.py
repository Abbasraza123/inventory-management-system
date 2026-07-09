import json
import os

from app import app
from models import db, Item


with app.app_context():

    if not os.path.exists("inventory.json"):
        print("inventory.json not found.")
        exit()

    with open("inventory.json", "r") as file:
        data = json.load(file)

    migrated = 0

    for item_data in data:

        existing_item = Item.query.filter_by(
            sku=item_data["sku"]
        ).first()

        if existing_item:
            continue

        new_item = Item(
            name=item_data["name"],
            quantity=item_data["quantity"],
            price=item_data["price"],
            sku=item_data["sku"]
        )

        db.session.add(new_item)
        migrated += 1

    db.session.commit()

    print(f"{migrated} items migrated successfully.")