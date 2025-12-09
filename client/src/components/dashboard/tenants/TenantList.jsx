import { Home } from "lucide-react";
import Badge from "../Badge"; // Adjust path as needed

// Reusing helper logic (In a real app, import from utils)
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

const TenantListHeader = () => (
  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
    <div className="col-span-4">Tenant</div>
    <div className="col-span-2">Unit</div>
    <div className="col-span-3">Lease Period</div>
    <div className="col-span-2">Status</div>
    <div className="col-span-1 text-right">Balance</div>
  </div>
);

const TenantRow = ({ tenant }) => {
  const badgeColor = getBadgeColor(tenant.status);

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
      {/* Name & Contact */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 border border-slate-200">
          {tenant.avatar_url ? (
            <img
              src={tenant.avatar_url}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            tenant.full_name?.substring(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">
            {tenant.full_name}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {tenant.email}
          </p>
        </div>
      </div>

      {/* Unit */}
      <div className="col-span-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
          <Home size={12} className="text-slate-400" />
          {tenant.room_number}
        </div>
      </div>

      {/* Dates */}
      <div className="col-span-3">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {formatDate(tenant.lease_start)}
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                tenant.status === "Expired" ? "bg-amber-400" : "bg-slate-300"
              }`}
            ></span>
            {formatDate(tenant.lease_end)}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2">
        <Badge color={badgeColor} variant="dot" size="sm">
          {tenant.status}
        </Badge>
      </div>

      {/* Balance */}
      <div
        className={`col-span-1 text-right text-sm font-bold ${
          Number(tenant.balance) > 0 ? "text-rose-600" : "text-slate-700"
        }`}
      >
        ${Number(tenant.balance || 0).toLocaleString()}
      </div>
    </div>
  );
};

const TenantListView = ({ tenants }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <TenantListHeader />
          {tenants.map((tenant) => (
            <TenantRow key={tenant.tenant_id} tenant={tenant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenantListView;
