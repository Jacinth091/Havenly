import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Step 1: Email Input
const Step1 = ({ email, setEmail, error }) => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex justify-center mb-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center"
      >
        <Mail className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
      </motion.div>
    </div>

    <h3 className="text-lg md:text-xl font-semibold text-slate-800 text-center">
      Forgot Your Password?
    </h3>

    <p className="text-slate-500 text-center text-sm md:text-base">
      Enter your email address and we'll send you a verification code to reset
      your password.
    </p>

    <div className="space-y-4">
      <div>
        <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1 md:mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition text-sm md:text-base ${
              error ? "border-red-300" : "border-slate-300"
            }`}
            placeholder="you@example.com"
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>

    <div className="bg-slate-50 rounded-lg p-3 md:p-4 border border-slate-200">
      <div className="flex items-start space-x-2 md:space-x-3">
        <div className="flex-shrink-0">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-slate-600 mt-0.5" />
        </div>
        <div>
          <p className="text-xs md:text-sm text-slate-600">
            Make sure to enter the email address associated with your Havenly
            account.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Step 2: Verification Code
const Step2 = ({ code, setCode, error, timer, resendCode, isLoading }) => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex justify-center mb-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center"
      >
        <Shield className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
      </motion.div>
    </div>

    <h3 className="text-lg md:text-xl font-semibold text-slate-800 text-center">
      Check Your Email
    </h3>

    <p className="text-slate-500 text-center text-sm md:text-base">
      We've sent a 6-digit verification code to your email address. Enter it
      below to continue.
    </p>

    <div className="space-y-4">
      <div>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={code[index] || ""}
              onChange={(e) => {
                const newCode = [...code];
                newCode[index] = e.target.value.replace(/[^0-9]/g, "");
                setCode(newCode);

                if (e.target.value && index < 5) {
                  document.getElementById(`code-input-${index + 1}`)?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[index] && index > 0) {
                  document.getElementById(`code-input-${index - 1}`)?.focus();
                }
              }}
              id={`code-input-${index}`}
              className={`w-10 h-10 md:w-12 md:h-12 text-center text-lg md:text-xl font-semibold border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
                error ? "border-red-300" : "border-slate-300"
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="text-red-500 text-xs text-center mt-2">{error}</p>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs md:text-sm text-slate-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={resendCode}
            disabled={timer > 0 || isLoading}
            className={`font-medium ${
              timer > 0 || isLoading
                ? "text-slate-400 cursor-not-allowed"
                : "text-emerald-600 hover:text-emerald-800"
            }`}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
          </button>
        </p>
      </div>
    </div>

    <div className="bg-emerald-50 rounded-lg p-3 md:p-4 border border-emerald-100">
      <div className="flex items-start space-x-2 md:space-x-3">
        <div className="flex-shrink-0">
          <Info className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
        </div>
        <div>
          <p className="text-xs md:text-sm text-emerald-800">
            For security reasons, this code will expire in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Step 3: New Password
