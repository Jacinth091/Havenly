import {
  AlertCircle,
  Building2,
  Clock,
  DollarSign,
  Home,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getLandlordDashboardStats } from "../../api/statistics.api";
import StatCard from "../../components/dashboard/StatCard";

const LandlordDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize with safe default values
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_properties: 0,
      vacant_units: 0,
      total_units: 0,
      pending_collections: 0,
      revenue_current: 0,
      revenue_growth: 0,
    },
    properties: [],
    recentTransactions: [],
    alerts: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await getLandlordDashboardStats();

        if (response.success) {
          setDashboardData({
            stats: response.stats || {},
            properties: response.properties || [],
            recentTransactions: response.recentTransactions || [],
            alerts: response.alerts || [],
          });
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Helper to remove decimals from days in alert messages
  const formatAlertMessage = (msg) => {
    return msg.replace(/(\d+\.\d+) days/, (match, number) => {
      return `${Math.round(Number(number))} days`;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          Error: {error}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Properties",
      value: String(dashboardData.stats.total_properties || 0),
      change: "Active",
      trend: "up",
      icon: Building2,
      color: "blue",
    },
    {
      title: "Room Availability",
      value: `${dashboardData.stats.vacant_units}/${dashboardData.stats.total_units}`,
      subtext: "Vacant Units",
      change: String(dashboardData.stats.vacant_units || 0),
      trend: "down",
      icon: Home,
      color: "purple",
    },
    {
      title: "Pending Collections",
      value: `₱${(
        Number(dashboardData.stats.pending_collections || 0) / 1000
      ).toFixed(1)}k`,
      change: "Urgent",
      trend: "down",
      icon: Clock,
      color: "orange",
    },
    {
      title: "Total Revenue",
      value: `₱${(
        Number(dashboardData.stats.revenue_current || 0) / 1000
      ).toFixed(0)}k`,
      subtext: "Manual Records",
      change: `${dashboardData.stats.revenue_growth > 0 ? "+" : ""}${
        dashboardData.stats.revenue_growth || 0
      }%`,
      trend: dashboardData.stats.revenue_growth >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "green",
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Landlord Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Welcome back. Manage your properties and tenant records.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area: Property & Room Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Grid */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-slate-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "New Lease",
                  desc: "Assign Room",
                  icon: FileText,
                  color: "bg-blue-50 text-blue-600 border-blue-100",
                },
                {
                  label: "Log Payment",
                  desc: "Manual Entry",
                  icon: DollarSign,
                  color: "bg-emerald-50 text-emerald-600 border-emerald-100",
                },
                {
                  label: "Add Tenant",
                  desc: "Registration",
                  icon: Users,
                  color: "bg-purple-50 text-purple-600 border-purple-100",
                },
                {
                  label: "Maintenance",
                  desc: "Room Status",
                  icon: AlertCircle,
                  color: "bg-amber-50 text-amber-600 border-amber-100",
                },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-start p-4 rounded-xl border transition-all hover:shadow-md ${action.color} bg-opacity-50`}
                >
                  <div className={`p-2 rounded-lg bg-white mb-3 shadow-sm`}>
                    <action.icon size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {action.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    {action.desc}
                  </span>
                </button>
              ))}
            </div>
          </div> */}

          {/* Property List with City Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                Properties Overview
              </h3>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                Sorted by City
              </span>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Property Name</th>
                    <th className="px-6 py-3 font-medium">Location (City)</th>
                    <th className="px-6 py-3 font-medium">Total Rooms</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.properties.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-slate-500"
                      >
                        No properties found.
                      </td>
                    </tr>
                  ) : (
                    dashboardData.properties.map((prop) => (
                      <tr
                        key={prop.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {prop.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 flex items-center gap-1">
                          <MapPin size={14} /> {prop.city}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {prop.rooms} Units
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              prop.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {prop.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Urgent Alerts & Transaction Audit */}
        <div className="space-y-6">
          {/* Urgent Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Urgent Alerts
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {dashboardData.alerts.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  No urgent alerts.
                </p>
              ) : (
                dashboardData.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg text-sm border ${
                      alert.severity === "urgent" ||
                      alert.type.includes("expiring")
                        ? "bg-red-50 text-red-800 border-red-100"
                        : "bg-amber-50 text-amber-800 border-amber-100"
                    }`}
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block">{alert.title}</span>
                      <span className="opacity-90">
                        {formatAlertMessage(alert.message)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions Audit Trail */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Recent Payments
              </h3>
              <button className="text-xs text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  No recent transactions.
                </p>
              ) : (
                dashboardData.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Unit {tx.unit}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tx.method} • {tx.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">
                        {tx.amount}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
