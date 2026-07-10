import { Bell, LogOut, Search, UserCircle2 } from "lucide-react";

function Navbar({ onLogout }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-600">{today}</p>
          <h2 className="text-xl font-semibold text-slate-800">Operations overview</h2>
        </div>

        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:flex">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-28 bg-transparent outline-none"
            />
          </label>
          <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <UserCircle2 className="h-6 w-6 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;