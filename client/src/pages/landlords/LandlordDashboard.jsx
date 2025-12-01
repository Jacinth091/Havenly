import {
  Building2,
  Calendar,
  DollarSign,
  Home,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";

function LandlordDashboard() {
  const stats = [
    {
      title: "Total Properties",
      value: "12",
      change: "+2",
      trend: "up",
      icon: Building2,
      color: "blue",
    },
    {
      title: "Total Rooms",
      value: "48",
      change: "+4",
      trend: "up",
      icon: Home,
      color: "green",
    },
    {
      title: "Occupied Rooms",
      value: "36",
      change: "+3",
      trend: "up",
      icon: Users,
      color: "purple",
    },
    {
      title: "Monthly Revenue",
      value: "$45,600",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "orange",
    },
  ];

  const properties = [
    {
      id: 1,
      name: "Sunset Apartments",
      address: "123 Main St, Cityville",
      rooms: 12,
      occupied: 10,
      revenue: "$14,400",
    },
    {
      id: 2,
      name: "Green Villa",
      address: "456 Oak Ave, Townsville",
      rooms: 8,
      occupied: 6,
      revenue: "$9,600",
    },
    {
      id: 3,
      name: "Downtown Suites",
      address: "789 Center Blvd, Metropolis",
      rooms: 16,
      occupied: 14,
      revenue: "$19,200",
    },
  ];

  const recentPayments = [
    {
      id: 1,
      tenant: "Emma Wilson",
      room: "A-101",
      amount: 1200,
      date: "2024-11-01",
      status: "Paid",
    },
    {
      id: 2,
      tenant: "James Brown",
      room: "B-205",
      amount: 1500,
      date: "2024-11-01",
      status: "Pending",
    },
    {
      id: 3,
      tenant: "Lisa Wong",
      room: "C-308",
      amount: 1100,
      date: "2024-10-30",
      status: "Paid",
    },
  ];

  const upcomingTasks = [
    { id: 1, task: "Renew lease for Room A-101", due: "Dec 15" },
    { id: 2, task: "Schedule property inspection", due: "Dec 20" },
    { id: 3, task: "Update tenant contact info", due: "Next week" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Landlord Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Manage your properties and tenants
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Properties List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                My Properties
              </h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {property.name}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {property.address}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {property.rooms} rooms
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Occupied</p>
                      <p className="text-lg font-bold text-green-600">
                        {property.occupied}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="text-lg font-bold text-blue-600">
                        {property.rooms - property.occupied}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Monthly Revenue</p>
                      <p className="text-lg font-bold text-gray-900">
                        {property.revenue}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Payments
            </h3>

            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.tenant}
                      </p>
                      <p className="text-sm text-gray-600">
                        Room {payment.room}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {payment.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Tasks
            </h3>

            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 hover:bg-blue-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {task.task}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Due: {task.due}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              Manage Tasks →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandlordDashboard;
