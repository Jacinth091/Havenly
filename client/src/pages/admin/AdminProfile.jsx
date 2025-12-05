import { Edit2, Save, Shield, ShieldAlert, User, X } from "lucide-react";
import { useState } from "react";

// SCHEMA MAPPING: 'admins' table JOIN 'users' table
const AdminProfile = () => {
  const initialData = {
    user_id: 1,
    username: "admin_main",
    email: "admin@havenly.com",
    role: "Admin",
    first_name: "System",
    last_name: "Administrator",
    contact_num: "0917-000-0000",
    created_at: "2024-01-01",
  };

  const [profile, setProfile] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const InputField = ({ label, name, value, disabled = false }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-4 py-2 text-sm rounded-lg border outline-none
          ${
            disabled
              ? "bg-slate-50 text-slate-500 border-slate-200"
              : "bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          }
        `}
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Profile</h2>
          <p className="text-sm text-slate-600">
            System Administrator details.
          </p>
        </div>
        <div className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200 flex items-center gap-1">
          <ShieldAlert size={14} /> Super Admin
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Admin Header Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-lg">
              <div className="w-full h-full bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl">
                {profile.first_name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 px-8 pb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {profile.first_name} {profile.last_name}
              </h3>
              <p className="text-sm text-slate-500">
                Root Access • ID: #{profile.user_id}
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <User size={16} className="text-purple-500" /> Personal Info
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <InputField
                  label="First Name"
                  name="first_name"
                  value={
                    isEditing ? tempProfile.first_name : profile.first_name
                  }
                  disabled={!isEditing}
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={isEditing ? tempProfile.last_name : profile.last_name}
                  disabled={!isEditing}
                />
                <InputField
                  label="Contact Number"
                  name="contact_num"
                  value={
                    isEditing ? tempProfile.contact_num : profile.contact_num
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Shield size={16} className="text-purple-500" /> System
                Credentials
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <InputField
                  label="Email"
                  name="email"
                  value={profile.email}
                  disabled={true}
                />
                <InputField
                  label="Username"
                  name="username"
                  value={profile.username}
                  disabled={true}
                />
              </div>
              <div className="p-3 bg-purple-50 text-purple-800 text-xs rounded-lg mt-2">
                <strong>Role Privileges:</strong> Full access to User
                Management, Database Settings, and System Logs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
