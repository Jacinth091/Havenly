import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Home,
  Info,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// Memoized step components to prevent unnecessary re-renders
const Step1 = ({ userType, setUserType, error }) => {
  const handleRoleSelect = (selectedRole) => {
    setUserType(selectedRole === userType ? "" : selectedRole);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
        Select Your Role
      </h3>
      <p className="text-gray-600 text-center text-sm md:text-base">
        Choose how you'll use Havenly
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Tenant Option */}
        <button
          type="button"
          onClick={() => handleRoleSelect("tenant")}
          className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-200 relative ${
            userType === "tenant"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
          }`}
        >
          {/* Selection indicator */}
          {userType === "tenant" && (
            <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
          )}

          <div className="flex flex-col items-center space-y-3 md:space-y-4">
            <div
              className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                userType === "tenant" ? "bg-blue-500 scale-110" : "bg-blue-100"
              }`}
            >
              <Home
                className={`w-5 h-5 md:w-8 md:h-8 transition-colors duration-200 ${
                  userType === "tenant" ? "text-white" : "text-blue-600"
                }`}
              />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                Tenant
              </h4>
              <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
                Looking for a place to rent? Create a tenant account to find and
                manage rentals.
              </p>
              {userType === "tenant" && (
                <div className="mt-2 md:mt-3">
                  <span className="inline-flex items-center px-2 py-0.5 md:px-2 md:py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Selected
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Landlord Option */}
        <button
          type="button"
          onClick={() => handleRoleSelect("landlord")}
          className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-200 relative ${
            userType === "landlord"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
          }`}
        >
          {/* Selection indicator */}
          {userType === "landlord" && (
            <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
          )}

          <div className="flex flex-col items-center space-y-3 md:space-y-4">
            <div
              className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                userType === "landlord"
                  ? "bg-purple-500 scale-110"
                  : "bg-purple-100"
              }`}
            >
              <Building2
                className={`w-5 h-5 md:w-8 md:h-8 transition-colors duration-200 ${
                  userType === "landlord" ? "text-white" : "text-purple-600"
                }`}
              />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                Landlord
              </h4>
              <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
                Own properties? Create a landlord account to manage properties
                and tenants.
              </p>
              {userType === "landlord" && (
                <div className="mt-2 md:mt-3">
                  <span className="inline-flex items-center px-2 py-0.5 md:px-2 md:py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    Selected
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs md:text-sm text-center">{error}</p>
      )}

      <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-100">
        <div className="flex items-start space-x-2 md:space-x-3">
          <div className="flex-shrink-0">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-blue-800">
              <span className="font-semibold">Note:</span> Select one role.
              Admin access requires existing administrator approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step2 = ({ formData, handleChange, errors }) => (
  <div className="space-y-4 md:space-y-5">
    <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
      Personal Information
    </h3>
    <p className="text-gray-600 text-center text-xs md:text-sm">
      Tell us about yourself
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          First Name *
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
            errors.firstName ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Juan"
          required
        />
        {errors.firstName && (
          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          Last Name *
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
            errors.lastName ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Dela Cruz"
          required
        />
        {errors.lastName && (
          <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
        )}
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          Middle Name
        </label>
        <input
          type="text"
          name="middleName"
          value={formData.middleName}
          onChange={handleChange}
          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base"
          placeholder="Santos"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          Birthdate *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            className={`w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
              errors.birthdate ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
        </div>
        {errors.birthdate && (
          <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="juan.delacruz@example.com"
            required
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>
    </div>
  </div>
);

const Step3 = ({ formData, handleChange, errors }) => (
  <div className="space-y-4 md:space-y-5">
    <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
      Contact Details
    </h3>
    <p className="text-gray-600 text-center text-xs md:text-sm">
      Where can we reach you?
    </p>

    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
        Phone Number *
      </label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
            errors.phone ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="+63 912 345 6789"
          required
        />
      </div>
      {errors.phone && (
        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
      )}
    </div>

    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
        Current Address *
      </label>
      <textarea
        name="currentAddress"
        value={formData.currentAddress}
        onChange={handleChange}
        rows="2"
        className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
          errors.currentAddress ? "border-red-300" : "border-gray-300"
        }`}
        placeholder="Street Address, Barangay"
        required
      />
      {errors.currentAddress && (
        <p className="text-red-500 text-xs mt-1">{errors.currentAddress}</p>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          City
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base"
          placeholder="City"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          Province
        </label>
        <input
          type="text"
          name="province"
          value={formData.province}
          onChange={handleChange}
          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base"
          placeholder="Province"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          ZIP Code
        </label>
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base"
          placeholder="1234"
        />
      </div>
    </div>
  </div>
);

const Step4 = ({
  formData,
  handleChange,
  errors,
  showPassword,
  setShowPassword,
}) => (
  <div className="space-y-4 md:space-y-5">
    <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
      Account Setup
    </h3>
    <p className="text-gray-600 text-center text-xs md:text-sm">
      Create your login credentials
    </p>

    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
        Username *
      </label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
            errors.username ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="juan.delacruz"
          required
        />
      </div>
      {errors.username && (
        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        This will be your unique identifier for login
      </p>
    </div>

    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
        Password *
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full pl-9 pr-10 md:pl-10 md:pr-12 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
            errors.password ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Must be at least 6 characters long
      </p>
    </div>

    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
        Confirm Password *
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base ${
            errors.confirmPassword ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="••••••••"
          required
        />
      </div>
      {errors.confirmPassword && (
        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
      )}
    </div>

    <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-100">
      <h4 className="font-semibold text-blue-800 text-sm md:text-base mb-1 md:mb-2">
        Privacy Notice
      </h4>
      <p className="text-xs md:text-sm text-blue-700">
        Your information is secure with us. We'll only use it for account
        management and verification purposes. We never share your personal data
        with third parties without your consent.
      </p>
    </div>
  </div>
);

const Register = () => {
  // Step state
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthdate: "",
    email: "",
    phone: "",
    currentAddress: "",
    city: "",
    province: "",
    zipCode: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Step titles
  const steps = useMemo(
    () => [
      { number: 1, title: "Select Role", icon: Users },
      { number: 2, title: "Personal Info", icon: User },
      { number: 3, title: "Contact Details", icon: Mail },
      { number: 4, title: "Account Setup", icon: Lock },
    ],
    []
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const handleUserTypeSelect = useCallback(
    (type) => {
      setUserType(type);
      if (errors.userType) {
        setErrors((prev) => ({ ...prev, userType: "" }));
      }
    },
    [errors.userType]
  );

  const validateStep = useCallback(() => {
    const newErrors = {};

    if (step === 1 && !userType) {
      newErrors.userType = "Please select a user type";
    }

    if (step === 2) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.birthdate) newErrors.birthdate = "Birthdate is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
    }

    if (step === 3) {
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.currentAddress.trim())
        newErrors.currentAddress = "Current address is required";
    }

    if (step === 4) {
      if (!formData.username.trim())
        newErrors.username = "Username is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, userType, formData]);

  const handleNext = useCallback(() => {
    if (validateStep()) {
      if (step < steps.length) {
        setStep(step + 1);
      }
    }
  }, [step, steps.length, validateStep]);

  const handlePrev = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      const finalData = {
        userType,
        role: userType,
        ...formData,
        birthdate: new Date(formData.birthdate).toISOString().split("T")[0],
      };

      console.log("Registration Data:", finalData);
      alert(
        "Registration successful! Please check your email for verification."
      );
    }
  };

  const renderStep = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <Step1
            userType={userType}
            setUserType={handleUserTypeSelect}
            error={errors.userType}
          />
        );
      case 2:
        return (
          <Step2
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <Step4
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        );
      default:
        return null;
    }
  }, [
    step,
    userType,
    formData,
    errors,
    showPassword,
    handleChange,
    handleUserTypeSelect,
  ]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-3 md:p-4 space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg md:max-w-2xl bg-white/90 md:bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm md:shadow-md rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8"
      >
        {/* Progress Steps */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 space-y-2 md:space-y-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Create Account
            </h2>
            <span className="text-xs md:text-sm text-gray-500">
              Step {step} of {steps.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mb-4 md:mb-6">
            <motion.div
              className="bg-blue-600 h-1.5 md:h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-1 md:flex md:justify-between mb-6 md:mb-8">
            {steps.map((s) => {
              const Icon = s.icon;
              const isCompleted = s.number < step;
              const isCurrent = s.number === step;

              return (
                <div
                  key={s.number}
                  className={`flex flex-col items-center ${
                    s.number <= step ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <motion.div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1 md:mb-2 ${
                      isCurrent
                        ? "bg-blue-600 text-white border-2 border-blue-600"
                        : isCompleted
                        ? "bg-green-100 text-green-600 border-2 border-green-500"
                        : "bg-gray-100 border-2 border-gray-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                    ) : (
                      <Icon className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                  </motion.div>
                  <span className="text-[10px] md:text-xs font-medium whitespace-nowrap text-center">
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form>
          <div className="min-h-[300px] md:min-h-[350px] lg:min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep}
              </motion.div>
            </AnimatePresence>
          </div>
        </form>
      </motion.div>

      {/* Navigation Buttons - Responsive */}
      <div className="flex justify-between w-full max-w-lg md:max-w-2xl px-2 md:px-0">
        <button
          type="button"
          onClick={handlePrev}
          className={`flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-medium transition text-sm md:text-base ${
            step === 1
              ? "opacity-0 cursor-default"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }`}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {step < 4 ? (
          <motion.button
            type="button"
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg text-sm md:text-base"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 md:gap-2 bg-green-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium hover:bg-green-700 transition shadow-lg text-sm md:text-base"
          >
            <span className="hidden sm:inline">Complete</span>
            <span className="sm:hidden">Finish</span>
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Register;
