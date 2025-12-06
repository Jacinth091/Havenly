import {
  Archive,
  Banknote,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  LogOut,
  Plus,
  Search,
  User,
  UserPlus,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRooms } from "../../api/room.api";
import Badge from "../../components/dashboard/Badge";
import RoomCard from "../../components/dashboard/Card";
import CardMenu from "../../components/dashboard/CardMenu";
import RoomListItem from "../../components/dashboard/ListComponent";
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

const ITEMS_PER_PAGE = 8;

const LandlordRooms = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_items: 0,
    limit: ITEMS_PER_PAGE,
  });

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page: pagination.current_page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        ...(statusFilter !== "All" && { status: statusFilter }),
      };

      const result = await getAllRooms(queryParams);

      if (result.success) {
        setRooms(result.rooms);
        setSummary(result.summary || {});
        setPagination({
          current_page: result.pagination.current_page,
          last_page: result.pagination.last_page,
          total_items: result.pagination.total_items,
          limit: result.pagination.limit,
        });
      } else {
        setError(result.message);
        setRooms([]);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [pagination.current_page, debouncedSearch, statusFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [debouncedSearch, statusFilter]);

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

  const handleRoomAction = (actionId, room) => {
    if (actionId === "view_details")
      navigate(
        `/landlord/properties/${room.property_id}/rooms/${room.room_id}`
      );
  };

  const getInitials = (first, last) =>
    `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`;

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Room Management
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            View and manage all rental units across your properties.
          </p>
        </div>
        <button
          onClick={() => navigate("/landlord/rooms/new")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg transition-all"
        >
          <Plus size={18} /> Add Room
        </button>
      </div>

      {/* --- CONTROLS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search room number or tenant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Status Filter Tabs */}
          <div className="flex w-full sm:w-auto overflow-x-auto no-scrollbar gap-1 p-1 bg-slate-100/50 rounded-lg border border-slate-200/50">
            {["All", "Available", "Occupied", "Maintenance"].map((status) => {
              const isActive = statusFilter === status;
              let count = 0;
              if (status === "All") {
                count = summary?.All ?? pagination.total_items;
              } else if (summary) {
                count = summary[status] || 0;
              }

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    isActive
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {status}
                  {summary && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive
                          ? "bg-slate-100 text-slate-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-emerald-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "card"
                  ? "bg-white shadow-sm text-emerald-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
          <p>Error: {error}</p>
          <button
            onClick={fetchRooms}
            className="text-emerald-600 underline mt-2 text-sm hover:text-emerald-700"
          >
            Retry
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
          <div className="p-4 bg-slate-50 rounded-full mb-3">
            <BedDouble size={24} className="opacity-50" />
          </div>
          <p className="text-base font-medium text-slate-600">No rooms found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : viewMode === "list" ? (
        /* --- LIST VIEW --- */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-500">
                    Room
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 font-semibold text-slate-500">
                    Property
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
                    onClick={() => handleRoomAction("view_details", room)}
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
        /* --- CARD VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
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
                    onAction={(actionId) => handleRoomAction(actionId, room)}
                  />
                }
                footer={
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                    <div className="flex items-center gap-2">
                      {room.tenant ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
                            {getInitials(
                              room.tenant.first_name,
                              room.tenant.last_name
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">
                              {room.tenant.last_name}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Active
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center ring-2 ring-white">
                            <User size={14} />
                          </div>
                          <span className="text-xs text-slate-400 italic font-medium">
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
                {/* Header inside Card to show Property Name */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="flex items-center gap-1.5 text-slate-400 group/link cursor-pointer hover:text-emerald-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/landlord/properties/${room.property_id}`);
                    }}
                  >
                    <Building2 size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[100px]">
                      {room.property_name}
                    </span>
                    <ExternalLink
                      size={10}
                      className="opacity-0 group-hover/link:opacity-100 transition-opacity"
                    />
                  </div>
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
      {pagination.total_items > ITEMS_PER_PAGE && (
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-6">
          <span className="text-sm text-slate-500">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current_page: Math.max(prev.current_page - 1, 1),
                }))
              }
              disabled={pagination.current_page === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current_page: Math.min(
                    prev.current_page + 1,
                    pagination.last_page
                  ),
                }))
              }
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordRooms;
