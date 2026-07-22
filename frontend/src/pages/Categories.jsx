import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/common/PageHeader";
import { createCategory, getCategories } from "../services/api";

function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canCreate = user?.role === "Super Admin" || user?.role === "Inventory Manager";

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load categories");
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getCategories();
        if (!cancelled) setCategories(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || "Failed to load categories");
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setLoading(true);
      setError("");
      await createCategory(newName.trim());
      setNewName("");
      setShowForm(false);
      await loadCategories();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not create category");
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organize your inventory with clear product groups and growth signals."
        action={
          canCreate ? (
            <button
              onClick={() => { setShowForm((p) => !p); setError(""); }}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              {showForm ? "Cancel" : "+ Add Category"}
            </button>
          ) : null
        }
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {showForm && canCreate ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Category name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              type="text"
              placeholder="e.g. Electronics, Furniture, Office Supplies"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newName.trim()}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Adding..." : "Create Category"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-5">
          <p className="text-sm font-medium text-slate-500">Overview</p>
          <p className="mt-3 text-3xl font-semibold text-slate-800">{categories.length}</p>
          <p className="mt-1 text-sm text-slate-500">Total categories</p>
          <div className="mt-4 border-t border-slate-200 pt-3">
            <p className="text-2xl font-semibold text-cyan-600">{totalProducts}</p>
            <p className="text-sm text-slate-500">Products across all</p>
          </div>
        </div>

        {categories.map((category) => (
          <div
            key={category.id}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 transition group-hover:from-cyan-100 group-hover:to-blue-100">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{category.name}</h3>
                  <p className="text-xs text-slate-400">ID #{category.id}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Live
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold text-slate-800">{category.product_count}</p>
                <p className="mt-1 text-sm text-slate-500">Products listed</p>
              </div>
              <div className="h-8 w-16 rounded-lg bg-gradient-to-r from-cyan-100 to-blue-50 opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
