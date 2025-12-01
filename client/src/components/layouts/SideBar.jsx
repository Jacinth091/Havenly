import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const adminMenu = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Properties", href: "/admin/properties", icon: Building2 },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const landlordMenu = [
    { name: "Dashboard", href: "/landlord/dashboard", icon: Home },
    { name: "Properties", href: "/landlord/properties", icon: Building2 },
    { name: "Tenants", href: "/landlord/tenants", icon: Users },
    { name: "Leases", href: "/landlord/leases", icon: FileText },
    { name: "Payments", href: "/landlord/payments", icon: CreditCard },
    { name: "Settings", href: "/landlord/settings", icon: Settings },
  ];

  const tenantMenu = [
    { name: "Dashboard", href: "/tenant/dashboard", icon: Home },
    { name: "My Lease", href: "/tenant/lease", icon: FileText },
    { name: "Payments", href: "/tenant/payments", icon: CreditCard },
    { name: "Requests", href: "/tenant/requests", icon: Bell },
    { name: "Settings", href: "/tenant/settings", icon: Settings },
  ];

  // const menuItems =
  //   user?.role === "Admin"
  //     ? adminMenu
  //     : user?.role === "Landlord"
  //     ? landlordMenu
  //     : adminMenu;
  const menuItems = adminMenu;

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Havenly</h1>
              <p className="text-xs text-gray-500">Rental Management</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300
          lg:translate-x-0 lg:static lg:inset-0
          ${mobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
          lg:flex lg:flex-col lg:h-screen
        `}
      >
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Havenly</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-sm font-bold text-blue-600">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  <span className="ml-3">{item.name}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Support Link */}
          <a
            href="/help"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
            <span className="ml-3">Help & Support</span>
          </a>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
