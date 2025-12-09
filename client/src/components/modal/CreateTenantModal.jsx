import {
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
// import { createTenantProfile } from "../../api/tenant.api"; // Simulated API

const CreateTenantModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // 1. Tenant Personal Info (Required for tenants table) [cite: 146]
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    contact_num: "",
    // 2. Account Info (Required for users table) [cite: 140]
    username: "",
    password: "",
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      // Generate a random temp password
      const tempPass = "Temp" + Math.floor(1000 + Math.random() * 9000);
      setFormData({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        contact_num: "",
        username: "",
        password: tempPass,
      });
    }
  }, [isOpen]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const generateUsername = () => {
    if (formData.first_name && formData.last_name && !formData.username) {
      const user = `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}`;
      setFormData((prev) => ({ ...prev, username: user }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Tenant/User Details (All required fields for users/tenants tables)
    if (!formData.first_name.trim()) newErrors.first_name = "Required";
    if (!formData.last_name.trim()) newErrors.last_name = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    if (!formData.contact_num.trim()) newErrors.contact_num = "Required";
    if (!formData.username.trim()) newErrors.username = "Required";
    if (!formData.password.trim()) newErrors.password = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // API call to create USER (role=Tenant) and TENANT record
      const payload = { ...formData };
      console.log("Submitting Tenant Profile Payload:", payload);

      // Simulate API Call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      setErrors({ form: "System error during profile creation." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[800px]">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg border bg-emerald-100 text-emerald-600 border-emerald-200">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Register New Tenant
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Create user account and tenant profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <form
            id="tenant-profile-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* SECTION 1: PERSONAL DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  1. Personal Information
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    First Name
                  </label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={generateUsername}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                      errors.first_name ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="Juan"
                  />
                  {errors.first_name && (
                    <span className="text-[10px] text-red-500">
                      {errors.first_name}
                    </span>
                  )}
                </div>
                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    Last Name
                  </label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={generateUsername}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                      errors.last_name ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="Dela Cruz"
                  />
                  {errors.last_name && (
                    <span className="text-[10px] text-red-500">
                      {errors.last_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-9 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                      errors.email ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-500">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="contact_num"
                    value={formData.contact_num}
                    onChange={handleChange}
                    className={`w-full pl-9 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                      errors.contact_num ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="0917 123 4567"
                  />
                </div>
                {errors.contact_num && (
                  <span className="text-[10px] text-red-500">
                    {errors.contact_num}
                  </span>
                )}
              </div>

              {/* CREDENTIALS BOX */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={12}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-7 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 text-slate-400">
                  <Info size={12} />
                  <span className="text-[10px]">
                    This creates the tenant's login account.
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tenant-profile-form"
            disabled={loading}
            className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={18} /> Create Tenant Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTenantModal;
