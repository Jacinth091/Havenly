import { AlertCircle, Calendar, CheckCircle2, Clock, Hash } from "lucide-react";
import Badge from "../../Badge";
import CardMenu from "../../CardMenu";
import PaymentMethodBadge from "../../PaymentBadge";

const PaymentsCardView = ({ data, getInitials, getMenuOptions }) => {
  // 1. Inspect schema from first item
  const sample = data && data.length > 0 ? data[0] : {};

  // 2. Create Boolean Flags
  const showTenant = "tenant" in sample;
  const showProperty = "property" in sample;
  const showMethod = "method" in sample;
  const showRef = "ref" in sample;
  const showDate = "date" in sample;
  const showAmount = "amount" in sample;
  const showStatus = "status" in sample;

  const getBadgeProps = (status) => {
    switch (status) {
      case "Verified":
      case "Completed":
        return { color: "emerald", icon: CheckCircle2 };
      case "Pending":
        return { color: "amber", icon: Clock };
      case "Overdue":
      case "Rejected":
        return { color: "red", icon: AlertCircle };
      default:
        return { color: "slate" };
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        No payment data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 animate-fade-in">
      {data.map((payment) => (
        <div
          key={payment.id}
          className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          {/* --- ROW 1: Date & Menu --- */}
          <div className="flex justify-between items-start mb-4">
            {showDate && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Calendar size={12} strokeWidth={2.5} />
                {payment.date}
              </div>
            )}
            {/* If no date, push menu to the right */}
            {!showDate && <div></div>}

            <CardMenu options={getMenuOptions(payment.status)} />
          </div>

          {/* --- ROW 2: Main Details (Conditionally Rendered) --- */}
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar: Only show if we have a Tenant */}
            {showTenant && (
              <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-100 shadow-sm shrink-0 mt-1">
                {getInitials(payment.tenant)}
              </div>
            )}

            {/* Details Column */}
            <div className="min-w-0 flex flex-col gap-1 w-full">
              {/* Tenant Name */}
              {showTenant && (
                <h3 className="font-bold text-slate-800 text-base leading-tight truncate">
                  {payment.tenant}
                </h3>
              )}

              {/* Property Info */}
              {showProperty && (
                <p className="text-xs text-slate-500 font-medium truncate">
                  {payment.property} {payment.unit && `• Unit ${payment.unit}`}
                </p>
              )}

              {/* Payment Method - If no tenant/property, this becomes the 'title' visual */}
              {showMethod && (
                <div
                  className={`${
                    !showTenant && !showProperty ? "mt-0" : "mt-2"
                  }`}
                >
                  <PaymentMethodBadge method={payment.method} />
                </div>
              )}

              {/* Reference Number */}
              {showRef && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 pl-1">
                  <Hash size={12} className="opacity-50" />
                  <span className="font-mono tracking-wide">
                    {payment.ref || "NO-REF"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* --- ROW 3: Footer (Amount & Status) --- */}
          <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-auto">
            {showAmount && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Amount Paid
                </p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱{payment.amount.toLocaleString()}
                </p>
              </div>
            )}

            {showStatus && (
              <Badge
                {...getBadgeProps(payment.status)}
                size="md"
                className="py-1 shadow-sm"
              >
                {payment.status}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentsCardView;
