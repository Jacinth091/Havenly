import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  User,
} from "lucide-react";
import Badge from "../Badge"; // Adjust path as needed

// --- Helpers ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name) => {
  return name ? name.substring(0, 2).toUpperCase() : "T";
};

const TenantCard = ({ tenant, onMenuClick }) => {
  // 1. Feature Flags (Check data existence)
  const showAvatar = true; // Always show structure, even if placeholder
  const showContact = tenant.email || tenant.contact_num;
  const showLease = tenant.lease_end_date;
  const showBalance = true;

  // 2. Props
  // const badgeProps = getBadgeProps(tenant.status);
  const getBadgeProps = (status) => {
    switch (status) {
      case "Active":
        return { color: "emerald", icon: CheckCircle2 };
      case "Expired":
        return { color: "amber", icon: Clock };
      case "Terminated":
        return { color: "red", icon: AlertCircle };
      case "Archived":
        return { color: "slate", icon: null };
      default:
        return { color: "slate", icon: null };
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between h-full animate-fade-in">
      {/* --- ROW 1: Unit/Tag & Menu --- */}
      <div className="flex justify-between items-start mb-4">
        {/* Unit Tag (replaces Date in your example) */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
          <MapPin size={12} className="text-slate-400" strokeWidth={2.5} />
          {tenant.current_room ? `Unit ${tenant.current_room}` : "No Unit"}
        </div>

        {/* Menu (Placeholder for CardMenu) */}
        <button
          onClick={(e) => onMenuClick && onMenuClick(e, tenant)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* --- ROW 2: Main Details --- */}
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-100 shadow-sm shrink-0 overflow-hidden">
          {tenant.avatar_url ? (
            <img
              src={tenant.avatar_url}
              alt={tenant.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(tenant.full_name)
          )}
        </div>

        {/* Details Column */}
        <div className="min-w-0 flex flex-col gap-1 w-full">
          {/* Tenant Name */}
          <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
            {tenant.full_name || "Unknown Tenant"}
          </h3>

          {/* Contact Info (Condensed) */}
          {showContact && (
            <div className="flex flex-col gap-1 mt-1">
              {tenant.email && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate hover:text-indigo-600 transition-colors cursor-pointer">
                  <Mail size={12} />
                  <span className="truncate">{tenant.email}</span>
                </div>
              )}
              {tenant.contact_num && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate hover:text-emerald-600 transition-colors cursor-pointer">
                  <Phone size={12} />
                  <span>{tenant.contact_num}</span>
                </div>
              )}
            </div>
          )}

          {/* Lease End Date (Optional line) */}
          {showLease && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Calendar size={12} />
              <span>Ends: {formatDate(tenant.lease_end_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* --- ROW 3: Footer (Balance & Status) --- */}
      <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-auto">
        {showBalance && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              Current Balance
            </p>
            <div
              className={`flex items-center gap-1 text-xl font-bold tracking-tight ${
                Number(tenant.balance) > 0 ? "text-rose-600" : "text-slate-900"
              }`}
            >
              <span className="text-sm font-normal text-slate-400 -mb-1 mr-0.5">
                $
              </span>
              {Number(tenant.balance || 0).toLocaleString()}
            </div>
          </div>
        )}

        <Badge
          {...getBadgeProps(tenant.status)}
          size="md"
          className="py-1 shadow-sm"
        >
          {/* If you have icons supported in your Badge component, you can pass badgeProps.icon here */}
          {tenant.status}
        </Badge>
      </div>
    </div>
  );
};

const TenantGridView = ({ tenants, onMenuClick }) => {
  if (!tenants || tenants.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <User size={48} className="mx-auto text-slate-300 mb-3" />
        <p>No tenants found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 animate-fade-in">
      {tenants.map((tenant) => (
        <TenantCard
          key={tenant.tenant_id}
          tenant={tenant}
          onMenuClick={onMenuClick}
        />
      ))}
    </div>
  );
};

export default TenantGridView;
