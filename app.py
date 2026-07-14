from flask import Flask, abort, jsonify, request
from flask_cors import CORS

from auth import auth_required, create_auth_blueprint
from config import Config
from models import Category, Product, Supplier, User, db

# ── Validate critical config before creating the app ──────────────────
Config.validate()

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
app.register_blueprint(create_auth_blueprint(), url_prefix="/api/auth")


# ── Global JSON error handlers ───────────────────────────────────────

@app.errorhandler(400)
def bad_request(e):
    return jsonify({"success": False, "error": str(e.description) if hasattr(e, "description") else "Bad request"}), 400


@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Resource not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"success": False, "error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"success": False, "error": "An unexpected error occurred"}), 500


# ── DB initialisation ────────────────────────────────────────────────

@app.before_request
def _ensure_db_tables():
    if not app.config.get("_db_ready", False):
        with app.app_context():
            db.create_all()
            seed_demo_data()
            app.config["_db_ready"] = True


def seed_demo_data():
    if Category.query.first() is None:
        categories = [
            Category(name="Electronics"),
            Category(name="Accessories"),
            Category(name="Furniture"),
        ]
        db.session.add_all(categories)
        db.session.commit()

    if Supplier.query.first() is None:
        suppliers = [
            Supplier(name="Tech Solutions Ltd", contact="0300-1234567", email="tech@gmail.com", address="Lahore"),
            Supplier(name="ABC Electronics", contact="0312-9876543", email="abc@gmail.com", address="Karachi"),
            Supplier(name="Global Traders", contact="0333-5556677", email="global@gmail.com", address="Islamabad"),
        ]
        db.session.add_all(suppliers)
        db.session.commit()

    if Product.query.first() is None:
        electronics = Category.query.filter_by(name="Electronics").first()
        accessories = Category.query.filter_by(name="Accessories").first()
        tech_supplier = Supplier.query.filter_by(name="Tech Solutions Ltd").first()
        abc_supplier = Supplier.query.filter_by(name="ABC Electronics").first()

        products = [
            Product(name="Laptop", price=1200.0, quantity=25, category_id=electronics.id, supplier_id=tech_supplier.id),
            Product(name="Keyboard", price=50.0, quantity=5, category_id=accessories.id, supplier_id=abc_supplier.id),
            Product(name="Monitor", price=300.0, quantity=15, category_id=electronics.id, supplier_id=tech_supplier.id),
        ]
        db.session.add_all(products)
        db.session.commit()


# ── Public routes ─────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# ── Protected routes ──────────────────────────────────────────────────

@app.route("/api/dashboard")
@auth_required
def dashboard_summary():
    products = Product.query.all()
    categories = Category.query.all()
    suppliers = Supplier.query.all()

    total_products = len(products)
    inventory_value = sum(product.price * product.quantity for product in products)
    low_stock_items = sum(1 for product in products if product.quantity <= 5)

    return jsonify(
        {
            "total_products": total_products,
            "inventory_value": round(inventory_value, 2),
            "low_stock_items": low_stock_items,
            "total_categories": len(categories),
            "total_suppliers": len(suppliers),
        }
    )


@app.route("/api/products", methods=["GET"]) 
@auth_required
def list_products():
    products = Product.query.order_by(Product.id.desc()).all()
    return jsonify([product.to_dict() for product in products])


@app.route("/api/products", methods=["POST"]) 
@auth_required
def create_product():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "error": "Name is required"}), 400

    price = float(payload.get("price") or 0)
    quantity = int(payload.get("stock") or payload.get("quantity") or 0)

    category = None
    if payload.get("category"):
        category_name = str(payload.get("category")).strip()
        category = Category.query.filter_by(name=category_name).first() or Category(name=category_name)

    supplier = None
    if payload.get("supplier"):
        supplier_name = str(payload.get("supplier")).strip()
        supplier = Supplier.query.filter_by(name=supplier_name).first() or Supplier(name=supplier_name)

    product = Product(
        name=name,
        price=price,
        quantity=quantity,
        category=category,
        supplier=supplier,
    )
    db.session.add(product)
    db.session.commit()

    return jsonify(product.to_dict()), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"]) 
@auth_required
def update_product(product_id):
    product = db.session.get(Product, product_id) or abort(404)
    payload = request.get_json(silent=True) or {}

    if "name" in payload:
        product.name = str(payload["name"]).strip()
    if "price" in payload:
        product.price = float(payload["price"])
    if "stock" in payload or "quantity" in payload:
        product.quantity = int(payload.get("stock") or payload.get("quantity") or 0)

    if "category" in payload:
        category_name = str(payload["category"]).strip()
        product.category = (
            Category.query.filter_by(name=category_name).first() or Category(name=category_name)
            if category_name else None
        )

    if "supplier" in payload:
        supplier_name = str(payload["supplier"]).strip()
        product.supplier = (
            Supplier.query.filter_by(name=supplier_name).first() or Supplier(name=supplier_name)
            if supplier_name else None
        )

    db.session.commit()
    return jsonify(product.to_dict())


@app.route("/api/products/<int:product_id>", methods=["DELETE"]) 
@auth_required
def delete_product(product_id):
    product = db.session.get(Product, product_id) or abort(404)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"deleted": True})


@app.route("/api/categories", methods=["GET"]) 
@auth_required
def list_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify([category.to_dict() for category in categories])


@app.route("/api/suppliers", methods=["GET"]) 
@auth_required
def list_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name).all()
    return jsonify([supplier.to_dict() for supplier in suppliers])


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)