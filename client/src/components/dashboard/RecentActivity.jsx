import { AlertCircle, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";

function RecentActivity({ activities }) {
  const [expandedId, setExpandedId] = useState(null);

  const getStatusConfig = (status) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle2,
          bg: "bg-green-100",
          text: "text-green-800",
          iconColor: "text-green-500",
          pulse: true,
        };
      case "warning":
        return {
          icon: AlertCircle,
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          iconColor: "text-yellow-500",
          pulse: true,
        };
      case "error":
        return {
          icon: AlertCircle,
          bg: "bg-red-100",
          text: "text-red-800",
          iconColor: "text-red-500",
          pulse: true,
        };
      default:
        return {
          icon: Clock,
          bg: "bg-gray-100",
          text: "text-gray-800",
          iconColor: "text-gray-500",
          pulse: false,
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
        <button className="group flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-300">
          View All
          <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const statusConfig = getStatusConfig(activity.status);
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedId === activity.id;

          return (
            <div
              key={activity.id}
              onClick={() => setExpandedId(isExpanded ? null : activity.id)}
              className={`
                group relative cursor-pointer overflow-hidden
                rounded-lg border p-3 sm:p-4
                ${
                  isExpanded
                    ? "border-primary-300 bg-primary-50"
                    : "border-gray-200 hover:border-primary-200"
                }
                transition-all duration-300 transform hover:-translate-y-0.5
                ${index > 0 ? "opacity-0 animate-slide-up" : ""}
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              {/* Timeline indicator */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-0.5 h-full bg-gray-200 group-hover:bg-primary-200 transition-colors duration-300" />

              <div className="relative flex items-start space-x-3 sm:space-x-4 pl-6">
                {/* Icon with pulse animation */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`
                    p-2 rounded-full bg-gray-100 group-hover:bg-white
                    transition-all duration-300 ${
                      statusConfig.pulse ? "animate-pulse-slow" : ""
                    }
                  `}
                  >
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        isExpanded ? "text-primary-600" : "text-gray-600"
                      } transition-colors duration-300`}
                    />
                  </div>

                  {/* Status indicator */}
                  <div
                    className={`absolute -top-1 -right-1 p-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isExpanded ? "text-primary-900" : "text-gray-900"
                    }`}
                  >
                    {activity.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </span>

                    <span
                      className={`
                      inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${statusConfig.bg} ${statusConfig.text}
                      transition-all duration-300 transform group-hover:scale-105
                    `}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      <span className="capitalize">{activity.status}</span>
                    </span>
                  </div>

                  {/* Expandable details */}
                  <div
                    className={`
                    overflow-hidden transition-all duration-300
                    ${
                      isExpanded
                        ? "max-h-20 mt-3 opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                  >
                    <div className="text-xs text-gray-600 bg-white/50 p-2 rounded border border-gray-200">
                      Activity details and additional information...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentActivity;
