import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle2,
  ChevronDown,
  Copy,
  Hash,
  Home,
  Layers,
  Loader2,
  Search,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
// Ensure this path matches where you saved the first code block
import { getProperties } from "../../api/property.api";
import { createRoomForProperty } from "../../api/room.api";

const AddRoomModal = ({
  isOpen,
  onClose,
  preSelectedProperty = null,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- PAGINATION & SEARCH STATE ---
  const [fetchingProps, setFetchingProps] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_LIMIT = 10; //

  const [errors, setErrors] = useState({});
  const [entryMode, setEntryMode] = useState("single");

  // Form Data
  const [formData, setFormData] = useState({
    property_id: "",
    room_number: "",
    monthly_rent: "",
    room_status: "Available",
  });

  // Batch Data
  const [batchData, setBatchData] = useState({
    start_number: "",
    count: "",
    prefix: "",
  });

  // --- INIT ---
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setEntryMode("single");
      setBatchData({ start_number: "", count: "", prefix: "" });

      // Reset Search/Page on Open
      setSearchTerm("");
      setPage(1);
      setHasMore(true);

      if (preSelectedProperty) {
        setFormData((prev) => ({
          ...prev,
          property_id: preSelectedProperty.property_id,
          room_number: "",
          monthly_rent: "",
          room_status: "Available",
        }));
        setStep(2);
      } else {
        setFormData({
          property_id: "",
          room_number: "",
          monthly_rent: "",
          room_status: "Available",
        });
        setStep(1);
        // Initial Fetch
        fetchProperties(1, "", true);
      }
    }
  }, [isOpen, preSelectedProperty]);

  // --- FETCH FUNCTION (Supports Pagination) ---
  const fetchProperties = async (
    pageToFetch,
    search = "",
    resetList = false
  ) => {
    setFetchingProps(true);
    try {
      // NOTE: API must support { page, limit, search } parameters
      const response = await getProperties({
        page: pageToFetch,
        limit: PAGE_LIMIT,
        search: search,
      });

      if (response.success) {
        console.log("Properties Fetched: ", response.properties);
        const newProps = response.properties || [];

        setProperties((prev) => {
          if (resetList) return newProps;
          // Prevent duplicates if API returns same items
          const existingIds = new Set(prev.map((p) => p.property_id));
          const uniqueNew = newProps.filter(
            (p) => !existingIds.has(p.property_id)
          );
          return [...prev, ...uniqueNew];
        });

        // If we got fewer items than the limit, we've reached the end
        setHasMore(newProps.length === PAGE_LIMIT);
        setPage(pageToFetch);
      } else {
        setProperties(resetList ? [] : (prev) => prev);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load properties", error);
      if (resetList) setProperties([]);
    } finally {
      setFetchingProps(false);
    }
  };

  // --- DEBOUNCED SEARCH EFFECT ---
  useEffect(() => {
    // Skip the very first render to avoid double fetching with init
    if (!isOpen) return;

    const delayDebounceFn = setTimeout(() => {
      // Reset page to 1 when search changes
      fetchProperties(1, searchTerm, true);
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- HANDLER: LOAD MORE ---
  const handleLoadMore = () => {
    if (!fetchingProps && hasMore) {
      fetchProperties(page + 1, searchTerm, false);
    }
  };

  // --- OTHER HANDLERS ---
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleBatchChange = (e) => {
    const { name, value } = e.target;
    setBatchData((prev) => ({ ...prev, [name]: value }));
  };

  const getBatchPreview = () => {
    const start = parseInt(batchData.start_number);
    const count = parseInt(batchData.count);

    if (!start || !count || count <= 0) {
      return { list: [], total: 0, remaining: 0 };
    }

    const preview = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      preview.push(`${batchData.prefix}${start + i}`);
    }
    return { list: preview, total: count, remaining: Math.max(0, count - 5) };
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.property_id) {
        setErrors({ property_id: "Please select a property to continue" });
        return;
      }
      setStep(2);
    }
  };

  const validateFinal = () => {
    const newErrors = {};
    if (entryMode === "single") {
      if (!formData.room_number.trim())
        newErrors.room_number = "Room number is required";
    } else {
      if (!batchData.start_number)
        newErrors.batch_start = "Start number required";
      if (!batchData.count || batchData.count < 1)
        newErrors.batch_count = "Quantity required";
    }
    if (!formData.monthly_rent || formData.monthly_rent <= 0)
      newErrors.monthly_rent = "Rent amount required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFinal()) return;

    setLoading(true);

    // 1. Generate the ARRAY of rooms
    let roomsList = [];

    if (entryMode === "single") {
      roomsList.push({
        room_number: formData.room_number,
        monthly_rent: formData.monthly_rent,
        room_status: formData.room_status,
      });
    } else {
      const start = parseInt(batchData.start_number);
      const count = parseInt(batchData.count);

      roomsList = Array.from({ length: count }).map((_, i) => ({
        room_number: `${batchData.prefix}${start + i}`,
        monthly_rent: formData.monthly_rent,
        room_status: formData.room_status,
      }));
    }

    // 2. Wrap it in the ROOT OBJECT expected by Laravel
    const payload = {
      property_id: formData.property_id,
      rooms: roomsList,
    };

    try {
      console.log("Submitting Payload:", payload);

      // Import this function at the top of your file!
      const response = await createRoomForProperty(
        formData.property_id,
        payload
      );

      if (response && response.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Handle backend errors (e.g. "Room already exists")
        setErrors({
          property_id: response?.message || "Failed to create rooms",
        });
      }
    } catch (error) {
      console.error("Submit error", error);
    } finally {
      setLoading(false);
    }
  };

  // Get selected property object for display
  const selectedPropObj =
    properties.find((p) => p.property_id === parseInt(formData.property_id)) ||
    preSelectedProperty;

  if (!isOpen) return null;

  return (
    <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col h-[600px] max-h-[90vh]">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border transition-colors ${
                step === 1
                  ? "bg-blue-100 text-blue-600 border-blue-200"
                  : "bg-emerald-100 text-emerald-600 border-emerald-200"
              }`}
            >
              {step === 1 ? <Search size={20} /> : <Layers size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {step === 1 ? "Select Property" : "Unit Details"}
              </h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                Step {step} of 2 <span className="text-slate-300">•</span>{" "}
                {step === 1 ? "Where is this unit?" : "Configure rooms"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- BODY CONTENT (SCROLLABLE) --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
          {/* STEP 1: PROPERTY SELECTION */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 pb-2">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* List */}
              <div className="space-y-2">
                {properties.length === 0 && !fetchingProps ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No properties found.
                  </div>
                ) : (
                  properties.map((p) => {
                    const isSelected =
                      parseInt(formData.property_id) === p.property_id;
                    return (
                      <div
                        key={p.property_id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            property_id: p.property_id,
                          }));
                          setErrors({});
                        }}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm"
                            : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-md ${
                              isSelected
                                ? "bg-white text-blue-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Building size={18} />
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                isSelected ? "text-blue-900" : "text-slate-700"
                              }`}
                            >
                              {p.property_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {p.city} • {p.total_rooms} Units
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={18} className="text-blue-600" />
                        )}
                      </div>
                    );
                  })
                )}

                {/* LOAD MORE BUTTON / SPINNER */}
                {fetchingProps && (
                  <div className="flex justify-center py-4">
                    <Loader2
                      className="animate-spin text-slate-300"
                      size={20}
                    />
                  </div>
                )}

                {!fetchingProps && hasMore && properties.length > 0 && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-dashed border-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    Load More Properties <ChevronDown size={14} />
                  </button>
                )}
              </div>

              {errors.property_id && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.property_id}
                </p>
              )}
            </div>
          )}

          {/* STEP 2: DETAILS FORM */}
          {step === 2 && (
            <form
              id="add-room-form"
              onSubmit={handleSubmit}
              className="space-y-6 animate-in slide-in-from-right-4 duration-300"
            >
              {/* Selected Property Summary Pill */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="p-1.5 bg-white rounded border border-slate-100 text-slate-400">
                  <Building size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Property
                  </p>
                  <p className="text-sm font-medium text-slate-600 truncate">
                    {selectedPropObj
                      ? selectedPropObj.property_name
                      : "Unknown Property"}
                  </p>
                </div>
                {!preSelectedProperty && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline px-2"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Single/Batch Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setEntryMode("single")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    entryMode === "single"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Single Unit
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode("batch")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    entryMode === "batch"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Bulk Add
                </button>
              </div>

              {/* Form Fields Container */}
              <div className="space-y-5">
                {entryMode === "single" ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Room Number / Name
                    </label>
                    <div className="relative">
                      <Hash
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        autoFocus
                        type="text"
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleSingleChange}
                        placeholder="e.g. 101"
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                          errors.room_number
                            ? "border-red-500"
                            : "border-slate-200 focus:border-emerald-500"
                        }`}
                      />
                    </div>
                    {errors.room_number && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.room_number}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Start #
                        </label>
                        <input
                          type="number"
                          name="start_number"
                          value={batchData.start_number}
                          onChange={handleBatchChange}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="101"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Count
                        </label>
                        <input
                          type="number"
                          name="count"
                          value={batchData.count}
                          onChange={handleBatchChange}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Prefix (Opt.)
                      </label>
                      <div className="relative">
                        <Copy
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          name="prefix"
                          value={batchData.prefix}
                          onChange={handleBatchChange}
                          className="w-full pl-8 px-3 py-2 border rounded-lg text-sm"
                          placeholder="e.g. Unit "
                        />
                      </div>
                    </div>
                    {/* Preview */}
                    {getBatchPreview().list.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getBatchPreview().list.map((n, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono"
                          >
                            {n}
                          </span>
                        ))}
                        {getBatchPreview().remaining > 0 && (
                          <span className="text-[10px] text-slate-400 px-1">
                            +{getBatchPreview().remaining}
                          </span>
                        )}
                      </div>
                    )}
                    {(errors.batch_start || errors.batch_count) && (
                      <p className="text-xs text-red-500">
                        Check start number and quantity.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Monthly Rent
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-serif font-bold group-focus-within:text-emerald-500">
                      ₱
                    </span>
                    <input
                      type="number"
                      name="monthly_rent"
                      value={formData.monthly_rent}
                      onChange={handleSingleChange}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        errors.monthly_rent
                          ? "border-red-500"
                          : "border-slate-200 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Initial Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "Available",
                        icon: Home,
                        color: "emerald",
                        label: "Available",
                      },
                      {
                        id: "Occupied",
                        icon: User,
                        color: "blue",
                        label: "Occupied",
                      },
                      {
                        id: "Maintenance",
                        icon: Wrench,
                        color: "amber",
                        label: "Maintenance",
                      },
                    ].map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            room_status: status.id,
                          }))
                        }
                        className={`flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all ${
                          formData.room_status === status.id
                            ? `bg-${status.color}-50 border-${status.color}-500 text-${status.color}-700 ring-1 ring-${status.color}-500`
                            : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <status.icon size={16} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">
                          {status.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.property_id}
                className="flex-1 bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              {!preSelectedProperty && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}

              <button
                type="submit"
                form="add-room-form"
                disabled={loading}
                className={`flex-1 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70`}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Save Unit
                    {entryMode === "batch" && "s"}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRoomModal;
