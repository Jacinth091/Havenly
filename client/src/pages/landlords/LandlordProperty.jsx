import {
  Archive,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getProperties } from "../../api/property.api"; // Adjust path as needed
import Badge from "../../components/dashboard/Badge"; // Adjust path as needed

// Helper Hook for Debouncing Search (Prevents API flooding)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Helper to generate consistent colors based on ID (since API doesn't return image_color)
const getColorById = (id) => {
  const colors = [
    "bg-blue-100",
    "bg-emerald-100",
    "bg-amber-100",
    "bg-purple-100",
    "bg-indigo-100",
    "bg-rose-100",
  ];
  return colors[id % colors.length];
};

const ITEMS_PER_PAGE = 10; // Matches your API default

const LandlordProperties = () => {
  // UI State
  const [viewMode, setViewMode] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500); // Wait 500ms after typing

  // Data State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_items: 0,
    limit: ITEMS_PER_PAGE,
  });

  // Fetch Data Function
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const result = await getProperties({
        page: pagination.current_page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
      });

      if (result.success) {
        setProperties(result.properties);
        setPagination((prev) => ({
          ...prev,
          ...result.pagination,
        }));
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [pagination.current_page, debouncedSearch]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [debouncedSearch]);

  const handlePageChange = (direction) => {
    if (
      direction === "next" &&
      pagination.current_page < pagination.last_page
    ) {
      setPagination((prev) => ({
        ...prev,
        current_page: prev.current_page + 1,
      }));
    } else if (direction === "prev" && pagination.current_page > 1) {
      setPagination((prev) => ({
        ...prev,
        current_page: prev.current_page - 1,
      }));
    }
  };

  // Helper: Occupancy Percentage
  const getOccupancyRate = (occupied, total) => {
    if (!total || total === 0) return 0;
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
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : properties.length === 0 ? (
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
                {properties.map((prop) => (
                  <tr
                    key={prop.property_id}
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
                              prop.occupied_rooms_count === prop.total_rooms
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${getOccupancyRate(
                                prop.occupied_rooms_count,
                                prop.total_rooms
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {prop.occupied_rooms_count}/{prop.total_rooms}
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
          {properties.map((prop) => (
            <div
              key={prop.property_id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg ${getColorById(
                        prop.property_id
                      )} flex items-center justify-center text-slate-700`}
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
                      {getOccupancyRate(
                        prop.occupied_rooms_count,
                        prop.total_rooms
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prop.occupied_rooms_count === prop.total_rooms
                          ? "bg-emerald-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${getOccupancyRate(
                          prop.occupied_rooms_count,
                          prop.total_rooms
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>{prop.occupied_rooms_count} Occupied</span>
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
          Showing page{" "}
          <span className="font-medium text-slate-900">
            {pagination.current_page}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900">
            {pagination.last_page}
          </span>{" "}
          ({pagination.total_items} properties)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={pagination.current_page === 1 || loading}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => handlePageChange("next")}
            disabled={
              pagination.current_page === pagination.last_page || loading
            }
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
