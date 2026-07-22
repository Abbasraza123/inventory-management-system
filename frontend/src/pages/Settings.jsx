import { Settings as SettingsIcon } from "lucide-react";
import PageHeader from "../components/common/PageHeader";

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure system preferences and application settings."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">System Settings</h3>
            <p className="text-sm text-slate-500">Manage application configuration.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">Database Backup</p>
            <p className="mt-1 text-sm text-slate-500">Create a backup of the current database.</p>
            <button
              disabled
              className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">Audit Logs</p>
            <p className="mt-1 text-sm text-slate-500">View system audit trail and activity logs.</p>
            <button
              disabled
              className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">Data Import/Export</p>
            <p className="mt-1 text-sm text-slate-500">Import or export inventory data in CSV/JSON format.</p>
            <button
              disabled
              className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
