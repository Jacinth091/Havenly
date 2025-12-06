import { AlertCircle, CheckCircle2, Clock, Info, XCircle } from "lucide-react";

const Badge = ({
  children,
  color = "slate",
  icon: Icon,
  size = "md",
  className = "",
}) => {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200", 
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };
  const defaultIcons = {
    emerald: CheckCircle2,
    green: CheckCircle2,
    red: XCircle,
    amber: AlertCircle,
    blue: Info,
    slate: Clock,
  };

  const activeStyle = styles[color] || styles.slate;
  const activeSize = sizes[size] || sizes.md;

  const ActiveIcon = Icon || defaultIcons[color];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 
        rounded-md font-medium border shadow-sm
        transition-all duration-200 select-none
        whitespace-nowrap
        ${activeStyle}
        ${activeSize}
        ${className}
      `}
    >
      {ActiveIcon && (
        <ActiveIcon
          size={size === "sm" ? 10 : size === "lg" ? 16 : 12}
          className="shrink-0 -ml-0.5 opacity-80"
          strokeWidth={2.5}
        />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
};

export default Badge;
