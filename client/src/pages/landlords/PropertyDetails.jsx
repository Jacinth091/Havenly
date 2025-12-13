import {
  Archive,
  ArrowLeft,
  BedDouble,
  ChevronDown,
  Edit,
  Plus,
  Search,
  Settings,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoomByProperty } from "../../api/room.api";

import { archiveProperty, updateProperty } from "../../api/property.api";

import CardMenu from "../../components/dashboard/CardMenu";
import PropertyInfoCard from "../../components/dashboard/Property/PropertyInfoCard";
import RoomCard from "../../components/dashboard/Property/Rooms/RoomCard";
import RoomListItem from "../../components/dashboard/RoomList";
import ActionModal from "../../components/modal/ActionModal";
import AddRoomModal from "../../components/modal/AddRoomModal";
import ManagePropertyModal from "../../components/modal/ManagePropertyModal";
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

  // --- State ---
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  // Manage Modal State (For Editing)
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Archive Modal State (For Confirmation)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Dropdown Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [property, setProperty] = useState(null);
  const [summary, setSummary] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState("card");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [paginationInfo, setPaginationInfo] = useState({
    last_page: 1,
    total_items: 0,
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPropertyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        status: filter,
      };

      const result = await getRoomByProperty(propertyId, params);

      if (result.success) {
        // Merge property details with summary stats so PropertyInfoCard works correctly
        setProperty({ ...result.property, ...result.summary });

        setRooms(result.rooms || []);

        // Ensure summary has default values if API misses them
        setSummary(
          result.summary || { Available: 0, Occupied: 0, Maintenance: 0 }
        );

        setPaginationInfo({
          last_page: result.pagination.last_page,
          total_items: result.pagination.total_items,
        });
      } else {
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

  // Re-fetch when dependencies change
  useEffect(() => {
    fetchPropertyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, currentPage, filter, debouncedSearch, limit]);

  const handleRoomAdded = () => {
    fetchPropertyData();
  };

  // --- LOGIC FOR UPDATE ---
  const handleUpdateProperty = async (formData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProperty(propertyId, formData);

      if (result.success) {
        await fetchPropertyData(); // Refresh UI
        setIsManageOpen(false);
      } else {
        alert(result.message || "Failed to update property.");
      }
    } catch (error) {
      console.error("Failed to update property", error);
      alert("An error occurred while updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIC FOR ARCHIVE ---
  const handleArchiveProperty = async () => {
    // CONSTRAINT: Do not allow archive if there are occupied rooms
    const activeTenants = summary?.["Occupied"] || 0;

    if (activeTenants > 0) {
      alert(
        `Cannot archive property. There are currently ${activeTenants} active units/tenants.`
      );
      setIsArchiveModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await archiveProperty(propertyId);

      if (result.success) {
        setIsArchiveModalOpen(false);
        navigate("/landlord/properties"); // Redirect on success
      } else {
        alert(result.message || "Failed to archive property.");
      }
    } catch (error) {
      console.error("Failed to archive property", error);
      alert("An error occurred while archiving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch]);

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
    const baseOptions = [
      { id: "view_details", label: "View Details", icon: Search },
      { id: "edit_room", label: "Edit Room", icon: Edit },
    ];

    switch (status) {
      case "Occupied":
        return [
          ...baseOptions,
          { id: "maintenance", label: "Report Issue", icon: Wrench },
        ];
      case "Available":
        return [
          ...baseOptions,
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
        // Fallback to pagination total if property.total_rooms isn't set
        count: property?.total_rooms || paginationInfo.total_items || 0,
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
    [property, summary, paginationInfo]
  );

  // Loading State
  if (loading && !property) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Error State
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

  const hasActiveTenants = (summary?.["Occupied"] || 0) > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        preSelectedProperty={property}
        onSuccess={handleRoomAdded}
      />

      {/* Edit Property Modal */}
      <ManagePropertyModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        property={property}
        onUpdate={handleUpdateProperty}
        isSubmitting={isSubmitting}
      />

      {/* Action Modal for Archive Confirmation */}
      <ActionModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveProperty}
        title="Archive Property"
        description="Are you sure you want to archive this property? This will hide it from your dashboard and may affect active leases. This action cannot be easily undone."
        confirmLabel="Yes, Archive Property"
        type="danger"
        loading={isSubmitting}
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
              {property.name || property.property_name || "Property Overview"}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Property Management Dashboard
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto z-20">
          {/* Manage Property Dropdown */}
          <div className="relative flex-1 sm:flex-none" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              <Settings size={18} /> Manage <ChevronDown size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <button
                  onClick={() => {
                    setIsManageOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors"
                >
                  <Edit size={16} /> Edit Details
                </button>
                <div className="h-px bg-slate-100 my-1"></div>

                {/* Archive Button with Disabled State */}
                <button
                  onClick={() => {
                    if (hasActiveTenants) return;
                    setIsArchiveModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  disabled={hasActiveTenants}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    hasActiveTenants
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                  title={
                    hasActiveTenants
                      ? "Cannot archive while active tenants exist"
                      : ""
                  }
                >
                  <Archive size={16} /> Archive Property
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:transform active:scale-95"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Pass fetched property data to the card */}
        <div className="lg:col-span-1 space-y-6">
          <PropertyInfoCard
            property={property}
            summary={summary}
            rooms={rooms}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
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
              <ViewToggles mode={viewMode} setMode={setViewMode} />
            </div>
            <div className="w-full overflow-x-auto no-scrollbar border-slate-100">
              <StatusControlTab
                tabs={propertyTabs}
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
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.room_id}
                      room={room}
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
                </div>
              )}
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
