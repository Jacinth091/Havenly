import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import RecentActivity from "../../components/dashboard/RecentActivity";
import StatCard from "../../components/dashboard/StatCard";

function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      title: "Properties",
      value: "89",
      change: "+5%",
      trend: "up",
      icon: Building2,
      color: "green",
    },
    {
      title: "Monthly Revenue",
      value: "$45,678",
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "purple",
    },
    {
      title: "Occupancy Rate",
      value: "87%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  const activities = [
    {
      id: 1,
      type: "user",
      message: "New landlord registered - John Doe",
      time: "5 minutes ago",
      icon: Users,
      status: "success",
    },
    {
      id: 2,
      type: "property",
      message: "New property added - Sunset Apartments",
      time: "1 hour ago",
      icon: Building2,
      status: "success",
    },
    {
      id: 3,
      type: "alert",
      message: "Payment overdue - Unit 4B",
      time: "2 hours ago",
      icon: AlertCircle,
      status: "warning",
    },
    {
      id: 4,
      type: "system",
      message: "System backup completed",
      time: "5 hours ago",
      icon: CheckCircle2,
      status: "success",
    },
  ];

  const systemUsers = [
    {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      role: "Landlord",
      status: "Active",
      joined: "2024-01-15",
    },
    {
      id: 2,
      username: "sarah_smith",
      email: "sarah@example.com",
      role: "Tenant",
      status: "Active",
      joined: "2024-02-20",
    },
    {
      id: 3,
      username: "mike_johnson",
      email: "mike@example.com",
      role: "Landlord",
      status: "Inactive",
      joined: "2024-03-10",
    },
    {
      id: 4,
      username: "emma_wilson",
      email: "emma@example.com",
      role: "Tenant",
      status: "Active",
      joined: "2024-04-05",
    },
  ];

  const recentTasks = [
    {
      id: 1,
      task: "Review pending landlord applications",
      priority: "high",
      due: "Today",
    },
    {
      id: 2,
      task: "Update system security patches",
      priority: "medium",
      due: "Tomorrow",
    },
    {
      id: 3,
      task: "Generate monthly financial report",
      priority: "medium",
      due: "Dec 15",
    },
    {
      id: 4,
      task: "Audit user permissions",
      priority: "low",
      due: "Next week",
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                System overview and administration
              </p>
            </div>
          </div>

          {/* Date and Time Display */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* System Status Badge */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            System Online
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Recent Activity & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity activities={activities} />

          {/* User Management Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage system users and permissions
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Users className="w-4 h-4" />
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
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {systemUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
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
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.joined}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* System Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              System Overview
            </h3>

            <div className="space-y-4">
              {[
                {
                  label: "System Status",
                  value: "Operational",
                  status: "success",
                },
                { label: "Database", value: "Healthy", status: "success" },
                { label: "Active Sessions", value: "47", status: "info" },
                { label: "Uptime", value: "99.9%", status: "success" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      item.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Server Load */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Server Load
                </span>
                <span className="text-sm font-bold text-gray-900">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                  style={{ width: "42%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Tasks
            </h3>

            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {task.task}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {task.due}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              View All Tasks →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
