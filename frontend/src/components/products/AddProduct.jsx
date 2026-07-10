import { useEffect, useState } from "react";

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
    category: "",
    price: "",
    stock: "",
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        category: initialValues.category || "",
        price: initialValues.price ?? "",
        stock: initialValues.stock ?? "",
      });
      return;
    }

    setForm({ name: "", category: "", price: "", stock: "" });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.category || !form.price || !form.stock) {
      return;
    }

    onAdd({
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
    });

    if (!initialValues) {
      setForm({ name: "", category: "", price: "", stock: "" });
    }
  };

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
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          type="text"
          placeholder="Product Name"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 focus:border-cyan-400"
        />

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          type="text"
          placeholder="Category"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 focus:border-cyan-400"
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          type="number"
          placeholder="Price"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 focus:border-cyan-400"
        />

        <input
          name="stock"
          value={form.stock}
          onChange={handleChange}
          type="number"
          placeholder="Stock"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 focus:border-cyan-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default AddProduct;