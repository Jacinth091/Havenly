import {
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  MapPin,
  Search,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoomCard from "../../components/dashboard/Property/Rooms/RoomCard";

// --- MOCK DATA ---
const MOCK_PROPERTIES = [
  { id: 1, name: "Sunset Apartments", city: "Cebu City", available: 12 },
  { id: 2, name: "Green Valley Homes", city: "Mandaue City", available: 5 },
  { id: 3, name: "Azure Heights", city: "Lapu-Lapu City", available: 0 },
];

// Generates dummy rooms for pagination demo
const generateMockRooms = (propId, count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: parseInt(`${propId}${i}`),
    number: `${propId}0${i + 1}`,
    price: 15000 + i * 500,
    status: "Available",
    floor: i < 5 ? "1st Floor" : "2nd Floor",
  }));
};

const MOCK_ROOMS = {
  1: generateMockRooms(1, 14),
  2: generateMockRooms(2, 5),
};

const CreateLeasePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- STATE ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pagination State for Step 2
  const [unitPage, setUnitPage] = useState(1);
  const UNITS_PER_PAGE = 6;

  // Selections
  const [selectedProp, setSelectedProp] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Search & Form
  const [tenantSearch, setTenantSearch] = useState("");
  const [foundTenants, setFoundTenants] = useState([]);
  const [leaseData, setLeaseData] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    monthly_rent: "",
    security_deposit: "",
    payment_due_day: 1,
  });

  // --- INIT ---
  useEffect(() => {
    const propId = searchParams.get("prop_id");
    if (propId) {
      const prop = MOCK_PROPERTIES.find((p) => p.id === parseInt(propId));
      if (prop) {
        setSelectedProp(prop);
        setStep(2);
      }
    }
  }, [searchParams]);

  // Reset pagination when property changes
  useEffect(() => {
    setUnitPage(1);
  }, [selectedProp]);

  // --- HELPERS ---
  const handleTenantSearch = (term) => {
    setTenantSearch(term);
    if (term.length > 1) {
      // Mock search logic
      const mockResults = [
        {
          id: 1,
          name: "Juan Dela Cruz",
          email: "juan.dc@gmail.com",
          status: "Active",
        },
        {
          id: 2,
          name: "Maria Santos",
          email: "maria.s@yahoo.com",
          status: "Active",
        },
      ];
      setFoundTenants(
        mockResults.filter((t) =>
          t.name.toLowerCase().includes(term.toLowerCase())
        )
      );
    } else {
      setFoundTenants([]);
    }
  };

  const handleNext = () => {
    setErrors({});
    if (step === 1 && !selectedProp)
      return setErrors({ step: "Select a property to continue." });
    if (step === 2 && !selectedRoom)
      return setErrors({ step: "Select a unit to continue." });
    if (step === 3 && !selectedTenant)
      return setErrors({ step: "Assign a tenant to continue." });

    if (step === 3) {
      setLeaseData((prev) => ({
        ...prev,
        monthly_rent: selectedRoom.price,
        security_deposit: selectedRoom.price * 2,
      }));
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = () => {
    if (!leaseData.start_date || !leaseData.end_date) {
      setErrors({ step: "Please fill in all lease dates." });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/landlord/leases");
    }, 1500);
  };

  // --- PAGINATION LOGIC ---
  const getPaginatedRooms = () => {
    if (!selectedProp) return [];
    const allRooms = (MOCK_ROOMS[selectedProp.id] || []).filter(
      (r) => r.status === "Available"
    );
    const indexOfLast = unitPage * UNITS_PER_PAGE;
    const indexOfFirst = indexOfLast - UNITS_PER_PAGE;
    return {
      currentRooms: allRooms.slice(indexOfFirst, indexOfLast),
      totalPages: Math.ceil(allRooms.length / UNITS_PER_PAGE),
      totalCount: allRooms.length,
    };
  };

  // --- SUB-COMPONENT: SIDEBAR STEP ---
  const SidebarStep = ({ num, title, icon: Icon, active, completed }) => (
    <div
      className={`group flex items-center gap-3 py-2 px-3 rounded-lg transition-all ${
        active ? "bg-slate-50" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          active
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
            : completed
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {completed ? <CheckCircle2 size={16} /> : <Icon size={16} />}
      </div>
      <div>
        <p
          className={`text-sm font-bold transition-colors ${
            active
              ? "text-slate-800"
              : completed
              ? "text-emerald-700"
              : "text-slate-500"
          }`}
        >
          {title}
        </p>
      </div>
    </div>
  );

  const { currentRooms, totalPages, totalCount } = getPaginatedRooms();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-600 overflow-hidden">
      {/* === SIDEBAR === */}
      <div className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-100">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors text-xs font-bold uppercase tracking-wider mb-4"
          >
            <ArrowLeft size={14} /> Cancel
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Create Lease
          </h1>
          <p className="text-xs text-slate-500 mt-1">New rental agreement</p>
        </div>

        <div className="flex-1 p-4 space-y-1">
          <SidebarStep
            num={1}
            title="Property"
            icon={Building}
            active={step === 1}
            completed={step > 1}
          />
          <div className="ml-7 h-4 border-l border-slate-200" />
          <SidebarStep
            num={2}
            title="Unit Selection"
            icon={Home}
            active={step === 2}
            completed={step > 2}
          />
          <div className="ml-7 h-4 border-l border-slate-200" />
          <SidebarStep
            num={3}
            title="Tenant Info"
            icon={User}
            active={step === 3}
            completed={step > 3}
          />
          <div className="ml-7 h-4 border-l border-slate-200" />
          <SidebarStep
            num={4}
            title="Terms & Financials"
            icon={Wallet}
            active={step === 4}
            completed={step > 4}
          />
        </div>

        {selectedProp && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
              Drafting For
            </p>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {selectedProp.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  {selectedRoom
                    ? `Unit ${selectedRoom.number}`
                    : "Selecting Unit..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <span className="text-sm font-bold text-slate-800">
            {step === 1 && "Select Property"}
            {step === 2 && "Select Unit"}
            {step === 3 && "Assign Tenant"}
            {step === 4 && "Finalize Lease"}
          </span>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
          <div className="max-w-4xl mx-auto w-full p-4 md:p-8 pb-32">
            {errors.step && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-800 animate-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm font-medium">{errors.step}</span>
              </div>
            )}

            {/* --- STEP 1: PROPERTY --- */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Select Property
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Choose the building for this agreement.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_PROPERTIES.map((prop) => {
                    const isActive = selectedProp?.id === prop.id;
                    const isFull = prop.available === 0;
                    return (
                      <button
                        key={prop.id}
                        onClick={() => !isFull && setSelectedProp(prop)}
                        disabled={isFull}
                        className={`text-left relative p-5 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                          isActive
                            ? "border-emerald-500 bg-white ring-2 ring-emerald-500/10 shadow-md"
                            : isFull
                            ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isFull
                              ? "bg-slate-100 text-slate-400"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <Building size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-800 truncate">
                              {prop.name}
                            </h3>
                            {isActive && (
                              <CheckCircle2
                                size={18}
                                className="text-emerald-600 shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={10} /> {prop.city}
                          </p>
                          <div className="mt-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                isFull
                                  ? "bg-slate-200 text-slate-500"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {isFull
                                ? "No Vacancy"
                                : `${prop.available} Units Available`}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- STEP 2: UNIT SELECTION (WITH PAGINATION & ROOM CARD) --- */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Select Unit
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Available spaces in{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedProp.name}
                      </span>
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start">
                    Showing {currentRooms.length} of {totalCount} units
                  </div>
                </div>

                {/* GRID FOR ROOM CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {currentRooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;

                    // Transform mock data to fit RoomCard props
                    const cardData = {
                      room_status: room.status, // "Available"
                      room_number: room.number,
                      monthly_rent: room.price,
                      property_name: selectedProp.name,
                      tenant: null, // Available rooms have no tenant
                    };

                    return (
                      <div
                        key={room.id}
                        className={`relative rounded-xl transition-all duration-300 ${
                          isSelected
                            ? "ring-2 ring-emerald-500 ring-offset-2 scale-[1.02] z-10"
                            : "hover:scale-[1.01]"
                        }`}
                      >
                        {/* THE ROOM CARD COMPONENT */}
                        <RoomCard
                          room={cardData}
                          onClick={() => setSelectedRoom(room)}
                        />

                        {/* Selection Checkmark Overlay */}
                        {isSelected && (
                          <div className="absolute top-[-8px] right-[-8px] bg-emerald-500 text-white rounded-full p-1 shadow-md z-20">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalCount > 0 ? (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                    <button
                      onClick={() => setUnitPage((p) => Math.max(1, p - 1))}
                      disabled={unitPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 disabled:text-slate-300 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    <span className="text-xs font-bold text-slate-400">
                      Page {unitPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setUnitPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={unitPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 disabled:text-slate-300 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No available units found.</p>
                  </div>
                )}
              </div>
            )}

            {/* --- STEP 3: TENANT --- */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Assign Tenant
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Search for an existing tenant profile.
                  </p>
                </div>

                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-4 flex items-center focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all">
                  <div className="pl-3 text-slate-400">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full p-3 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium outline-none"
                    value={tenantSearch}
                    onChange={(e) => handleTenantSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  {foundTenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTenant(t);
                        setTenantSearch("");
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedTenant?.id === t.id
                          ? "border-purple-500 bg-purple-50/10 ring-1 ring-purple-500/20"
                          : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                          {t.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800">
                            {t.name}
                          </p>
                          <p className="text-xs text-slate-500">{t.email}</p>
                        </div>
                      </div>
                      {selectedTenant?.id === t.id && (
                        <CheckCircle2 size={20} className="text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- STEP 4: TERMS & FINANCIALS --- */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Finalize Lease
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Review agreement terms and financials.
                  </p>
                </div>

                {/* Summary Bar */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Property
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Building size={14} className="text-blue-600" />{" "}
                      {selectedProp.name}
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Unit
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Home size={14} className="text-emerald-600" /> Unit{" "}
                      {selectedRoom.number}
                    </div>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={leaseData.start_date}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            start_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={leaseData.end_date}
                        onChange={(e) =>
                          setLeaseData({
                            ...leaseData,
                            end_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Monthly Rent
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          ₱
                        </span>
                        <input
                          type="number"
                          readOnly
                          className="w-full pl-8 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 cursor-not-allowed"
                          value={leaseData.monthly_rent}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                onClick={() => setStep((prev) => prev - 1)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-200 transition-all active:scale-95"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Finalize Lease
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLeasePage;
