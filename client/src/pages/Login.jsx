import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputField } from "../components/input/InputField"; // Reusing your existing component
import { showToast } from "../components/toast/Toast";
import { useAuth } from "../context/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = { email, password };
      const result = await login(formData);

      if (!result?.success) {
        showToast(result?.message, "error");
        setIsLoading(false);
        return;
      } else {
        showToast(result?.message || "Login Successful!", "success");

        if (!result?.user?.role.toLowerCase()) {
          console.log("Role not found or invalid role!");
          return;
        }
        navigate(`/${result?.user?.role.toLowerCase()}/dashboard`, {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        // MATCHING CONTAINER: w-full max-w-md matches the fix provided for ForgotPassword
        className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative"
      >
        {/* TOP BAR: Back Link */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/"
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-full transition-all flex items-center gap-1"
            title="Back to Home"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="p-8 pt-10">
          {/* HEADER SECTION (Matches ForgotPassword aesthetics) */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4"
            >
              <LogIn size={24} />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* FORM SECTION */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleIcon={true}
              showPassword={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              required
            />

            {/* REMEMBER & FORGOT */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm text-slate-600 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* FOOTER BAR (Matches the style of the other pages) */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Create Account
            </Link>
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
            <Link
              to="/terms"
              className="hover:text-slate-600 transition-colors"
            >
              Terms
            </Link>
            <span>•</span>
            <Link
              to="/privacy"
              className="hover:text-slate-600 transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
