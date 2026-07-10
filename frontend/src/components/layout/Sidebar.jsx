import { NavLink } from "react-router-dom";
import { BarChart3, Boxes, LayoutDashboard, Package, Tag, Truck } from "lucide-react";

function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Categories", path: "/categories", icon: Tag },
    { name: "Suppliers", path: "/suppliers", icon: Truck },
    { name: "Reports", path: "/reports", icon: BarChart3 },
  ];

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950/95 px-6 py-8 text-slate-100 lg:flex">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">IMS</p>
            <p className="text-sm text-slate-400">Inventory Management</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-sm font-semibold text-white">Daily focus</p>
        <p className="mt-2 text-sm text-slate-400">Keep low-stock products visible and reorder on time.</p>
      </div>
    </aside>
  );
}

export default Sidebar;