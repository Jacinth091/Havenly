import { Building2, Loader2, Lock, LogOut, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { InputField } from "../../components/input/InputField";
import { showToast } from "../../components/toast/Toast";
import { useAuth } from "../../context/AuthProvider";

const LandlordSettings = () => {
  const { user, changeUserPassword } = useAuth();

  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Visibility Toggles for the 3 fields
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  // Removed [message, setMessage] state

  const hasActiveProperties = user?.landlord?.properties_count > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    try {
      // 1. Basic Validation
      if (formData.password !== formData.password_confirmation) {
        showToast("New passwords do not match.", "error");
        return;
      }

      if (formData.password.length < 8) {
        showToast("Password must be at least 8 characters.", "error");
        return;
      }

      setIsSaving(true);

      // 2. Call API
      const result = await changeUserPassword(formData);

      if (result.success) {
        showToast("Password updated successfully!", "success");
        // Reset form
        setFormData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        showToast(result.message || "Failed to update password.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("An unexpected error occurred.", "error");
    } finally {
      setIsSaving(false);
    }
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

      {/* Removed the inline {message && ...} div here */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security / Password */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
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
            <InputField
              label="Current Password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              type={showPasswords.current ? "text" : "password"}
              placeholder="••••••••"
              toggleIcon={true}
              showPassword={showPasswords.current}
              onToggle={() => toggleVisibility("current")}
              disabled={isSaving}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="New Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPasswords.new ? "text" : "password"}
                placeholder="Min 8 chars"
                toggleIcon={true}
                showPassword={showPasswords.new}
                onToggle={() => toggleVisibility("new")}
                disabled={isSaving}
              />

              <InputField
                label="Confirm Password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm new"
                toggleIcon={true}
                showPassword={showPasswords.confirm}
                onToggle={() => toggleVisibility("confirm")}
                disabled={isSaving}
              />
            </div>

            <button
              disabled={isSaving || !formData.current_password}
              className="w-full mt-2 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save size={16} /> Update Password
                </>
              )}
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
                  <strong>Action Required:</strong> You have{" "}
                  {user?.landlord?.properties_count} active properties or
                  leases. You must transfer ownership or delete all properties
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
