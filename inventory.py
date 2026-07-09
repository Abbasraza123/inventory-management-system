from models import db, Item


class Inventory:

    def __init__(self):
        pass

    def add_item(self, item):
        db.session.add(item)
        db.session.commit()

    def remove_item(self, sku):
        item = Item.query.filter_by(sku=sku).first()

        if item:
            db.session.delete(item)
            db.session.commit()
            return True

        return False

    def update_item(self, sku, **changes):
        item = Item.query.filter_by(sku=sku).first()

        if item:

            for key, value in changes.items():
                setattr(item, key, value)

            db.session.commit()
            return True

        return False

    def list_items(self):
        return Item.query.order_by(Item.name).all()

    def find_by_sku(self, sku):
        return Item.query.filter_by(sku=sku).first()

    def find_by_name(self, keyword):
        return Item.query.filter(
            Item.name.ilike(f"%{keyword}%")
        ).all()