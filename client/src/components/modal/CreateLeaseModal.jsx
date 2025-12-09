import {
  AlertCircle, // Added
  Building, // Added
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard, // Added
  FileText,
  Home,
  Loader2,
  Search,
  User, // Added
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createLease } from "../../api/lease.api";
import { getProperties, getRoomByProperty } from "../../api/property.api";
import { searchAvailableTenants } from "../../api/tenant.api";
import { RoomSelectCard } from "../dashboard/Property/Rooms/RoomSelectCard";
import { SummaryRow } from "../dashboard/lease/SummaryRow";
import { PaginationControls } from "../ui/SimplePagination";
// --- HOOKS ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
// --- MAIN MODAL ---
const CreateLeaseModal = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedPropertyId,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // API Data State
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Pagination & Search
  const [propSearch, setPropSearch] = useState("");
  const debouncedPropSearch = useDebounce(propSearch, 500);
  const [propPage, setPropPage] = useState(1);
  const [totalPropPages, setTotalPropPages] = useState(1);

  const [roomSearch, setRoomSearch] = useState("");
  const debouncedRoomSearch = useDebounce(roomSearch, 500);
  const [roomPage, setRoomPage] = useState(1);
  const [totalRoomPages, setTotalRoomPages] = useState(1);

  const [tenantSearch, setTenantSearch] = useState("");
  const debouncedTenantSearch = useDebounce(tenantSearch, 500);

  // Selections
  const [selectedProp, setSelectedProp] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Form Data
  const [leaseData, setLeaseData] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    monthly_rent: "",
    security_deposit: "",
    payment_due_day: 1,
    notes: "",
    initial_payment_amount: "",
    payment_method: "Cash",
    reference_number: "",
    payment_for_month: new Date().toISOString().split("T")[0],
  });

  const getTenantName = (t) => {
    if (!t) return "";
    if (t.first_name && t.last_name) return `${t.first_name} ${t.last_name}`;
    return t.name || t.full_name || "Unknown Tenant";
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setStep(1);
      if (!preSelectedPropertyId) {
        setSelectedProp(null);
      }
      setSelectedRoom(null);
      setSelectedTenant(null);

      setPropSearch("");
      setPropPage(1);
      setRoomSearch("");
      setRoomPage(1);
      setTenantSearch("");

      if (preSelectedPropertyId) {
        setSelectedProp({
          property_id: preSelectedPropertyId,
          property_name: "Loading...",
        });
        setStep(2);
      }
    }
  }, [isOpen, preSelectedPropertyId]);

  // --- API CALLS ---
  const loadProperties = useCallback(async () => {
    if (!isOpen) return;
    setDataLoading(true);

    try {
      const res = await getProperties({
        current_page: propPage,
        search: debouncedPropSearch,
        limit: 4,
      });

      if (res.success) {
        setProperties(res.properties);
        setTotalPropPages(res.pagination.last_page);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setDataLoading(false);
    }
  }, [isOpen, propPage, debouncedPropSearch]);

  const loadRooms = useCallback(async () => {
    const pId = selectedProp?.property_id || selectedProp?.id;
    if (!pId || !isOpen) return;

    setDataLoading(true);

    try {
      const params = {
        current_page: roomPage,
        search: debouncedRoomSearch,
        limit: 6,
        statusTab: "Available",
      };

      const res = await getRoomByProperty(pId, params);

      if (res.success) {
        setRooms(res.rooms);
        setTotalRoomPages(res.pagination.last_page);

        if (selectedProp?.property_name === "Loading..." && res.property) {
          setSelectedProp((prev) => ({ ...prev, ...res.property }));
        }
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setDataLoading(false);
    }
  }, [
    isOpen,
    selectedProp?.property_id,
    selectedProp?.id,
    roomPage,
    debouncedRoomSearch,
  ]);

  const loadTenants = useCallback(async () => {
    if (!isOpen) return;
    setDataLoading(true);

    try {
      const res = await searchAvailableTenants(
        debouncedTenantSearch,
        "Available"
      );
      if (res.success) setTenants(res.tenants);
    } catch (error) {
      console.error("Error loading tenants:", error);
    } finally {
      setDataLoading(false);
    }
  }, [isOpen, debouncedTenantSearch]);

  useEffect(() => {
    if (step === 1 && isOpen && !preSelectedPropertyId) {
      loadProperties();
    }
  }, [step, isOpen, preSelectedPropertyId, loadProperties]);

  useEffect(() => {
    if (step === 2 && isOpen && selectedProp) {
      loadRooms();
    }
  }, [step, isOpen, selectedProp, loadRooms]);

  useEffect(() => {
    if (step === 3 && isOpen) {
      loadTenants();
    }
  }, [step, isOpen, loadTenants]);

  // --- VALIDATION & NAVIGATION ---
  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && !selectedProp)
      newErrors.property = "Please select a property.";
    if (step === 2 && !selectedRoom) newErrors.room = "Please select a unit.";
    if (step === 3 && !selectedTenant)
      newErrors.tenant = "Please select a tenant.";

    if (step === 4) {
      if (!leaseData.start_date) newErrors.start_date = "Required";
      if (!leaseData.end_date) newErrors.end_date = "Required";
      if (
        leaseData.start_date &&
        leaseData.end_date &&
        new Date(leaseData.end_date) <= new Date(leaseData.start_date)
      ) {
        newErrors.end_date = "End date must be after start date.";
      }
      if (
        leaseData.initial_payment_amount === "" ||
        Number(leaseData.initial_payment_amount) <= 0
      ) {
        newErrors.initial_payment_amount = "Required";
      }
      if (!leaseData.payment_method) newErrors.payment_method = "Required";
    }
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (step === 3 && selectedRoom) {
      const rent = Number(selectedRoom.monthly_rent);
      setLeaseData((prev) => ({
        ...prev,
        monthly_rent: rent,
        security_deposit: 0,
        initial_payment_amount: rent,
      }));
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    if (step === 2 && preSelectedPropertyId) onClose();
    else setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const flatPayload = {
      property_id: selectedProp.property_id || selectedProp.id,
      room_id: selectedRoom.room_id || selectedRoom.id,
      tenant_id: selectedTenant.tenant_id || selectedTenant.id,
      start_date: leaseData.start_date,
      end_date: leaseData.end_date,
      monthly_rent: Number(leaseData.monthly_rent),
      security_deposit: Number(leaseData.security_deposit) || 0,
      payment_due_day: leaseData.payment_due_day,
      notes: leaseData.notes || "",
      initial_payment_amount: Number(leaseData.initial_payment_amount),
      payment_method: leaseData.payment_method,
      reference_number:
        leaseData.payment_method === "Cash"
          ? "SYSTEM_GENERATED"
          : leaseData.reference_number || "",
      payment_for_month: leaseData.payment_for_month,
    };

    try {
      const result = await createLease(flatPayload);
      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        if (result.errors)
          alert("Validation Error: " + JSON.stringify(result.errors));
        else alert(result.message || "Failed to create lease.");
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full h-full sm:h-[85vh] max-w-5xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        {/* SIDEBAR */}
        <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 flex-col p-6 shrink-0 h-full overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-1">New Lease</h2>
          <p className="text-xs text-slate-500 mb-6">Wizard</p>
          <div className="space-y-4 relative mb-6">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 -z-10" />
            {[
              { num: 1, label: "Property", icon: Building },
              { num: 2, label: "Unit", icon: Home },
              { num: 3, label: "Tenant", icon: User },
              { num: 4, label: "Details", icon: FileText },
              { num: 5, label: "Confirm", icon: ClipboardCheck },
            ].map((item) => {
              const isCompleted =
                step > item.num || (item.num === 1 && preSelectedPropertyId);
              const isActive = step === item.num;
              return (
                <div key={item.num} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-lg"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white border border-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={14} /> : item.num}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {(selectedProp || selectedRoom) && (
            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
                {selectedProp && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Property
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Building size={12} />
                      </div>
                      <p
                        className="text-xs font-bold text-slate-700 truncate"
                        title={selectedProp.property_name}
                      >
                        {selectedProp.property_name || selectedProp.name}
                      </p>
                    </div>
                  </div>
                )}
                {selectedRoom && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Unit
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Home size={12} />
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {selectedRoom.room_number || selectedRoom.number}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-white h-full min-h-0 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between p-4">
              <div className="md:hidden">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Step {step} of 5
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {step === 1
                    ? "Property"
                    : step === 2
                    ? "Unit"
                    : step === 3
                    ? "Tenant"
                    : step === 4
                    ? "Lease Details"
                    : "Confirmation"}
                </p>
              </div>
              <div className="hidden md:block"></div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="md:hidden w-full h-1 bg-slate-100">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-4">
            {/* STEP 1: PROPERTY */}
            {step === 1 && !preSelectedPropertyId && (
              <div className="animate-in slide-in-from-right-4">
                <h3 className="hidden md:block text-xl font-bold text-slate-800 mb-4">
                  Select Property
                </h3>
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    placeholder="Search property..."
                    value={propSearch}
                    onChange={(e) => {
                      setPropSearch(e.target.value);
                      setPropPage(1);
                    }}
                    autoFocus
                  />
                </div>
                {errors.property && (
                  <p className="text-red-500 text-xs font-bold mb-3 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.property}
                  </p>
                )}

                {dataLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-slate-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {properties.map((p) => {
                      const pId = p.property_id || p.id;
                      return (
                        <button
                          key={pId}
                          onClick={() => {
                            setSelectedProp(p);
                            setErrors({});
                          }}
                          className={`p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${
                            selectedProp?.id === pId ||
                            selectedProp?.property_id === pId
                              ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                              : "hover:border-blue-300"
                          }`}
                        >
                          <div className="font-bold text-slate-800">
                            {p.property_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.available_rooms || p.total_rooms || 0} units •{" "}
                            {p.city}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {!dataLoading && (
                  <PaginationControls
                    page={propPage}
                    totalPages={totalPropPages}
                    setPage={setPropPage}
                    isLoading={dataLoading}
                  />
                )}
              </div>
            )}

            {/* STEP 2: UNIT (USING NEW ROOM CARD) */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h3 className="hidden md:block text-xl font-bold text-slate-800">
                    Select Unit
                  </h3>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded w-fit">
                    {rooms.length} Loaded
                  </span>
                </div>
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    placeholder="Search unit number..."
                    value={roomSearch}
                    onChange={(e) => {
                      setRoomSearch(e.target.value);
                      setRoomPage(1);
                    }}
                    autoFocus
                  />
                </div>
                {errors.room && (
                  <p className="text-red-500 text-xs font-bold mb-3 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.room}
                  </p>
                )}

                {dataLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-slate-400" />
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm border border-dashed rounded-xl">
                    No available units found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                    {rooms.map((room) => {
                      const rId = room.room_id || room.id;
                      return (
                        <RoomSelectCard
                          key={rId}
                          room={room}
                          onClick={() => {
                            setSelectedRoom(room);
                            setErrors({});
                          }}
                          isSelected={
                            selectedRoom?.id === rId ||
                            selectedRoom?.room_id === rId
                          }
                        />
                      );
                    })}
                  </div>
                )}
                {!dataLoading && (
                  <PaginationControls
                    page={roomPage}
                    totalPages={totalRoomPages}
                    setPage={setRoomPage}
                    isLoading={dataLoading}
                  />
                )}
              </div>
            )}

            {/* STEP 3: TENANT */}
            {step === 3 && (
              <div className="animate-in slide-in-from-right-4">
                <h3 className="hidden md:block text-xl font-bold text-slate-800 mb-4">
                  Assign Tenant
                </h3>
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm sm:text-base"
                    placeholder="Search tenant name..."
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                {errors.tenant && (
                  <p className="text-red-500 text-xs font-bold mb-3 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.tenant}
                  </p>
                )}

                {dataLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-slate-400" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tenants.map((t) => {
                      const tId = t.tenant_id || t.id;
                      const tName = getTenantName(t);
                      return (
                        <div
                          key={tId}
                          onClick={() => {
                            setSelectedTenant(t);
                            setErrors({});
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer active:scale-[0.99] transition-transform ${
                            selectedTenant?.id === tId ||
                            selectedTenant?.tenant_id === tId
                              ? "bg-purple-50 border-purple-500"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {tName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">
                                {tName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {t.email}
                              </div>
                            </div>
                          </div>
                          {(selectedTenant?.id === tId ||
                            selectedTenant?.tenant_id === tId) && (
                            <CheckCircle2
                              size={18}
                              className="text-purple-600"
                            />
                          )}
                        </div>
                      );
                    })}
                    {tenants.length === 0 && (
                      <div className="text-center py-8 text-sm text-slate-500">
                        No active tenants found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: DETAILS (No Changes) */}
            {step === 4 && (
              <div className="animate-in slide-in-from-right-4 space-y-6">
                <h3 className="hidden md:block text-xl font-bold text-slate-800">
                  Lease Details
                </h3>
                <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Building size={14} className="text-slate-400" />{" "}
                    {selectedProp?.property_name || selectedProp?.name}
                  </div>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Home size={14} className="text-slate-400" />{" "}
                    {selectedRoom?.room_number || selectedRoom?.number}
                  </div>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <User size={14} className="text-slate-400" />{" "}
                    {getTenantName(selectedTenant)}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileText size={16} /> Agreement Terms
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Lease Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={leaseData.start_date}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            start_date: e.target.value,
                          })
                        }
                        className={`w-full p-3 bg-white border rounded-xl text-sm focus:outline-none ${
                          errors.start_date
                            ? "border-red-500"
                            : "border-slate-200 focus:border-emerald-500"
                        }`}
                      />
                      {errors.start_date && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.start_date}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Lease End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={leaseData.end_date}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            end_date: e.target.value,
                          })
                        }
                        className={`w-full p-3 bg-white border rounded-xl text-sm focus:outline-none ${
                          errors.end_date
                            ? "border-red-500"
                            : "border-slate-200 focus:border-emerald-500"
                        }`}
                      />
                      {errors.end_date && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.end_date}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Rent Due Day
                      </label>
                      <select
                        value={leaseData.payment_due_day}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            payment_due_day: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      >
                        {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                          <option key={d} value={d}>
                            Every {d}
                            {d === 1
                              ? "st"
                              : d === 2
                              ? "nd"
                              : d === 3
                              ? "rd"
                              : "th"}{" "}
                            of the month
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Notes / Conditions
                      </label>
                      <textarea
                        placeholder="Optional notes..."
                        value={leaseData.notes}
                        onChange={(e) =>
                          setLeaseData({ ...leaseData, notes: e.target.value })
                        }
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 h-[46px] resize-none pt-2.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2 flex items-center gap-2">
                    <CreditCard size={16} /> Payment Setup
                  </h4>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Monthly Rent
                      </label>
                      <input
                        readOnly
                        value={leaseData.monthly_rent}
                        className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-slate-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Security Deposit
                      </label>
                      <input
                        type="number"
                        value={leaseData.security_deposit}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            security_deposit:
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value),
                          })
                        }
                        className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Total Amount Paid Now{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={leaseData.initial_payment_amount}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            initial_payment_amount:
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value),
                          })
                        }
                        className={`w-full p-3 bg-white border rounded-xl text-sm font-bold text-emerald-700 focus:outline-none ${
                          errors.initial_payment_amount
                            ? "border-red-500"
                            : "border-emerald-200 focus:border-emerald-500"
                        }`}
                      />
                      {errors.initial_payment_amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.initial_payment_amount}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={leaseData.payment_method}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            payment_method: e.target.value,
                          })
                        }
                        className={`w-full p-3 bg-white border rounded-xl text-sm focus:outline-none ${
                          errors.payment_method
                            ? "border-red-500"
                            : "border-emerald-200 focus:border-emerald-500"
                        }`}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="GCash">GCash</option>
                        <option value="Check">Check</option>
                      </select>
                      {errors.payment_method && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.payment_method}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Reference No.
                      </label>
                      {leaseData.payment_method === "Cash" ? (
                        <div className="w-full p-3 bg-emerald-100/50 border border-emerald-200 rounded-xl text-sm text-emerald-700 italic flex items-center gap-2">
                          <CheckCircle2 size={14} /> Auto-generated
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="OR No. / Ref No."
                          value={leaseData.reference_number}
                          onChange={(e) =>
                            setLeaseData({
                              ...leaseData,
                              reference_number: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Payment For Month
                      </label>
                      <input
                        type="date"
                        value={leaseData.payment_for_month}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            payment_for_month: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRM (No Changes) */}
            {step === 5 && (
              <div className="animate-in slide-in-from-right-4 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Confirm Lease
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Please review the details before creating.
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                      <Building size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedProp?.property_name || selectedProp?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Unit {selectedRoom?.room_number || selectedRoom?.number}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Lease Terms
                      </h4>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                        <SummaryRow
                          label="Tenant"
                          value={getTenantName(selectedTenant)}
                        />
                        <SummaryRow
                          label="Start Date"
                          value={leaseData.start_date}
                        />
                        <SummaryRow
                          label="End Date"
                          value={leaseData.end_date}
                        />
                        <SummaryRow
                          label="Rent Due"
                          value={`Every ${leaseData.payment_due_day}${
                            leaseData.payment_due_day === 1
                              ? "st"
                              : leaseData.payment_due_day === 2
                              ? "nd"
                              : leaseData.payment_due_day === 3
                              ? "rd"
                              : "th"
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Initial Payment
                      </h4>
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                        <SummaryRow
                          label="Security Deposit"
                          value={`₱${Number(
                            leaseData.security_deposit
                          ).toLocaleString()}`}
                        />
                        <SummaryRow
                          label="First Month Rent"
                          value={`₱${Number(
                            leaseData.monthly_rent
                          ).toLocaleString()}`}
                        />
                        <SummaryRow
                          label="Total Paid"
                          value={`₱${Number(
                            leaseData.initial_payment_amount
                          ).toLocaleString()}`}
                          isTotal
                        />
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-emerald-200/50">
                          <span className="text-xs font-medium text-emerald-700">
                            Paid via {leaseData.payment_method}
                          </span>
                          <span className="text-xs font-medium text-emerald-700">
                            {leaseData.payment_method === "Cash"
                              ? "Auto-Ref"
                              : leaseData.reference_number || "No Ref"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 flex justify-between bg-white shrink-0 pb-safe sm:pb-4">
            <button
              onClick={handleBack}
              className="px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
            >
              {step === 1 || (step === 2 && preSelectedPropertyId)
                ? "Cancel"
                : "Back"}
            </button>
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}{" "}
                Create Lease
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLeaseModal;
