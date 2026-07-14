from models import db, Product


class Inventory:

    def __init__(self):
        pass

    def add_item(self, item):
        db.session.add(item)
        db.session.commit()

    def remove_item(self, product_id):
        item = db.session.get(Product, product_id)

        if item:
            db.session.delete(item)
            db.session.commit()
            return True

        return False

    def update_item(self, product_id, **changes):
        item = db.session.get(Product, product_id)

        if item:

            for key, value in changes.items():
                setattr(item, key, value)

            db.session.commit()
            return True

        return False

    def list_items(self):
        return Product.query.order_by(Product.name).all()

    def find_by_id(self, product_id):
        return db.session.get(Product, product_id)

    def find_by_name(self, keyword):
        return Product.query.filter(
            Product.name.ilike(f"%{keyword}%")
        ).all()