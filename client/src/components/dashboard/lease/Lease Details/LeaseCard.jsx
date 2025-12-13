import { Calendar, Clock, MapPin } from "lucide-react";
import Badge from "../../Badge";
import CardMenu from "../../CardMenu";

// --- HELPERS ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(parseFloat(amount || 0));
};

const isExpiringSoon = (endDate) => {
  if (!endDate) return false;
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays > 0;
};

// Updated to handle just the day number (e.g., 30)
const getOrdinal = (n) => {
  if (!n) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getLeaseBadgeProps = (status, endDate) => {
  if (status === "Active" && isExpiringSoon(endDate)) {
    return { color: "amber", label: "Expiring Soon" };
  }
  switch (status) {
    case "Active":
      return { color: "emerald", label: "Active" };
    case "Expired":
      return { color: "red", label: "Expired" };
    default:
      return { color: "slate", label: status || "Unknown" };
  }
};
// --- REDESIGNED CARD VIEW ---
export const LeaseCard = ({ data, getMenuOptions, onAction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.map((lease, index) => {
        // --- NEW JSON MAPPING ---
        const tenantName = lease.tenant || "Unknown";
        const propertyName = lease.property || "Unknown Property";
        const unitName = lease.unit || "N/A";
        const endDate = lease.end_date;
        const rent = formatCurrency(lease.monthly_rent);
        const dueDay = lease.payment_due_day;

        const badgeProps = getLeaseBadgeProps(lease.status, endDate);
        const isExpiring = isExpiringSoon(endDate) && lease.status === "Active";

        return (
          <div
            key={lease.id || index}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all relative group flex flex-col h-full ${
              isExpiring
                ? "border-amber-200 ring-1 ring-amber-100"
                : "border-slate-200 hover:border-emerald-300 hover:shadow-md"
            }`}
          >
            {/* --- TOP ROW: Tenant & Menu --- */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-sm">
                  {tenantName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">
                    {tenantName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <MapPin size={10} />
                    <span className="truncate max-w-[120px]">
                      {propertyName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{unitName}</span>
                  </div>
                </div>
              </div>

              {/* Absolute Menu */}
              {getMenuOptions && (
                <div className="absolute top-4 right-4">
                  <CardMenu
                    options={getMenuOptions(lease)}
                    onAction={(actionId) => onAction(actionId, lease)}
                  />
                </div>
              )}
            </div>

            {/* --- MIDDLE: Financials --- */}
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Monthly Rent
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {rent}
                </span>
              </div>
              <Badge {...badgeProps} size="sm" className="translate-y-[-2px]">
                {badgeProps.label}
              </Badge>
            </div>

            {/* --- BOTTOM: Details Grid --- */}
            <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              {/* 1. End Date */}
              <div className="col-span-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Ends
                </span>
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    isExpiring ? "text-amber-600" : "text-slate-700"
                  }`}
                >
                  <Calendar
                    size={14}
                    className={isExpiring ? "text-amber-500" : "text-slate-400"}
                  />
                  {endDate || "-"}
                </div>
              </div>

              {/* 2. Due Date */}
              <div className="col-span-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Next Due
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Clock size={14} className="text-slate-400" />
                  {getOrdinal(dueDay)} of month
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
