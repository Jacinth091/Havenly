import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Refs
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !sidebarRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  // --- HANDLERS ---

  // 1. Handle Sidebar Global Click (Expand if collapsed)
  const handleSidebarClick = () => {
    if (collapsed) {
      setCollapsed(false);
    }
  };

  // 2. Handle Toggle Button (Stop propagation to prevent immediate re-expansion)
  const handleToggleClick = (e) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  // 3. Handle User Profile Click (Smart Expand)
  const handleUserClick = (e) => {
    e.stopPropagation(); // Prevent double triggering from sidebar click

    if (collapsed) {
      setCollapsed(false); // Expand sidebar
      setUserDropdownOpen(true); // Open dropdown immediately
    } else {
      setUserDropdownOpen(!userDropdownOpen); // Normal toggle
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Menu Definitions
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
    user?.role === "Admin"
      ? adminMenu
      : user?.role === "Landlord"
      ? landlordMenu
      : tenantMenu;

  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent sidebar expansion logic when clicking a link (optional, but cleaner)
          handleNavigation(item.href);
        }}
        className={`
          group relative flex items-center w-full h-11 mb-1 rounded-lg transition-all duration-200
          ${collapsed ? "justify-center px-0" : "px-3 space-x-3"}
          ${
            isActive
              ? "bg-emerald-50 text-emerald-600"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        <Icon
          size={20}
          className={`shrink-0 transition-colors ${
            isActive
              ? "text-emerald-600"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        />

        {!collapsed && (
          <span className="text-sm font-medium truncate whitespace-nowrap">
            {item.name}
          </span>
        )}

        {isActive && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
        )}

        {/* Tooltip for Collapsed State */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-lg">
            {item.name}
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Header Overlay */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            H
          </div>
          <span className="font-bold text-slate-800">Havenly</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        ref={sidebarRef}
        onClick={handleSidebarClick} // CLICK TO EXPAND
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out cursor-default
          ${collapsed ? "w-20 hover:bg-slate-50/50 cursor-pointer" : "w-64"} 
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          pt-16 lg:pt-0 overflow-x-hidden
        `}
      >
        {/* Desktop Header Toggle */}
        <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b border-slate-100 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                H
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight truncate">
                Havenly
              </span>
            </div>
          )}
          <button
            onClick={handleToggleClick} // STOP PROPAGATION HERE
            className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ${
              collapsed ? "mx-auto" : "ml-auto"
            }`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <p
            className={`px-3 text-xs font-bold text-slate-400 uppercase mb-2 truncate ${
              collapsed ? "text-center" : ""
            }`}
          >
            {collapsed ? "Menu" : "Main Menu"}
          </p>
          {menuItems.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </div>

        {/* User Profile Section with Hover Dropdown */}
        <div
          className="border-t border-slate-100 p-3 relative"
          onMouseEnter={() => setUserDropdownOpen(true)}
          onMouseLeave={() => setUserDropdownOpen(false)}
        >
          <button
            onClick={handleUserClick} // SMART EXPAND HERE
            className={`
                flex items-center w-full p-2 rounded-xl hover:bg-slate-50 transition-colors group
                ${collapsed ? "justify-center" : "gap-3"}
                ${userDropdownOpen ? "bg-slate-50 ring-1 ring-slate-200" : ""}
              `}
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>

            {!collapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.role || "Guest"}
                </p>
              </div>
            )}
          </button>

          {/* User Dropdown Popup */}
          <div
            ref={dropdownRef}
            className={`
                  absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100]
                  transition-all duration-200 origin-bottom-left
                  ${
                    userDropdownOpen
                      ? "opacity-100 scale-100 visible"
                      : "opacity-0 scale-95 invisible"
                  }
                  ${
                    collapsed ? "left-full ml-2 w-56 bottom-0" : "w-full left-0"
                  } 
                `}
            style={{ minWidth: collapsed ? "14rem" : "100%" }}
          >
            <div className="bg-slate-50 p-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${user?.role.toLowerCase()}/profile`);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
              >
                <User size={16} /> My Profile
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${user?.role.toLowerCase()}/settings`);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
              >
                <Settings size={16} /> Settings
              </button>
              <div className="my-1 border-t border-slate-100"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                  navigate("/login");
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Padding Adjuster */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        } pt-16 lg:pt-0`}
      >
        {/* Routes render here */}
      </div>
    </>
  );
};

export default Sidebar;
