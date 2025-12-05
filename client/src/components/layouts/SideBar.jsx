import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

// --- PLACEHOLDER ICONS (Replacing lucide-react) ---
const Home = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const FileText = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const CreditCard = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const User = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const Settings = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 0-2 0l-.15-.08a2 2 0 0 0-2.73 2.73l.09.15a2 2 0 0 0 0 2l-.25.43a2 2 0 0 1-1.73 1h-.18a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2h.18a2 2 0 0 1 1.73 1l.25.43a2 2 0 0 0 0 2l-.09.15a2 2 0 0 0 2.73 2.73l.15-.08a2 2 0 0 0 2 0l.43-.25a2 2 0 0 1 1-1.73v-.18a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2h-.18a2 2 0 0 1-1.73-1l-.25-.43a2 2 0 0 0 0-2l.09-.15a2 2 0 0 0-2.73-2.73l-.15.08a2 2 0 0 0 2 0l.43.25a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 2v-.44a2 2 0 0 0-2-2h-.18a2 2 0 0 1-1.73-1l-.25-.43a2 2 0 0 0 0-2l.09-.15a2 2 0 0 0-2.73-2.73l.15.08a2 2 0 0 0 2 0l.43.25a2 2 0 0 1 1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const LogOut = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const Menu = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);
const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ChevronLeft = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronDown = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const Building2 = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 22V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
    <path d="M3 22h18" />
    <path d="M10 10v4" />
    <path d="M14 10v4" />
    <path d="M10 18v4" />
    <path d="M14 18v4" />
    <path d="M6 4h.01" />
    <path d="M18 4h.01" />
    <path d="M14 2h-4" />
  </svg>
);
const Users = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const BarChart3 = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);
const Bell = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminMenu = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Properties", href: "/admin/properties", icon: Building2 },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const landlordMenu = [
    { name: "Dashboard", href: "/landlord/dashboard", icon: Home },
    { name: "Properties", href: "/landlord/properties", icon: Building2 },
    { name: "Tenants", href: "/landlord/tenants", icon: Users },
    { name: "Leases", href: "/landlord/leases", icon: FileText },
    { name: "Payments", href: "/landlord/payments", icon: CreditCard },
  ];

  const tenantMenu = [
    { name: "Dashboard", href: "/tenant/dashboard", icon: Home },
    { name: "My Lease", href: "/tenant/lease", icon: FileText },
    { name: "Payments", href: "/tenant/payments", icon: CreditCard },
  ];

  const menuItems =
    user?.role.toLowerCase() === "admin"
      ? adminMenu
      : user?.role.toLowerCase() === "landlord"
      ? landlordMenu
      : tenantMenu;

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUserToggle = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <button
        onClick={() => handleNavigation(item.href)}
        title={collapsed ? item.name : ""}
        className={`
          group relative flex items-center h-11 rounded-lg
          transition-all duration-200 overflow-hidden w-full
          ${collapsed ? "justify-center px-0" : "px-3 space-x-3"}
          ${
            active
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }
        `}
      >
        <Icon
          className={`
            flex-shrink-0 transition-all
            ${collapsed ? "w-6 h-6" : "w-5 h-5"}
            ${
              active
                ? "text-blue-600"
                : "text-gray-500 group-hover:text-gray-700"
            }
          `}
        />

        {!collapsed && (
          <span className="text-sm flex-1 truncate overflow-hidden text-left">
            {item.name}
          </span>
        )}

        {active && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
        )}

        {collapsed && (
          <div className="absolute left-full ml-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-300 z-50 shadow-md">
            {item.name}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 px-4 shadow-sm">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Havenly</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 w-64 pt-16 lg:pt-0
          flex flex-col
        `}
      >
        {/* Desktop Header with Collapse Button */}
        <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">Havenly</h1>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              p-1.5 rounded-full hover:bg-gray-200 transition-colors border border-gray-300
              ${collapsed ? "mx-auto" : ""}
            `}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </nav>

        {/* User Profile with Dropdown - FIXED COMPACT VERSION */}
        <div
          className="border-t border-gray-200 p-2 flex-shrink-0 relative"
          ref={userDropdownRef}
        >
          {/* Main User Button - COMPACT */}
          <button
            onClick={handleUserToggle}
            title={collapsed && !userDropdownOpen ? "Account" : ""}
            className={`
              group relative w-full flex items-center rounded-lg
              hover:bg-gray-100 transition-colors
              ${userDropdownOpen ? "bg-gray-100" : ""}
              ${collapsed ? "justify-center p-2" : "p-3 space-x-3"}
            `}
          >
            {/* User Avatar - COMPACT */}
            <div
              className={`
                ${
                  collapsed
                    ? "w-7 h-7 bg-gray-200"
                    : "w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600"
                }
                rounded-full flex items-center justify-center 
                ${collapsed ? "" : "text-white font-semibold shadow-md"}
                flex-shrink-0
              `}
            >
              {collapsed ? (
                <User className="w-4 h-4 text-gray-600" />
              ) : (
                <span className="text-sm">{user?.name?.charAt(0) || "U"}</span>
              )}
            </div>

            {/* User Info (Hidden when collapsed) */}
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}

            {/* Tooltip for collapsed (but not open) state */}
            {collapsed && !userDropdownOpen && (
              <div className="absolute left-full ml-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-300 z-50 shadow-md">
                Account
              </div>
            )}
          </button>

          {/* User Dropdown Content - POSITION FIXED */}
          {userDropdownOpen && (
            <div
              className={`
                absolute bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999]
                transition-all duration-200 overflow-hidden
                ${
                  collapsed
                    ? "left-full ml-3 bottom-0 min-w-[220px]"
                    : "left-1/2 -translate-x-1/2 bottom-full mb-3 min-w-[240px]"
                }
              `}
            >
              <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    handleNavigation(`/${user?.role.toLowerCase()}/profile`);
                    setUserDropdownOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    View Profile
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleNavigation(`/${user?.role.toLowerCase()}/settings`);
                    setUserDropdownOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Settings
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600 border-t border-gray-100 rounded-b-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div
        className={`
          pt-16 lg:pt-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          transition-all duration-300 flex-shrink-0
        `}
      />
    </div>
  );
};

export default Sidebar;
