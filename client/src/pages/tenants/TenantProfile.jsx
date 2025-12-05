import {
  Camera,
  Edit2,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

// SCHEMA MAPPING: 'tenants' table joined with 'users' table
const TenantProfile = () => {
  // Mock Data mimicking a fetch from: SELECT * FROM tenants t JOIN users u ON t.user_id = u.user_id WHERE u.user_id = ?
  const initialData = {
    user_id: 101,
    username: "felix_tenant",
    email: "felix.ybanez@havenly.com",
    role: "Tenant",
    first_name: "Felix Vincent",
    middle_name: "C.",
    last_name: "Ybañez",
    contact_num: "0917-123-4567",
    created_at: "2024-06-01",
    is_active: true,
  };

  const [profile, setProfile] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // API Call would go here: UPDATE tenants SET ... WHERE user_id = ...
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile); // Revert changes
    setIsEditing(false);
  };

  const InputField = ({
    label,
    name,
    value,
    icon: Icon,
    disabled = false,
    type = "text",
  }) => (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="text-xs font-bold text-slate-500 uppercase tracking-wide"
      >
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            className={`w-5 h-5 ${
              disabled ? "text-slate-400" : "text-emerald-500"
            }`}
          />
        </div>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all outline-none
            ${
              disabled
                ? "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-800 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            }
          `}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
          <p className="text-sm text-slate-600">
            Manage your personal information and account settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit text-center">
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-slate-400 overflow-hidden">
              {/* Placeholder Avatar */}
              {profile.first_name.charAt(0)}
              {profile.last_name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors shadow-sm">
              <Camera size={16} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            {profile.first_name} {profile.last_name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              {profile.role.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
              ID: #{profile.user_id}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Joined</span>
              <span className="font-medium text-slate-800">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                <Shield size={12} /> Active
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-slate-400" /> Personal Details
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="first_name"
              value={isEditing ? tempProfile.first_name : profile.first_name}
              icon={User}
              disabled={!isEditing}
            />
            <InputField
              label="Last Name"
              name="last_name"
              value={isEditing ? tempProfile.last_name : profile.last_name}
              icon={User}
              disabled={!isEditing}
            />
            <InputField
              label="Middle Name (Optional)"
              name="middle_name"
              value={isEditing ? tempProfile.middle_name : profile.middle_name}
              icon={User}
              disabled={!isEditing}
            />
            <InputField
              label="Contact Number"
              name="contact_num"
              value={isEditing ? tempProfile.contact_num : profile.contact_num}
              icon={Phone}
              disabled={!isEditing}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-slate-400" /> Account Security
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Email Address"
                name="email"
                value={profile.email}
                icon={Mail}
                disabled={true}
              />
              <InputField
                label="Username"
                name="username"
                value={profile.username}
                icon={User}
                disabled={true}
              />
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">
              Note: To change your email or username, please contact your system
              administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;
