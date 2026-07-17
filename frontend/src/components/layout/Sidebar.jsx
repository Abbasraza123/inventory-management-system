import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Boxes, LayoutDashboard, Menu, Package, Tag, Truck, X } from "lucide-react";

function Sidebar() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Categories", path: "/categories", icon: Tag },
    { name: "Suppliers", path: "/suppliers", icon: Truck },
    { name: "Reports", path: "/reports", icon: BarChart3 },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-900 p-2 text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-800/50 bg-slate-950 px-5 py-7 text-slate-100 transition-transform duration-300 lg:static lg:translate-x-0 lg:flex ${
          open ? "flex translate-x-0" : "-translate-x-full hidden lg:flex"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">IMS</p>
              <p className="text-xs text-slate-400">Inventory Management</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-md shadow-cyan-500/15"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50 p-4">
            <p className="text-sm font-semibold text-white">Daily focus</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Keep low-stock products visible and reorder on time.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
