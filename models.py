class Item:
    def __init__(self, name, quantity, price, sku):
        if quantity < 0:
            raise ValueError("Quantity cannot be negative.")

        if price < 0:
            raise ValueError("Price cannot be negative.")

        self.name = name
        self.quantity = quantity
        self.price = price
        self.sku = sku

    def __repr__(self):
        return (
            f"Item(name='{self.name}', "
            f"quantity={self.quantity}, "
            f"price={self.price}, "
            f"sku='{self.sku}')"
        )
    
    def to_dict(self):
        return {
            "name": self.name,
            "quantity": self.quantity,
            "price": self.price,
            "sku": self.sku
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            data["name"],
            data["quantity"],
            data["price"],
            data["sku"]
        )
