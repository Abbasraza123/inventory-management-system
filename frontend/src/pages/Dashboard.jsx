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
        const [dashboard, productsResponse] = await Promise.all([getDashboardSummary(), getProducts()]);
        setSummary(dashboard);
        setRecentProducts((productsResponse.products || []).slice(0, 5));
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
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Your inventory health looks strong today. Keep an eye on the alerts below."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 p-8 text-white shadow-xl lg:p-10"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-cyan-200">Today at a glance</p>
            <h2 className="mt-3 text-2xl font-semibold lg:text-3xl">You're staying ahead of stock issues.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 lg:text-base">
              {summary.total_products} products are currently in the system, with {summary.low_stock_items} low-stock alerts to watch.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
            >
              Manage products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/reports"
              className="rounded-2xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              See reports
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">Recent inventory changes</h3>
              <p className="mt-1 text-sm text-slate-500">Products that were added recently.</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-slate-600">Product</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600">Category</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600">Stock</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentProducts.map((product) => {
                  const isLowStock = product.stock <= 5;
                  return (
                    <tr key={product.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-medium text-slate-700">{product.name}</td>
                      <td className="px-5 py-4 text-slate-600">{product.category || "Uncategorized"}</td>
                      <td className="px-5 py-4 text-slate-600">{product.stock}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isLowStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {isLowStock ? "Low stock" : "In stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                      No products yet. Add your first product to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">Action needed</h3>
              <p className="text-sm text-slate-500">Items that deserve your attention.</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-amber-200 hover:bg-amber-50/50"
              >
                <Package2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                <p className="text-sm text-slate-600">{alert}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
