import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  List,
  MapPin,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useState } from "react";

// SCHEMA MAPPING: Aggregated data from 'properties' (grouped by city) and 'users' (grouped by role)
const MOCK_CITY_STATS = [
  {
    id: 1,
    city: "Cebu City",
    property_count: 24,
    room_count: 120,
    active_rate: 95,
  },
  {
    id: 2,
    city: "Mandaue City",
    property_count: 18,
    room_count: 85,
    active_rate: 88,
  },
  {
    id: 3,
    city: "Lapu-Lapu City",
    property_count: 12,
    room_count: 60,
    active_rate: 92,
  },
  {
    id: 4,
    city: "Talisay City",
    property_count: 8,
    room_count: 35,
    active_rate: 75,
  },
  {
    id: 5,
    city: "Consolacion",
    property_count: 5,
    room_count: 20,
    active_rate: 100,
  },
  { id: 6, city: "Liloan", property_count: 3, room_count: 15, active_rate: 60 },
  {
    id: 7,
    city: "Minglanilla",
    property_count: 2,
    room_count: 10,
    active_rate: 50,
  },
  {
    id: 8,
    city: "Naga City",
    property_count: 1,
    room_count: 5,
    active_rate: 100,
  },
];

const USER_DISTRIBUTION = [
  { role: "Tenants", count: 450, color: "bg-blue-500", percentage: 65 },
  { role: "Landlords", count: 120, color: "bg-emerald-500", percentage: 25 },
  { role: "Admins", count: 15, color: "bg-purple-500", percentage: 10 },
];

const ITEMS_PER_PAGE = 4;

const AdminAnalytics = () => {
  const [viewMode, setViewMode] = useState("chart"); // 'chart' (Visual) | 'list' (Table)
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Data
  const filteredCities = MOCK_CITY_STATS.filter((stat) =>
    stat.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredCities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredCities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            System Analytics
          </h2>
          <p className="text-sm text-slate-600">
            Platform growth and demographic distribution reports.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm">
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="text-blue-600 mt-0.5 shrink-0" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-800">
            Scope Limitation Note
          </h4>
          <p className="text-xs text-blue-600 mt-1">
            Financial forecasting and advanced accounting features are excluded
            from this system . Revenue data displayed is aggregated from
            manually recorded transactions only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Card (Fixed Visualization) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-800">User Role Distribution</h3>
          </div>

          {/* Stacked Bar Visual */}
          <div className="flex h-4 w-full rounded-full overflow-hidden mb-6">
            {USER_DISTRIBUTION.map((item) => (
              <div
                key={item.role}
                className={item.color}
                style={{ width: `${item.percentage}%` }}
                title={`${item.role}: ${item.percentage}%`}
              />
            ))}
          </div>

          {/* Legend / List */}
          <div className="space-y-4">
            {USER_DISTRIBUTION.map((item) => (
              <div
                key={item.role}
                className="flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-slate-600">
                    {item.role}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-800">
                    {item.count}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.percentage}% of total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Geographic Density (Toggleable) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {/* Controls Header */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <MapPin size={20} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-800">
                Property Density by City
              </h3>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:w-48">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Filter city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                <button
                  onClick={() => setViewMode("chart")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "chart"
                      ? "bg-white shadow-sm text-slate-800"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Chart View"
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-slate-800"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* View Content */}
          <div className="p-6 flex-grow">
            {viewMode === "chart" ? (
              /* CHART VIEW (Cards with Bars) */
              <div className="space-y-4">
                {currentData.map((stat) => (
                  <div key={stat.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">
                        {stat.city}
                      </span>
                      <span className="text-slate-500">
                        {stat.property_count} Properties
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${(stat.property_count / 30) * 100}%`,
                        }} // Mock max scale
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{stat.room_count} Total Rooms</span>
                      <span>{stat.active_rate}% Active</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW (Table) */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="pb-3">City / Location</th>
                      <th className="pb-3">Properties</th>
                      <th className="pb-3">Total Rooms</th>
                      <th className="pb-3 text-right">Activity Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentData.map((stat) => (
                      <tr key={stat.id}>
                        <td className="py-3 font-medium text-slate-700">
                          {stat.city}
                        </td>
                        <td className="py-3 text-slate-600">
                          {stat.property_count}
                        </td>
                        <td className="py-3 text-slate-600">
                          {stat.room_count}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              stat.active_rate >= 90
                                ? "bg-emerald-100 text-emerald-700"
                                : stat.active_rate >= 70
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {stat.active_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange("next")}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
