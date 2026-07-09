import json
import os

from models import Item


class Inventory:
    def __init__(self, filepath):
        self.filepath = filepath
        self.items = []
        self.load()

    def load(self):
        if not os.path.exists(self.filepath):
            return

        try:
            with open(self.filepath, "r") as file:
                data = json.load(file)

            self.items = [Item.from_dict(item) for item in data]

        except json.JSONDecodeError:
            print("Error: inventory.json is corrupt.")
            self.items = []

    def save(self):
        with open(self.filepath, "w") as file:
            json.dump(
                [item.to_dict() for item in self.items],
                file,
                indent=4
            )

    def add_item(self, item):
        self.items.append(item)
        self.save()

    def find_by_sku(self, sku):
        for item in self.items:
            if item.sku == sku:
                return item
        return None
    
    def find_by_name(self, name):
    results = []

    for item in self.items:
        if name.lower() in item.name.lower():
            results.append(item)

    return results

    def remove_item(self, sku):
        item = self.find_by_sku(sku)

        if item is None:
            return False

        self.items.remove(item)
        self.save()
        return True

    def update_item(self, sku, quantity=None, price=None):
        item = self.find_by_sku(sku)

        if item is None:
            return False

        if quantity is not None:
            if quantity < 0:
                raise ValueError("Quantity cannot be negative.")
            item.quantity = quantity

        if price is not None:
            if price < 0:
                raise ValueError("Price cannot be negative.")
            item.price = price

        self.save()
        return True

    def list_items(self):
        return sorted(self.items, key=lambda item: item.name.lower())