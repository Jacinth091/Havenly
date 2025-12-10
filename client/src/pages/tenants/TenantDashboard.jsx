import {
  Banknote,
  Calendar,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import PaymentsCardView from "../../components/dashboard/tenants/payments/PaymentCard";
import PaymentsList from "../../components/dashboard/tenants/payments/PaymentList";
import { ViewToggles } from "../../components/ui/StatusControlTab";

const TenantDashboard = () => {
  // --- STATE FOR TOGGLE ---
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'card'
  const navigate = useNavigate();
  // --- MOCK DATA ---
  const leaseInfo = {
    property: "Sunset Heights",
    unit: "101",
    address: "123 Sunset Blvd, Cebu City",
    landlord: "Maria Santos",
    landlord_contact: "0917-123-4567",
    landlord_email: "maria.santos@havenly.com",
    rent: 15000,
    due_day: 5,
    end_date: "Jan 01, 2026",
    status: "Active",
    tenant_name: "Alice Johnson",
  };

  // Data formatted for both List and Card components
  const paymentHistory = [
    {
      id: 101,
      tenant: leaseInfo.tenant_name,
      property: leaseInfo.property,
      unit: leaseInfo.unit,
      date: "Oct 05, 2025",
      amount: 15000,
      method: "Cash",
      ref: "CASH-REC-001",
      status: "Completed",
    },
    {
      id: 102,
      tenant: leaseInfo.tenant_name,
      property: leaseInfo.property,
      unit: leaseInfo.unit,
      date: "Sep 05, 2025",
      amount: 15000,
      method: "GCash",
      ref: "GC-99887766",
      status: "Completed",
    },
    {
      id: 103,
      tenant: leaseInfo.tenant_name,
      property: leaseInfo.property,
      unit: leaseInfo.unit,
      date: "Aug 05, 2025",
      amount: 15000,
      method: "Bank Transfer",
      ref: "BDO-123456",
      status: "Completed",
    },
  ];

  // --- DATA TRANSFORMATION ---
  // Create a "clean" version for BOTH views to avoid clutter.
  // We remove 'tenant', 'property', and 'unit'.
  const listViewData = paymentHistory.map(
    ({ tenant, property, unit, ...rest }) => rest
  );

  // --- HELPER FUNCTIONS ---
  const getInitials = (name) => (name ? name.charAt(0) : "?");

  const getMenuOptions = (status) => [
    { id: "download", label: "Download Receipt", icon: FileText },
  ];

  const today = new Date("2025-10-15");
  const getNextDueDate = () => {
    let nextDue = new Date(
      today.getFullYear(),
      today.getMonth(),
      leaseInfo.due_day
    );
    if (today.getDate() > leaseInfo.due_day) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    return nextDue.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back,{" "}
            <span className="font-medium text-slate-700">Alice</span>.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Home size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Current Unit
            </p>
            <p className="text-sm font-bold text-slate-800">
              {leaseInfo.property} • {leaseInfo.unit}
            </p>
          </div>
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Next Payment Due"
          value={getNextDueDate()}
          subtext="Upcoming bill"
          icon={Calendar}
          color="green"
          showProgress={false}
        />
        <StatCard
          title="Monthly Rent"
          value={`₱${leaseInfo.rent.toLocaleString()}`}
          subtext="Due on the 5th"
          icon={Banknote}
          color="blue"
          showProgress={false}
        />
        <StatCard
          title="Lease Status"
          value={leaseInfo.status}
          subtext={`Expires ${leaseInfo.end_date}`}
          icon={FileText}
          color="purple"
          showProgress={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Section Header with Toggles */}
          <div className="flex flex-row sm:items-center justify-between gap-4">
            {/* Title & View All Link */}
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                Recent Payments
              </h3>
              <button
                onClick={() => navigate("/tenant/payments")}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                View All
              </button>
            </div>

            {/* View Toggle Component */}
            <div className="flex items-center self-start sm:self-auto">
              <ViewToggles mode={viewMode} setMode={setViewMode} />
            </div>
          </div>

          {/* Conditional Rendering based on viewMode */}
          {viewMode === "list" ? (
            <PaymentsList
              // Pass the CLEAN data (hides columns)
              data={listViewData}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
            />
          ) : (
            <PaymentsCardView
              // Pass the CLEAN data (hides avatars & property info)
              data={listViewData}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
            />
          )}
        </div>

        {/* --- RIGHT COLUMN: LANDLORD SIDEBAR --- */}
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
                {leaseInfo.landlord.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{leaseInfo.landlord}</p>
                <p className="text-xs text-slate-500">verified_landlord</p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                <Phone size={16} className="text-slate-400" />{" "}
                {leaseInfo.landlord_contact}
              </button>
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                <Mail size={16} className="text-slate-400" /> Send Message
              </button>

              <div className="pt-3 border-t border-slate-100 mt-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
                  Property Location
                </p>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  {leaseInfo.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
