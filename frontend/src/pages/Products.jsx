import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import AddProduct from "../components/products/AddProduct";
import ProductTable from "../components/products/ProductTable";
import SearchBar from "../components/products/SearchBar";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../services/api";

function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch {
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.category || "").toLowerCase().includes(term)
    );
  });

  const lowStockCount = products.filter((product) => product.stock <= 5).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  const handleAddProduct = async (product) => {
    try {
      setLoading(true);
      const createdProduct = await createProduct(product);
      setProducts((previous) => [createdProduct, ...previous]);
      setShowForm(false);
      setError("");
    } catch {
      setError("Could not save the product.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (product) => {
    try {
      setLoading(true);
      const updatedProduct = await updateProduct(editingProduct.id, product);
      setProducts((previous) => previous.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)));
      setEditingProduct(null);
      setShowForm(false);
      setError("");
    } catch {
      setError("Could not update the product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteProduct(productId);
      setProducts((previous) => previous.filter((item) => item.id !== productId));
      setError("");
    } catch {
      setError("Could not delete the product.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Track stock levels, update catalog items, and stay ahead of reorders."
        action={
          <button
            onClick={() => {
              setShowForm((previous) => !previous);
              if (showForm) {
                setEditingProduct(null);
              }
            }}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            {showForm ? "Hide form" : "+ Add Product"}
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total products</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Stock in hand</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{totalStock}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Low stock alerts</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{lowStockCount}</p>
        </div>
      </div>

      {showForm ? (
        <AddProduct
          onAdd={editingProduct ? handleUpdateProduct : handleAddProduct}
          loading={loading}
          initialValues={editingProduct}
          onCancel={cancelEditing}
          submitLabel={editingProduct ? "Update Product" : "Save Product"}
          title={editingProduct ? "Update product" : "Add a new product"}
          subtitle={editingProduct ? "Adjust inventory details and keep the catalog current." : "Keep your inventory fresh and easy to track."}
        />
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Inventory list</h2>
            <p className="text-sm text-slate-500">Quickly scan and manage your catalog.</p>
          </div>
          <div className="w-full md:max-w-sm">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        {loading && products.length === 0 ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : (
          <ProductTable products={filteredProducts} onEdit={startEditing} onDelete={handleDeleteProduct} />
        )}
      </div>
    </div>
  );
}

export default Products;
