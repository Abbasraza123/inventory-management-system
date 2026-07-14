import sys
from app import app
from inventory import Inventory
from models import Product


def main():
    inventory = Inventory()

    while True:
        print("\n===== Inventory Management System =====")
        print("1. Add Product")
        print("2. Remove Product")
        print("3. Update Product")
        print("4. Search by Name")
        print("5. List Products")
        print("6. Exit")

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            try:
                name = input("Enter Product Name: ").strip()

                if not name:
                    print("Error: Name cannot be empty.")
                    continue

                quantity = int(input("Enter Quantity: "))
                price = float(input("Enter Price: "))

                product = Product(
                    name=name,
                    quantity=quantity,
                    price=price,
                )

                inventory.add_item(product)

                print("Product added successfully.")

            except ValueError as e:
                print(f"Error: {e}")

        elif choice == "2":
            try:
                product_id = int(input("Enter Product ID to remove: "))
            except ValueError:
                print("Error: Invalid ID.")
                continue

            if inventory.remove_item(product_id):
                print("Product removed successfully.")
            else:
                print("Product not found.")

        elif choice == "3":
            try:
                product_id = int(input("Enter Product ID to update: "))

                quantity = int(input("Enter New Quantity: "))
                price = float(input("Enter New Price: "))

                if inventory.update_item(
                    product_id,
                    quantity=quantity,
                    price=price
                ):
                    print("Product updated successfully.")
                else:
                    print("Product not found.")

            except ValueError as e:
                print(f"Error: {e}")

        elif choice == "4":
            name = input("Enter Product Name to search: ").strip()

            results = inventory.find_by_name(name)

            if results:
                print("\nMatching Products")
                print("-" * 50)

                for item in results:
                    print(item.to_dict())
            else:
                print("No matching products found.")

        elif choice == "5":
            items = inventory.list_items()

            if not items:
                print("Inventory is empty.")
            else:
                print("\nCurrent Inventory")
                print("-" * 50)

                for item in items:
                    print(item.to_dict())

        elif choice == "6":
            print("Thank you for using Inventory Management System.")
            sys.exit(0)

        else:
            print("Invalid choice. Please enter a number between 1 and 6.")


if __name__ == "__main__":
    with app.app_context():
        main()