import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { register } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const { handleLogin, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await register(form);
      if (data?.token) {
        handleLogin(data.token, data.user);
        navigate("/dashboard");
        return;
      }
      throw new Error("No token returned from server");
    } catch (error) {
      const details = error?.response?.data?.details;
      const backendMessage = details
        ? Object.values(details).join(". ")
        : error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to create account right now.";
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-white/95 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Inventory System</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Register a new workspace account to start managing inventory.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="username" value={form.username} onChange={handleChange} type="text" placeholder="Username" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400" />
          <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400" />
          <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-400" />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-cyan-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
