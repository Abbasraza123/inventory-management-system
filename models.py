from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


role_permissions = db.Table(
    "role_permissions",
    db.Column("role_id", db.Integer, db.ForeignKey("role.id"), primary_key=True),
    db.Column("permission_id", db.Integer, db.ForeignKey("permission.id"), primary_key=True),
)


class Role(db.Model):
    """Authorization role (e.g. Super Admin, Inventory Manager)."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    permissions = db.relationship(
        "Permission",
        secondary=role_permissions,
        backref=db.backref("roles", lazy="select"),
        lazy="select",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "permissions": sorted([p.name for p in self.permissions]),
        }


class Permission(db.Model):
    """Granular permission (e.g. products:create, users:delete)."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    resource = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(30), nullable=False)
    description = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "resource": self.resource,
            "action": self.action,
            "description": self.description,
        }


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("role.id"), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    role = db.relationship("Role", backref=db.backref("users", lazy="dynamic"), lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role.name if self.role else None,
            "role_id": self.role_id,
            "is_active": self.is_active,
            "permissions": sorted([p.name for p in self.role.permissions]) if self.role else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    products = db.relationship("Product", back_populates="category", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "product_count": len(self.products),
        }


class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    contact = db.Column(db.String(80), nullable=True)
    email = db.Column(db.String(160), nullable=True)
    address = db.Column(db.String(220), nullable=True)
    products = db.relationship("Product", back_populates="supplier", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact": self.contact or "",
            "email": self.email or "",
            "address": self.address or "",
            "product_count": len(self.products),
        }


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey("supplier.id"), nullable=True)
    category = db.relationship("Category", back_populates="products")
    supplier = db.relationship("Supplier", back_populates="products")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "stock": self.quantity,
            "category_id": self.category_id,
            "supplier_id": self.supplier_id,
            "category": self.category.name if self.category else "",
            "supplier": self.supplier.name if self.supplier else "",
        }


class StockMovement(db.Model):
    """Tracks every stock-in, stock-out, adjustment, and damage event."""

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    movement_type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    reference = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    product = db.relationship("Product", backref=db.backref("movements", lazy="dynamic"))
    user = db.relationship("User", backref=db.backref("stock_movements", lazy="dynamic"))

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "movement_type": self.movement_type,
            "quantity": self.quantity,
            "reference": self.reference or "",
            "notes": self.notes or "",
            "created_by": self.user.username if self.user else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
