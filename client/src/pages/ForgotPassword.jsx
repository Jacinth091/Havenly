import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Info,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputField } from "../components/input/InputField";

// --- STEP 1: EMAIL ENTRY ---
const Step1 = ({ email, setEmail, error }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4">
        <KeyRound size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Forgot Password?
      </h3>
      <p className="text-slate-500 text-sm">
        Enter your registered email to receive reset instructions
      </p>
    </div>

    <div className="w-full mx-auto">
      <InputField
        label="Email Address"
        icon={Mail}
        type="email"
        placeholder="name@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        autoFocus
      />
    </div>

    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
      <div className="shrink-0 text-blue-600 mt-0.5">
        <Info size={18} />
      </div>
      <div className="text-xs text-slate-600 leading-relaxed">
        <span className="font-bold text-slate-800 block mb-1">
          Verification
        </span>
        We will send a 6-digit secure code to verify your identity before
        resetting your credentials.
      </div>
    </div>
  </div>
);

// --- STEP 2: VERIFICATION CODE ---
const Step2 = ({ code, setCode, error, timer, resendCode, isLoading }) => (
  <div className="space-y-6 ">
    <div className="text-center mb-8">
      <div className="inline-flex p-3 rounded-full bg-purple-50 text-purple-600 mb-4">
        <ShieldCheck size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Verify Identity</h3>
      <p className="text-slate-500 text-sm">
        Enter the 6-digit code sent to your email
      </p>
    </div>

    <div className="space-y-6 ">
      <div className="flex gap-2 justify-center">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            id={`code-input-${index}`}
            type="text"
            maxLength="1"
            value={code[index] || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              const newCode = [...code];
              newCode[index] = val;
              setCode(newCode);
              if (val && index < 5)
                document.getElementById(`code-input-${index + 1}`)?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !code[index] && index > 0) {
                document.getElementById(`code-input-${index - 1}`)?.focus();
              }
            }}
            className={`w-10 h-12 md:w-12 md:h-14 text-center text-lg font-bold bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
              error
                ? "border-red-300 focus:border-red-500"
                : "border-slate-200 focus:border-emerald-500 hover:border-slate-300"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-xs font-medium text-center flex items-center justify-center gap-1">
          <Info size={12} /> {error}
        </p>
      )}

      <div className="text-center">
        <p className="text-xs text-slate-500">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={resendCode}
            disabled={timer > 0 || isLoading}
            className={`font-bold ${
              timer > 0 || isLoading
                ? "text-slate-400 cursor-not-allowed"
                : "text-emerald-600 hover:text-emerald-700"
            }`}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
          </button>
        </p>
      </div>
    </div>
  </div>
);

// --- STEP 3: NEW PASSWORD ---
const Step3 = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  showPassword,
  setShowPassword,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-600 mb-4">
        <Lock size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Secure Account</h3>
      <p className="text-slate-500 text-sm">Create a strong new password</p>
    </div>

    <div className="space-y-5">
      <InputField
        label="New Password"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        placeholder="••••••••"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={error?.password}
        toggleIcon={true}
        showPassword={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />
      <InputField
        label="Confirm New Password"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={error?.confirm}
      />

      {/* Reusing the "Data Privacy" box style from Register for Password Rules */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
        <div className="shrink-0 text-emerald-600 mt-0.5">
          <Info size={18} />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed space-y-1">
          <span className="font-bold text-slate-800 block mb-1">
            Requirements
          </span>
          <p>• At least 8 characters long</p>
          <p>• Must contain uppercase & number</p>
        </div>
      </div>
    </div>
  </div>
);

// --- STEP 4: SUCCESS ---
const Step4 = ({ email }) => (
  <div className="space-y-6 text-center py-8">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-4 ring-4 ring-emerald-50"
    >
      <CheckCircle size={48} />
    </motion.div>
    <div className="text-center mb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Password Reset!</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto">
        Your password has been updated successfully. You can now login with your
        new credentials.
      </p>
    </div>
    <div className="text-center mb-8"></div>
    <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 inline-flex items-center gap-3 text-left">
      <div className="shrink-0 text-slate-400">
        <Mail size={20} />
      </div>
      <div className="text-xs text-slate-600">
        Confirmation email sent to <br />
        <span className="font-bold text-slate-800">{email}</span>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
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
  const navigate = useNavigate();

  const steps = useMemo(
    () => [
      { number: 1, title: "Email" },
      { number: 2, title: "Verify" },
      { number: 3, title: "Reset" },
      { number: 4, title: "Success" },
    ],
    []
  );

  // --- Logic (Timer & Validation) ---
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const startTimer = useCallback(() => setTimer(30), []);

  const resendCode = useCallback(() => {
    if (timer === 0 && !isLoading) {
      startTimer();
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000); // Mock API delay
    }
  }, [timer, isLoading, startTimer]);

  const validateStep = useCallback(() => {
    const newErrors = {};
    if (step === 1) {
      if (!email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    }
    if (step === 2) {
      const fullCode = code.join("");
      if (fullCode.length !== 6) newErrors.code = "Enter the 6-digit code";
      else if (fullCode !== "123456")
        newErrors.code = "Invalid code (Try 123456)";
    }
    if (step === 3) {
      if (!newPassword) newErrors.password = "Password is required";
      else if (newPassword.length < 8) newErrors.password = "Min 8 characters";
      else if (!/[A-Z]/.test(newPassword))
        newErrors.password = "Needs uppercase";

      if (newPassword !== confirmPassword)
        newErrors.confirm = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, email, code, newPassword, confirmPassword]);

  const handleNext = () => {
    if (validateStep() && step < steps.length) {
      setIsLoading(true);
      setTimeout(() => {
        // Mock API Loading
        setIsLoading(false);
        if (step === 1) startTimer();
        setStep(step + 1);
      }, 600);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleComplete = () => {
    navigate("/login");
  };

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
        return <Step4 email={email} />;
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
    isLoading,
    resendCode,
  ]);

  return (
    <div className="bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <Link
            to="/login"
            className="text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Login
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

        {/* CONTENT BODY */}
        <div className="p-6 md:p-8 min-h-[480px] flex flex-col justify-center items-center ">
          <div className="relative overflow-hidden w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto" // Ensure full width
              >
                {renderStep}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER BAR (Matched from Register) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          {/* Show "Previous" only if not on Step 1 and not on Step 4 (Success) */}
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-lg text-sm font-bold transition-colors text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
            >
              Previous
            </button>
          ) : (
            <div /> /* Spacer to keep Next button to the right */
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:bg-emerald-400 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Processing..."
                : step === 3
                ? "Reset Password"
                : "Continue"}
              {!isLoading &&
                (step === 3 ? <Lock size={16} /> : <ArrowRight size={16} />)}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              Return to Login <ArrowRight size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
