import { useState } from "react";

// Placeholder Icons
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
const Mail = (props) => (
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
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const Phone = (props) => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-7.07-7.07A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4.1 2h3.62a2 2 0 0 1 1.95 1.77l.8 6a2 2 0 0 1-.45 1.76L8.1 14.5a15 15 0 0 0 7.4 7.4l2.25-1.93a2 2 0 0 1 1.76-.45l6 .8c.9.15 1.77.72 1.77 1.63z" />
  </svg>
);
const Save = (props) => (
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
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const Edit = (props) => (
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
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TenantProfile = () => {
  const initialData = {
    firstName: "Felix Vincent",
    lastName: "Ybañez",
    email: "felix.tenant@havenly.com",
    contactNumber: "+63 917 123 4567",
    username: "felix_vincent_tenant",
    memberSince: "2024-06-01",
    role: "Tenant",
  };

  const [profile, setProfile] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real app: API call to update profile data (user table and tenant table)
    console.log("Saving profile:", profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(initialData); // Revert changes
    setIsEditing(false);
  };

  const InputField = ({ label, name, value, icon: Icon, disabled = false }) => (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-500">
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon className="w-5 h-5 text-gray-400 absolute left-3" />
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={!isEditing || disabled}
          className={`
                        w-full p-3 pl-10 border rounded-lg transition-colors
                        ${
                          isEditing && !disabled
                            ? "border-blue-500 bg-white shadow-md focus:ring-2 focus:ring-blue-500"
                            : "border-gray-200 bg-gray-50 text-gray-700 cursor-default"
                        }
                    `}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
        My Profile
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-extrabold shadow-xl border-4 border-white ring-2 ring-blue-500">
              {profile.firstName.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {profile.role}
            </span>
          </div>

          <div className="space-y-3 text-sm text-gray-600 border-t pt-4">
            <p className="flex justify-between">
              Member Since:{" "}
              <span className="font-semibold text-gray-800">
                {profile.memberSince}
              </span>
            </p>
            <p className="flex justify-between">
              Account Status:{" "}
              <span className="font-semibold text-green-600">Active</span>
            </p>
          </div>

          <div className="mt-6 border-t pt-4">
            {isEditing ? (
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-md text-sm font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account Details Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">
            Personal & Contact Information
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                value={profile.firstName}
                icon={User}
              />
              <InputField
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                icon={User}
              />
            </div>

            <InputField
              label="Contact Number"
              name="contactNumber"
              value={profile.contactNumber}
              icon={Phone}
            />

            <InputField
              label="Email Address (Login ID)"
              name="email"
              value={profile.email}
              icon={Mail}
              disabled={true} // Email should usually be immutable or require separate verification
            />

            <InputField
              label="Username"
              name="username"
              value={profile.username}
              icon={User}
              disabled={true} // Username often disabled if UUID/system generated
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;
