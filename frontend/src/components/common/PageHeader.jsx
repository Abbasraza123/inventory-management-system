import { Link } from "react-router-dom";

function PageHeader({ title, subtitle, action, showBackButton = title !== "Dashboard" }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showBackButton ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
          >
            ← Back to Dashboard
          </Link>
        ) : null}
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

export default PageHeader;
