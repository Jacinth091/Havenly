import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

function StatCard({ title, value, change, trend, icon: Icon, color }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-l-blue-500",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-l-green-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-l-purple-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-l-orange-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  // Counter animation
  useEffect(() => {
    if (typeof numericValue === "number") {
      const duration = 1500;
      const step = Math.ceil(numericValue / (duration / 16));
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [numericValue]);

  return (
    <div
      className={`
        group relative bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6
        ${colors.border} border-l-4
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        overflow-hidden
      `}
    >
      {/* Animated background effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="relative flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {value.includes("$") || value.includes("%")
                ? value.replace(/\d+/, count.toString())
                : count}
            </p>
            <div className="flex items-center">
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  trend === "up"
                    ? "bg-green-100 text-green-800 animate-pulse-once"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {trend === "up" ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                {change}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            from last month
          </p>
        </div>
        <div
          className={`ml-4 p-2 sm:p-3 rounded-full ${colors.bg} ${colors.text} transform group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Progress bar indicator */}
      <div className="relative mt-4">
        <div className="overflow-hidden h-1 text-xs flex rounded-full bg-gray-200">
          <div
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
              trend === "up" ? "bg-green-500" : "bg-red-500"
            } animate-progress`}
            style={{ width: trend === "up" ? "75%" : "25%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
