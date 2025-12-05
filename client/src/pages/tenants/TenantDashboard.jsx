import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Home,
  MapPin,
  Phone,
  User,
  Wallet,
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";

// SCHEMA MAPPING: Based on 'leases' and 'transactions' tables for a specific tenant
const TenantDashboard = () => {
  // Mock Data representing a logged-in Tenant's view
  const leaseInfo = {
    property: "Sunset Heights",
    unit: "101",
    landlord: "Maria Santos",
    landlord_contact: "0917-123-4567",
    start_date: "Jan 01, 2025",
    end_date: "Jan 01, 2026",
    rent: "₱15,000",
    due_day: "5th of the month",
    status: "Active",
  };

  const paymentHistory = [
    {
      id: 101,
      date: "Oct 05, 2025",
      amount: "₱15,000",
      for_month: "October 2025",
      method: "Cash",
      reference: "CASH-REC-001",
      status: "Completed",
    },
    {
      id: 102,
      date: "Sep 05, 2025",
      amount: "₱15,000",
      for_month: "September 2025",
      method: "GCash",
      reference: "GC-99887766",
      status: "Completed",
    },
    {
      id: 103,
      date: "Aug 05, 2025",
      amount: "₱15,000",
      for_month: "August 2025",
      method: "Bank Transfer",
      reference: "BDO-123456",
      status: "Completed",
    },
  ];

  const stats = [
    {
      title: "Monthly Rent",
      value: leaseInfo.rent,
      subtext: `Due on the ${leaseInfo.due_day}`,
      icon: Wallet,
      color: "blue",
    },
    {
      title: "Lease Status",
      value: leaseInfo.status,
      subtext: `Expires ${leaseInfo.end_date}`,
      icon: FileText,
      color: "green",
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Home</h2>
          <p className="text-sm text-slate-600">
            Welcome back! Here's your rental summary.
          </p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Home size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Current Unit
            </p>
            <p className="font-bold text-slate-800">
              {leaseInfo.property} - {leaseInfo.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Payment History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock size={20} className="text-slate-400" /> Payment History
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              Last 3 Months
            </span>
          </div>

          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {payment.for_month}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{payment.date}</span>
                      <span>•</span>
                      <span>{payment.method}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Ref: {payment.reference}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto pl-14 sm:pl-0">
                  <span className="text-lg font-bold text-slate-800">
                    {payment.amount}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                    <CheckCircle2 size={12} /> {payment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Landlord Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-slate-400" /> Landlord Contact
          </h3>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">
                {leaseInfo.landlord.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{leaseInfo.landlord}</p>
                <p className="text-xs text-slate-500">Property Owner</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
              <Phone size={16} className="text-blue-500" />
              {leaseInfo.landlord_contact}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Property Location
            </h4>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
              123 Sunset Blvd, Cebu City
              <br />
              Unit 101
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
