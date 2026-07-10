import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children, onLogout }) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />

      <div className="flex-1">
        <Navbar onLogout={onLogout} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;