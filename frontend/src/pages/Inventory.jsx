import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Minus, Plus, Warehouse } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { getProducts, getMovements, stockIn, stockOut, adjustStock, markDamaged } from "../services/api";

const MOVEMENT_TYPES = [
  { value: "stock_in", label: "Stock In", color: "emerald", permission: "inventory:stock_in" },
  { value: "stock_out", label: "Stock Out", color: "rose", permission: "inventory:stock_out" },
  { value: "adjustment", label: "Adjustment", color: "amber", permission: "inventory:adjust" },
  { value: "damaged", label: "Mark Damaged", color: "red", permission: "inventory:mark_damaged" },
];

function Inventory() {
  const { user } = useAuth();
  const hasPermission = (permission) =>
    user?.role === "Super Admin" || user?.permissions?.includes(permission);

  const allowedMovementTypes = MOVEMENT_TYPES.filter((t) => hasPermission(t.permission));
  const canWrite = allowedMovementTypes.length > 0;

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [movementType, setMovementType] = useState(
    allowedMovementTypes[0]?.value || "stock_in",
  );
  const [quantity, setQuantity] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(canWrite ? "operations" : "history");
  const successTimeoutRef = useRef(null);

  const loadMovements = async () => {
    try {
      const data = await getMovements({ page: 1, limit: 20 });
      setMovements(data.movements || []);
    } catch {
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getProducts(1, 100);
        if (!cancelled) setProducts(data.products || []);
      } catch {
      }
      if (!cancelled) await loadMovements();
    };
    load();
    return () => {
      cancelled = true;
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const resetForm = () => {
    setSelectedProduct("");
    setQuantity("");
    setNewQuantity("");
    setReference("");
    setNotes("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const product_id = Number(selectedProduct);
      const payload = { product_id, reference, notes };

      if (movementType === "adjustment") {
        payload.new_quantity = Number(newQuantity);
        await adjustStock(payload);
      } else if (movementType === "damaged") {
        payload.quantity = Number(quantity);
        await markDamaged(payload);
      } else if (movementType === "stock_in") {
        payload.quantity = Number(quantity);
        await stockIn(payload);
      } else {
        payload.quantity = Number(quantity);
        await stockOut(payload);
      }

      const typeLabel = MOVEMENT_TYPES.find((t) => t.value === movementType)?.label;
      resetForm();
      await loadMovements();
      const productsData = await getProducts(1, 100);
      setProducts(productsData.products || []);
      setSuccess(`${typeLabel} recorded successfully.`);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedProductData = products.find((p) => p.id === Number(selectedProduct));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Manage stock levels, record movements, and track changes."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="flex gap-2">
        {(canWrite ? ["operations", "history"] : ["history"]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "operations" ? "Stock Operations" : "Movement History"}
          </button>
        ))}
      </div>

      {canWrite && activeTab === "operations" && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-slate-800">Record Stock Movement</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Product *</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400">
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Movement Type *</label>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400">
                {allowedMovementTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {movementType === "adjustment" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">New Quantity *</label>
                <input type="number" min="0" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} required
                  placeholder={selectedProductData ? String(selectedProductData.stock) : "0"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
                {selectedProductData && (
                  <p className="mt-1 text-xs text-slate-400">Current: {selectedProductData.stock}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Quantity *</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Reference</label>
              <input type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                placeholder="PO-001, Invoice, etc."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
            </div>
          </div>

          <button type="submit" disabled={loading || !selectedProduct}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70">
            {loading ? "Processing..." : (
              <>
                {movementType === "stock_in" && <Plus className="h-4 w-4" />}
                {movementType === "stock_out" && <Minus className="h-4 w-4" />}
                Record Movement
              </>
            )}
          </button>
        </form>
      )}

      {activeTab === "history" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-xl font-semibold text-slate-800">Recent Movements</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">By</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {movements.map((m) => (
                  <tr key={m.id} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">{m.product_name}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        m.movement_type === "stock_in" ? "bg-emerald-100 text-emerald-700" :
                        m.movement_type === "stock_out" ? "bg-rose-100 text-rose-700" :
                        m.movement_type === "damaged" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                         {m.movement_type.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{m.quantity}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{m.reference || "-"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{m.created_by}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 text-xs">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
