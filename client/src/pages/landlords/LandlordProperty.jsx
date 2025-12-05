import {
  Archive,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'properties' table
// Columns: property_id, property_name, address, city, total_rooms, is_active
const MOCK_PROPERTIES = [
  {
    id: 1,
    property_name: "Sunset Heights",
    address: "123 Sunset Blvd",
    city: "Cebu City", // Schema Requirement
    total_rooms: 10,
    occupied_rooms: 8, // Derived from 'rooms' table count
    est_revenue: 120000, // Derived from active 'leases'
    is_active: true,
    image_color: "bg-blue-100",
  },
  {
    id: 2,
    property_name: "Ocean View Apts",
    address: "45 Coastal Rd",
    city: "Mandaue City",
    total_rooms: 5,
    occupied_rooms: 2,
    est_revenue: 35000,
    is_active: true,
    image_color: "bg-emerald-100",
  },
  {
    id: 3,
    property_name: "Mountain Villas",
    address: "88 Hilltop Dr",
    city: "Talamban",
    total_rooms: 4,
    occupied_rooms: 4, // Full occupancy
    est_revenue: 80000,
    is_active: false, // Under Maintenance/Renovation
    image_color: "bg-amber-100",
  },
  {
    id: 4,
    property_name: "City Central Flats",
    address: "909 Osmena Blvd",
    city: "Cebu City",
    total_rooms: 12,
    occupied_rooms: 10,
    est_revenue: 150000,
    is_active: true,
    image_color: "bg-purple-100",
  },
  {
    id: 5,
    property_name: "Riverside Loft",
    address: "12 River Rd",
    city: "Mandaue City",
    total_rooms: 6,
    occupied_rooms: 0,
    est_revenue: 0,
    is_active: true,
    image_color: "bg-indigo-100",
  },
];

const ITEMS_PER_PAGE = 3;

const LandlordProperties = () => {
  const [viewMode, setViewMode] = useState("card"); // 'list' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter
  const filteredProps = MOCK_PROPERTIES.filter(
    (p) =>
      p.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredProps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredProps.slice(
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

  // Helper: Occupancy Percentage
  const getOccupancyRate = (occupied, total) => {
    if (!total) return 0;
    return Math.round((occupied / total) * 100);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Properties</h2>
          <p className="text-sm text-slate-600">
            Manage buildings, occupancy, and status.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-all">
          <Plus size={16} /> New Property
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search property or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "card"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredProps.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <Building2 size={32} className="mx-auto mb-2 opacity-50" />
          No properties found.
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Property Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Occupancy</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((prop) => (
                  <tr
                    key={prop.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        {prop.property_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {prop.total_rooms} Units
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {prop.city}
                        </span>
                        <span className="text-xs text-slate-400">
                          {prop.address}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prop.occupied_rooms === prop.total_rooms
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${getOccupancyRate(
                                prop.occupied_rooms,
                                prop.total_rooms
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {prop.occupied_rooms}/{prop.total_rooms}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={prop.is_active ? "blue" : "amber"}>
                        {prop.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
                          <Edit size={16} />
                        </button>
                        <button
                          title="Archive"
                          className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentData.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg ${prop.image_color} flex items-center justify-center text-slate-700`}
                    >
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">
                        {prop.property_name}
                      </h3>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {prop.city}
                      </div>
                    </div>
                  </div>
                  <Badge color={prop.is_active ? "blue" : "amber"}>
                    {prop.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Occupancy Stats */}
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between items-end text-sm">
                    <span className="text-slate-500 font-medium">
                      Occupancy
                    </span>
                    <span className="font-bold text-slate-700">
                      {getOccupancyRate(prop.occupied_rooms, prop.total_rooms)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prop.occupied_rooms === prop.total_rooms
                          ? "bg-emerald-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${getOccupancyRate(
                          prop.occupied_rooms,
                          prop.total_rooms
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>{prop.occupied_rooms} Occupied</span>
                    <span>{prop.total_rooms} Units Total</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-2">
                <button className="flex-1 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Settings size={14} /> Manage
                </button>
                <button className="flex-1 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Users size={14} /> Tenants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4">
        <span className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-900">{startIndex + 1}</span>{" "}
          to{" "}
          <span className="font-medium text-slate-900">
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredProps.length)}
          </span>{" "}
          of {filteredProps.length} properties
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordProperties;
