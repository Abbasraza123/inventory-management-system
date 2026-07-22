import { ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AccessDenied() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
            <ShieldOff className="h-10 w-10 text-rose-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">403</h1>
          <p className="mt-2 text-lg font-semibold text-slate-700">Access Denied</p>
          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-white/95 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
          <ShieldOff className="h-10 w-10 text-rose-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">403</h1>
        <p className="mt-2 text-lg font-semibold text-slate-700">Access Denied</p>
        <p className="mt-2 text-sm text-slate-500">
          You do not have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default AccessDenied;
