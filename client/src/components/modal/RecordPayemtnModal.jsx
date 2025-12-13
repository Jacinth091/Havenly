import {
  AlertCircle,
  Building,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Home,
  Loader2,
  Search,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getProperties } from "../../api/property.api";
import { getRoomByProperty } from "../../api/room.api";
import { recordPayment } from "../../api/transaction.api";
import { RoomSelectCard } from "../dashboard/Property/Rooms/RoomSelectCard";
import { SummaryRow } from "../dashboard/lease/SummaryRow";
import { showToast } from "../toast/Toast";
import { PaginationControls } from "../ui/SimplePagination";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const RecordPaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // API Data State
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Pagination & Search
  const [propSearch, setPropSearch] = useState("");
  const debouncedPropSearch = useDebounce(propSearch, 500);
  const [propPage, setPropPage] = useState(1);
  const [totalPropPages, setTotalPropPages] = useState(1);

  const [roomSearch, setRoomSearch] = useState("");
  const debouncedRoomSearch = useDebounce(roomSearch, 500);
  const [roomPage, setRoomPage] = useState(1);
  const [totalRoomPages, setTotalRoomPages] = useState(1);

  // Selections
  const [selectedProp, setSelectedProp] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const selectedTenant =
    selectedRoom?.current_tenant || selectedRoom?.tenant || null;
  const activeLeaseId =
    selectedRoom?.current_lease?.id ||
    selectedRoom?.lease?.id ||
    selectedRoom?.lease_id;

  // Form Data
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date_paid: new Date().toISOString().split("T")[0],
    payment_method: "Cash",
    reference_number: "",
    payment_for_month: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setStep(1);
      setSelectedProp(null);
      setSelectedRoom(null);
      setPropSearch("");
      setPropPage(1);
      setRoomSearch("");
      setRoomPage(1);

      setPaymentData({
        amount: "",
        date_paid: new Date().toISOString().split("T")[0],
        payment_method: "Cash",
        reference_number: "",
        payment_for_month: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [isOpen]);

  // --- API CALLS ---
  const loadProperties = useCallback(async () => {
    if (!isOpen) return;
    setDataLoading(true);
    try {
      const res = await getProperties({
        current_page: propPage,
        search: debouncedPropSearch,
        limit: 6,
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
        statusTab: "Occupied",
      };
      const res = await getRoomByProperty(pId, params);

      if (res.success) {
        setRooms(res.rooms);
        setTotalRoomPages(res.pagination.last_page);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setDataLoading(false);
    }
  }, [isOpen, selectedProp, roomPage, debouncedRoomSearch]);

  useEffect(() => {
    if (step === 1 && isOpen) loadProperties();
  }, [step, isOpen, loadProperties]);

  useEffect(() => {
    if (step === 2 && isOpen && selectedProp) loadRooms();
  }, [step, isOpen, selectedProp, loadRooms]);

  useEffect(() => {
    if (selectedRoom && step === 3 && !paymentData.amount) {
      setPaymentData((prev) => ({
        ...prev,
        amount: selectedRoom.monthly_rent || "",
      }));
    }
  }, [selectedRoom, step]);

  // --- NAVIGATION & VALIDATION ---
  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && !selectedProp)
      newErrors.property = "Please select a property.";
    if (step === 2 && !selectedRoom) newErrors.room = "Please select a unit.";

    if (step === 3) {
      if (!paymentData.amount || Number(paymentData.amount) <= 0)
        newErrors.amount = "Valid amount is required.";
      if (!paymentData.date_paid)
        newErrors.date_paid = "Date paid is required.";
      if (!paymentData.payment_method)
        newErrors.payment_method = "Payment method is required.";
      if (
        paymentData.payment_method !== "Cash" &&
        !paymentData.reference_number
      ) {
        newErrors.reference_number =
          "Reference number is required for non-cash payments.";
      }
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
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      lease_id: activeLeaseId,
      room_id: !activeLeaseId
        ? selectedRoom.room_id || selectedRoom.id
        : undefined,
      amount: Number(paymentData.amount),
      transaction_date: paymentData.date_paid,
      payment_method: paymentData.payment_method,
      reference_number:
        paymentData.payment_method === "Cash"
          ? ""
          : paymentData.reference_number,
      payment_for_month: paymentData.payment_for_month,
      notes: paymentData.notes,
    };

    try {
      const result = await recordPayment(payload);

      if (result.success) {
        showToast("Payment recorded successfully!", "success");
        onSuccess?.();
        onClose();
      } else {
        showToast(result.message || "Failed to record payment.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("An unexpected error occurred.", "error");
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
        {/* SIDEBAR WIZARD */}
        <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 flex-col p-6 shrink-0 h-full overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            Record Payment
          </h2>
          <p className="text-xs text-slate-500 mb-6">Wizard</p>
          <div className="space-y-4 relative mb-6">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 -z-10" />
            {[
              { num: 1, label: "Property", icon: Building },
              { num: 2, label: "Unit", icon: Home },
              { num: 3, label: "Payment", icon: CreditCard },
              { num: 4, label: "Confirm", icon: CheckCircle2 },
            ].map((item) => {
              const isCompleted = step > item.num;
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

          {/* Context Info Box */}
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
                      <p className="text-xs font-bold text-slate-700 truncate">
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
          {/* Mobile Header */}
          <div className="flex flex-col border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between p-4">
              <div className="md:hidden">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Step {step} of 4
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {step === 1
                    ? "Select Property"
                    : step === 2
                    ? "Select Unit"
                    : step === 3
                    ? "Payment Details"
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
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-4">
            {/* STEP 1: PROPERTY */}
            {step === 1 && (
              <div className="animate-in slide-in-from-right-4">
                <h3 className="hidden md:block text-xl font-bold text-slate-800 mb-4">
                  Select Property
                </h3>

                {/* Search */}
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

                {/* List */}
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
                          <div className="text-xs text-slate-500">{p.city}</div>
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

            {/* STEP 2: UNIT */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h3 className="hidden md:block text-xl font-bold text-slate-800">
                    Select Unit
                  </h3>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded w-fit">
                    Occupied Units Only
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
                    No occupied units found.
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

            {/* STEP 3: PAYMENT DETAILS */}
            {step === 3 && (
              <div className="animate-in slide-in-from-right-4 space-y-6">
                <h3 className="hidden md:block text-xl font-bold text-slate-800">
                  Payment Details
                </h3>

                {/* Auto Detected Tenant Info */}
                <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-400 uppercase">
                      Payer (Tenant)
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedTenant?.first_name
                        ? `${selectedTenant.first_name} ${selectedTenant.last_name}`
                        : "Unknown Tenant"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2 flex items-center gap-2">
                    <CreditCard size={16} /> Transaction Info
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Amount Received <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={paymentData.amount}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            amount: e.target.value,
                          })
                        }
                        className={`w-full p-3 bg-white border rounded-xl text-sm font-bold text-emerald-700 focus:outline-none ${
                          errors.amount
                            ? "border-red-500"
                            : "border-emerald-200 focus:border-emerald-500"
                        }`}
                        placeholder="0.00"
                      />
                      {errors.amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    {/* Date Paid */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Date Paid <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={paymentData.date_paid}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            date_paid: e.target.value,
                          })
                        }
                        className={`w-full p-3 bg-white border rounded-xl text-sm focus:outline-none ${
                          errors.date_paid
                            ? "border-red-500"
                            : "border-slate-200 focus:border-emerald-500"
                        }`}
                      />
                    </div>

                    {/* Method */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentData.payment_method}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            payment_method: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="GCash">GCash</option>
                        <option value="Check">Check</option>
                      </select>
                    </div>

                    {/* Reference */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Reference No.
                      </label>
                      {paymentData.payment_method === "Cash" ? (
                        <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 italic flex items-center gap-2">
                          <CheckCircle2 size={14} /> N/A (Cash)
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={paymentData.reference_number}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              reference_number: e.target.value,
                            })
                          }
                          placeholder="OR No. / Ref No."
                          className={`w-full p-3 bg-white border rounded-xl text-sm focus:outline-none ${
                            errors.reference_number
                              ? "border-red-500"
                              : "border-slate-200 focus:border-emerald-500"
                          }`}
                        />
                      )}
                      {errors.reference_number && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.reference_number}
                        </p>
                      )}
                    </div>

                    {/* For Month Of */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500">
                        Payment For (Month)
                      </label>
                      <input
                        type="date"
                        value={paymentData.payment_for_month}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            payment_for_month: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Select any day in the month you are applying payment to.
                      </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={paymentData.notes}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Additional details..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none h-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
              <div className="animate-in slide-in-from-right-4 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Confirm Payment
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Review details before recording.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                      ₱
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase">
                        Total Amount
                      </p>
                      <p className="text-xl font-bold text-slate-800">
                        ₱{Number(paymentData.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <SummaryRow
                      label="Property"
                      value={selectedProp?.property_name}
                    />
                    <SummaryRow
                      label="Unit"
                      value={selectedRoom?.room_number}
                    />
                    <SummaryRow
                      label="Payer"
                      value={
                        selectedTenant?.first_name
                          ? `${selectedTenant.first_name} ${selectedTenant.last_name}`
                          : "Unknown"
                      }
                    />
                    <div className="h-px bg-slate-100 my-2" />
                    <SummaryRow
                      label="Date Paid"
                      value={paymentData.date_paid}
                    />
                    <SummaryRow
                      label="Method"
                      value={paymentData.payment_method}
                    />
                    <SummaryRow
                      label="Status"
                      value={
                        paymentData.payment_method === "Cash"
                          ? "Verified (Auto)"
                          : "Pending (Needs Verify)"
                      }
                    />
                    <SummaryRow
                      label="Reference"
                      value={
                        paymentData.payment_method === "Cash"
                          ? "Cash Payment"
                          : paymentData.reference_number
                      }
                    />
                    <SummaryRow
                      label="For Month"
                      value={new Date(
                        paymentData.payment_for_month
                      ).toLocaleDateString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 border-t border-slate-100 flex justify-between bg-white shrink-0 pb-safe sm:pb-4">
            <button
              onClick={handleBack}
              className="px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            {step < 4 ? (
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
                )}
                Confirm Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
