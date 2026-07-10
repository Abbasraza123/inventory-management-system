import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { getSuppliers } from "../services/api";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Failed to load suppliers", error);
      }
    };

    loadSuppliers();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Build dependable vendor relationships and track supply strength."
        action={
          <button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90">
            + Add Supplier
          </button>
        }
      />

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
              <p>Products supplied: {supplier.product_count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Suppliers;