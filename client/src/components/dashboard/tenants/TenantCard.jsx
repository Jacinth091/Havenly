import {
  Calendar,
  Clock,
  Home,
  Mail,
  MoreHorizontal,
  Phone,
  Wallet,
} from "lucide-react";
import Badge from "../Badge"; // Adjust path as needed

// Helper (Move to a utils file in a real app)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "emerald";
    case "expired":
      return "amber";
    case "terminated":
      return "rose";
    case "archived":
      return "slate";
    default:
      return "slate";
  }
};

const TenantCard = ({ tenant }) => {
  console.log("Tenant Card Details: ", tenant);
  const badgeColor = getBadgeColor(tenant.status);

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-card transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 flex justify-between items-start gap-3">
        <div className="flex gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg border border-slate-200">
            {tenant.avatar_url ? (
              <img
                src={tenant.avatar_url}
                alt={tenant.full_name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              tenant.full_name?.substring(0, 2).toUpperCase() || "T"
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-lg leading-tight truncate pr-2">
              {tenant.full_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 font-medium">
              <Home size={14} className="text-slate-400" />
              <span>Unit {tenant.current_room || "N/A"}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Badge color={badgeColor} variant="dot" size="sm">
            {tenant.status}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 flex-1 space-y-5">
        {/* Lease Dates */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Start Date
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Calendar size={14} className="text-emerald-500" />
              {formatDate(tenant.lease_start_date)}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              End Date
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Clock size={14} className="text-rose-500" />
              {formatDate(tenant.lease_end_date)}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm group/link cursor-pointer">
            <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 group-hover/link:bg-indigo-50 group-hover/link:text-indigo-600 transition-colors">
              <Mail size={14} />
            </div>
            <span className="text-slate-600 truncate">
              {tenant.email || "No email"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm group/link cursor-pointer">
            <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 group-hover/link:bg-emerald-50 group-hover/link:text-emerald-600 transition-colors">
              <Phone size={14} />
            </div>
            <span className="text-slate-600">
              {tenant.contact_num || "No phone"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Balance
          </span>
          <div
            className={`flex items-center gap-1.5 text-sm font-bold ${
              Number(tenant.balance) > 0 ? "text-rose-600" : "text-slate-700"
            }`}
          >
            <Wallet size={14} />${Number(tenant.balance || 0).toLocaleString()}
          </div>
        </div>
        <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

const TenantGridView = ({ tenants }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tenants.map((tenant) => (
        <TenantCard key={tenant.tenant_id} tenant={tenant} />
      ))}
    </div>
  );
};

export default TenantGridView;
