import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useEffect, useState } from "react";

const StatCard = ({
  title,
  value,
  change,
  trend,
  subtext,
  icon: Icon,
  color = "blue",
  isLoading = false,
  showProgress = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Extract numeric value safely
  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;

  // Theme configuration
  const themes = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-500",
      ring: "focus:ring-blue-500",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-500",
      ring: "focus:ring-emerald-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-500",
      ring: "focus:ring-purple-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-500",
      ring: "focus:ring-orange-500",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-500",
      ring: "focus:ring-red-500",
    },
  };

  const theme = themes[color] || themes.blue;

  // Animation effect for the number counter
  useEffect(() => {
    if (isLoading) return;

    let start = 0;
    const end = numericValue || 0;
    const duration = 1000;
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericValue, isLoading]);

  // Determine trend icon and color
  const getTrendDetails = () => {
    if (trend === "up" || (typeof change === "number" && change > 0)) {
      return {
        icon: ArrowUp,
        color: "text-emerald-600 bg-emerald-100",
        label: "Increased",
      };
    }
    if (trend === "down" || (typeof change === "number" && change < 0)) {
      return {
        icon: ArrowDown,
        color: "text-red-600 bg-red-100",
        label: "Decreased",
      };
    }
    return {
      icon: Minus,
      color: "text-slate-600 bg-slate-100",
      label: "No change",
    };
  };

  const { icon: TrendIcon, color: trendColor } = getTrendDetails();

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        </div>
        <div className="mt-4 h-2 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div
      className={`
      relative group bg-white rounded-xl shadow-sm border border-slate-200 p-6
      transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden
      border-l-4 ${theme.border}
    `}
    >
      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

      <div className="relative flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
              {/* Intelligent Formatting: Detects currency/percentage or defaults to locale number */}
              {value.toString().includes("₱")
                ? `₱${displayValue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`
                : value.toString().includes("%")
                ? `${displayValue.toFixed(1)}%`
                : displayValue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
              {value.toString().includes("k") && "k"}
            </h3>
          </div>

          {/* Change Indicator */}
          {change && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${trendColor}`}
              >
                <TrendIcon size={12} className="mr-1" />
                {change}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                vs last month
              </span>
            </div>
          )}

          {/* Optional Subtext (e.g., "5 Pending") */}
          {subtext && !change && (
            <p className="text-xs text-slate-500 mt-2 font-medium">{subtext}</p>
          )}
        </div>

        {/* Icon Container */}
        <div
          className={`
          p-3 rounded-xl ${theme.bg} ${theme.text} 
          shadow-sm group-hover:scale-110 transition-transform duration-300
        `}
        >
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>

      {/* Optional Progress Bar */}
      {showProgress && (
        <div className="mt-4 relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
              trend === "down"
                ? "bg-red-500"
                : color === "orange"
                ? "bg-orange-500" // Custom check for orange theme
                : "bg-emerald-500"
            }`}
            style={{ width: trend === "down" ? "35%" : "75%" }} // Mock width based on trend
          />
        </div>
      )}
    </div>
  );
};

export default StatCard;
