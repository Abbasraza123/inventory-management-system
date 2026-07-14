import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { createSupplier, getSuppliers } from "../services/api";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", email: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load suppliers");
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setLoading(true);
      setError("");
      await createSupplier({
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      });
      setForm({ name: "", contact: "", email: "", address: "" });
      setShowForm(false);
      await loadSuppliers();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not create supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Build dependable vendor relationships and track supply strength."
        action={
          <button
            onClick={() => { setShowForm((p) => !p); setError(""); }}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            {showForm ? "Cancel" : "+ Add Supplier"}
          </button>
        }
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {showForm ? (
        <form onSubmit={handleAdd} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Supplier Name *"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400"
            />
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              type="text"
              placeholder="Contact"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400"
            />
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              type="text"
              placeholder="Address"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !form.name.trim()}
            className="mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Adding..." : "Add Supplier"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">{supplier.name}</h3>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">Active</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Contact: {supplier.contact}</p>
              <p>Email: {supplier.email}</p>
              <p>Address: {supplier.address}</p>
              <p>Products supplied: {supplier.product_count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Suppliers;