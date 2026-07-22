"""Reporting endpoints — inventory analytics and CSV export.

Endpoints:
    GET /api/reports/inventory          Aggregated inventory report (JSON)
    GET /api/reports/inventory/export   Full inventory report as CSV download

All aggregation is done in the database layer so the report stays correct and
fast regardless of catalog size (no unbounded Python loops, no pagination cap).
"""

import csv
import io
import logging

from flask import Blueprint, Response, jsonify, request

from models import Category, Product, Supplier, db
from rbac import permissions_required

logger = logging.getLogger(__name__)

DEFAULT_LOW_STOCK_THRESHOLD = 5
UNCATEGORIZED = "Uncategorized"


def _success(payload, status=200):
    return jsonify({"success": True, **payload}), status


def _error(message, status=400):
    return jsonify({"success": False, "error": message}), status


def _parse_threshold(raw):
    """Parse and validate the ?low_stock_threshold= query param."""
    if raw is None:
        return DEFAULT_LOW_STOCK_THRESHOLD
    try:
        value = int(raw)
    except (TypeError, ValueError):
        raise ValueError("low_stock_threshold must be a non-negative integer")
    if value < 0:
        raise ValueError("low_stock_threshold must be a non-negative integer")
    return value


def _category_rows():
    """Grouped stock/value/count per category (products with no category → Uncategorized).

    Returns a list of dicts ordered by descending stock value.
    """
    rows = (
        db.session.query(
            Category.name.label("category"),
            db.func.count(Product.id).label("product_count"),
            db.func.coalesce(db.func.sum(Product.quantity), 0).label("stock"),
            db.func.coalesce(db.func.sum(Product.price * Product.quantity), 0).label("value"),
        )
        .select_from(Product)
        .outerjoin(Category, Product.category_id == Category.id)
        .group_by(Category.name)
        .all()
    )
    result = [
        {
            "category": row.category or UNCATEGORIZED,
            "product_count": int(row.product_count or 0),
            "stock": int(row.stock or 0),
            "value": round(float(row.value or 0), 2),
        }
        for row in rows
    ]
    result.sort(key=lambda item: item["value"], reverse=True)
    return result


def _summary(threshold):
    totals = db.session.query(
        db.func.count(Product.id),
        db.func.coalesce(db.func.sum(Product.quantity), 0),
        db.func.coalesce(db.func.sum(Product.price * Product.quantity), 0),
    ).one()
    total_products, total_stock, inventory_value = totals

    low_stock_count = (
        db.session.query(db.func.count(Product.id))
        .filter(Product.quantity <= threshold)
        .scalar()
    )
    out_of_stock_count = (
        db.session.query(db.func.count(Product.id))
        .filter(Product.quantity <= 0)
        .scalar()
    )

    return {
        "total_products": int(total_products or 0),
        "total_stock": int(total_stock or 0),
        "inventory_value": round(float(inventory_value or 0), 2),
        "low_stock_count": int(low_stock_count or 0),
        "out_of_stock_count": int(out_of_stock_count or 0),
        "total_categories": db.session.query(db.func.count(Category.id)).scalar() or 0,
        "total_suppliers": db.session.query(db.func.count(Supplier.id)).scalar() or 0,
        "low_stock_threshold": threshold,
    }


def create_reports_blueprint():
    reports_bp = Blueprint("reports", __name__)

    # ── Inventory report (JSON) ───────────────────────────────────────
    @reports_bp.route("/inventory", methods=["GET"])
    @permissions_required("reports:read")
    def inventory_report():
        try:
            threshold = _parse_threshold(request.args.get("low_stock_threshold"))
        except ValueError as exc:
            return _error(str(exc))

        low_stock = (
            Product.query.filter(Product.quantity <= threshold)
            .order_by(Product.quantity.asc())
            .all()
        )

        return _success({
            "summary": _summary(threshold),
            "by_category": _category_rows(),
            "low_stock": [
                {
                    "id": p.id,
                    "name": p.name,
                    "stock": p.quantity,
                    "category": p.category.name if p.category else UNCATEGORIZED,
                }
                for p in low_stock
            ],
        })

    # ── Inventory report (CSV export) ─────────────────────────────────
    @reports_bp.route("/inventory/export", methods=["GET"])
    @permissions_required("reports:read")
    def export_inventory_report():
        products = Product.query.order_by(Product.name.asc()).all()

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["Product", "Category", "Supplier", "Stock", "Unit Price", "Stock Value"])
        for p in products:
            writer.writerow([
                p.name,
                p.category.name if p.category else UNCATEGORIZED,
                p.supplier.name if p.supplier else "",
                p.quantity,
                f"{p.price:.2f}",
                f"{p.price * p.quantity:.2f}",
            ])

        logger.info("Inventory CSV exported by %s (%d rows)", request.current_user.username, len(products))
        return Response(
            buffer.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=inventory-report.csv"},
        )

    return reports_bp
