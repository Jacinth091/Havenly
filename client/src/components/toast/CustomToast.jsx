import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { toast } from "sonner";

// 1. Define the "Tint" styles based on your Semantic Colors
const variants = {
  success: {
    icon: CheckCircle2,
    iconWrapper: "bg-emerald-50 text-emerald-600", // Brand Color (Growth)
    borderColor: "border-emerald-100", // Subtle bleed
  },
  error: {
    icon: AlertCircle,
    iconWrapper: "bg-red-50 text-red-800", // Critical Alerts
    borderColor: "border-red-100",
  },
  warning: {
    icon: AlertTriangle,
    iconWrapper: "bg-amber-50 text-amber-600", // Warning/Maintenance
    borderColor: "border-amber-100",
  },
  info: {
    icon: Info,
    iconWrapper: "bg-blue-50 text-blue-600", // Information/Links
    borderColor: "border-blue-100",
  },
};

export const CustomToast = ({ type = "success", message, count, t }) => {
  // Handle capitalization safety
  const safeType = (type || "success").toLowerCase();
  const style = variants[safeType] || variants.success;
  const Icon = style.icon;

  return (
    <div
      className={`
      relative flex items-start gap-3 p-4 w-full min-w-[340px]
      bg-white 
      rounded-xl 
      border ${style.borderColor} {/* Fixed: Using dynamic border color */}
      shadow-lg shadow-slate-200/50 
      transition-all duration-300
    `}
    >
      {/* Icon Area */}
      <div className={`shrink-0 p-2 rounded-lg ${style.iconWrapper}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>

      {/* Content Area */}
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-slate-800">
            {/* Capitalize label for display only */}
            {safeType.charAt(0).toUpperCase() + safeType.slice(1)}
          </p>
          {count > 1 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-md border border-slate-200">
              +{count}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600 font-medium leading-relaxed">
          {message}
        </p>
      </div>

      <button
        onClick={() => toast.dismiss(t)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};
