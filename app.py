import logging
import os
import sys

from flask import Flask, abort, jsonify, request
from flask_cors import CORS

from auth import auth_required, create_auth_blueprint
from config import Config
from inventory_routes import create_inventory_blueprint
from models import Category, Product, Role, StockMovement, Supplier, User, db
from rbac import permissions_required, roles_required
from reports_routes import create_reports_blueprint
from seed_rbac import seed_rbac
from users import create_users_blueprint

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

Config.validate()

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)

app.register_blueprint(create_auth_blueprint(), url_prefix="/api/auth")
app.register_blueprint(create_users_blueprint(), url_prefix="/api/users")
app.register_blueprint(create_inventory_blueprint(), url_prefix="/api/inventory")
app.register_blueprint(create_reports_blueprint(), url_prefix="/api/reports")


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


def error(message, status=400):
    """Return errors in one consistent API format."""
    return jsonify({"success": False, "error": message}), status


def parse_number(value, field, number_type):
    try:
        return number_type(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be {'an integer' if number_type is int else 'a number'}")


def find_or_create(model, value):
    """Find a category/supplier by name, creating it when needed."""
    name = str(value or "").strip()
    if not name:
        return None

    instance = model.query.filter_by(name=name).first()
    if instance is None:
        instance = model(name=name)
        db.session.add(instance)
        db.session.flush()
    return instance


def resolve_relation(model, payload, field):
    """Resolve either `<field>_id` or a plain name from a request."""
    id_field = f"{field}_id"
    if id_field in payload:
        relation_id = payload[id_field]
        if relation_id is None:
            return None
        try:
            relation_id = int(relation_id)
        except (TypeError, ValueError):
            raise ValueError(f"Selected {field} does not exist")
        instance = db.session.get(model, relation_id)
        if instance is None:
            raise ValueError(f"Selected {field} does not exist")
        return instance

    return find_or_create(model, payload.get(field))


def seed_demo_data():
    try:
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

            if electronics and accessories and tech_supplier and abc_supplier:
                products = [
                    Product(name="Laptop", price=1200.0, quantity=25, category_id=electronics.id, supplier_id=tech_supplier.id),
                    Product(name="Keyboard", price=50.0, quantity=5, category_id=accessories.id, supplier_id=abc_supplier.id),
                    Product(name="Monitor", price=300.0, quantity=15, category_id=electronics.id, supplier_id=tech_supplier.id),
                ]
                db.session.add_all(products)
                db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to seed demo data")


with app.app_context():
    db.create_all()
    if Role.query.count() == 0:
        seed_rbac()
    if Category.query.count() == 0 and Product.query.count() == 0 and Supplier.query.count() == 0:
        seed_demo_data()


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/dashboard")
@permissions_required("dashboard:read")
def dashboard_summary():
    user = request.current_user
    role_name = user.role.name if user.role else ""

    products = Product.query.all()
    total_products = len(products)
    inventory_value = round(sum(p.price * p.quantity for p in products), 2)
    low_stock_items = sum(1 for p in products if p.quantity <= 5)

    base = {
        "total_products": total_products,
        "low_stock_items": low_stock_items,
        "role": role_name,
    }

    if role_name == "Super Admin":
        total_users = User.query.count()
        total_suppliers = Supplier.query.count()
        total_categories = Category.query.count()
        total_stock = sum(p.quantity for p in products)
        from datetime import date as _date
        today = _date.today()
        movements_today = StockMovement.query.filter(
            db.func.date(StockMovement.created_at) == today
        ).count()

        base.update({
            "total_users": total_users,
            "total_suppliers": total_suppliers,
            "total_categories": total_categories,
            "inventory_value": inventory_value,
            "total_stock": total_stock,
            "stock_movements": movements_today,
        })

    elif role_name == "Inventory Manager":
        total_stock = sum(p.quantity for p in products)
        recent_movements = StockMovement.query.order_by(StockMovement.id.desc()).limit(5).all()

        base.update({
            "inventory_value": inventory_value,
            "total_stock": total_stock,
            "stock_movements_today": StockMovement.query.count(),
            "recent_movements": [m.to_dict() for m in recent_movements],
        })

    elif role_name == "Sales & Purchase Manager":
        total_suppliers = Supplier.query.count()

        base.update({
            "total_suppliers": total_suppliers,
            "inventory_value": inventory_value,
            "revenue": 0.0,
            "total_orders": 0,
            "sales_summary": {"total": 0, "count": 0},
            "purchase_summary": {"total": 0, "count": 0},
        })

    elif role_name == "Store Keeper":
        recent_in = StockMovement.query.filter_by(movement_type="stock_in") \
            .order_by(StockMovement.id.desc()).limit(5).all()
        recent_out = StockMovement.query.filter_by(movement_type="stock_out") \
            .order_by(StockMovement.id.desc()).limit(5).all()

        base.update({
            "total_products": total_products,
            "low_stock_items": low_stock_items,
            "recent_stock_in": [m.to_dict() for m in recent_in],
            "recent_stock_out": [m.to_dict() for m in recent_out],
        })

    return jsonify(base)


@app.route("/api/products", methods=["GET"])
@permissions_required("products:read")
def list_products():
    try:
        page = parse_number(request.args.get("page", 1), "page", int)
        limit = parse_number(request.args.get("limit", 10), "limit", int)
    except ValueError:
        return error("page and limit must be positive integers")

    if page < 1:
        return error("page must be a positive integer")
    if limit < 1:
        return error("limit must be a positive integer")
    if limit > 100:
        return error("limit must be <= 100")

    products_query = Product.query.order_by(Product.id.desc())
    paginated = products_query.paginate(page=page, per_page=limit, error_out=False)

    pagination = {
        "page": page,
        "per_page": limit,
        "total_items": paginated.total,
        "total_pages": paginated.pages,
        "has_next": paginated.has_next,
        "has_prev": paginated.has_prev,
        "next_page": paginated.next_num,
        "prev_page": paginated.prev_num,
    }

    return jsonify(
        {
            "success": True,
            "products": [product.to_dict() for product in paginated.items],
            "pagination": pagination,
        }
    )


@app.route("/api/products", methods=["POST"])
@permissions_required("products:create")
def create_product():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return error("Name is required")

    try:
        price = parse_number(payload.get("price", 0), "Price", float)
        quantity = parse_number(payload.get("stock", payload.get("quantity", 0)), "Stock", int)
        category = resolve_relation(Category, payload, "category")
        supplier = resolve_relation(Supplier, payload, "supplier")
    except ValueError as exc:
        db.session.rollback()
        return error(str(exc))

    if price < 0 or quantity < 0:
        db.session.rollback()
        return error("Price and stock cannot be negative")

    product = Product(
        name=name,
        price=price,
        quantity=quantity,
        category=category,
        supplier=supplier,
    )
    try:
        db.session.add(product)
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to create product")
        return error("Could not save product", 500)

    logger.info("Product created: %s by %s", product.name, request.current_user.username)
    return jsonify(product.to_dict()), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"])
@permissions_required("products:update")
def update_product(product_id):
    product = db.session.get(Product, product_id) or abort(404)
    payload = request.get_json(silent=True) or {}

    try:
        if "name" in payload:
            name = str(payload["name"] or "").strip()
            if not name:
                raise ValueError("Name is required")
            product.name = name
        if "price" in payload:
            product.price = parse_number(payload["price"], "Price", float)
        if "stock" in payload or "quantity" in payload:
            product.quantity = parse_number(payload.get("stock", payload.get("quantity")), "Stock", int)
        if product.price < 0 or product.quantity < 0:
            raise ValueError("Price and stock cannot be negative")
        if "category_id" in payload or "category" in payload:
            product.category = resolve_relation(Category, payload, "category")
        if "supplier_id" in payload or "supplier" in payload:
            product.supplier = resolve_relation(Supplier, payload, "supplier")
    except ValueError as exc:
        db.session.rollback()
        return error(str(exc))

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to update product %s", product_id)
        return error("Could not update product", 500)

    logger.info("Product updated: %s by %s", product.name, request.current_user.username)
    return jsonify(product.to_dict())


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
@permissions_required("products:delete")
def delete_product(product_id):
    product = db.session.get(Product, product_id) or abort(404)
    try:
        name = product.name
        db.session.delete(product)
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to delete product %s", product_id)
        return error("Could not delete product", 500)

    logger.info("Product deleted: %s by %s", name, request.current_user.username)
    return jsonify({"deleted": True})


@app.route("/api/categories", methods=["GET"])
@permissions_required("categories:read")
def list_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify([category.to_dict() for category in categories])


@app.route("/api/categories", methods=["POST"])
@permissions_required("categories:create")
def create_category():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "error": "Category name is required"}), 400
    existing = Category.query.filter_by(name=name).first()
    if existing:
        return jsonify({"success": False, "error": "Category already exists"}), 409
    category = Category(name=name)
    db.session.add(category)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to create category")
        return error("Could not save category", 500)
    logger.info("Category created: %s by %s", name, request.current_user.username)
    return jsonify(category.to_dict()), 201


