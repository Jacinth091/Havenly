import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createTenantAccount } from "../../api/tenant.api";
import { showToast } from "../toast/Toast";

// Helper for cleaning strings (for auto-generation)
const sanitizeString = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const CreateTenantModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    contact_num: "",
    username: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setGlobalError("");
      setShowPassword(false);

      // Generate secure temp password (ensure it hits 8 char limit)
      const tempPass = "TempPass" + Math.floor(1000 + Math.random() * 9000);

      setFormData({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        contact_num: "",
        username: "",
        password: tempPass,
        password_confirmation: tempPass,
      });
    }
  }, [isOpen]);

  const generateUsername = (force = false) => {
    if (
      formData.first_name &&
      formData.last_name &&
      (!formData.username || force)
    ) {
      const cleanFirst = sanitizeString(formData.first_name);
      const cleanLast = sanitizeString(formData.last_name);
      const suffix = Math.floor(100 + Math.random() * 900);
      const user = `${cleanFirst}.${cleanLast}${suffix}`;
      setFormData((prev) => ({ ...prev, username: user }));
      if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (name === "password" || name === "password_confirmation") {
      if (errors.password_confirmation)
        setErrors((prev) => ({ ...prev, password_confirmation: null }));
    }
    if (globalError) setGlobalError("");
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\u00f1\u00d1\s\-\.\']+$/;
    const usernameRegex = /^[a-zA-Z0-9\._\-]+$/;
    const phPhoneRegex = /^(09|\+639)\d{9}$/;
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (!nameRegex.test(formData.first_name)) {
      newErrors.first_name =
        "Invalid characters. Use letters, (-), (.), or (') only.";
    }

    // 2. Last Name
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (!nameRegex.test(formData.last_name)) {
      newErrors.last_name =
        "Invalid characters. Use letters, (-), (.), or (') only.";
    }

    // 3. Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // 4. Contact Number (Strict PH Validation)
    if (!formData.contact_num.trim()) {
      newErrors.contact_num = "Contact number is required";
    } else {
      // Remove spaces/dashes/parentheses just for checking validation
      const cleanPhone = formData.contact_num.replace(/[^0-9+]/g, "");
      if (!phPhoneRegex.test(cleanPhone)) {
        newErrors.contact_num = "Invalid PH mobile number (e.g., 0917xxxxxxx)";
      }
    }

    // 5. Username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username =
        "Only letters, numbers, dot (.), dash (-), underscore (_) allowed";
    }

    // 6. Password (8 chars minimum)
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // 7. Confirmation
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { ...payload } = formData;
      const result = await createTenantAccount(payload);

      if (result.success) {
        if (onSuccess) onSuccess();
        showToast("Tenant Account Created Successfully!", "success");
        onClose();
      } else {
        if (result.message && typeof result.message === "object") {
          const formattedErrors = {};
          Object.keys(result.message).forEach((key) => {
            formattedErrors[key] = Array.isArray(result.message[key])
              ? result.message[key][0]
              : result.message[key];
          });
          setErrors(formattedErrors);
        } else {
          setGlobalError(result.message || "Failed to create account.");
          showToast(result.message || "Failed to create account.", "error");
        }
      }
    } catch (error) {
      console.error("Critical error:", error);
      showToast(
        "A system error occurred. Please check your connection.",
        "error"
      );

      setGlobalError("A system error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* HEADER */}
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

        {/* GLOBAL ERROR ALERT */}
        {globalError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-xs font-semibold">{globalError}</span>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <form
            id="tenant-profile-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  1. Personal Information
                </span>
              </div>

              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      onBlur={() => generateUsername(false)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                        errors.first_name
                          ? "border-red-500 bg-red-50 focus:border-red-500"
                          : "border-slate-200"
                      }`}
                      placeholder="Juan"
                    />
                    {errors.first_name && (
                      <span className="text-[10px] text-red-500 font-medium leading-tight block">
                        {errors.first_name}
                      </span>
                    )}
                  </div>
                  {/* Middle Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">
                      Middle Name
                    </label>
                    <input
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                {/* Last Name */}
                <div className="space-y-1 mt-3">
                  <label className="text-xs font-bold text-slate-600">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={() => generateUsername(false)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                      errors.last_name
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="Dela Cruz"
                  />
                  {errors.last_name && (
                    <span className="text-[10px] text-red-500 font-medium leading-tight block">
                      {errors.last_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      errors.email ? "text-red-400" : "text-slate-400"
                    }`}
                  />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-9 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      errors.contact_num ? "text-red-400" : "text-slate-400"
                    }`}
                  />
                  <input
                    name="contact_num"
                    value={formData.contact_num}
                    onChange={handleChange}
                    className={`w-full pl-9 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${
                      errors.contact_num
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="0917 123 4567"
                  />
                </div>
                {errors.contact_num && (
                  <span className="text-[10px] text-red-500 font-medium">
                    {errors.contact_num}
                  </span>
                )}
              </div>

              {/* CREDENTIALS BOX */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                {/* Username - Full Width */}
                <div className="space-y-1 col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => generateUsername(true)}
                      className="text-[10px] flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                      title="Regenerate Username"
                    >
                      <RefreshCw size={10} /> Auto-Gen
                    </button>
                  </div>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-2 py-1.5 bg-white border rounded text-xs transition-colors ${
                      errors.username
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200"
                    }`}
                  />
                  {errors.username && (
                    <p className="text-[10px] text-red-500 leading-tight">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password - Half Width */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={12}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-7 pr-8 px-2 py-1.5 bg-white border rounded text-xs transition-colors ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      }`}
                    />
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex="-1" // Prevent tab focus
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-red-500 leading-tight">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password - Half Width */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={12}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`w-full pl-7 px-2 py-1.5 bg-white border rounded text-xs transition-colors ${
                        errors.password_confirmation
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-[10px] text-red-500 leading-tight">
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>

                <div className="col-span-2 flex items-start gap-1.5 text-slate-400">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  <span className="text-[10px] leading-tight">
                    This creates the tenant's login account.
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
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
            className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
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
