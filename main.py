from inventory import Inventory
from models import Item


def main():
    inventory = Inventory("inventory.json")

    while True:
        print("\n===== Inventory Management System =====")
        print("1. Add Item")
        print("2. Remove Item")
        print("3. Update Item")
        print("4. List Items")
        print("5. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            try:
                name = input("Enter Item Name: ").strip()

                if not name:
                    print("Name cannot be empty.")
                    continue

                quantity = int(input("Enter Quantity: "))
                price = float(input("Enter Price: "))
                sku = input("Enter SKU: ").strip()

                if inventory.find_by_sku(sku):
                    print("SKU already exists.")
                    continue

                item = Item(name, quantity, price, sku)
                inventory.add_item(item)

                print("Item added successfully.")

            except ValueError as e:
                print(f"Error: {e}")

        elif choice == "2":
            sku = input("Enter SKU to remove: ").strip()

            if inventory.remove_item(sku):
                print("Item removed successfully.")
            else:
                print("Item not found.")

        elif choice == "3":
            try:
                sku = input("Enter SKU: ").strip()

                quantity = int(input("Enter New Quantity: "))
                price = float(input("Enter New Price: "))

                if inventory.update_item(sku, quantity, price):
                    print("Item updated successfully.")
                else:
                    print("Item not found.")

            except ValueError as e:
                print(f"Error: {e}")

        elif choice == "4":
            items = inventory.list_items()

            if not items:
                print("Inventory is empty.")
            else:
                print("\nCurrent Inventory")
                print("-" * 60)

                for item in items:
                    print(item)

        elif choice == "5":
            print("Goodbye!")
            break

        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()