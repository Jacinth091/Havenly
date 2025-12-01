import { motion } from "framer-motion";
import {
  Download,
  Filter,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react";

function QuickActions({ role }) {
  const adminActions = [
    { label: "Add User", icon: Plus, onClick: () => console.log("Add User") },
    {
      label: "System Settings",
      icon: Settings,
      onClick: () => console.log("Settings"),
    },
    {
      label: "Export Data",
      icon: Download,
      onClick: () => console.log("Export"),
    },
    {
      label: "Send Broadcast",
      icon: MessageSquare,
      onClick: () => console.log("Broadcast"),
    },
  ];

  const landlordActions = [
    {
      label: "Add Property",
      icon: Plus,
      onClick: () => console.log("Add Property"),
    },
    {
      label: "Add Tenant",
      icon: Plus,
      onClick: () => console.log("Add Tenant"),
    },
    {
      label: "Generate Report",
      icon: Download,
      onClick: () => console.log("Report"),
    },
    {
      label: "Filter View",
      icon: Filter,
      onClick: () => console.log("Filter"),
    },
  ];

  const tenantActions = [
    {
      label: "Make Payment",
      icon: Plus,
      onClick: () => console.log("Payment"),
    },
    {
      label: "Request Maintenance",
      icon: Settings,
      onClick: () => console.log("Maintenance"),
    },
    {
      label: "Download Receipt",
      icon: Download,
      onClick: () => console.log("Receipt"),
    },
    {
      label: "Contact Landlord",
      icon: MessageSquare,
      onClick: () => console.log("Contact"),
    },
  ];

  const actions =
    role === "Admin"
      ? adminActions
      : role === "Landlord"
      ? landlordActions
      : tenantActions;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.h3
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="text-sm font-semibold text-gray-900 uppercase tracking-wider"
        >
          Quick Actions
        </motion.h3>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(59, 130, 246, 0.05)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="w-5 h-5 text-gray-600 mb-2" />
              </motion.div>
              <span className="text-xs font-medium text-gray-700 text-center">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default QuickActions;
