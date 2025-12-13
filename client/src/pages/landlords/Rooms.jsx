import {
  Archive,
  BedDouble,
  Edit,
  Loader2,
  Plus,
  Search,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRooms } from "../../api/room.api";
import CardMenu from "../../components/dashboard/CardMenu";
import RoomListItem from "../../components/dashboard/ListComponent";
import RoomCard from "../../components/dashboard/Property/Rooms/RoomCard";
import AddRoomModal from "../../components/modal/AddRoomModal";
import Pagination from "../../components/ui/Pagination";
import {
  StatusControlTab,
  ViewToggles,
} from "../../components/ui/StatusControlTab";

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

const LandlordRooms = () => {
  const navigate = useNavigate();
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [limit, setLimit] = useState(6);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_items: 0,
  });

  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page: pagination.current_page,
        limit: limit,
        search: debouncedSearch,
        ...(statusFilter !== "All" && { status: statusFilter }),
      };

      const result = await getAllRooms(queryParams);

      if (result.success) {
        // FIX: Add || [] to ensure it never sets undefined
        setRooms(result.rooms || []);
        setSummary(result.summary || {});
        setPagination({
          current_page: result.pagination?.current_page || 1, // Added safety check ?
          last_page: result.pagination?.last_page || 1, // Added safety check ?
          total_items: result.pagination?.total_items || 0, // Added safety check ?
        });
      } else {
        setError(result.message);
        setRooms([]);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      setError("An unexpected error occurred.");
      setRooms([]); // Ensure rooms is an array on error
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchRooms();
  }, [pagination.current_page, debouncedSearch, statusFilter, limit]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [debouncedSearch]);

  // --- HANDLERS ---
  const handleStatusChange = (newStatus) => {
    if (newStatus === statusFilter) return;

    // React batches these updates together so the fetch only happens once
    setStatusFilter(newStatus);
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

  const handleRoomAction = (actionId, room) => {
    if (actionId === "view_details")
      navigate(
        `/landlord/properties/${room.property_id}/rooms/${room.room_id}`
      );
  };

  // --- HELPERS ---
  const getInitials = (first, last) =>
    `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`;

  const getMenuOptions = (status) => {
    // Base option available for all statuses
    const baseOptions = [
      { id: "view_details", label: "View Details", icon: Search },
      { id: "edit_room", label: "Edit Room", icon: Edit },
    ];

    switch (status) {
      case "Occupied":
        return [
          ...baseOptions,
          // Removed: View Lease, Record Payment, End Lease
          { id: "maintenance", label: "Report Issue", icon: Wrench },
        ];

      case "Available":
        return [
          ...baseOptions,
          // Removed: Add Tenant
          { id: "set_maintenance", label: "Set Maintenance", icon: Wrench },
          { type: "divider" },
          {
            id: "delete_room",
            label: "Archive Room",
            icon: Archive,
            className: "text-red-600 hover:bg-red-50",
          },
        ];

      case "Maintenance":
        return [
          ...baseOptions,
          {
            id: "set_available",
            label: "Mark Available",
            icon: BedDouble,
            className: "text-emerald-600 hover:bg-emerald-50",
          },
          { type: "divider" },
          {
            id: "delete_room",
            label: "Archive Room",
            icon: Archive,
            className: "text-red-600 hover:bg-red-50",
          },
        ];

      default:
        return baseOptions;
    }
  };
  const propertyTabs = useMemo(
    () => [
      {
        id: "All",
        label: "All Rooms",
        count: summary?.["All"] || 0,
      },
      {
        id: "Available",
        label: "Available",
        count: summary?.["Available"] || 0,
        color: "emerald",
      },
      {
        id: "Occupied",
        label: "Occupied",
        count: summary?.["Occupied"] || 0,
        color: "blue",
      },
      {
        id: "Maintenance",
        label: "Maintenance",
        count: summary?.["Maintenance"] || 0,
        color: "amber",
      },
    ],
    [rooms, summary]
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        preSelectedProperty={null}
        onSuccess={() => fetchRooms()}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Room Management
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            View and manage all rental units across your properties.
          </p>
        </div>
        <button
          onClick={() => setIsAddRoomOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:transform active:scale-95"
        >
          <Plus size={18} /> Add Room
        </button>
      </div>

      {/* --- CONTROLS TOOLBAR (APPLIED SNIPPET) --- */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
        {/* ROW 1: Search and View Toggles */}
        <div className="flex items-center justify-between gap-3">
          {/* Search Bar (Grows to fill space) */}
          <div className="relative flex-1 group">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search unit or tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* View Toggles (Fixed on the right) */}
          <ViewToggles mode={viewMode} setMode={setViewMode} />
        </div>

        {/* ROW 2: Status Tabs (Full width) */}
        <div className="w-full overflow-x-auto no-scrollbar ">
          <StatusControlTab
            tabs={propertyTabs}
            current={statusFilter}
            onChange={handleStatusChange}
            summary={summary}
            total={summary["All"] || 0}
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-slate-500 text-sm font-medium">Loading rooms...</p>
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
      ) : !rooms || rooms?.length === 0 ? ( // FIX: Added !rooms || rooms?.length
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
          <div className="p-4 bg-slate-50 rounded-full mb-3">
            <BedDouble size={24} className="opacity-50" />
          </div>
          <p className="text-base font-medium text-slate-600">No rooms found</p>
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
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Room
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Rent
                      </th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
              {rooms.map((room) => (
                <RoomCard
                  key={room.room_id}
                  room={room}
                  onClick={() => handleRoomAction("view_details", room)}
                  onPropertyClick={(propId) =>
                    navigate(`/landlord/properties/${propId}`)
                  }
                  menu={
                    <CardMenu
                      options={getMenuOptions(room.room_status)}
                      onAction={(actionId) => handleRoomAction(actionId, room)}
                    />
                  }
                />
              ))}
            </div>
          )}

          {/* --- SMART PAGINATION --- */}
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
  );
};

export default LandlordRooms;
