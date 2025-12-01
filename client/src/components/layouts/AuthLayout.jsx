import { motion } from "framer-motion";
import { Key, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

function AuthLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isForgotPassword = location.pathname === "/forgot-password";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header (EXACT match to HomeHeader) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - EXACT same as HomeHeader */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-lg font-bold text-gray-900">
                  Havenly
                </span>
                <span className="block text-[11px] text-gray-500">
                  Rental Management System
                </span>
              </div>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {!isLogin && (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {!isRegister && (
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  {isLogin ? "Create Account" : "Get Started"}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
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

          {/* Mobile Navigation - EXACT same as HomeHeader */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/login"
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                    isLogin
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                    isRegister
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="font-medium">Create Account</span>
                </Link>

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="font-medium">Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Centered Auth Page */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl" // <-- increase max-width
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Simple White Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              © 2025 Havenly — Information Management Database Systems I
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
