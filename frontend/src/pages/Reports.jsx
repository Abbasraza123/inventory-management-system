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
import { AlertTriangle, Download, DollarSign, Package, RefreshCw, Truck } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { downloadInventoryReport, getInventoryReport } from "../services/api";

const CHART_COLORS = ["#0891b2", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function StockTooltip({ active, payload, label }) {
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

function ValueTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-sm text-slate-600">{currency(payload[0].value)} stock value</p>
      </div>
    );
  }
  return null;
}

function Reports() {
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const loadReports = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getInventoryReport();
        if (!cancelled) {
          setSummary(data.summary || null);
          setByCategory(data.by_category || []);
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || "Unable to load reports right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const blob = await downloadInventoryReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "inventory-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.error || "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const reportCards = summary
    ? [
        { title: "Inventory value", value: currency(summary.inventory_value), color: "text-emerald-600", icon: DollarSign, bg: "bg-emerald-50" },
        { title: "Products", value: String(summary.total_products ?? 0), color: "text-cyan-600", icon: Package, bg: "bg-cyan-50" },
        { title: "Low stock", value: String(summary.low_stock_count ?? 0), color: "text-rose-600", icon: AlertTriangle, bg: "bg-rose-50" },
        { title: "Suppliers", value: String(summary.total_suppliers ?? 0), color: "text-violet-600", icon: Truck, bg: "bg-violet-50" },
      ]
    : [];

  const hasData = byCategory.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Analyze inventory performance with a clearer snapshot of operations."
        action={
          <button
            onClick={handleExport}
            disabled={exporting || loading || !!error}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Download CSV"}
          </button>
        }
      />

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <button
            onClick={loadReports}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[24rem] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-500">Loading report...</p>
          </div>
        </div>
      ) : !error && (
        <>
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

          {!hasData ? (
            <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
              <Package className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">No inventory data yet</p>
              <p className="mt-1 text-sm text-slate-400">Add products to see category breakdowns and value analytics.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Stock by category</h2>
                    <p className="mt-1 text-sm text-slate-500">Units in stock across categories.</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byCategory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<StockTooltip />} cursor={{ fill: "rgba(8, 145, 178, 0.05)" }} />
                        <Bar dataKey="stock" radius={[8, 8, 0, 0]} maxBarSize={56}>
                          {byCategory.map((entry, index) => (
                            <Cell key={`stock-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Value by category</h2>
                    <p className="mt-1 text-sm text-slate-500">Estimated stock value across categories.</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byCategory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<ValueTooltip />} cursor={{ fill: "rgba(16, 185, 129, 0.05)" }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56} fill="#10b981">
                          {byCategory.map((entry, index) => (
                            <Cell key={`value-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">Category breakdown</h2>
                  <p className="mt-1 text-sm text-slate-500">Products, stock, and value per category.</p>
                </div>
                <div className="space-y-3">
                  {byCategory.map((item, index) => (
                    <div
                      key={item.category}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-semibold text-slate-700">{item.category}</span>
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {item.product_count} {item.product_count === 1 ? "product" : "products"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-600">{item.stock} units</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between pl-6">
                        <span className="text-sm text-slate-500">Estimated value</span>
                        <span className="text-sm font-semibold text-emerald-600">{currency(item.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Reports;
