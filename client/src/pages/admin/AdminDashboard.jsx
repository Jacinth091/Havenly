import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";

// SCHEMA MAPPING: Aggregated stats based on 'users', 'properties', 'landlords' tables
const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,240",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      title: "Verified Landlords",
      value: "89",
      subtext: "5 Pending Approval",
      change: "+5%",
      trend: "up",
      icon: ShieldCheck,
      color: "purple",
    },
    {
      title: "Active Properties",
      value: "215",
      subtext: "Across 4 Cities",
      change: "+8",
      trend: "up",
      icon: Building2,
      color: "green",
    },
    {
      title: "System Load",
      value: "Stable",
      subtext: "XAMPP / MySQL", // Explicit mention of local env
      icon: Activity,
      color: "orange",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user",
      message: "New Landlord Registration: Maria Santos",
      time: "2 mins ago",
      status: "pending",
      icon: UserCheck,
    },
    {
      id: 2,
      type: "property",
      message: "Property Added: 'Sunset Heights' by John Doe",
      time: "15 mins ago",
      status: "success",
      icon: Building2,
    },
    {
      id: 3,
      type: "system",
      message: "Daily Database Backup Completed",
      time: "4 hours ago",
      status: "success",
      icon: Database,
    },
    {
      id: 4,
      type: "alert",
      message: "High Disk Usage Warning (85%)",
      time: "6 hours ago",
      status: "warning",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
          <p className="text-sm text-slate-600 mt-1">
            Monitor user growth, property density, and server health status.
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center space-x-4 text-sm text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 border-r border-slate-200 pr-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <span className="font-bold text-emerald-700">Online</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section: System Health (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Server Health Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity size={20} className="text-slate-400" /> Server Health
                (Localhost)
              </h3>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-100">
                Optimal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Database Status */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Database
                    </p>
                    <p className="font-bold text-slate-800">MySQL 8.0</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 size={12} /> Connection Active
                </div>
              </div>

              {/* Disk Usage */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <HardDrive size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Storage
                    </p>
                    <p className="font-bold text-slate-800">45% Used</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Memory
                    </p>
                    <p className="font-bold text-slate-800">2.4GB / 8GB</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Admin Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Verify Users",
                  icon: UserCheck,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  label: "Backup DB",
                  icon: Database,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "System Logs",
                  icon: Activity,
                  color: "text-slate-600 bg-slate-50",
                },
                {
                  label: "Security",
                  icon: Shield,
                  color: "text-purple-600 bg-purple-50",
                },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <div
                    className={`p-3 rounded-full mb-2 ${action.color} group-hover:scale-110 transition-transform`}
                  >
                    <action.icon size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Activity Log (1/3 width) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Live Activity</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="relative pl-6 pb-2 last:pb-0">
                {/* Timeline Line */}
                {index !== recentActivities.length - 1 && (
                  <div className="absolute left-2.5 top-6 bottom-[-24px] w-0.5 bg-slate-100"></div>
                )}

                {/* Icon Indicator */}
                <div
                  className={`absolute left-0 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    activity.status === "success"
                      ? "bg-emerald-500"
                      : activity.status === "warning"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                ></div>

                {/* Content */}
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-tight mb-1">
                    {activity.message}
                  </p>
                  <span className="text-xs text-slate-400 font-medium">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Security Check
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Last scan completed 2 hours ago. No vulnerabilities found.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
