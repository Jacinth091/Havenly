import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { userLogin } from "../api/auth.api";
import { useAuth } from "../context/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = { email, password };
      const response = await userLogin(formData);
      if (response !== false) console.log("response", response);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-8"
      >
        {/* LOGO */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* REMEMBER ME */}
          <div className="flex items-center justify-between">
            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Forgot Password */}
            <Link
              to="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-800 transition font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* SUBMIT */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
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
        <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create Account
            </a>
          </p>

          <p className="text-[11px] text-gray-400">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-blue-500">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-500">
              Privacy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
