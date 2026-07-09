from flask import Flask, render_template, request, redirect, url_for
from models import db, Item
from inventory import Inventory

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///inventory.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

inventory = Inventory()

@app.route("/")
def dashboard():
    items = inventory.list_items()

    total_items = len(items)

    total_inventory_value = sum(
        item.quantity * item.price for item in items
    )

    low_stock_count = sum(
        1 for item in items if item.quantity < 5
    )

    return render_template(
        "index.html",
        items=items,
        total_items=total_items,
        total_inventory_value=total_inventory_value,
        low_stock_count=low_stock_count
    )


@app.route("/items/add", methods=["POST"])
def add_item():

    name = request.form.get("name", "").strip()
    sku = request.form.get("sku", "").strip()

    try:
        quantity = int(request.form.get("quantity", 0))
        price = float(request.form.get("price", 0))
    except ValueError:
        return redirect(url_for("dashboard"))

    if not name or not sku:
        return redirect(url_for("dashboard"))

    if inventory.find_by_sku(sku):
        return redirect(url_for("dashboard"))

    item = Item(
        name=name,
        quantity=quantity,
        price=price,
        sku=sku
    )

    inventory.add_item(item)

    return redirect(url_for("dashboard"))


@app.route("/items/<sku>/delete", methods=["POST"])
def delete_item(sku):

    inventory.remove_item(sku)

    return redirect(url_for("dashboard"))


@app.route("/items/<sku>/update", methods=["POST"])
def update_item(sku):

    try:
        quantity = int(request.form.get("quantity"))
        price = float(request.form.get("price"))
    except (TypeError, ValueError):
        return redirect(url_for("dashboard"))

    inventory.update_item(
        sku,
        quantity=quantity,
        price=price
    )

    return redirect(url_for("dashboard"))


@app.route("/items/search")
def search_items():

    keyword = request.args.get("q", "").strip()

    items = inventory.find_by_name(keyword)

    total_items = len(items)

    total_inventory_value = sum(
        item.quantity * item.price for item in items
    )

    low_stock_count = sum(
        1 for item in items if item.quantity < 5
    )

    return render_template(
        "index.html",
        items=items,
        total_items=total_items,
        total_inventory_value=total_inventory_value,
        low_stock_count=low_stock_count
    )


if __name__ == "__main__":
    app.run(debug=True)