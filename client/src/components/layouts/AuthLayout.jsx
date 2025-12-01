import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-gray-800 hover:text-blue-600 transition-colors"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block font-semibold text-sm">Havenly</span>
              <span className="block text-[11px] text-gray-500">
                Rental Management System
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Centered Auth Page */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-gray-600">
            © 2024 Havenly. Information Management Database Systems I
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/terms"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Privacy
            </Link>
            <Link
              to="/help"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