const Step3 = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  showPassword,
  setShowPassword,
}) => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex justify-center mb-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center"
      >
        <Lock className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
      </motion.div>
    </div>

    <h3 className="text-lg md:text-xl font-semibold text-slate-800 text-center">
      Create New Password
    </h3>

    <p className="text-slate-500 text-center text-sm md:text-base">
      Your new password must be different from previously used passwords.
    </p>

    <div className="space-y-4">
      <div>
        <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1 md:mb-2">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full pl-9 pr-10 md:pl-10 md:pr-12 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition text-sm md:text-base ${
              error?.password ? "border-red-300" : "border-slate-300"
            }`}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Eye className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        </div>
        {error?.password && (
          <p className="text-red-500 text-xs mt-1">{error.password}</p>
        )}
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1 md:mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition text-sm md:text-base ${
              error?.confirm ? "border-red-300" : "border-slate-300"
            }`}
            placeholder="Confirm new password"
          />
        </div>
        {error?.confirm && (
          <p className="text-red-500 text-xs mt-1">{error.confirm}</p>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-3 md:p-4 border border-slate-200">
        <h4 className="font-semibold text-slate-800 text-sm md:text-base mb-1 md:mb-2">
          Password Requirements:
        </h4>
        <ul className="text-xs md:text-sm text-slate-600 space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle
              className={`w-3 h-3 md:w-4 md:h-4 ${
                newPassword.length >= 8 ? "text-emerald-500" : "text-slate-300"
              }`}
            />
            At least 8 characters long
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle
              className={`w-3 h-3 md:w-4 md:h-4 ${
                /[A-Z]/.test(newPassword)
                  ? "text-emerald-500"
                  : "text-slate-300"
              }`}
            />
            Contains uppercase letter
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle
              className={`w-3 h-3 md:w-4 md:h-4 ${
                /[0-9]/.test(newPassword)
                  ? "text-emerald-500"
                  : "text-slate-300"
              }`}
            />
            Contains number
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle
              className={`w-3 h-3 md:w-4 md:h-4 ${
                /[^A-Za-z0-9]/.test(newPassword)
                  ? "text-emerald-500"
                  : "text-slate-300"
              }`}
            />
            Contains special character
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// Step 4: Success
const Step4 = ({ email, onComplete }) => (
  <div className="space-y-4 md:space-y-6 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="flex justify-center mb-4"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
      </div>
    </motion.div>

    <h3 className="text-lg md:text-xl font-semibold text-slate-800">
      Password Reset Successful!
    </h3>

    <p className="text-slate-500 text-sm md:text-base">
      Your password has been successfully reset. You can now log in with your
      new password.
    </p>

    <div className="bg-emerald-50 rounded-lg p-3 md:p-4 border border-emerald-100">
      <div className="flex items-start space-x-2 md:space-x-3">
        <div className="flex-shrink-0">
          <Mail className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
        </div>
        <div>
          <p className="text-xs md:text-sm text-emerald-800">
            An email confirmation has been sent to{" "}
            <span className="font-semibold">{email}</span>.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Main Forgot Password Component
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const steps = useMemo(
    () => [
      { number: 1, title: "Enter Email", icon: Mail },
      { number: 2, title: "Verify Code", icon: Shield },
      { number: 3, title: "New Password", icon: Lock },
      { number: 4, title: "Success", icon: CheckCircle },
    ],
    []
  );

  // Timer for resend code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const startTimer = useCallback(() => {
    setTimer(30);
  }, []);

  const resendCode = useCallback(() => {
    if (timer === 0 && !isLoading) {
      startTimer();
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setErrors({});
      }, 1000);
    }
  }, [timer, isLoading, startTimer]);

  const validateStep1 = useCallback(() => {
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }
    setErrors({});
    return true;
  }, [email]);

  const validateStep2 = useCallback(() => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setErrors({ code: "Please enter the 6-digit code" });
      return false;
    }
    if (fullCode !== "123456") {
      // Demo only
      setErrors({ code: "Invalid verification code" });
      return false;
    }
    setErrors({});
    return true;
  }, [code]);

  const validateStep3 = useCallback(() => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.password = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.password = "Password must contain a number";
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      newErrors.password = "Password must contain a special character";
    }

    if (!confirmPassword) {
      newErrors.confirm = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newPassword, confirmPassword]);

  const handleNext = useCallback(() => {
    let isValid = false;

    if (step === 1) isValid = validateStep1();
    else if (step === 2) isValid = validateStep2();
    else if (step === 3) isValid = validateStep3();

    if (isValid && step < 4) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        if (step === 1) startTimer();
        setStep(step + 1);
      }, 1000);
    }
  }, [step, validateStep1, validateStep2, validateStep3, startTimer]);

  const handlePrev = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  }, [step]);

  const handleComplete = useCallback(() => {
    window.location.href = "/login";
  }, []);

  const renderStep = useMemo(() => {
    switch (step) {
      case 1:
        return <Step1 email={email} setEmail={setEmail} error={errors.email} />;
      case 2:
        return (
          <Step2
            code={code}
            setCode={setCode}
            error={errors.code}
            timer={timer}
            resendCode={resendCode}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <Step3
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            error={errors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        );
      case 4:
        return <Step4 email={email} onComplete={handleComplete} />;
      default:
        return null;
    }
  }, [
    step,
    email,
    code,
    newPassword,
    confirmPassword,
    errors,
    timer,
    showPassword,
    resendCode,
    isLoading,
    handleComplete,
  ]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-3 md:p-4 space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg md:max-w-2xl bg-white/90 md:bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm md:shadow-md rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 relative"
      >
        {/* BACK TO HOME BUTTON */}
        <Link
          to="/"
          className="absolute top-6 left-6 p-2 flex items-center gap-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden md:inline text-sm font-medium">Back</span>
        </Link>

        {/* Progress Steps - Increased top padding (pt-12) to clear button on mobile */}
        <div className="mb-6 md:mb-8 pt-4 md:pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-4 space-y-2 md:space-y-0">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center md:text-left w-full md:w-auto">
              Reset Password
            </h2>
            <span className="text-xs md:text-sm text-slate-500 text-center md:text-right">
              Step {step} of {steps.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 md:h-2 mb-4 md:mb-6">
            <motion.div
              className="bg-emerald-600 h-1.5 md:h-2 rounded-full"
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
                    s.number <= step ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  <motion.div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1 md:mb-2 ${
                      isCurrent
                        ? "bg-emerald-600 text-white border-2 border-emerald-600"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-500"
                        : "bg-slate-100 border-2 border-slate-300"
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

        {/* Back to Login Link - Only show on first step */}
        {step === 1 && (
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs md:text-sm text-slate-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Back to Login
              </Link>
            </p>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons - Moved Outside Card Container */}
      {step < 4 ? (
        <div className="flex justify-between w-full max-w-lg md:max-w-2xl px-2 md:px-0">
          <button
            type="button"
            onClick={handlePrev}
            className={`flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-medium transition text-sm md:text-base ${
              step === 1
                ? "opacity-0 cursor-default"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
            disabled={step === 1 || isLoading}
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <motion.button
            type="button"
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className="flex items-center gap-1 md:gap-2 bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Processing...</span>
              </>
            ) : step === 3 ? (
              <>
                <span className="hidden sm:inline">Reset Password</span>
                <span className="sm:hidden">Reset</span>
                <Lock className="w-4 h-4 md:w-5 md:h-5" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </>
            )}
          </motion.button>
        </div>
      ) : (
        /* Success Step Button - Also Outside Card */
        <div className="flex justify-center w-full max-w-lg md:max-w-2xl">
          <motion.button
            type="button"
            onClick={handleComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition shadow-lg text-sm md:text-base w-full md:w-auto"
          >
            Return to Login
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
