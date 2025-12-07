import {
  Archive,
  ArrowLeft,
  Banknote,
  BedDouble,
  Edit,
  FileText,
  LogOut,
  Plus,
  Search,
  User,
  UserPlus,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoomByProperty } from "../../api/property.api";
import Badge from "../../components/dashboard/Badge";
import RoomCard from "../../components/dashboard/Card";
import CardMenu from "../../components/dashboard/CardMenu";
import PropertyInfoCard from "../../components/dashboard/Property/PropertyInfoCard";
import RoomListItem from "../../components/dashboard/RoomList";
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

const LandlordPropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  // State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [property, setProperty] = useState(null);
  const [summary, setSummary] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState("card");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6); // Default items per page
  const [paginationInfo, setPaginationInfo] = useState({
    last_page: 1,
    total_items: 0,
  });

  const fetchPropertyData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Prepare params (Your API helper handles the merging, just send what changes)
      const params = {
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        ...(filter !== "All" && { status: filter }),
      };

      // 2. Call the API
      const result = await getRoomByProperty(propertyId, params);

      if (result.success) {
        setProperty(result.property);
        setRooms(result.rooms || []);
        setSummary(result.summary);
        setPaginationInfo({
          last_page: result.pagination.last_page,
          total_items: result.pagination.total_items,
        });
      } else {
        // Use the message from your API helper
        setError(result.message || "Failed to fetch property details.");
        setRooms([]);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  // Add 'limit' to dependency array so it refetches when dropdown changes
  useEffect(() => {
    fetchPropertyData();
  }, [propertyId, currentPage, filter, debouncedSearch, limit]);

  const handleRoomAdded = () => {
    fetchPropertyData();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch]);

  // Handler for changing limit (resets to page 1)
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

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
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        preSelectedProperty={property}
        onSuccess={handleRoomAdded}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
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

        {/* UPDATED BUTTON: Added 'w-full sm:w-auto' */}
        <button
          onClick={() => setIsAddRoomOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:transform active:scale-95"
        >
          <Plus size={18} /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-6">
          <PropertyInfoCard property={property} />
        </div>

        <div className="lg:col-span-3">
          {/* <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3"></div> */}
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
            <div className="w-full overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
              {/* Wrapped in a div to add a slight separator and ensure full width */}
              <StatusControlTab
                current={filter}
                onChange={setFilter}
                summary={summary}
                total={property?.total_rooms || 0}
              />
            </div>
          </div>

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
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-20">
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

              {/* NEW PAGINATION COMPONENT */}
              <div className="mt-2 border-t border-slate-200 pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={paginationInfo.total_items}
                  limit={limit}
                  onPageChange={(page) => setCurrentPage(page)}
                  onLimitChange={handleLimitChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordPropertyDetails;
