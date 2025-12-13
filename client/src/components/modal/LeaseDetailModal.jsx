import {
  AlertTriangle,
  Ban,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Home,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import Badge from "../../components/dashboard/Badge";

// --- HELPER: 7-Day Expiry Check ---
const isExpiringSoon = (endDateString) => {
  if (!endDateString) return false;
  const today = new Date();
  const end = new Date(endDateString);

  // Calculate difference in time
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Trigger if within 7 days AND in the future
  return diffDays <= 7 && diffDays > 0;
};

const LeaseDetailsModal = ({
  isOpen,
  onClose,
  lease,
  onTerminate,
  onDownload,
  children,
  footer,
}) => {
  if (!isOpen || !lease) return null;

  // --- 1. DATA MAPPING ---
  const propertyName =
    lease.property || lease.property_name || "Unknown Property";
  const unitName = lease.unit || lease.unit_number || "N/A";
  const tenantName = lease.tenant || lease.full_name || "Unknown Tenant";
  const tenantEmail = lease.email || "No email provided";
  const tenantPhone = lease.contact_num || lease.phone || "No phone provided";

  const startDate = lease.start_date || "N/A";
  const endDate = lease.end_date || "N/A";

  const rawStatus = lease.status || lease.lease_status || "Unknown";
  const rentAmount = lease.monthly_rent || 0;
  const displayId = lease.id || lease.lease_id;

  // --- 2. COMPUTED STATUS LOGIC ---
  let displayStatus = rawStatus;

  // Override 'Active' if it is actually expiring soon
  if (rawStatus === "Active" && isExpiringSoon(endDate)) {
    displayStatus = "Expiring Soon";
  }

  // --- 3. THEME LOGIC ---
  const getTheme = (s) => {
    switch (s) {
      case "Active":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-700",
          icon: "text-emerald-600",
          badge: "emerald",
        };
      case "Expiring Soon": // New Case
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-700",
          icon: "text-amber-600",
          badge: "amber",
        };
      case "Expired":
        return {
          bg: "bg-red-50",
          border: "border-red-100",
          text: "text-red-700",
          icon: "text-red-600",
          badge: "red",
        };
      case "Terminated":
      case "Cancelled":
        return {
          bg: "bg-slate-100",
          border: "border-slate-200",
          text: "text-slate-600",
          icon: "text-slate-500",
          badge: "slate",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-100",
          text: "text-slate-600",
          icon: "text-slate-400",
          badge: "gray",
        };
    }
  };

  const theme = getTheme(displayStatus);
  const isActiveOrExpiring = rawStatus === "Active"; // Allow actions for both

  // --- DEFAULT FOOTER ---
  const DefaultFooter = () => (
    <div className="pt-4 mt-auto">
      {isActiveOrExpiring ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => onDownload && onDownload(lease)}
              className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> Contract
            </button>
            <button className="py-2.5 px-4 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50">
              <CreditCard size={16} /> Pay Rent
            </button>
          </div>

          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to terminate this lease?")
              ) {
                onClose();
                onTerminate && onTerminate(lease);
              }
            }}
            className="w-full py-2.5 px-4 bg-red-50 text-red-600 border border-red-100 text-sm font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
          >
            <Ban size={16} /> Terminate Lease
          </button>
        </>
      ) : (
        <button
          onClick={() => onDownload && onDownload(lease)}
          className="w-full py-2.5 px-4 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
        >
          <Download size={16} /> Download Archived Contract
        </button>
      )}

      {/* Specific Status Message */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium opacity-70">
        {displayStatus === "Active" && (
          <span className="text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={12} /> Lease is active
          </span>
        )}
        {displayStatus === "Expiring Soon" && (
          <span className="text-amber-600 flex items-center gap-1">
            <Clock size={12} /> Expiring on {endDate}
          </span>
        )}
        {displayStatus === "Expired" && (
          <span className="text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} /> Expired on {endDate}
          </span>
        )}
        {displayStatus === "Terminated" && (
          <span className="text-slate-500 flex items-center gap-1">
            <Ban size={12} /> Terminated early
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Lease Details</h3>
            <p className="text-xs text-slate-500 font-mono">ID: #{displayId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          {/* Main Info Card (Dynamic Theme) */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${theme.bg} ${theme.border} ${theme.icon}`}
            >
              <Home size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="text-xl font-bold text-slate-800 leading-tight truncate">
                    {propertyName}
                  </h4>
                  <div className="flex flex-col gap-1 mt-1.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">Unit {unitName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <User size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{tenantName}</span>
                    </div>
                  </div>
                </div>
                {/* Display Computed Status */}
                <Badge color={theme.badge}>{displayStatus.toUpperCase()}</Badge>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-6">
            <div className="flex items-center gap-2 truncate">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="truncate" title={tenantEmail}>
                {tenantEmail}
              </span>
            </div>
            <div className="hidden sm:block w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 truncate">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{tenantPhone}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* Duration */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <Calendar size={14} /> Duration
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Start
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {startDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    End
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      displayStatus === "Expired" ||
                      displayStatus === "Expiring Soon"
                        ? "text-red-600"
                        : "text-slate-700"
                    }`}
                  >
                    {endDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Rent (Themed Border) */}
            <div
              className={`p-4 rounded-xl border ${theme.bg} ${theme.border}`}
            >
              <p
                className={`text-xs font-bold uppercase mb-2 flex items-center gap-1.5 ${theme.text}`}
              >
                <Banknote size={14} />{" "}
                {isActiveOrExpiring ? "Current Rent" : "Historical Rent"}
              </p>
              <p className={`text-2xl font-bold tracking-tight ${theme.text}`}>
                ₱{Number(rentAmount).toLocaleString()}
              </p>
              <p
                className={`text-[10px] font-medium mt-1 opacity-70 ${theme.text}`}
              >
                Per month
              </p>
            </div>
          </div>

          {children && <div className="mt-4">{children}</div>}

          {footer === undefined ? <DefaultFooter /> : footer}
        </div>
      </div>
    </div>
  );
};

export default LeaseDetailsModal;
