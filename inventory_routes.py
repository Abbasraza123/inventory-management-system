"""Stock movement endpoints — stock-in, stock-out, adjustments, history.

Endpoints:
    POST /api/inventory/stock-in      Receive stock
    POST /api/inventory/stock-out     Issue stock
    POST /api/inventory/adjust        Stock adjustment
    PATCH /api/products/<id>/mark-damaged  Mark product as damaged
    GET  /api/inventory/movements     Stock movement history
    GET  /api/inventory/low-stock     Low stock products
    GET  /api/inventory/value         Total inventory value
"""

import logging

from flask import Blueprint, jsonify, request

from models import Product, StockMovement, db
from rbac import permissions_required

logger = logging.getLogger(__name__)


def _success(payload, status=200):
    return jsonify({"success": True, **payload}), status


def _error(message, status=400, details=None):
    body = {"success": False, "error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


def create_inventory_blueprint():
    inventory_bp = Blueprint("inventory", __name__)

    @inventory_bp.route("/stock-in", methods=["POST"])
    @permissions_required("inventory:stock_in")
    def stock_in():
        payload = request.get_json(silent=True) or {}

        product_id = payload.get("product_id")
        quantity = payload.get("quantity")
        reference = payload.get("reference", "")
        notes = payload.get("notes", "")

        if not product_id:
            return _error("product_id is required")
        if not isinstance(quantity, int) or quantity <= 0:
            return _error("quantity must be a positive integer")

        try:
            product = db.session.get(Product, int(product_id))
        except (TypeError, ValueError):
            return _error("Invalid product_id")
        if not product:
            return _error("Product not found", 404)

        product.quantity += quantity

        movement = StockMovement(
            product_id=product.id,
            movement_type="stock_in",
            quantity=quantity,
            reference=reference,
            notes=notes,
            created_by=request.current_user.id,
        )
        db.session.add(movement)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            logger.exception("Failed to record stock in")
            return _error("Could not record stock movement", 500)

        logger.info(
            "Stock in: product=%s qty=%d by=%s",
            product.name, quantity, request.current_user.username,
        )
        return _success({
            "message": f"Stock received: +{quantity} units of {product.name}",
            "product": product.to_dict(),
            "movement": movement.to_dict(),
        }, status=201)

    @inventory_bp.route("/stock-out", methods=["POST"])
    @permissions_required("inventory:stock_out")
    def stock_out():
        payload = request.get_json(silent=True) or {}

        product_id = payload.get("product_id")
        quantity = payload.get("quantity")
        reference = payload.get("reference", "")
        notes = payload.get("notes", "")

        if not product_id:
            return _error("product_id is required")
        if not isinstance(quantity, int) or quantity <= 0:
            return _error("quantity must be a positive integer")

        try:
            product = db.session.get(Product, int(product_id))
        except (TypeError, ValueError):
            return _error("Invalid product_id")
        if not product:
            return _error("Product not found", 404)

        if product.quantity < quantity:
            return _error(
                f"Insufficient stock: {product.name} has {product.quantity} units, "
                f"requested {quantity}"
            )

        product.quantity -= quantity

        movement = StockMovement(
            product_id=product.id,
            movement_type="stock_out",
            quantity=quantity,
            reference=reference,
            notes=notes,
            created_by=request.current_user.id,
        )
        db.session.add(movement)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            logger.exception("Failed to record stock out")
            return _error("Could not record stock movement", 500)

        logger.info(
            "Stock out: product=%s qty=%d by=%s",
            product.name, quantity, request.current_user.username,
        )
        return _success({
            "message": f"Stock issued: -{quantity} units of {product.name}",
            "product": product.to_dict(),
            "movement": movement.to_dict(),
        }, status=201)

    @inventory_bp.route("/adjust", methods=["POST"])
    @permissions_required("inventory:adjust")
    def adjust_stock():
        payload = request.get_json(silent=True) or {}

        product_id = payload.get("product_id")
        new_quantity = payload.get("new_quantity")
        notes = payload.get("notes", "")
        reference = payload.get("reference", "")

        if not product_id:
            return _error("product_id is required")
        if new_quantity is None or not isinstance(new_quantity, int) or new_quantity < 0:
            return _error("new_quantity must be a non-negative integer")

        try:
            product = db.session.get(Product, int(product_id))
        except (TypeError, ValueError):
            return _error("Invalid product_id")
        if not product:
            return _error("Product not found", 404)

        old_quantity = product.quantity
        diff = new_quantity - old_quantity

        if diff == 0:
            return _error("No adjustment needed — quantity unchanged")

        product.quantity = new_quantity

        movement = StockMovement(
            product_id=product.id,
            movement_type="adjustment",
            quantity=abs(diff),
            reference=reference,
            notes=notes or f"Adjusted from {old_quantity} to {new_quantity}",
            created_by=request.current_user.id,
        )
        db.session.add(movement)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            logger.exception("Failed to record stock adjustment")
            return _error("Could not record stock adjustment", 500)

        direction = "increased" if diff > 0 else "decreased"
        logger.info(
            "Stock adjust: product=%s %s %d -> %d by=%s",
            product.name, direction, old_quantity, new_quantity,
            request.current_user.username,
        )
        return _success({
            "message": f"Stock adjusted: {product.name} {direction} from {old_quantity} to {new_quantity}",
            "product": product.to_dict(),
            "movement": movement.to_dict(),
        })

    @inventory_bp.route("/mark-damaged", methods=["POST"])
    @permissions_required("inventory:mark_damaged")
    def mark_damaged():
        payload = request.get_json(silent=True) or {}

        product_id = payload.get("product_id")
        quantity = payload.get("quantity")
        notes = payload.get("notes", "")

        if not product_id:
            return _error("product_id is required")
        if not isinstance(quantity, int) or quantity <= 0:
            return _error("quantity must be a positive integer")

        try:
            product = db.session.get(Product, int(product_id))
        except (TypeError, ValueError):
            return _error("Invalid product_id")
        if not product:
            return _error("Product not found", 404)

        if product.quantity < quantity:
            return _error(
                f"Cannot mark {quantity} as damaged — only {product.quantity} in stock"
            )

        product.quantity -= quantity

        movement = StockMovement(
            product_id=product.id,
            movement_type="damaged",
            quantity=quantity,
            notes=notes or "Marked as damaged",
            created_by=request.current_user.id,
        )
        db.session.add(movement)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            logger.exception("Failed to mark product as damaged")
            return _error("Could not record damage", 500)

        logger.info(
            "Damaged: product=%s qty=%d by=%s",
            product.name, quantity, request.current_user.username,
        )
        return _success({
            "message": f"Marked {quantity} units of {product.name} as damaged",
            "product": product.to_dict(),
            "movement": movement.to_dict(),
        }, status=201)

    @inventory_bp.route("/movements", methods=["GET"])
    @permissions_required("inventory:read_history")
    def list_movements():
        try:
            page = int(request.args.get("page", 1))
            limit = int(request.args.get("limit", 20))
        except (TypeError, ValueError):
            page, limit = 1, 20

        page = max(1, page)
        limit = max(1, min(100, limit))

        product_id = request.args.get("product_id")
        movement_type = request.args.get("type")

        query = StockMovement.query.order_by(StockMovement.id.desc())

        if product_id:
            try:
                query = query.filter_by(product_id=int(product_id))
            except (TypeError, ValueError):
                return _error("Invalid product_id parameter")
        if movement_type:
            query = query.filter_by(movement_type=movement_type)

        paginated = query.paginate(page=page, per_page=limit, error_out=False)

        return _success({
            "movements": [m.to_dict() for m in paginated.items],
            "pagination": {
                "page": page,
                "per_page": limit,
                "total_items": paginated.total,
                "total_pages": paginated.pages,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev,
            },
        })

    @inventory_bp.route("/low-stock", methods=["GET"])
    @permissions_required("products:read")
    def low_stock():
        try:
            threshold = int(request.args.get("threshold", 5))
        except (TypeError, ValueError):
            threshold = 5
        products = Product.query.filter(Product.quantity <= threshold).order_by(Product.quantity.asc()).all()
        return _success({
            "products": [p.to_dict() for p in products],
            "count": len(products),
            "threshold": threshold,
        })

    @inventory_bp.route("/value", methods=["GET"])
    @permissions_required("products:read")
    def inventory_value():
        products = Product.query.all()
        total_value = sum(p.price * p.quantity for p in products)
        total_items = sum(p.quantity for p in products)
        return _success({
            "total_value": round(total_value, 2),
            "total_items": total_items,
            "total_products": len(products),
        })

    return inventory_bp
