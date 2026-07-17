import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children, onLogout }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar onLogout={onLogout} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
