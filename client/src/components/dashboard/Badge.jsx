import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  XCircle,
} from "lucide-react";

const Badge = ({
  children,
  color = "slate",
  icon: Icon,
  variant = "default", // Options: 'default' (icon) | 'dot' (status dot)
  size = "md",
  className = "",
}) => {
  const colors = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-100",
      dot: "bg-blue-500",
      icon: Info,
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-100",
      dot: "bg-red-500",
      icon: XCircle,
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
      dot: "bg-amber-500",
      icon: AlertCircle,
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-100",
      dot: "bg-purple-500",
      icon: HelpCircle,
    },
    slate: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200", 
      dot: "bg-slate-500",
      icon: Clock,
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-100",
      dot: "bg-indigo-500",
      icon: Info,
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-100",
      dot: "bg-rose-500",
      icon: XCircle,
    },
  };

  // 2. Size Config
  const sizes = {
    sm: { container: "px-2 py-0.5 text-[10px]", icon: 10, dot: "w-1 h-1" },
    md: { container: "px-2.5 py-0.5 text-xs", icon: 12, dot: "w-1.5 h-1.5" },
    lg: { container: "px-3 py-1 text-sm", icon: 14, dot: "w-2 h-2" },
  };

  const theme = colors[color] || colors.slate;
  const sizeConfig = sizes[size] || sizes.md;

  // Determine which icon to show (Prop icon > Default Theme Icon)
  const ActiveIcon = Icon || theme.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 
        rounded-full font-bold border shadow-sm
        transition-all duration-200 select-none
        whitespace-nowrap
        ${theme.bg} ${theme.text} ${theme.border}
        ${sizeConfig.container}
        ${className}
      `}
    >
      {/* Logic: If variant is 'dot', show the circle. Otherwise show the Icon. */}
      {variant === "dot" ? (
        <span className={`rounded-full ${theme.dot} ${sizeConfig.dot}`} />
      ) : (
        ActiveIcon && (
          <ActiveIcon
            size={sizeConfig.icon}
            className="shrink-0 -ml-0.5 opacity-80"
            strokeWidth={2.5}
          />
        )
      )}

      <span className="truncate">{children}</span>
    </span>
  );
};

export default Badge;
