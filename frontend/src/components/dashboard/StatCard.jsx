function StatCard({ title, value, color, accent }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-4 h-1.5 w-12 rounded-full ${accent} transition-all group-hover:w-16`} />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h2 className={`mt-3 text-3xl font-bold tracking-tight ${color}`}>{value}</h2>
    </div>
  );
}

export default StatCard;
