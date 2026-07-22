function ProductTable({ products, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const formatPrice = (price) => {
    const numericValue = Number(price || 0);
    return `$${numericValue.toLocaleString()}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Stock</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              {(canEdit || canDelete) && (
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => {
              const isLowStock = product.stock <= 5;
              return (
                <tr key={product.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="font-semibold text-slate-800">{product.name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">SKU {product.id}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{product.category || "Uncategorized"}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">{formatPrice(product.price)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{product.stock}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        isLowStock
                          ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
                          : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                      }`}
                    >
                      {isLowStock ? "Low stock" : "In stock"}
                    </span>
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => onEdit(product)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(product.id)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
