import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, Truck } from "lucide-react";
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
    getSuppliers()
      .then(setSuppliers)
      .catch((err) => setError(err?.response?.data?.error || "Failed to load suppliers"));
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
        <form onSubmit={handleAdd} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">New supplier details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Supplier company name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Contact</label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                type="text"
                placeholder="Phone or contact person"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="supplier@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                type="text"
                placeholder="City, State or full address"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !form.name.trim()}
            className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Adding..." : "Add Supplier"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-blue-50 text-violet-600 transition group-hover:from-violet-100 group-hover:to-blue-100">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{supplier.name}</h3>
                  <p className="text-xs text-slate-400">Vendor ID #{supplier.id}</p>
                </div>
              </div>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">Active</span>
            </div>

            <div className="mt-5 space-y-2.5 text-sm text-slate-600">
              {supplier.contact ? (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{supplier.contact}</span>
                </div>
              ) : null}
              {supplier.email ? (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{supplier.email}</span>
                </div>
              ) : null}
              {supplier.address ? (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{supplier.address}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-2xl font-semibold text-slate-800">{supplier.product_count}</p>
                <p className="text-xs text-slate-500">Products supplied</p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {supplier.product_count > 0 ? "Supplying" : "No products yet"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Suppliers;
