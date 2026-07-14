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
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
    next_page: null,
    prev_page: null,
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(page, limit);
        setProducts(data.products || []);
        if (data.pagination) setPagination(data.pagination);
      } catch (err) {
        const apiError = err?.response?.data?.error;
        const apiDetails = err?.response?.data?.details;
        setError(apiError ? `Unable to load products: ${apiError}${apiDetails ? ` (${apiDetails})` : ""}` : "Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };


    loadProducts();
  }, [page, limit]);

  const filteredProducts = searchTerm
    ? products.filter((product) => {
        const term = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(term) ||
          (product.category || "").toLowerCase().includes(term)
        );
      })
    : products;

  const lowStockCount = products.filter((product) => product.stock <= 5).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);


  const refresh = async () => {
    try {
      const data = await getProducts(page, limit);
      setProducts(data.products || []);
      if (data.pagination) setPagination(data.pagination);
      setError("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Unable to refresh products.";
      setError(`Unable to load products: ${msg}`);
    }
  };

  const handleAddProduct = async (product) => {
    try {
      setLoading(true);
      await createProduct(product);
      await refresh();
      setShowForm(false);
      setError("");
      setSuccess("Product added successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not save the product.");
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateProduct = async (product) => {
    try {
      setLoading(true);
      await updateProduct(editingProduct.id, product);
      await refresh();
      setEditingProduct(null);
      setShowForm(false);
      setError("");
      setSuccess("Product updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not update the product.");
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
      await refresh();
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not delete the product.");
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
          <p className="mt-2 text-2xl font-semibold text-slate-800">{pagination.total_items ?? 0}</p>
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
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
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
          <>
            <ProductTable products={filteredProducts} onEdit={startEditing} onDelete={handleDeleteProduct} />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.total_pages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(pagination.prev_page)}
                  disabled={!pagination.has_prev || pagination.prev_page == null}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const total = pagination.total_pages || 0;
                    if (total <= 1) return null;

                    const current = pagination.page || 1;
                    const pages = [];

                    // Small window around current
                    const windowSize = 2;
                    const start = Math.max(1, current - windowSize);
                    const end = Math.min(total, current + windowSize);

                    if (start > 1) pages.push(1);
                    if (start > 2) pages.push(null); // ellipsis

                    for (let p = start; p <= end; p++) pages.push(p);

                    if (end < total - 1) pages.push(null);
                    if (end < total) pages.push(total);

                    return pages.map((p, idx) =>
                      p === null ? (
                        <span key={`e-${idx}`} className="px-2 text-sm text-slate-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          aria-current={p === current ? "page" : undefined}
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${
                            p === current
                              ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                </div>

                <button
                  onClick={() => setPage(pagination.next_page)}
                  disabled={!pagination.has_next || pagination.next_page == null}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Products;
