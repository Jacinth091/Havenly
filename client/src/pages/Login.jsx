import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-8 relative"
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

        {/* LOGO AREA */}
        <div className="text-center mb-8 pt-4">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage your rentals
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* REMEMBER ME & FORGOT PASSWORD */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="remember-me" className="text-sm text-slate-700">
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-xs text-emerald-600 hover:text-emerald-800 transition font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* SUBMIT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-6 pt-6 border-t border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Create Account
            </Link>
          </p>

          <p className="text-[11px] text-slate-400">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-emerald-500 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-emerald-500 hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
