import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Home,
  Info,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputField } from "../components/input/InputField";
import { showToast } from "../components/toast/Toast";
import { useAuth } from "../context/AuthProvider";

// --- STEP 1: ROLE SELECTION ---
const Step1 = ({ userType, setUserType, error }) => {
  const handleRoleSelect = (selectedRole) => {
    if (selectedRole === "tenant") {
      showToast(
        "Tenant registration is invite-only. Please contact your Landlord.",
        "info"
      );
      return;
    }
    setUserType(selectedRole === userType ? "" : selectedRole);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Choose your Workspace
        </h3>
        <p className="text-slate-500 text-sm">
          Select how you will manage your rental experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleRoleSelect("tenant")}
          className="relative p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-not-allowed group text-left"
        >
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/50 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
              <Lock size={10} /> Invite Only
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-100/50 transition-colors">
            <Home size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-700">Tenant</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Find your home. Access lease details provided by your landlord.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSelect("landlord")}
          className={`relative p-6 rounded-xl border transition-all text-left group ${
            userType === "landlord"
              ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500"
              : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
          }`}
        >
          {userType === "landlord" && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <CheckCircle size={14} />
              </div>
            </div>
          )}
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
              userType === "landlord"
                ? "bg-emerald-100 text-emerald-600"
                : "bg-emerald-50 text-emerald-600/70 group-hover:text-emerald-600"
            }`}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h4
              className={`font-bold transition-colors ${
                userType === "landlord" ? "text-emerald-900" : "text-slate-800"
              }`}
            >
              Landlord
            </h4>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                userType === "landlord"
                  ? "text-emerald-700/80"
                  : "text-slate-500"
              }`}
            >
              Manage properties. Track payments and organize your portfolio.
            </p>
          </div>
        </button>
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-medium"
        >
          <Info size={16} /> {error}
        </motion.div>
      )}
    </div>
  );
};

// --- STEP 2: PERSONAL INFO ---
const Step2 = ({ formData, handleChange, errors }) => (
  <div className="flex flex-col justify-between gap-4">
    <div className="text-center mb-6">
      <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4">
        <User size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">Personal Details</h3>
      <p className="text-slate-500 text-sm">
        Tell us who is managing these properties
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputField
        label="First Name"
        name="first_name"
        icon={User}
        placeholder="e.g. Juan"
        value={formData.first_name}
        onChange={handleChange}
        error={errors.first_name}
      />
      <InputField
        label="Last Name"
        name="last_name"
        icon={User}
        placeholder="e.g. Dela Cruz"
        value={formData.last_name}
        onChange={handleChange}
        error={errors.last_name}
      />
      <InputField
        label="Middle Name"
        name="middle_name"
        icon={User}
        placeholder="e.g. Santos (Optional)"
        value={formData.middle_name}
        onChange={handleChange}
      />
      <InputField
        label="Mobile Number"
        name="contact_num"
        icon={Phone}
        type="tel"
        placeholder="0912 345 6789"
        value={formData.contact_num}
        onChange={handleChange}
        error={errors.contact_num}
      />
    </div>
  </div>
);

// --- STEP 3: ACCOUNT INFO ---
const Step3 = ({ formData, handleChange, errors }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-4">
        <Mail size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">Account Access</h3>
      <p className="text-slate-500 text-sm">
        Set up your secure login credentials
      </p>
    </div>
    <div className="space-y-5">
      <InputField
        label="Email Address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="name@company.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />
      <InputField
        label="Username"
        name="username"
        icon={ShieldCheck}
        placeholder="Create a unique username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />
    </div>
  </div>
);

