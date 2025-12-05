import { useState } from "react";

// Placeholder Icons
const Lock = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const Trash = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);
const AlertTriangle = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const Key = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5l2.44-2.44L22 7.5l-4.5 4.5L12 17.5l-2.44-2.44z" />
  </svg>
);
// Missing icon definition added here:
const User = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TenantSettings = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [modalOpen, setModalOpen] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Basic validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      // Using custom modal in real app
      console.error("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      console.error("Password must be at least 8 characters.");
      return;
    }

    // API call to change password
    console.log("Password change initiated for user.");
    // Confirmation message using console.log instead of alert
    console.log("Password change request sent successfully!");

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeactivate = () => {
    // API call to set is_active = FALSE and deleted_at = NULL (soft deletion)
    console.log("Account deactivation requested.");
    setModalOpen(false);
    // Confirmation message using console.log instead of alert
    console.log("Your account has been deactivated. Goodbye!");
  };

  const PasswordInput = ({ label, name, value }) => (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-600">
        {label}
      </label>
      <input
        type="password"
        id={name}
        name={name}
        value={value}
        onChange={(e) =>
          setPasswordForm((prev) => ({ ...prev, [name]: e.target.value }))
        }
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
    </div>
  );

  const ConfirmationModal = () => {
    if (!modalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900 text-center">
            Confirm Deactivation
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Are you sure you want to proceed with account deactivation? This
            action will set your status to inactive but your records will be
            preserved for auditing.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <ConfirmationModal />

      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
        Account Settings
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings: Change Password */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 border-b pb-3">
            <Lock className="w-6 h-6 text-blue-600" />
            Security Settings
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={passwordForm.currentPassword}
            />
            <PasswordInput
              label="New Password (min 8 chars)"
              name="newPassword"
              value={passwordForm.newPassword}
            />
            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
            />

            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
              >
                <Key className="w-5 h-5" />
                Change Password
              </button>
            </div>
          </form>
        </div>

        {/* Account Management */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 border-b pb-3">
            <User className="w-6 h-6 text-blue-600" />
            Account Management
          </h2>

          {/* Deactivation Panel */}
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <p className="font-bold">Deactivate Account</p>
            </div>
            <p className="text-sm text-red-600">
              Deactivating your account will make your login inactive. All
              tenant history and data will be preserved as per Havenly's audit
              policy (soft deletion).
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-md text-sm font-semibold"
            >
              <Trash className="w-5 h-5" />
              Deactivate My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSettings;
