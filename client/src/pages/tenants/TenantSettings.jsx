import {
  AlertTriangle,
  Check,
  Key,
  Lock,
  LogOut,
  Save,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";

// SCHEMA MAPPING: Updates 'users' table (password_hash, is_active, deleted_at)
const TenantSettings = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeLeaseWarning, setActiveLeaseWarning] = useState(true); // Mock check for active lease

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Logic: Update 'password_hash' in 'users' table
    console.log("Updating password...");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeactivate = () => {
    // Logic: UPDATE users SET is_active = FALSE, deleted_at = NOW() WHERE user_id = ?
    console.log("Soft deleting account...");
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Account Settings
          </h2>
          <p className="text-sm text-slate-600">
            Manage login security and account status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security / Password Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Login Security
              </h3>
              <p className="text-xs text-slate-500">
                Update your password regularly.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Current Password
              </label>
              <div className="relative">
                <Key
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <Check
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                <Save size={18} /> Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Account Actions / Deactivation */}
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-emerald-600" />
              <h3 className="font-bold text-slate-800">Account Status</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-lg border border-emerald-100 flex items-center justify-between">
              <span>Active Tenant Account</span>
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Deactivate Account
                </h3>
                <p className="text-xs text-slate-500">
                  Close your account permanently.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Deactivating will mark your account as <strong>inactive</strong>.
              Your rental history and payment records will be{" "}
              <strong>archived</strong> for audit purposes but you will lose
              access to the dashboard.
            </p>

            {activeLeaseWarning && (
              <div className="mb-6 p-3 bg-amber-50 text-amber-800 text-xs border border-amber-200 rounded-lg flex gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                Note: You have an Active Lease. Please contact your landlord to
                terminate your lease before deactivating.
              </div>
            )}

            <button
              onClick={() => setModalOpen(true)}
              disabled={activeLeaseWarning}
              className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${
                      activeLeaseWarning
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                    }`}
            >
              <LogOut size={18} />{" "}
              {activeLeaseWarning
                ? "Cannot Deactivate (Active Lease)"
                : "Proceed to Deactivate"}
            </button>
          </div>
        </div>
      </div>

      {/* Deactivation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-scale-up">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              Are you sure?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              This action cannot be undone immediately. An admin will need to
              reactivate your account if you wish to return.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSettings;
