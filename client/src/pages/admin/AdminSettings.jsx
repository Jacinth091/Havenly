import { AlertOctagon, Database, Globe, RefreshCw, Save } from "lucide-react";
import { useState } from "react";

const AdminSettings = () => {
  // Mock System Configs
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    debugMode: false,
  });

  const toggleConfig = (key) => {
    setSystemConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
          <p className="text-sm text-slate-600">
            Configure global platform behavior and database maintenance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-blue-500" /> Platform Controls
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="font-bold text-slate-700">
                  Allow New Registrations
                </p>
                <p className="text-xs text-slate-500">
                  If disabled, new users cannot sign up.
                </p>
              </div>
              <button
                onClick={() => toggleConfig("allowRegistrations")}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  systemConfig.allowRegistrations
                    ? "bg-blue-500"
                    : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    systemConfig.allowRegistrations
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="font-bold text-slate-700">Maintenance Mode</p>
                <p className="text-xs text-slate-500">
                  Takes the site offline for non-admins.
                </p>
              </div>
              <button
                onClick={() => toggleConfig("maintenanceMode")}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  systemConfig.maintenanceMode ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    systemConfig.maintenanceMode
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={20} className="text-emerald-500" /> Database
            Maintenance
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-emerald-800">
                  Connection Status
                </span>
                <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>
              <p className="text-xs text-emerald-700">
                MySQL 8.0 • XAMPP Localhost
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Save size={24} className="text-slate-600 mb-2" />
                <span className="text-xs font-bold text-slate-700">
                  Backup DB
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <RefreshCw size={24} className="text-slate-600 mb-2" />
                <span className="text-xs font-bold text-slate-700">
                  Flush Logs
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertOctagon size={20} /> Danger Zone
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-red-100 bg-red-50/50 rounded-lg gap-4">
            <div>
              <p className="font-bold text-slate-800">System Reset</p>
              <p className="text-xs text-slate-500">
                This will purge all transaction logs and soft-deleted users.
                Irreversible.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-md whitespace-nowrap">
              Execute Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
