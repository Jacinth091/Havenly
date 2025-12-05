import {
  Activity,
  AlertCircle,
  Building2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";

const LandlordDashboard = () => {
  // SCHEMA MAPPING: Based on 'properties' table and sample data
  // Business Rule: "All properties must have a city specified for geographic filtering"
  const properties = [
    {
      id: 1,
      name: "Sunset Apartments",
      city: "Cebu City",
      rooms: 5,
      status: "Active",
    },
    {
      id: 2,
      name: "Green Valley Homes",
      city: "Mandaue City",
      rooms: 3,
      status: "Active",
    },
  ];

  // SCHEMA MAPPING: Based on 'transactions' table ENUMs
  // "transaction_status" ENUM('Pending', 'Completed', 'Cancelled')
  const recentTransactions = [
    {
      id: 101,
      unit: "101",
      amount: "₱5,000",
      date: "Dec 02, 2025",
      status: "Completed",
      method: "Cash",
    },
    {
      id: 102,
      unit: "103",
      amount: "₱6,000",
      date: "Dec 01, 2025",
      status: "Pending",
      method: "GCash",
    },
  ];

  const stats = [
    {
      title: "Total Properties",
      value: "2",
      change: "Active",
      trend: "up",
      icon: Building2,
      color: "blue",
    },
    {
      title: "Room Availability",
      value: "15/19",
      subtext: "Vacant Units",
      change: "-2",
      trend: "down",
      icon: Home,
      color: "purple",
    },
    {
      title: "Pending Collections",
      value: "₱11k",
      change: "Urgent", // Highlights manual collection requirement
      trend: "down",
      icon: Clock,
      color: "orange",
    },
    {
      title: "Total Revenue",
      value: "₱235k",
      subtext: "Manual Records", // Explicitly stating manual entry limitation
      change: "+12%",
      trend: "up",
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
            Welcome back, Maria. Manage your properties and tenant records.
          </p>
        </div>
        <div className="flex gap-2">
          {/* SCHEMA: Support for manual payment recording  */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <CreditCard size={16} /> Record Payment
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm">
            <Plus size={16} /> Add Property
          </button>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
                  desc: "Manual Entry", // emphasized limitation
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
                  desc: "Room Status", // Matches 'Maintenance' ENUM
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
          </div>

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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Property Name</th>
                    <th className="px-6 py-3 font-medium">Location (City)</th>
                    <th className="px-6 py-3 font-medium">Total Rooms</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((prop) => (
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
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                          {prop.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Urgent Alerts & Transaction Audit */}
        <div className="space-y-6">
          {/* Urgent Alerts - Based on Payment Due Day & Lease End Date */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Urgent Alerts
            </h3>
            <div className="space-y-3">
              {/* Alert matches 'end_date' check  */}
              <div className="flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Lease Expiring</span>
                  <span className="opacity-90">
                    Unit 102 (Green Valley) expires in 5 days.
                  </span>
                </div>
              </div>
              {/* Alert matches 'payment_due_day'  */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100">
                <Clock size={16} className="mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Payment Overdue</span>
                  <span className="opacity-90">
                    Unit 305 (Sunset Apts) missed due date (1st).
                  </span>
                </div>
              </div>
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
            {/* Shows manual records  */}
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
