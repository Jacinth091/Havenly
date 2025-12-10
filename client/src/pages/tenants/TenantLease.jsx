import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  History,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../components/dashboard/Badge";
import LeaseDetailsModal from "../../components/modal/LeaseDetailModal"; // Import the modal

const TenantLease = () => {
  // --- MOCK DATA: ACTIVE LEASE ---
  const activeLease = {
    lease_id: 101,
    lease_status: "Active",
    start_date: "2025-01-01",
    end_date: "2026-01-01",
    payment_due_day: 5,
    monthly_rent: 15000.0,
    security_deposit: 30000.0,
    notes:
      "Tenant responsible for electricity (VECO) and water (MCWD). No pets allowed.",
    created_at: "2024-12-15",
    property_name: "Sunset Apartments",
    address: "123 Main Street",
    city: "Cebu City",
    unit: "101",
    landlord_name: "Maria Santos",
    landlord_contact: "0918-123-4567",
    landlord_email: "maria.santos@havenly.com",
  };

  // --- MOCK DATA: LEASE HISTORY ---
  const leaseHistory = [
    {
      id: 85,
      property: "Green Valley Homes",
      unit: "4B",
      start: "2023-01-01",
      end: "2024-01-01",
      status: "Expired",
      monthly_rent: 12000,
    },
    {
      id: 92,
      property: "Green Valley Homes",
      unit: "4B",
      start: "2024-01-01",
      end: "2024-12-31",
      status: "Terminated",
      monthly_rent: 12500,
    },
  ];

  // --- STATE FOR MODAL ---
  const [selectedLease, setSelectedLease] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewLease = (lease) => {
    setSelectedLease(lease);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedLease(null), 200); // Clear data after animation
  };

  // --- LOGIC HELPERS ---
  const today = new Date("2025-03-15");
  const start = new Date(activeLease.start_date);
  const end = new Date(activeLease.end_date);

  const totalDuration = end - start;
  const elapsed = today - start;
  const progressPercent = Math.min(
    Math.max((elapsed / totalDuration) * 100, 0),
    100
  );
  const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

  const getNextDueDate = () => {
    let nextDue = new Date(
      today.getFullYear(),
      today.getMonth(),
      activeLease.payment_due_day
    );
    if (today.getDate() > activeLease.payment_due_day) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    return nextDue.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      {/* --- MODAL INJECTION --- */}
      <LeaseDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lease={selectedLease}
      />

      {/* --- PAGE HEADER --- */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Lease Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          View your current agreement and rental history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LEFT COLUMN (Active Lease) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. ACTIVE PROPERTY CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <Badge color="emerald">ACTIVE CONTRACT</Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                <Home size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                  {activeLease.property_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <MapPin size={14} className="text-slate-400" />
                  {activeLease.address}, {activeLease.city}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    UNIT {activeLease.unit}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    • Lease #{activeLease.lease_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Contract Duration
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {Math.round(progressPercent)}% Elapsed
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Start
                    </p>
                    <p className="font-semibold text-slate-700">
                      {new Date(activeLease.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      End
                    </p>
                    <p className="font-semibold text-slate-700">
                      {new Date(activeLease.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Calendar size={14} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. FINANCIAL TERMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Rent
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                  <Banknote size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                ₱{activeLease.monthly_rent.toLocaleString()}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100 text-xs font-bold">
                <Clock size={12} /> Next Due: {getNextDueDate()}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Security Deposit
                </p>
                <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                ₱{activeLease.security_deposit.toLocaleString()}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 text-xs font-bold">
                <CheckCircle2 size={12} className="text-emerald-500" /> Fully
                Paid
              </div>
            </div>
          </div>

          {/* 3. NOTES */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" /> Terms &
              Conditions Note
            </h4>
            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed italic">
              "{activeLease.notes}"
            </p>
          </div>

          {/* --- HISTORY SECTION --- */}
          <div className="pt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-slate-400" /> Lease History
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Property</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Duration</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaseHistory.map((lease) => (
                    <tr
                      key={lease.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-700">
                          {lease.property}
                        </p>
                        <p className="text-xs text-slate-400">
                          Unit {lease.unit} • #{lease.id}
                        </p>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-slate-600">
                        {lease.start} - {lease.end}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          color={lease.status === "Expired" ? "slate" : "red"}
                          size="sm"
                        >
                          {lease.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleViewLease(lease)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Sidebar) --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Landlord Details
              </h3>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded border border-purple-100">
                Owner
              </span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100">
                {activeLease.landlord_name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {activeLease.landlord_name}
                </p>
                <p className="text-xs text-slate-500">verified_landlord</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Phone size={16} className="text-slate-400" />{" "}
                {activeLease.landlord_contact}
              </button>
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Mail size={16} className="text-slate-400" /> Send Message
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Documents</h3>
            <p className="text-xs text-slate-500 mb-4">
              Official signed copies.
            </p>
            <button className="w-full py-2.5 px-4 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-200">
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantLease;
