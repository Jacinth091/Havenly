import {
  Archive,
  Building2,
  Loader2,
  MapPin,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProperties } from "../../api/property.api";
import Badge from "../../components/dashboard/Badge";
import FilterDropdown from "../../components/ui/Dropdown";
import Pagination from "../../components/ui/Pagination";
import { ViewToggles } from "../../components/ui/StatusControlTab";

const PropertyIcon = ({ id }) => {
  const colors = [
    "bg-blue-50 text-blue-600",
    "bg-purple-50 text-purple-600",
    "bg-indigo-50 text-indigo-600",
    "bg-rose-50 text-rose-600",
    "bg-cyan-50 text-cyan-600",
  ];
  const colorClass = colors[(id || 0) % colors.length];

  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} ring-1 ring-inset ring-black/5`}
    >
      <Building2 size={20} />
    </div>
  );
};

const ITEMS_PER_PAGE = 6;

const LandlordProperties = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [availableCities, setAvailableCities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [limit, setLimit] = useState(ITEMS_PER_PAGE);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_items: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProperties();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, pagination.current_page, limit, cityFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.current_page,
        limit: limit,
        search: searchTerm,
        ...(cityFilter !== "All" && { city: cityFilter }),
        statusTab: "All",
      };

      const result = await getProperties(queryParams);

      if (result.success) {
        setProperties(result.properties);
        if (result.cities && Array.isArray(result.cities)) {
          setAvailableCities(result.cities);
        }
        setPagination((prev) => ({
          ...prev,
          last_page: result.pagination.last_page,
          total_items: result.pagination.total_items,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOccupancyRate = (occupied, total) => {
    if (!total) return 0;
    return Math.round((occupied / total) * 100);
  };

  // --- HANDLERS ---
  const handleCityChange = (newValue) => {
    setCityFilter(newValue);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      {/* --- Header Section --- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Properties
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Manage your building portfolio and occupancy health.
            </p>
          </div>
          <button
            onClick={() => navigate("/landlord/properties/create")}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:transform active:scale-95"
          >
            <Plus size={18} />
            Add Property
          </button>
        </div>

        {/* --- Toolbar --- */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* 1. Search Bar */}
            <div className="relative w-full md:flex-1 group z-10">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Search unit or tenant..."
                value={searchTerm}
                onChange={handleSearchChange} // Updated Handler
                className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* 2. Controls Wrapper */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-48 z-20">
                <FilterDropdown
                  label="Filter by City"
                  icon={MapPin}
                  options={availableCities}
                  value={cityFilter === "All" ? "" : cityFilter}
                  onChange={handleCityChange}
                />
              </div>

              <div className="shrink-0">
                <ViewToggles mode={viewMode} setMode={setViewMode} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* --- Content Area --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <p className="text-slate-500 text-sm font-medium">
              Loading properties...
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No properties found
            </h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
              We couldn't find any properties matching your search. Try
              adjusting filters or add a new building.
            </p>
          </div>
        ) : (
          <>
            {viewMode === "card" ? (
              /* --- CARD VIEW --- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => {
                  const occupancy = getOccupancyRate(
                    prop.occupied_rooms_count,
                    prop.total_rooms
                  );
                  return (
                    <div
                      key={prop.property_id}
                      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 flex flex-col h-full"
                    >
                      {/* Card Header */}
                      <div className="p-5 flex items-start justify-between border-b border-slate-50">
                        <div className="flex gap-4">
                          <PropertyIcon id={prop.property_id} />
                          <div>
                            <h3
                              className="font-bold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer"
                              onClick={() =>
                                navigate(
                                  `/landlord/properties/${prop.property_id}`
                                )
                              }
                            >
                              {prop.property_name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
                              <MapPin size={12} />
                              <span className="truncate max-w-[150px]">
                                {prop.city}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant="dot"
                          color={prop.is_active ? "emerald" : "amber"}
                        >
                          {prop.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Card Metrics */}
                      <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="space-y-4">
                          {/* Occupancy Bar */}
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Occupancy
                              </span>
                              <span
                                className={`text-sm font-bold ${
                                  occupancy >= 90
                                    ? "text-emerald-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {occupancy}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  occupancy === 100
                                    ? "bg-emerald-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-1.5 font-medium">
                              <span className="text-xs text-slate-400">
                                {prop.occupied_rooms_count} Occupied
                              </span>
                              <span className="text-xs text-slate-400">
                                {prop.total_rooms} Units
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 rounded-b-xl">
                        <button
                          onClick={() =>
                            navigate(`/landlord/properties/${prop.property_id}`)
                          }
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all active:scale-95"
                        >
                          <Settings size={14} /> Manage
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/landlord/properties/${prop.property_id}/tenants`
                            )
                          }
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all shadow-sm"
                        >
                          <Users size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* --- LIST VIEW --- */
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider">
                          Occupancy
                        </th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase text-xs tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {properties.map((prop) => (
                        <tr
                          key={prop.property_id}
                          className="hover:bg-slate-50 transition-colors group cursor-pointer"
                          onClick={() =>
                            navigate(`/landlord/properties/${prop.property_id}`)
                          }
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <PropertyIcon id={prop.property_id} />
                              <div className="font-bold text-slate-800">
                                {prop.property_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">
                            {prop.address}, {prop.city}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500 font-medium">
                                  {prop.occupied_rooms_count}/{prop.total_rooms}
                                </span>
                                <span className="font-bold text-slate-700">
                                  {getOccupancyRate(
                                    prop.occupied_rooms_count,
                                    prop.total_rooms
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${getOccupancyRate(
                                      prop.occupied_rooms_count,
                                      prop.total_rooms
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="dot"
                              color={prop.is_active ? "emerald" : "amber"}
                            >
                              {prop.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Archive size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/landlord/properties/${prop.property_id}`
                                  );
                                }}
                                className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-500"
                              >
                                <Settings size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- Pagination --- */}
            {!loading && pagination.total_items > 0 && (
              <div className="mt-2 pt-4 border-t border-slate-200">
                <Pagination
                  currentPage={pagination.current_page}
                  totalItems={pagination.total_items}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LandlordProperties;
