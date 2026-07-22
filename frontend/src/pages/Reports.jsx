import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, Package, AlertTriangle, Truck } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { getDashboardSummary, getProducts } from "../services/api";

const CHART_COLORS = ["#0891b2", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-sm text-slate-600">{payload[0].value} units in stock</p>
      </div>
    );
  }
  return null;
}

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
        const [dashboardData, productData] = await Promise.all([getDashboardSummary(), getProducts(1, 500)]);
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
    { title: "Inventory value", value: `$${summary.inventory_value.toLocaleString()}`, color: "text-emerald-600", icon: DollarSign, bg: "bg-emerald-50" },
    { title: "Products", value: summary.total_products.toString(), color: "text-cyan-600", icon: Package, bg: "bg-cyan-50" },
    { title: "Low stock", value: summary.low_stock_items.toString(), color: "text-rose-600", icon: AlertTriangle, bg: "bg-rose-50" },
    { title: "Suppliers", value: summary.total_suppliers.toString(), color: "text-violet-600", icon: Truck, bg: "bg-violet-50" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Analyze inventory performance with a clearer snapshot of operations."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.title}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{report.title}</p>
                <div className={`rounded-xl ${report.bg} p-2.5 transition group-hover:scale-110`}>
                  <Icon className={`h-4 w-4 ${report.color}`} />
                </div>
              </div>
              <h2 className={`mt-3 text-3xl font-bold ${report.color}`}>{report.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Inventory stock by category</h2>
            <p className="mt-1 text-sm text-slate-500">Visual snapshot of stock distribution across categories.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(8, 145, 178, 0.05)" }} />
                <Bar dataKey="stock" radius={[8, 8, 0, 0]} maxBarSize={56}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Category breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Stock and value per category.</p>
          </div>
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{item.stock} units</span>
                </div>
                <div className="mt-2 flex items-center justify-between pl-6">
                  <span className="text-sm text-slate-500">Estimated value</span>
                  <span className="text-sm font-semibold text-emerald-600">${item.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
