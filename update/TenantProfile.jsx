import {
  AlertCircle,
  Camera,
  Edit2,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getTenantProfile, updateTenantProfile } from "../../api/tenant.api";

// Move InputField outside component to prevent recreation on each render
const InputField = ({
  label,
  name,
  value,
  icon: Icon,
  disabled = false,
  type = "text",
  onChange,
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
        value={value || ""}
        onChange={onChange}
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

const TenantProfile = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);

  // --- FETCH PROFILE DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getTenantProfile();

        if (result.success) {
          setProfile(result.data);
          setTempProfile(result.data);
        } else {
          setError(result.message || "Failed to load profile.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await updateTenantProfile({
        first_name: tempProfile.first_name,
        middle_name: tempProfile.middle_name,
        last_name: tempProfile.last_name,
        contact_num: tempProfile.contact_num,
      });

      if (result.success) {
        setProfile(result.data);
        setTempProfile(result.data);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setSaveError("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
    setSaveError(null);
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !profile) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Profile</h2>
          <p className="text-slate-500 mb-4">{error || "Profile not found."}</p>
          <p className="text-xs text-slate-400 mb-4">
            This may happen if your tenant profile wasn't created properly. 
            Please contact support or try logging out and back in.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("auth_token");
                window.location.href = "/login";
              }}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <Shield size={18} />
          <span className="font-medium">Profile updated successfully!</span>
        </div>
      )}

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
              {profile.first_name?.charAt(0) || ""}
              {profile.last_name?.charAt(0) || ""}
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
              {profile.role?.toUpperCase() || "TENANT"}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
              ID: #{profile.user_id}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Joined</span>
              <span className="font-medium text-slate-800">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className={`font-medium flex items-center gap-1 ${profile.is_active ? "text-emerald-600" : "text-red-600"}`}>
                <Shield size={12} /> {profile.is_active ? "Active" : "Inactive"}
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
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Save Error */}
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="first_name"
              value={isEditing ? tempProfile?.first_name : profile.first_name}
              icon={User}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Last Name"
              name="last_name"
              value={isEditing ? tempProfile?.last_name : profile.last_name}
              icon={User}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Middle Name (Optional)"
              name="middle_name"
              value={isEditing ? tempProfile?.middle_name : profile.middle_name}
              icon={User}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Contact Number"
              name="contact_num"
              value={isEditing ? tempProfile?.contact_num : profile.contact_num}
              icon={Phone}
              disabled={!isEditing}
              onChange={handleChange}
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
                onChange={() => {}} // No-op for disabled fields
              />
              <InputField
                label="Username"
                name="username"
                value={profile.username}
                icon={User}
                disabled={true}
                onChange={() => {}} // No-op for disabled fields
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
