import { motion } from "framer-motion";
import { Key, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

function AuthLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header (Matching HomeHeader Style) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Key className="w-4 h-4 text-white" />
              </div>
              <div className="leading-none">
                <span className="block text-lg font-bold text-slate-900 tracking-tight">
                  Havenly
                </span>
              </div>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {!isLogin && (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {!isRegister && (
                <Link
                  to="/register"
                  className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-sm shadow-emerald-200"
                >
                  {isLogin ? "Create Account" : "Get Started"}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 animate-slide-down">
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isLogin
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isRegister
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Create Account</span>
                </Link>

                <div className="h-px bg-slate-100 my-2"></div>

                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Centered Auth Page Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl" // Standard width for auth forms
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            © 2025 Havenly - Information Management Database System Project.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
