import { Link } from "react-router-dom";

function PageHeader({ title, subtitle, action, showBackButton = title !== "Dashboard" }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
        {showBackButton ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        ) : null}
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

export default PageHeader;
