import {
  Bell,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Home,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  Search,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const HavenlyDashboard = () => {
  const [currentRole, setCurrentRole] = useState("admin");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedView, setSelectedView] = useState("dashboard");

  // Mock data
  const mockData = {
    admin: {
      stats: {
        totalUsers: 2847,
        activeLeases: 456,
        activeProperties: 2391,
        deactivated: 23,
      },
      users: [
        {
          id: 1,
          username: "john_doe",
          email: "john@example.com",
          role: "Landlord",
          status: "Active",
        },
        {
          id: 2,
          username: "sarah_smith",
          email: "sarah@example.com",
          role: "Tenant",
          status: "Active",
        },
        {
          id: 3,
          username: "mike_johnson",
          email: "mike@example.com",
          role: "Landlord",
          status: "Inactive",
        },
      ],
      recentActivity: [
        {
          action: "New user registered",
          user: "emma.wilson@mail.com",
          time: "2 minutes ago",
        },
        {
          action: "Property updated",
          user: "john_doe",
          time: "15 minutes ago",
        },
        {
          action: "Payment processed",
          user: "sarah_smith",
          time: "1 hour ago",
        },
      ],
    },
    landlord: {
      stats: {
        totalProperties: 12,
        totalRooms: 48,
        occupiedRooms: 36,
        monthlyRevenue: 45600,
      },
      properties: [
        {
          id: 1,
          name: "Sunset Apartments",
          address: "123 Main St",
          rooms: 12,
          occupied: 10,
        },
        {
          id: 2,
          name: "Green Villa",
          address: "456 Oak Ave",
          rooms: 8,
          occupied: 6,
        },
        {
          id: 3,
          name: "Downtown Suites",
          address: "789 Center Blvd",
          rooms: 16,
          occupied: 14,
        },
      ],
      recentTenants: [
        {
          name: "Emma Wilson",
          room: "A-101",
          rent: 1200,
          status: "Paid",
          date: "2024-11-01",
        },
        {
          name: "James Brown",
          room: "B-205",
          rent: 1500,
          status: "Pending",
          date: "2024-11-01",
        },
      ],
    },
    tenant: {
      lease: {
        property: "Sunset Apartments",
        room: "A-101",
        startDate: "2024-06-01",
        endDate: "2025-05-31",
        monthlyRent: 1200,
        status: "Active",
      },
      payments: [
        {
          month: "November 2024",
          amount: 1200,
          date: "2024-11-01",
          status: "Paid",
        },
        {
          month: "October 2024",
          amount: 1200,
          date: "2024-10-01",
          status: "Paid",
        },
        {
          month: "September 2024",
          amount: 1200,
          date: "2024-09-01",
          status: "Paid",
        },
      ],
      landlordInfo: {
        name: "John Doe",
        email: "john.doe@havenly.com",
        phone: "+1 (555) 123-4567",
      },
    },
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${
              change > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 inline" />
            ) : (
              <TrendingDown className="w-4 h-4 inline" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </h3>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={mockData.admin.stats.totalUsers}
          change={12}
          color="bg-blue-500"
        />
        <StatCard
          icon={FileText}
          label="Active Leases"
          value={mockData.admin.stats.activeLeases}
          change={5}
          color="bg-green-500"
        />
        <StatCard
          icon={Building2}
          label="Active Properties"
          value={mockData.admin.stats.activeProperties}
          change={8}
          color="bg-purple-500"
        />
        <StatCard
          icon={Users}
          label="Deactivated"
          value={mockData.admin.stats.deactivated}
          change={-3}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockData.admin.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "Landlord"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {mockData.admin.recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-600">{activity.user}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const LandlordDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Total Properties"
          value={mockData.landlord.stats.totalProperties}
          change={0}
          color="bg-blue-500"
        />
        <StatCard
          icon={Home}
          label="Total Rooms"
          value={mockData.landlord.stats.totalRooms}
          change={4}
          color="bg-green-500"
        />
        <StatCard
          icon={Users}
          label="Occupied Rooms"
          value={mockData.landlord.stats.occupiedRooms}
          change={7}
          color="bg-purple-500"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={mockData.landlord.stats.monthlyRevenue}
          change={12}
          color="bg-yellow-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockData.landlord.properties.map((property) => (
            <div
              key={property.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{property.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {property.address}
                  </p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Total Rooms</p>
                  <p className="text-lg font-bold text-gray-900">
                    {property.rooms}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Occupied</p>
                  <p className="text-lg font-bold text-green-600">
                    {property.occupied}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-lg font-bold text-blue-600">
                    {property.rooms - property.occupied}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Payments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tenant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Room
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockData.landlord.recentTenants.map((tenant, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {tenant.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {tenant.room}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ${tenant.rent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {tenant.date}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tenant.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const TenantDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            My Lease Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Property</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockData.tenant.lease.property}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Room Number</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockData.tenant.lease.room}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
              <p className="text-lg font-semibold text-green-600">
                ${mockData.tenant.lease.monthlyRent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Lease Status</p>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                {mockData.tenant.lease.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="text-base text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {mockData.tenant.lease.startDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">End Date</p>
              <p className="text-base text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {mockData.tenant.lease.endDate}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Landlord Contact
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Name</p>
              <p className="text-base font-medium text-gray-900">
                {mockData.tenant.landlordInfo.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-base text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {mockData.tenant.landlordInfo.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-base text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {mockData.tenant.landlordInfo.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Payment History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockData.tenant.payments.map((payment, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {payment.month}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {payment.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (currentRole) {
      case "admin":
        return <AdminDashboard />;
      case "landlord":
        return <LandlordDashboard />;
      case "tenant":
        return <TenantDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-xl text-gray-900">Havenly</span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setSelectedView("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              selectedView === "dashboard"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {currentRole === "admin" && (
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5" />
              {sidebarOpen && <span>Users</span>}
            </button>
          )}

          {currentRole === "landlord" && (
            <>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Building2 className="w-5 h-5" />
                {sidebarOpen && <span>Properties</span>}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Users className="w-5 h-5" />
                {sidebarOpen && <span>Tenants</span>}
              </button>
            </>
          )}

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>Leases</span>}
          </button>

          {currentRole !== "tenant" && (
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <DollarSign className="w-5 h-5" />
              {sidebarOpen && <span>Transactions</span>}
            </button>
          )}

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentRole === "admin"
                  ? "Admin Dashboard"
                  : currentRole === "landlord"
                  ? "Landlord Dashboard"
                  : "Tenant Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentRole === "admin"
                      ? "Admin User"
                      : currentRole === "landlord"
                      ? "John Doe"
                      : "Emma Wilson"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {currentRole}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentRole === "admin"
                    ? "A"
                    : currentRole === "landlord"
                    ? "JD"
                    : "EW"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderDashboard()}

          {/* Role Switcher for Demo */}
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2">Switch Role (Demo)</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentRole("admin")}
                className={`px-3 py-1 text-xs rounded ${
                  currentRole === "admin"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setCurrentRole("landlord")}
                className={`px-3 py-1 text-xs rounded ${
                  currentRole === "landlord"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Landlord
              </button>
              <button
                onClick={() => setCurrentRole("tenant")}
                className={`px-3 py-1 text-xs rounded ${
                  currentRole === "tenant"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Tenant
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HavenlyDashboard;
