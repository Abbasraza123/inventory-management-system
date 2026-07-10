import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { getCategories } from "../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organize your inventory with clear product groups and growth signals."
        action={
          <button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90">
            + Add Category
          </button>
        }
      />

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