import {
  Camera,
  Edit2,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { InputField } from "../../components/input/InputField";
import { useAuth } from "../../context/AuthProvider";
// 👇 Import your toast utility (Adjust path to where you saved the showToast file)
import { showToast } from "../../components/toast/Toast";

const LandlordProfile = () => {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Removed [message, setMessage] state

  // --- DATA MAPPING ---
  useEffect(() => {
    if (user && user.landlord) {
      const mappedData = {
        // Root User Data
        email: user.email,
        username: user.username,
        profile_image_url: user.profile_image_url,
        created_at: user.created_at,

        // Nested Landlord Data
        first_name: user.landlord.first_name,
        last_name: user.landlord.last_name,
        middle_name: user.landlord.middle_name,
        contact_num: user.landlord.contact_num,

        // Stats
        properties_owned: user.landlord.properties_count,
        total_units: user.landlord.total_rooms,
      };

      setProfile(mappedData);
      setTempProfile(mappedData);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const payload = {
      first_name: tempProfile.first_name,
      last_name: tempProfile.last_name,
      middle_name: tempProfile.middle_name,
      contact_num: tempProfile.contact_num,
    };

    const result = await updateProfile(payload);

    if (result.success) {
      setIsEditing(false);
      // 👇 Success Toast
      showToast("Profile updated successfully!", "success");
    } else {
      // 👇 Error Toast
      showToast(result.message || "Failed to update.", "error");
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

      {/* Removed the inline {message && ...} div here, as Toasts replace it */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit text-center">
          <div className="relative inline-block mb-4">
            {profile.profile_image_url &&
            !profile.profile_image_url.includes("default") ? (
              <img
                src={profile.profile_image_url}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white overflow-hidden uppercase">
                {profile.first_name?.charAt(0)}
                {profile.last_name?.charAt(0)}
              </div>
            )}

            <button className="absolute bottom-1 right-1 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors shadow-sm">
              <Camera size={16} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            {profile.first_name} {profile.last_name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Member since{" "}
            {profile.created_at
              ? new Date(profile.created_at).getFullYear()
              : "N/A"}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 pt-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-slate-800">
                {profile.properties_owned || 0}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase">
                Properties
              </span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="block text-2xl font-bold text-slate-800">
                {profile.total_units || 0}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase">
                Total Rooms
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
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InputField
              label="First Name"
              name="first_name"
              type="text"
              value={isEditing ? tempProfile.first_name : profile.first_name}
              onChange={handleChange}
              icon={User}
              disabled={!isEditing}
            />
            <InputField
              label="Last Name"
              name="last_name"
              type="text"
              value={isEditing ? tempProfile.last_name : profile.last_name}
              onChange={handleChange}
              icon={User}
              disabled={!isEditing}
            />
            <InputField
              label="Middle Name"
              name="middle_name"
              type="text"
              value={isEditing ? tempProfile.middle_name : profile.middle_name}
              onChange={handleChange}
              icon={User}
              disabled={!isEditing}
            />
            <InputField
              label="Contact Number"
              name="contact_num"
              type="text"
              value={isEditing ? tempProfile.contact_num : profile.contact_num}
              onChange={handleChange}
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
                type="email"
                value={profile.email}
                icon={Mail}
                disabled={true}
                onChange={() => {}}
              />
              <InputField
                label="Username"
                name="username"
                type="text"
                value={profile.username}
                icon={User}
                disabled={true}
                onChange={() => {}}
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
