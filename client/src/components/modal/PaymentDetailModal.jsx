import {
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Home,
  Receipt,
  X,
  XCircle,
} from "lucide-react";
import Badge from "../../components/dashboard/Badge";

const PaymentDetailsModal = ({
  isOpen,
  onClose,
  payment,
  onDownload,
  onVerify,
  footer,
}) => {
  if (!isOpen || !payment) return null;

  // --- 1. DATA MAPPING (Configured for your JSON) ---
  const transactionId = payment.id;
  const tenantName = payment.tenant || "Unknown Tenant";
  const propertyName = payment.property || "Unknown Property";
  const unitName = payment.unit || "N/A";
  const amount = payment.amount || 0;
  const paymentDate = payment.date || "N/A";
  const status = payment.status || "Pending";
  const paymentMethod = payment.method || "Cash";
  const referenceNo = payment.ref || "N/A";
  // Note: Your JSON didn't have a 'coverage' date (e.g. "Rent for Jan"),
  // so I'll use the Transaction ID in the grid instead.

  // --- 2. THEME LOGIC ---
  const getTheme = (s) => {
    switch (s) {
      case "Verified":
      case "Completed": // Matches your JSON 'Completed'
      case "Paid":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-700",
          icon: "text-emerald-600",
          badge: "emerald",
        };
      case "Pending":
      case "Processing":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-700",
          icon: "text-amber-600",
          badge: "amber",
        };
      case "Rejected":
      case "Failed":
      case "Overdue":
      case "Cancelled":
        return {
          bg: "bg-red-50",
          border: "border-red-100",
          text: "text-red-700",
          icon: "text-red-600",
          badge: "red",
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

  const theme = getTheme(status);

  // --- DEFAULT FOOTER ---
  const DefaultFooter = () => (
    <div className="pt-4 mt-auto">
      <div className="flex gap-3 mb-3">
        <button
          onClick={() => onDownload && onDownload(payment)}
          className="flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Download size={16} /> Receipt
        </button>

        {status === "Pending" && onVerify && (
          <button
            onClick={() => onVerify(payment)}
            className="flex-1 py-2.5 px-4 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50"
          >
            <CheckCircle2 size={16} /> Verify
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium opacity-70">
        {status === "Completed" || status === "Verified" ? (
          <span className="text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={12} /> Payment Verified
          </span>
        ) : status === "Pending" ? (
          <span className="text-amber-600 flex items-center gap-1">
            <Clock size={12} /> Awaiting Verification
          </span>
        ) : (
          <span className="text-red-600 flex items-center gap-1">
            <XCircle size={12} /> Transaction {status}
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
            <h3 className="text-lg font-bold text-slate-800">
              Payment Details
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Ref: {referenceNo}
            </p>
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
          {/* Main Info Card */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${theme.bg} ${theme.border} ${theme.icon}`}
            >
              {paymentMethod.toLowerCase().includes("bank") ? (
                <Banknote size={28} />
              ) : (
                <Receipt size={28} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="text-xl font-bold text-slate-800 leading-tight truncate">
                    {tenantName}
                  </h4>
                  <div className="flex flex-col gap-1 mt-1.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <Home size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {propertyName} • Unit {unitName}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge color={theme.badge}>{status.toUpperCase()}</Badge>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* Meta Data */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                  <FileText size={14} /> Info
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Date
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {paymentDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Method
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      ID
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      #{transactionId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-center ${theme.bg} ${theme.border}`}
            >
              <p
                className={`text-xs font-bold uppercase mb-2 flex items-center gap-1.5 ${theme.text}`}
              >
                <CreditCard size={14} /> Total Amount
              </p>
              <p className={`text-2xl font-bold tracking-tight ${theme.text}`}>
                ₱{Number(amount).toLocaleString()}
              </p>
              <p
                className={`text-[10px] font-medium mt-1 opacity-70 ${theme.text}`}
              >
                {status === "Completed" || status === "Verified"
                  ? "Paid in full"
                  : "Amount Due"}
              </p>
            </div>
          </div>

          {footer === undefined ? <DefaultFooter /> : footer}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
