import { TrendingDown, TrendingUp } from "lucide-react";

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div
            className={`flex items-center mt-2 text-sm ${
              trend === "up" ? "text-success-600" : "text-danger-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{change} from last month</span>
          </div>
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
