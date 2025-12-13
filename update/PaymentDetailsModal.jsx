import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Home,
  Receipt,
  User,
  X,
  XCircle,
} from "lucide-react";
import Badge from "../dashboard/Badge";

const PaymentDetailsModal = ({ isOpen, onClose, payment, onDownload, tenantInfo }) => {
  if (!isOpen || !payment) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(payment);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Verified":
        return {
          color: "emerald",
          icon: CheckCircle,
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-600",
          borderColor: "border-emerald-100",
        };
      case "Pending":
        return {
          color: "amber",
          icon: Clock,
          bgColor: "bg-amber-50",
          textColor: "text-amber-600",
          borderColor: "border-amber-100",
        };
      case "Overdue":
        return {
          color: "red",
          icon: XCircle,
          bgColor: "bg-red-50",
          textColor: "text-red-600",
          borderColor: "border-red-100",
        };
      default:
        return {
          color: "slate",
          icon: Clock,
          bgColor: "bg-slate-50",
          textColor: "text-slate-600",
          borderColor: "border-slate-100",
        };
    }
  };

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Payment Details</h3>
            <p className="text-xs text-slate-500 font-mono">
              Ref: {payment.ref !== "-" ? payment.ref : `PAY-${payment.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Info Card */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <Receipt size={28} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-slate-800 leading-tight">
                    ₱{payment.amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h4>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{formatDate(payment.date)}</span>
                  </div>
                </div>
                <Badge color={statusConfig.color}>
                  {payment.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tenant Info Card */}
          {tenantInfo && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <User size={12} /> Tenant Information
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  {tenantInfo.name}
                </p>
                {tenantInfo.contact && (
                  <p className="text-xs text-slate-500">
                    Contact: {tenantInfo.contact}
                  </p>
                )}
                {tenantInfo.email && (
                  <p className="text-xs text-slate-500">
                    Email: {tenantInfo.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <CreditCard size={12} /> Method
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {payment.method}
              </p>
            </div>

            {/* Reference */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Receipt size={12} /> Reference
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {payment.ref !== "-" ? payment.ref : `PAY-${payment.id}`}
              </p>
            </div>
          </div>

          {/* Property Info */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <p className="text-xs font-bold text-blue-600/70 uppercase mb-2 flex items-center gap-1.5">
              <Home size={12} /> Property
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-700">
                {payment.property}
              </p>
              <span className="text-xs font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                Unit {payment.unit}
              </span>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`p-4 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                <StatusIcon size={20} className={statusConfig.textColor} />
              </div>
              <div>
                <p className={`text-sm font-bold ${statusConfig.textColor}`}>
                  {payment.status === "Verified" && "Payment Verified"}
                  {payment.status === "Pending" && "Awaiting Verification"}
                  {payment.status === "Overdue" && "Payment Overdue"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {payment.status === "Verified" && "This payment has been confirmed and recorded."}
                  {payment.status === "Pending" && "This payment is waiting for landlord verification."}
                  {payment.status === "Overdue" && "This payment is past its due date."}
                </p>
              </div>
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="pt-2">
            <button
              onClick={handleDownload}
              className="w-full py-2.5 px-4 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
            >
              <Download size={16} /> Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;

