import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();

  const adminMenu = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Properties Overview', href: '/admin/properties', icon: Building2 },
    { name: 'System Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const landlordMenu = [
    { name: 'Dashboard', href: '/landlord/dashboard', icon: Home },
    { name: 'Properties', href: '/landlord/properties', icon: Building2 },
    { name: 'Tenants', href: '/landlord/tenants', icon: Users },
    { name: 'Leases', href: '/landlord/leases', icon: FileText },
    { name: 'Payments', href: '/landlord/payments', icon: CreditCard },
  ];

  const tenantMenu = [
    { name: 'Dashboard', href: '/tenant/dashboard', icon: Home },
    { name: 'My Lease', href: '/tenant/lease', icon: FileText },
    { name: 'Payment History', href: '/tenant/payments', icon: CreditCard },
  ];

  const menuItems = user?.role === 'Admin' ? adminMenu : 
                   user?.role === 'Landlord' ? landlordMenu : tenantMenu;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Havenly
            </span>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-danger-600 hover:bg-danger-50 transition-colors duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;