import { Bell, LogOut, Search, UserCircle2 } from "lucide-react";
import { useState } from "react";

function Navbar({ onLogout }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="ml-10 lg:ml-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">{today}</p>
          <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">Operations overview</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-cyan-300 hover:text-cyan-600 sm:hidden"
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </button>

          <label className="hidden cursor-text items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2 text-sm text-slate-400 transition-all hover:border-cyan-300 hover:shadow-sm focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 sm:flex">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-40 bg-transparent outline-none placeholder:text-slate-400 lg:w-56"
            />
            <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline-block">⌘K</kbd>
          </label>

          <button className="relative rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-cyan-300 hover:text-cyan-600">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
          </button>

          <div className="hidden items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 transition hover:border-slate-300 sm:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600">
              <UserCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Admin</span>
          </div>

          <button
            onClick={onLogout}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="mt-3 sm:hidden">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none"
              autoFocus
            />
          </label>
        </div>
      )}
    </header>
  );
}

export default Navbar;
