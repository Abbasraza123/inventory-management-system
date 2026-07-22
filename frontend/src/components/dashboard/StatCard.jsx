const ICON_BG = {
  "bg-cyan-500": "bg-cyan-500/10",
  "bg-blue-500": "bg-blue-500/10",
  "bg-violet-500": "bg-violet-500/10",
  "bg-rose-500": "bg-rose-500/10",
  "bg-amber-500": "bg-amber-500/10",
  "bg-emerald-500": "bg-emerald-500/10",
};

function StatCard({ title, value, color, accent, icon: Icon }) {
  const iconBg = ICON_BG[accent] || "bg-slate-500/10";
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`h-1.5 w-12 rounded-full ${accent} transition-all group-hover:w-16`} />
        {Icon && (
          <div className={`rounded-xl ${iconBg} p-2`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h2 className={`mt-3 text-3xl font-bold tracking-tight ${color}`}>{value}</h2>
    </div>
  );
}

export default StatCard;
