import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Package2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import { getDashboardSummary, getProducts } from "../services/api";

function Dashboard() {
  const [summary, setSummary] = useState({
    total_products: 0,
    inventory_value: 0,
    low_stock_items: 0,
    total_categories: 0,
    total_suppliers: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [dashboard, products] = await Promise.all([getDashboardSummary(), getProducts()]);
        setSummary(dashboard);
        setRecentProducts(products.slice(0, 3));
      } catch (error) {
        console.error("Failed to load dashboard", error);
      }
    };

    loadSummary();
  }, []);

  const stats = [
    { title: "Total Products", value: summary.total_products.toString(), color: "text-cyan-600", accent: "bg-cyan-500" },
    { title: "Inventory Value", value: `$${summary.inventory_value.toLocaleString()}`, color: "text-emerald-600", accent: "bg-emerald-500" },
    { title: "Low Stock", value: summary.low_stock_items.toString(), color: "text-rose-600", accent: "bg-rose-500" },
    { title: "Categories", value: summary.total_categories.toString(), color: "text-violet-600", accent: "bg-violet-500" },
  ];

  const alerts = ["Keyboard is below reorder threshold", "Mouse stock is running thin", "One supplier delivery is delayed"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your inventory health looks strong today. Keep an eye on the alerts below."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 p-6 text-white shadow-xl"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-cyan-200">Today at a glance</p>
            <h2 className="mt-2 text-2xl font-semibold">You’re staying ahead of stock issues.</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              {summary.total_products} products are currently in the system, with {summary.low_stock_items} low-stock alerts to watch.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/25"
            >
              Manage products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/reports"
              className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              See reports
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">Recent inventory changes</h3>
              <p className="text-sm text-slate-500">Products that were added recently.</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Stock</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentProducts.map((product) => {
                  const isLowStock = product.stock <= 5;
                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-3 font-medium text-slate-700">{product.name}</td>
                      <td className="px-4 py-3 text-slate-600">{product.category || "Uncategorized"}</td>
                      <td className="px-4 py-3 text-slate-600">{product.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLowStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {isLowStock ? "Low stock" : "In stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">Action needed</h3>
              <p className="text-sm text-slate-500">Items that deserve your attention.</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <Package2 className="mt-0.5 h-4 w-4 text-cyan-600" />
                <p className="text-sm text-slate-600">{alert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;