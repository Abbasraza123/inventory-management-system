function ProductTable({ products, onEdit, onDelete }) {
  const formatPrice = (price) => {
    const numericValue = Number(price || 0);
    return `$${numericValue.toLocaleString()}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Price</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Stock</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {products.map((product) => {
            const isLowStock = product.stock <= 5;
            return (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-800">{product.name}</div>
                  <div className="text-xs text-slate-500">SKU {product.id}</div>
                </td>
                <td className="px-4 py-4 text-slate-600">{product.category || "Uncategorized"}</td>
                <td className="px-4 py-4 text-slate-600">{formatPrice(product.price)}</td>
                <td className="px-4 py-4 text-slate-600">{product.stock}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isLowStock
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {isLowStock ? "Low stock" : "In stock"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded-full border border-cyan-200 px-3 py-1 text-sm font-medium text-cyan-700 hover:bg-cyan-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
