function StatCard({ title, value, color, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-4 h-2 w-16 rounded-full ${accent}`} />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h2 className={`mt-3 text-3xl font-semibold ${color}`}>{value}</h2>
    </div>
  );
}

export default StatCard;