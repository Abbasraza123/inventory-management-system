from inventory import Inventory
from models import Item


def main():
    inventory = Inventory("inventory.json")

    while True:
        print("\n===== Inventory Management System =====")
        print("1. Add Item")
        print("2. Remove Item")
        print("3. Update Item")
        print("4. Search by Name")
        print("5. List Items")
        print("6. Exit")

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            try:
                name = input("Enter Item Name: ").strip()

                if not name:
                    print("Error: Name cannot be empty.")
                    continue

                quantity = int(input("Enter Quantity: "))
                price = float(input("Enter Price: "))
                sku = input("Enter SKU: ").strip()

                if inventory.find_by_sku(sku):
                    print("Error: SKU already exists.")
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
                sku = input("Enter SKU to update: ").strip()

                quantity = int(input("Enter New Quantity: "))
                price = float(input("Enter New Price: "))

                if inventory.update_item(sku, quantity, price):
                    print("Item updated successfully.")
                else:
                    print("Item not found.")

            except ValueError as e:
                print(f"Error: {e}")

        elif choice == "4":
            name = input("Enter Item Name to search: ").strip()

            results = inventory.find_by_name(name)

            if results:
                print("\nMatching Items")
                print("-" * 50)

                for item in results:
                    print(item)
            else:
                print("No matching items found.")

        elif choice == "5":
            items = inventory.list_items()

            if not items:
                print("Inventory is empty.")
            else:
                print("\nCurrent Inventory")
                print("-" * 50)

                for item in items:
                    print(item)

        elif choice == "6":
            print("Thank you for using Inventory Management System.")
            break

        else:
            print("Invalid choice. Please enter a number between 1 and 6.")


if __name__ == "__main__":
    main()