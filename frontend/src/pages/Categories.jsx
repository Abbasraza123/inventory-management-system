import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { createCategory, getCategories } from "../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load categories");
    }
  };

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err?.response?.data?.error || "Failed to load categories"));
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organize your inventory with clear product groups and growth signals."
        action={
          <button
            onClick={() => { setShowForm((p) => !p); setError(""); }}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            {showForm ? "Cancel" : "+ Add Category"}
          </button>
        }
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {showForm ? (
        <form onSubmit={handleAdd} className="flex gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            type="text"
            placeholder="Category name"
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={loading || !newName.trim()}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Category</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-800">{category.name}</h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Live
              </span>
            </div>
            <p className="mt-6 text-3xl font-semibold text-slate-800">{category.product_count}</p>
            <p className="mt-2 text-sm text-slate-500">Products listed</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