// --- STEP 4: SECURITY ---
const Step4 = ({
  formData,
  handleChange,
  errors,
  showPassword,
  setShowPassword,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-600 mb-4">
        <Lock size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">Secure Account</h3>
      <p className="text-slate-500 text-sm">Protect your property data</p>
    </div>
    <div className="space-y-5">
      <InputField
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        toggleIcon={true}
        showPassword={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />
      <InputField
        label="Confirm Password"
        name="password_confirmation"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        placeholder="••••••••"
        value={formData.password_confirmation}
        onChange={handleChange}
        error={errors.password_confirmation}
      />
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
        <div className="shrink-0 text-emerald-600 mt-0.5">
          <Info size={18} />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800 block mb-1">
            Data Privacy
          </span>
          Your data is stored locally. By registering as a Landlord, you agree
          to manage tenant data responsibly.
        </div>
      </div>
    </div>
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    contact_num: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    role: "",
  });

  const steps = useMemo(
    () => [
      { number: 1, title: "Role", icon: Users },
      { number: 2, title: "Identity", icon: User },
      { number: 3, title: "Access", icon: Mail },
      { number: 4, title: "Security", icon: Lock },
    ],
    []
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      if (apiErrors[name]) setApiErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors, apiErrors]
  );

  const handleUserTypeSelect = useCallback(
    (type) => {
      setUserType(type);
      setFormData((prev) => ({ ...prev, role: type }));
      if (errors.userType) setErrors((prev) => ({ ...prev, userType: "" }));
      if (apiErrors.role) setApiErrors((prev) => ({ ...prev, role: "" }));
    },
    [errors.userType, apiErrors.role]
  );

  const validateStep = useCallback(() => {
    const newErrors = {};
    if (step === 1 && !userType)
      newErrors.userType = "Please select the Landlord role";
    if (step === 2) {
      if (!formData.first_name.trim())
        newErrors.first_name = "First Name field is required";
      if (!formData.last_name.trim())
        newErrors.last_name = "Last Name field is required";
      if (!formData.contact_num.trim())
        newErrors.contact_num = "Contact Number field is required";
      else if (
        !/^(09|\+639)\d{9}$/.test(formData.contact_num.replace(/\s/g, ""))
      )
        newErrors.contact_num = "Invalid PH number";
    }
    if (step === 3) {
      if (!formData.email.trim()) newErrors.email = "Email field is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Invalid email";
      if (!formData.username.trim())
        newErrors.username = "Username field is required";
    }
    if (step === 4) {
      if (!formData.password) newErrors.password = "Password field is required";
      else if (formData.password.length < 8)
        newErrors.password = "Minimum of atleast 8 characters";
      if (!formData.password_confirmation)
        newErrors.password_confirmation = "Confirm Password field is required";
      else if (formData.password !== formData.password_confirmation)
        newErrors.password_confirmation = "Passwords do not match";
    }
    setErrors(newErrors);
    setApiErrors({});
    return Object.keys(newErrors).length === 0;
  }, [step, userType, formData]);

  const handleNext = () => {
    if (validateStep() && step < steps.length) setStep(step + 1);
  };
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);
    setApiErrors({});

    try {
      const registrationData = { ...formData, role: userType.toLowerCase() };
      const result = await register(registrationData);

      if (!result.success) {
        // --- SCENARIO 1: Message is an Object { email: ["taken"], username: ["taken"] } ---
        // This is the case matching your specific console log
        if (
          result.message &&
          typeof result.message === "object" &&
          !Array.isArray(result.message)
        ) {
          // 1. Set the field highlights (red borders)
          setApiErrors(result.message);

          // 2. Loop through the object to Toast the strings
          Object.values(result.message).forEach((errorVal) => {
            // Error val might be a string or an array of strings
            if (Array.isArray(errorVal)) {
              errorVal.forEach((err) => showToast(err, "error"));
            } else {
              showToast(errorVal, "error");
            }
          });

          // 3. Jump to the correct step
          const errorStep = findErrorStep(result.message);
          if (errorStep !== step) setStep(errorStep);

          setIsSubmitting(false);
          return;
        }

        // --- SCENARIO 2: Message/Errors is an Array (Generic List) ---
        const errorList = result.errors || result.message;
        if (Array.isArray(errorList)) {
          errorList.forEach((err) => showToast(err, "error"));
          setIsSubmitting(false);
          return;
        }

        // --- SCENARIO 3: "Errors" is the Object (Standard Validator) ---
        if (result.errors && typeof result.errors === "object") {
          setApiErrors(result.errors);
          const errorStep = findErrorStep(result.errors);
          if (errorStep !== step) setStep(errorStep);
          showToast("Please fix the highlighted errors.", "error");
          setIsSubmitting(false);
          return;
        }

        // --- SCENARIO 4: Single String Error ---
        showToast(result.message || "Registration failed", "error");
        setIsSubmitting(false);
        return;
      }

      // Success
      showToast("Landlord account created!", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error: ", error);
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      if (!window.location.pathname.includes("/login")) {
        setIsSubmitting(false);
      }
    }
  };

  const findErrorStep = (errors) => {
    const errorFields = Object.keys(errors);
    if (
      errorFields.some((field) =>
        ["first_name", "last_name", "contact_num", "middle_name"].includes(
          field
        )
      )
    )
      return 2;
    if (errorFields.some((field) => ["email", "username"].includes(field)))
      return 3;
    if (
      errorFields.some((field) =>
        ["password", "password_confirmation"].includes(field)
      )
    )
      return 4;
    if (errorFields.includes("role")) return 1;
    return 1;
  };

  const renderStep = useMemo(() => {
    const combinedErrors = { ...errors, ...apiErrors };
    switch (step) {
      case 1:
        return (
          <Step1
            userType={userType}
            setUserType={handleUserTypeSelect}
            error={combinedErrors.userType || combinedErrors.role}
          />
        );
      case 2:
        return (
          <Step2
            formData={formData}
            handleChange={handleChange}
            errors={combinedErrors}
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            handleChange={handleChange}
            errors={combinedErrors}
          />
        );
      case 4:
        return (
          <Step4
            formData={formData}
            handleChange={handleChange}
            errors={combinedErrors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        );
      default:
        return null;
    }
  }, [step, userType, formData, errors, apiErrors, showPassword]);

  return (
    <div className=" bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex gap-1.5">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`h-2 w-8 rounded-full transition-all duration-500 ${
                  s.number <= step ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Step {step}/{steps.length}
          </span>
        </div>

        <div className="p-6 md:p-8 min-h-[400px] flex flex-col justify-center items-center ">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden w-full"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep}
              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              step === 1
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
            }`}
          >
            Previous
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:bg-emerald-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Account"}{" "}
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
