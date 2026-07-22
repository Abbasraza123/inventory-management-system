import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Trash2, UserCog, X } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  toggleUserActive,
  updateUser,
} from "../services/api";

const emptyForm = { username: "", email: "", password: "", role_id: "" };

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total_items: 0,
    has_next: false,
    has_prev: false,
  });
  const [page, setPage] = useState(1);
  // Bumped after any mutation to re-trigger the single loader effect below.
  const [refreshKey, setRefreshKey] = useState(0);
  const reloadUsers = () => setRefreshKey((k) => k + 1);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const successTimeoutRef = useRef(null);

  const showSuccess = (msg) => {
    setSuccess(msg);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setSuccess(""), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    getRoles()
      .then((data) => { if (!cancelled) setRoles(data.roles || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getUsers(page, 10);
        if (!cancelled) {
          setUsers(data.users || []);
          if (data.pagination) setPagination(data.pagination);
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || "Failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, refreshKey]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const isEditing = Boolean(editingUser);
      if (editingUser) {
        const payload = { username: form.username, email: form.email, role_id: Number(form.role_id) };
        if (form.password) payload.password = form.password;
        await updateUser(editingUser.id, payload);
      } else {
        await createUser({
          username: form.username,
          email: form.email,
          password: form.password,
          role_id: Number(form.role_id),
        });
      }
      setShowForm(false);
      setEditingUser(null);
      setForm(emptyForm);
      reloadUsers();
      showSuccess(isEditing ? "User updated successfully." : "User created successfully.");
    } catch (err) {
      const details = err?.response?.data?.details;
      setError(
        details
          ? Object.values(details).join(". ")
          : err?.response?.data?.error || "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await toggleUserActive(userId);
      reloadUsers();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to toggle user status");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await deleteUser(userId);
      reloadUsers();
      showSuccess("User deleted.");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete user");
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setForm({ username: user.username, email: user.email, password: "", role_id: user.role_id });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage system users and their roles."
        action={
          <button
            onClick={() => {
              setShowForm((p) => !p);
              if (showForm) cancelForm();
            }}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            {showForm ? "Cancel" : "+ Add User"}
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-slate-800">
              {editingUser ? "Edit User" : "Create New User"}
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input name="username" value={form.username} onChange={handleChange} type="text" required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password {editingUser && "(leave blank to keep current)"}
              </label>
              <input name="password" value={form.password} onChange={handleChange} type="password"
                required={!editingUser}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select name="role_id" value={form.role_id} onChange={handleChange} required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400">
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={loading}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70">
              {loading ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </button>
            <button type="button" onClick={cancelForm}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">
          All Users <span className="text-sm font-normal text-slate-400">({pagination.total_items})</span>
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="font-semibold text-slate-800">{u.username}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{u.email}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                      {u.role || "No role"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(u)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
                        Edit
                      </button>
                      <button onClick={() => handleToggleActive(u.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          u.is_active
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}>
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(u.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.has_prev}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 disabled:opacity-50">
              Prev
            </button>
            <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.total_pages}</span>
            <button onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))} disabled={!pagination.has_next}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
