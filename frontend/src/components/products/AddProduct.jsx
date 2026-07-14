import { useEffect, useState } from "react";
import { getCategories, getSuppliers } from "../../services/api";

function AddProduct({
  onAdd,
  loading = false,
  initialValues = null,
  onCancel = null,
  submitLabel = "Save Product",
  title = "Add a new product",
  subtitle = "Keep your inventory fresh and easy to track.",
}) {
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    supplier_id: "",
    price: "",
    stock: "",
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        category_id: initialValues.category_id ?? "",
        supplier_id: initialValues.supplier_id ?? "",
        price: initialValues.price ?? "",
        stock: initialValues.stock ?? "",
      });
      return;
    }

    setForm({ name: "", category_id: "", supplier_id: "", price: "", stock: "" });
    setErrors({});
  }, [initialValues]);

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
      setForm({ name: "", category_id: "", supplier_id: "", price: "", stock: "" });
      setErrors({});
    }
  };

  const canSave = form.category_id && form.supplier_id;

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            placeholder="Product Name"
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400 ${errors.name ? "border-rose-400" : "border-slate-200"}`}
          />
          {errors.name ? <p className="mt-1 text-xs text-rose-500">{errors.name}</p> : null}
        </div>

        <div>
          {categories.length === 0 ? (
            <p className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
              No categories available. Please create a category first.
            </p>
          ) : (
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400 ${errors.category_id ? "border-rose-400" : "border-slate-200"}`}
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
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400 ${errors.price ? "border-rose-400" : "border-slate-200"}`}
          />
          {errors.price ? <p className="mt-1 text-xs text-rose-500">{errors.price}</p> : null}
        </div>

        <div>
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            type="number"
            min="0"
            placeholder="Stock"
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400 ${errors.stock ? "border-rose-400" : "border-slate-200"}`}
          />
          {errors.stock ? <p className="mt-1 text-xs text-rose-500">{errors.stock}</p> : null}
        </div>

        <div className="md:col-span-2">
          {suppliers.length === 0 ? (
            <p className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
              No suppliers available. Please create a supplier first.
            </p>
          ) : (
            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400 ${errors.supplier_id ? "border-rose-400" : "border-slate-200"}`}
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
      </div>

      <button
        type="submit"
        disabled={loading || !canSave}
        className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default AddProduct;