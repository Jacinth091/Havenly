import {
  Archive,
  Ban,
  Building,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'properties' table JOIN 'landlords'
// Admins need to see WHICH landlord owns the property
const MOCK_PROPERTIES = [
  {
    id: 1,
    property_name: "Sunset Heights",
    address: "123 Sunset Blvd",
    city: "Cebu City",
    landlord: "Maria Santos", // Joined from landlords table
    total_rooms: 10,
    occupied_rooms: 8,
    is_active: true,
  },
  {
    id: 2,
    property_name: "Ocean View Apts",
    address: "45 Coastal Rd",
    city: "Mandaue City",
    landlord: "Pedro Penduko",
    total_rooms: 5,
    occupied_rooms: 2,
    is_active: true,
  },
  {
    id: 3,
    property_name: "Mountain Villas",
    address: "88 Hilltop Dr",
    city: "Talamban",
    landlord: "Maria Santos",
    total_rooms: 4,
    occupied_rooms: 4,
    is_active: false, // Maintenance
  },
  {
    id: 4,
    property_name: "City Central Flats",
    address: "909 Osmena Blvd",
    city: "Cebu City",
    landlord: "Juan Dela Cruz",
    total_rooms: 12,
    occupied_rooms: 10,
    is_active: true,
  },
  {
    id: 5,
    property_name: "Riverside Loft",
    address: "12 River Rd",
    city: "Mandaue City",
    landlord: "Pedro Penduko",
    total_rooms: 6,
    occupied_rooms: 0,
    is_active: true,
  },
];

const ITEMS_PER_PAGE = 4;

const AdminProperties = () => {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  // Unique Cities for Filter Dropdown
  const cities = ["All", ...new Set(MOCK_PROPERTIES.map((p) => p.city))];

  // Filtering Logic
  const filteredProps = MOCK_PROPERTIES.filter((p) => {
    const matchesSearch =
      p.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.landlord.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === "All" || p.city === cityFilter;

    return matchesSearch && matchesCity;
  });

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

  const getOccupancyRate = (occupied, total) => {
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Property Registry
          </h2>
          <p className="text-sm text-slate-600">
            Oversee all registered properties and ownership.
          </p>
        </div>
        {/* Admin doesn't create properties typically (Landlords do), so we focus on Filtering */}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full xl:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search property or landlord..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto justify-end">
          {/* City Filter (Business Rule Requirement) */}
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500/20 cursor-pointer min-w-[160px]"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === "All" ? "All Cities" : city}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
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
          <Building size={32} className="mx-auto mb-2 opacity-50" />
          No properties found matching your filters.
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
                  <th className="px-6 py-4">Owner (Landlord)</th>
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
                        ID: #{prop.id}
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
                      <div className="flex items-center gap-2 text-slate-700">
                        <User size={14} className="text-slate-400" />
                        <span>{prop.landlord}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                        <button
                          title="Deactivate/Archive"
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {prop.property_name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {prop.address}, {prop.city}
                    </div>
                  </div>
                  <Badge color={prop.is_active ? "blue" : "amber"}>
                    {prop.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 space-y-2 mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <User size={14} /> Landlord
                    </span>
                    <span className="font-medium text-slate-700">
                      {prop.landlord}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Building2 size={14} /> Units
                    </span>
                    <span className="font-medium text-slate-700">
                      {prop.occupied_rooms} / {prop.total_rooms} Occupied
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
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
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {prop.id}
                </span>
                <div className="flex gap-2">
                  <button className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
                    View Details
                  </button>
                  <button className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1">
                    <Ban size={12} /> Deactivate
                  </button>
                </div>
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

export default AdminProperties;
