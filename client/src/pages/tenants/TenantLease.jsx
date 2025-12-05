import {
  AlertCircle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Home,
  ShieldCheck,
  User,
} from "lucide-react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'leases' table joined with 'properties' and 'rooms'
const TenantLease = () => {
  // Mock Data: Active lease for the logged-in tenant
  const leaseInfo = {
    id: 101,
    property: "Sunset Heights",
    unit: "101",
    landlord: "Maria Santos",
    start_date: "Jan 01, 2025",
    end_date: "Jan 01, 2026",
    payment_due_day: 5, // "5th" of every month
    monthly_rent: 15000,
    security_deposit: 30000,
    status: "Active", // ENUM('Active', 'Expired', 'Terminated')
    notes:
      "Tenant responsible for electricity (VECO) and water (MCWD). No pets allowed.",
    created_at: "2024-12-15",
  };

  // Helper to calculate days until expiration
  const getDaysUntilExpiration = () => {
    const today = new Date("2025-10-01"); // Mock current date
    const end = new Date(leaseInfo.end_date);
    const diffTime = Math.abs(end - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lease Agreement</h2>
          <p className="text-sm text-slate-600">
            View contract details and financial terms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            ID: #{leaseInfo.id}
          </span>
          <Badge color={leaseInfo.status === "Active" ? "green" : "red"}>
            {leaseInfo.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Contract Details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property & Unit Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Home size={120} />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Home size={20} className="text-blue-600" /> Rental Unit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Property Name
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {leaseInfo.property}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Unit Number
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {leaseInfo.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Landlord
                  </p>
                  <p className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <User size={16} /> {leaseInfo.landlord}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Date Signed
                  </p>
                  <p className="text-base font-medium text-slate-700">
                    {leaseInfo.created_at}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Terms Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Banknote size={20} className="text-emerald-600" /> Financial
              Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase">
                  Monthly Rent
                </p>
                <p className="text-2xl font-bold text-emerald-800 mt-1">
                  ₱{leaseInfo.monthly_rent.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Clock size={12} /> Due on the {leaseInfo.payment_due_day}th
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Security Deposit
                </p>
                <p className="text-2xl font-bold text-slate-700 mt-1">
                  ₱{leaseInfo.security_deposit.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-bold">
                  <CheckCircle2 size={12} /> Paid
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">
                  Additional Notes
                </h4>
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {leaseInfo.notes}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Duration & Actions (1/3) */}
        <div className="space-y-6">
          {/* Duration Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" /> Lease Duration
            </h3>

            <div className="relative pl-4 border-l-2 border-slate-100 space-y-6 my-6">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-100"></div>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  Start Date
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {leaseInfo.start_date}
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-100"></div>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  End Date
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {leaseInfo.end_date}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <span className="block text-2xl font-bold text-slate-800">
                {getDaysUntilExpiration()}
              </span>
              <span className="text-xs text-slate-500 uppercase font-bold">
                Days Remaining
              </span>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Actions</h3>
            <button className="w-full py-3 px-4 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
              <Download size={18} /> Download Contract
            </button>
            <button className="w-full mt-3 py-3 px-4 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <ShieldCheck size={18} /> View Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantLease;