@app.route("/api/categories/<int:category_id>", methods=["PUT"])
@permissions_required("categories:update")
def update_category(category_id):
    category = db.session.get(Category, category_id) or abort(404)
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return error("Category name is required")

    existing = Category.query.filter(Category.name == name, Category.id != category_id).first()
    if existing:
        return error("Category name already exists", 409)

    category.name = name
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to update category %s", category_id)
        return error("Could not update category", 500)
    return jsonify(category.to_dict())


@app.route("/api/categories/<int:category_id>", methods=["DELETE"])
@permissions_required("categories:delete")
def delete_category(category_id):
    category = db.session.get(Category, category_id) or abort(404)
    if category.products:
        return error("Cannot delete category with associated products. Reassign or remove them first.", 409)
    try:
        db.session.delete(category)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return error("Could not delete category", 500)
    return jsonify({"deleted": True})


@app.route("/api/suppliers", methods=["GET"])
@permissions_required("suppliers:read")
def list_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name).all()
    return jsonify([supplier.to_dict() for supplier in suppliers])


@app.route("/api/suppliers", methods=["POST"])
@permissions_required("suppliers:create")
def create_supplier():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "error": "Supplier name is required"}), 400
    supplier = Supplier(
        name=name,
        contact=(payload.get("contact") or "").strip(),
        email=(payload.get("email") or "").strip(),
        address=(payload.get("address") or "").strip(),
    )
    db.session.add(supplier)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to create supplier")
        return error("Could not save supplier", 500)
    logger.info("Supplier created: %s by %s", name, request.current_user.username)
    return jsonify(supplier.to_dict()), 201


@app.route("/api/suppliers/<int:supplier_id>", methods=["PUT"])
@permissions_required("suppliers:update")
def update_supplier(supplier_id):
    supplier = db.session.get(Supplier, supplier_id) or abort(404)
    payload = request.get_json(silent=True) or {}

    if "name" in payload:
        name = str(payload["name"] or "").strip()
        if not name:
            return error("Supplier name is required")
        supplier.name = name
    if "contact" in payload:
        supplier.contact = str(payload["contact"] or "").strip()
    if "email" in payload:
        supplier.email = str(payload["email"] or "").strip()
    if "address" in payload:
        supplier.address = str(payload["address"] or "").strip()

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Failed to update supplier %s", supplier_id)
        return error("Could not update supplier", 500)
    return jsonify(supplier.to_dict())


@app.route("/api/suppliers/<int:supplier_id>", methods=["DELETE"])
@permissions_required("suppliers:delete")
def delete_supplier(supplier_id):
    supplier = db.session.get(Supplier, supplier_id) or abort(404)
    if supplier.products:
        return error("Cannot delete supplier with associated products. Reassign or remove them first.", 409)
    try:
        db.session.delete(supplier)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return error("Could not delete supplier", 500)
    return jsonify({"deleted": True})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
