import { useEffect, useState } from "react";
import { getCategories, getSuppliers } from "../../services/api";

const emptyForm = { name: "", category_id: "", supplier_id: "", price: "", stock: "" };

function productFormValues(product) {
  if (!product) return emptyForm;
  return {
    name: product.name || "",
    category_id: product.category_id ?? "",
    supplier_id: product.supplier_id ?? "",
    price: product.price ?? "",
    stock: product.stock ?? "",
  };
}

function AddProduct({
  onAdd,
  loading = false,
  initialValues = null,
  onCancel = null,
  submitLabel = "Save Product",
  title = "Add a new product",
  subtitle = "Keep your inventory fresh and easy to track.",
}) {
  const [form, setForm] = useState(() => productFormValues(initialValues));

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.category_id) newErrors.category_id = "Category is required";
    if (!form.supplier_id) newErrors.supplier_id = "Supplier is required";
    if (!form.price) newErrors.price = "Price is required";
    if (form.price && Number(form.price) < 0) newErrors.price = "Price cannot be negative";
    if (!form.stock) newErrors.stock = "Stock is required";
    if (form.stock && Number(form.stock) < 0) newErrors.stock = "Stock cannot be negative";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      name: form.name.trim(),
      category_id: Number(form.category_id),
      supplier_id: Number(form.supplier_id),
      price: Number(form.price),
      stock: Number(form.stock),
    });

    if (!initialValues) {
      setForm(emptyForm);
      setErrors({});
    }
  };

  const canSave = form.category_id && form.supplier_id;

  const inputClasses = (hasError) =>
    `w-full rounded-xl border bg-slate-50/80 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-cyan-500/20 ${
      hasError ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
    }`;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            placeholder="e.g. Wireless Keyboard"
            className={inputClasses(errors.name)}
          />
          {errors.name ? <p className="mt-1 text-xs text-rose-500">{errors.name}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Category</label>
          {categories.length === 0 ? (
            <p className={inputClasses(false) + " text-slate-400"}>
              No categories available
            </p>
          ) : (
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={inputClasses(errors.category_id)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
          {errors.category_id ? <p className="mt-1 text-xs text-rose-500">{errors.category_id}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Supplier</label>
          {suppliers.length === 0 ? (
            <p className={inputClasses(false) + " text-slate-400"}>
              No suppliers available
            </p>
          ) : (
            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
              className={inputClasses(errors.supplier_id)}
            >
              <option value="">Select a supplier</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          )}
          {errors.supplier_id ? <p className="mt-1 text-xs text-rose-500">{errors.supplier_id}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Price ($)</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className={inputClasses(errors.price)}
          />
          {errors.price ? <p className="mt-1 text-xs text-rose-500">{errors.price}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Stock Quantity</label>
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            type="number"
            min="0"
            placeholder="0"
            className={inputClasses(errors.stock)}
          />
          {errors.stock ? <p className="mt-1 text-xs text-rose-500">{errors.stock}</p> : null}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
        <button
          type="submit"
          disabled={loading || !canSave}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        {!canSave && (
          <p className="text-xs text-amber-600">Select a category and supplier to continue</p>
        )}
      </div>
    </form>
  );
}

export default AddProduct;
