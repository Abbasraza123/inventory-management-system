import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../components/common/PageHeader";
import { getDashboardSummary, getProducts } from "../services/api";

function Reports() {
  const [summary, setSummary] = useState({
    total_products: 0,
    inventory_value: 0,
    low_stock_items: 0,
    total_categories: 0,
    total_suppliers: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [dashboardData, productData] = await Promise.all([getDashboardSummary(), getProducts()]);
        setSummary(dashboardData);

        const products = productData.products || [];
        const grouped = products.reduce((accumulator, product) => {
        const key = product.category || "Uncategorized";
        const existing = accumulator.find((item) => item.name === key);

        if (existing) {
          existing.stock += product.stock;
          existing.value += product.price * product.stock;
          return accumulator;
        }

        accumulator.push({
          name: key,
          stock: product.stock,
          value: product.price * product.stock,
        });
        return accumulator;
      }, []);

      setChartData(grouped);
      } catch (error) {
        console.error("Failed to load reports", error);
      }
    };

    loadReports();
  }, []);

  const reportCards = [
    { title: "Inventory value", value: `$${summary.inventory_value.toLocaleString()}`, color: "text-emerald-600" },
    { title: "Products", value: summary.total_products.toString(), color: "text-cyan-600" },
    { title: "Low stock", value: summary.low_stock_items.toString(), color: "text-rose-600" },
    { title: "Suppliers", value: summary.total_suppliers.toString(), color: "text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Analyze inventory performance with a clearer snapshot of operations."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => (
          <div key={report.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{report.title}</p>
            <h2 className={`mt-3 text-3xl font-semibold ${report.color}`}>{report.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Inventory stock by category</h2>
          <p className="mt-1 text-sm text-slate-500">Visual snapshot of home stock and coverage.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="stock" fill="#0891b2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Inventory highlights</h2>
          <p className="mt-1 text-sm text-slate-500">A quick view of category activity.</p>
          <div className="mt-6 space-y-4">
            {chartData.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className="text-sm text-slate-500">{item.stock} units</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Estimated value: ${item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;