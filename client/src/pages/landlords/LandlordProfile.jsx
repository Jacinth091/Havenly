import {
  Camera,
  Edit2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

// SCHEMA MAPPING: 'landlords' table JOIN 'users' table
const LandlordProfile = () => {
  // Mock Data: Fetched via `SELECT * FROM landlords l JOIN users u ON l.user_id = u.user_id WHERE u.user_id = ?`
  const initialData = {
    user_id: 2,
    username: "landlord_maria",
    email: "maria.santos@havenly.com",
    role: "Landlord",
    first_name: "Maria",
    middle_name: "Clara",
    last_name: "Santos",
    contact_num: "0918-123-4567", // Critical for tenant contact
    location: "Cebu City, Cebu", // Derived or added field
    created_at: "2024-01-15",
    is_active: true,
    // Portfolio stats derived from 'properties' table count
    properties_owned: 3,
    total_units: 19,
  };

  const [profile, setProfile] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // API Call: UPDATE landlords SET ... WHERE user_id = ?
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const InputField = ({ label, name, value, icon: Icon, disabled = false }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            className={`w-5 h-5 ${
              disabled ? "text-slate-400" : "text-blue-500"
            }`}
          />
        </div>
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all outline-none
            ${
              disabled
                ? "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-800 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
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
          <h2 className="text-2xl font-bold text-slate-800">
            Landlord Profile
          </h2>
          <p className="text-sm text-slate-600">
            Manage your public profile and contact details seen by tenants.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
          <ShieldCheck size={14} /> Verified Landlord
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit text-center">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
              {profile.first_name.charAt(0)}
              {profile.last_name.charAt(0)}
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors shadow-sm">
              <Camera size={16} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            {profile.first_name} {profile.last_name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Member since {new Date(profile.created_at).getFullYear()}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 pt-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-slate-800">
                {profile.properties_owned}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase">
                Properties
              </span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="block text-2xl font-bold text-slate-800">
                {profile.total_units}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase">
                Total Units
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-slate-400" /> Business Contact
              Info
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Edit2 size={16} /> Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded hover:bg-slate-200"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              label="Middle Name"
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

          <div className="space-y-6 border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-slate-800">
              Account Credentials
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
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded">
              To update email or username, please contact System Admin for
              identity verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;
