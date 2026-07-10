import secrets

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

from models import Category, Product, Supplier, User, db

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///inventory.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "inventory-secret-key"

CORS(app)
db.init_app(app)


@app.before_request
def _ensure_db_tables():
    if not app.config.get("_db_ready", False):
        with app.app_context():
            db.create_all()
            seed_demo_data()
            app.config["_db_ready"] = True


def seed_demo_data():
    if User.query.first() is None:
        admin = User(
            username="admin",
            password_hash=generate_password_hash("admin123"),
            token=secrets.token_urlsafe(24),
        )
        db.session.add(admin)
        db.session.commit()

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


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/dashboard")
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


@app.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    user.token = secrets.token_urlsafe(24)
    db.session.commit()

    return jsonify({"token": user.token, "user": user.to_dict()})


@app.route("/api/auth/me")
def auth_me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "", 1).strip()
    if not token:
        return jsonify({"error": "Authentication required"}), 401

    user = User.query.filter_by(token=token).first()
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    return jsonify(user.to_dict())


@app.route("/api/products", methods=["GET"]) 
def list_products():
    products = Product.query.order_by(Product.id.desc()).all()
    return jsonify([product.to_dict() for product in products])


@app.route("/api/products", methods=["POST"]) 
def create_product():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    price = float(payload.get("price") or 0)
    quantity = int(payload.get("stock") or payload.get("quantity") or 0)

    category = None
    if payload.get("category"):
        category_name = str(payload.get("category")).strip()
        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.commit()

    supplier = None
    if payload.get("supplier"):
        supplier_name = str(payload.get("supplier")).strip()
        supplier = Supplier.query.filter_by(name=supplier_name).first()
        if not supplier:
            supplier = Supplier(name=supplier_name)
            db.session.add(supplier)
            db.session.commit()

    product = Product(
        name=name,
        price=price,
        quantity=quantity,
        category_id=category.id if category else None,
        supplier_id=supplier.id if supplier else None,
    )
    db.session.add(product)
    db.session.commit()

    return jsonify(product.to_dict()), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"]) 
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    payload = request.get_json(silent=True) or {}

    if "name" in payload:
        product.name = str(payload["name"]).strip()
    if "price" in payload:
        product.price = float(payload["price"])
    if "stock" in payload or "quantity" in payload:
        product.quantity = int(payload.get("stock") or payload.get("quantity") or 0)

    if "category" in payload:
        category_name = str(payload["category"]).strip()
        if category_name:
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                category = Category(name=category_name)
                db.session.add(category)
                db.session.commit()
            product.category_id = category.id
        else:
            product.category_id = None

    if "supplier" in payload:
        supplier_name = str(payload["supplier"]).strip()
        if supplier_name:
            supplier = Supplier.query.filter_by(name=supplier_name).first()
            if not supplier:
                supplier = Supplier(name=supplier_name)
                db.session.add(supplier)
                db.session.commit()
            product.supplier_id = supplier.id
        else:
            product.supplier_id = None

    db.session.commit()
    return jsonify(product.to_dict())


@app.route("/api/products/<int:product_id>", methods=["DELETE"]) 
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"deleted": True})


@app.route("/api/categories", methods=["GET"]) 
def list_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify([category.to_dict() for category in categories])


@app.route("/api/suppliers", methods=["GET"]) 
def list_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name).all()
    return jsonify([supplier.to_dict() for supplier in suppliers])


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)