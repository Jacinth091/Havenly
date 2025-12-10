import {
  Banknote,
  Building,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";

const PaymentMethodBadge = ({ method, className = "" }) => {
  let icon = <Wallet size={14} strokeWidth={2} />;
  let colorClass = "bg-slate-100 text-slate-600 border-slate-200";

  const lowerMethod = method?.toLowerCase() || "";

  if (lowerMethod.includes("bank") || lowerMethod.includes("transfer")) {
    icon = <Building size={14} strokeWidth={2} />;
    colorClass = "bg-indigo-50 text-indigo-600 border-indigo-100";
  } else if (lowerMethod.includes("gcash") || lowerMethod.includes("wallet")) {
    icon = <Smartphone size={14} strokeWidth={2} />;
    colorClass = "bg-blue-50 text-blue-600 border-blue-100";
  } else if (lowerMethod.includes("cash")) {
    icon = <Banknote size={14} strokeWidth={2} />;
    colorClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
  } else if (lowerMethod.includes("cheque") || lowerMethod.includes("check")) {
    icon = <CreditCard size={14} strokeWidth={2} />;
    colorClass = "bg-amber-50 text-amber-700 border-amber-100";
  }

  return (
    <span
      className={`
        flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-lg border 
        text-[10px] sm:text-[11px] font-bold uppercase tracking-wide transition-colors
        w-fit justify-start
        ${colorClass} ${className}
      `}
      title={method}
    >
      {icon}
      <span className="inline">{method}</span>
    </span>
  );
};

export default PaymentMethodBadge;
