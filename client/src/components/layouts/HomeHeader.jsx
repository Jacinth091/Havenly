import { Home, Key, LogIn, Menu, Shield, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    {
      name: "Features",
      href: "/features",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      name: "For Landlords",
      href: "/landlords",
      icon: <Key className="w-5 h-5" />,
    },
    {
      name: "For Tenants",
      href: "/tenants",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>

            <Link
              to="/register"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Get Started
            </Link>

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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                    isActive(link.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}

              <div className="pt-3 border-t border-gray-200">
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
