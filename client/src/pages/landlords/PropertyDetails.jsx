import {
  Archive,
  ArrowLeft,
  Banknote,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  LayoutGrid,
  List,
  LogOut,
  Plus,
  Search,
  User,
  UserPlus,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoomByProperty } from "../../api/property.api";
import Badge from "../../components/dashboard/Badge";
import RoomCard from "../../components/dashboard/Card";
import CardMenu from "../../components/dashboard/CardMenu";
import PropertyInfoCard from "../../components/dashboard/Property/PropertyInfoCard";
import RoomListItem from "../../components/dashboard/RoomList";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ITEMS_PER_PAGE = 6;

const LandlordPropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [summary, setSummary] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    last_page: 1,
    total_items: 0,
  });

  const fetchPropertyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        ...(filter !== "All" && { status: filter }),
      };

      const result = await getRoomByProperty(propertyId, params);

      if (result.success) {
        setProperty(result.property);
        setRooms(result.rooms);
        setSummary(result.summary);
        setPaginationInfo({
          last_page: result.pagination.last_page,
          total_items: result.pagination.total_items,
        });
      } else {
        setError(result.message || "Failed to fetch property details.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [propertyId, currentPage, filter, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch]);

  const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`;

  const handleRoomAction = (actionId, room) => {
    if (actionId === "view_details")
      navigate(`/landlord/properties/${propertyId}/rooms/${room.room_id}`);
    if (actionId === "add_tenant")
      navigate(`/landlord/leases/new?room=${room.room_id}`);
  };

  const getMenuOptions = (status) => {
    switch (status) {
      case "Occupied":
        return [
          { id: "view_lease", label: "View Lease", icon: FileText },
          { id: "record_payment", label: "Record Payment", icon: Banknote },
          { id: "maintenance", label: "Report Issue", icon: Wrench },
          { type: "divider" },
          {
            id: "end_lease",
            label: "End Lease",
            icon: LogOut,
            className: "text-red-600 hover:bg-red-50",
          },
        ];
      case "Available":
        return [
          {
            id: "add_tenant",
            label: "Add Tenant",
            icon: UserPlus,
            className: "text-emerald-600 hover:bg-emerald-50 font-medium",
          },
          { id: "set_maintenance", label: "Maintenance", icon: Wrench },
          { id: "edit_room", label: "Edit Details", icon: Edit },
        ];
      case "Maintenance":
        return [
          {
            id: "set_available",
            label: "Mark Available",
            icon: BedDouble,
            className: "text-emerald-600 hover:bg-emerald-50",
          },
          { id: "edit_room", label: "Edit Details", icon: Edit },
          { type: "divider" },
          {
            id: "delete_room",
            label: "Archive Room",
            icon: Archive,
            className: "text-red-600 hover:bg-red-50",
          },
        ];
      default:
        return [];
    }
  };

  const getCount = (status) => {
    if (status === "All") return property.total_rooms || 0;
    if (status === "Available") return property.available_rooms_count || 0;
    if (status === "Occupied") return property.occupied_rooms_count || 0;
    if (status === "Maintenance") return property.maintenance_rooms_count || 0;
    return 0;
  };

  if (loading && !property) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
        <p className="text-lg font-medium">{error || "Property not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-emerald-600 underline mt-2 hover:text-emerald-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen font-sans text-slate-800 animate-fade-in">
      {/* 1. Header Row (Unified Div) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        {/* Left Side: Back Button + Title Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/landlord/properties")}
            className="group p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
            title="Back to Properties"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
              {property.name || "Property Overview"}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Property Management Dashboard
            </p>
          </div>
        </div>

        {/* Right Side: Action Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all">
          <Plus size={18} /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* === SIDEBAR (Responsive Property Info) === */}
        <div className="lg:col-span-1 space-y-6">
          <PropertyInfoCard property={property} />
        </div>

        {/* === MAIN CONTENT === */}
        <div className="lg:col-span-3">
          {/* 2. RESPONSIVE TOOLBAR */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
            {/* SEARCH & VIEW TOGGLES */}
            <div className="flex w-full md:w-auto items-center gap-2 flex-1">
              <div className="relative flex-1 md:max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search unit or tenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "card"
                      ? "bg-white shadow-sm text-emerald-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-emerald-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* FILTER TABS */}
            <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1 md:border-l border-slate-100 md:pl-3">
              {["All", "Available", "Occupied", "Maintenance"].map((status) => {
                const isActive = filter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {status}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {getCount(status)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Rooms Grid/List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <Search size={24} className="opacity-50" />
              </div>
              <p className="text-base font-medium text-slate-600">
                No rooms found
              </p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {viewMode === "list" ? (
                /* --- LIST VIEW --- */
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 font-semibold text-slate-500">
                            Room
                          </th>
                          <th className="px-6 py-3 font-semibold text-slate-500">
                            Status
                          </th>
                          <th className="px-6 py-3 font-semibold text-slate-500">
                            Tenant
                          </th>
                          <th className="hidden md:table-cell px-6 py-3 font-semibold text-slate-500">
                            Rent
                          </th>
                          <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rooms.map((room) => (
                          <RoomListItem
                            key={room.room_id}
                            room={room}
                            getInitials={getInitials}
                            onClick={() =>
                              handleRoomAction("view_details", room)
                            }
                            menu={
                              <CardMenu
                                options={getMenuOptions(room.room_status)}
                                onAction={(actionId) =>
                                  handleRoomAction(actionId, room)
                                }
                              />
                            }
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* --- GRID VIEW --- */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
                  {rooms.map((room) => {
                    const statusColor =
                      {
                        Occupied: "emerald",
                        Maintenance: "amber",
                        Available: "blue",
                      }[room.room_status] || "slate";
                    return (
                      <RoomCard
                        key={room.room_id}
                        status={room.room_status}
                        onClick={() => handleRoomAction("view_details", room)}
                        icon={
                          room.room_status === "Maintenance" ? (
                            <Wrench size={20} />
                          ) : (
                            <BedDouble size={20} />
                          )
                        }
                        menu={
                          <CardMenu
                            options={getMenuOptions(room.room_status)}
                            onAction={(a) => handleRoomAction(a, room)}
                          />
                        }
                        footer={
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
                            <div className="flex items-center gap-2">
                              {room.tenant ? (
                                <>
                                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                                    {getInitials(
                                      room.tenant.first_name,
                                      room.tenant.last_name
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">
                                      {room.tenant.last_name}
                                    </span>
                                    <span className="text-[10px] font-medium text-emerald-600">
                                      Active
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center ring-2 ring-white">
                                    <User size={16} />
                                  </div>
                                  <span className="text-xs text-slate-400 italic">
                                    Vacant
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Rent
                              </p>
                              <p className="text-sm font-bold text-slate-700">
                                ₱{room.monthly_rent.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        }
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Unit
                          </span>
                          <Badge color={statusColor} size="sm">
                            {room.room_status}
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                          {room.room_number}
                        </h3>
                      </RoomCard>
                    );
                  })}
                </div>
              )}

              {/* --- PAGINATION --- */}
              {paginationInfo.last_page > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-6">
                  <span className="text-sm text-slate-500">
                    Page {currentPage} of {paginationInfo.last_page}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, paginationInfo.last_page)
                        )
                      }
                      disabled={currentPage === paginationInfo.last_page}
                      className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordPropertyDetails;
