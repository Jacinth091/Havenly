import { Building2, Lock, LogOut, Save, Trash2 } from "lucide-react";
import { useState } from "react";

const LandlordSettings = () => {
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // BUSINESS RULE: A property cannot be deleted if it has active rooms or leases
  // We extend this to the landlord account: Cannot deactivate if properties are active.
  const hasActiveProperties = true;

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    console.log("Updating password...");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Account Settings
          </h2>
          <p className="text-sm text-slate-600">
            Manage login security and business continuity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security / Password */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Security</h3>
              <p className="text-xs text-slate-500">
                Ensure your landlord account is secure.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Min 8 chars"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Confirm
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Repeat password"
                />
              </div>
            </div>
            <button className="w-full mt-2 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
              <Save size={16} /> Update Password
            </button>
          </form>
        </div>

        {/* Account Deactivation */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Deactivate Account
              </h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Closing your account will archive your profile. You will not be
              able to manage your properties or collect rent.
            </p>

            {hasActiveProperties && (
              <div className="mb-6 p-3 bg-amber-50 text-amber-800 text-xs border border-amber-200 rounded-lg flex gap-2">
                <Building2 size={16} className="shrink-0" />
                <div>
                  <strong>Action Required:</strong> You have active properties
                  or leases. You must transfer ownership or terminate all leases
                  before deactivating.
                </div>
              </div>
            )}

            <button
              disabled={hasActiveProperties}
              className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${
                      hasActiveProperties
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-white border-2 border-red-100 text-red-600 hover:bg-red-50"
                    }`}
            >
              <LogOut size={16} />{" "}
              {hasActiveProperties
                ? "Resolve Properties First"
                : "Deactivate Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordSettings;
