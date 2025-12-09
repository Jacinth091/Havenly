import {
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle2,
  ChevronRight,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Wallet,
  Wand2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty } from "../../api/property.api";

const CreateProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    property_name: "",
    city: "Cebu City",
    street: "",
    barangay: "",
    zip_code: "",
    auto_generate: true,
    total_rooms: 5,
    room_prefix: "RM-",
    starting_number: 101,
    default_rent: 5000,
    generated_rooms: [],
  });

  // Effect: Regenerate rooms
  useEffect(() => {
    if (formData.auto_generate) {
      const rooms = Array.from(
        { length: Math.max(1, Number(formData.total_rooms)) },
        (_, i) => ({
          room_number: `${formData.room_prefix}${
            Number(formData.starting_number) + i
          }`,
          monthly_rent: formData.default_rent,
          room_status: "Available",
        })
      );
      setFormData((prev) => ({ ...prev, generated_rooms: rooms }));
    }
  }, [
    formData.total_rooms,
    formData.room_prefix,
    formData.starting_number,
    formData.default_rent,
    formData.auto_generate,
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (errors.apiError) setErrors((prev) => ({ ...prev, apiError: null }));
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...formData.generated_rooms];
    updatedRooms[index][field] = value;
    setFormData((prev) => ({ ...prev, generated_rooms: updatedRooms }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.property_name.trim())
      newErrors.property_name = "Property name is required";
    if (!formData.street.trim()) newErrors.street = "Street is required";
    if (!formData.barangay.trim()) newErrors.barangay = "Barangay is required";
    if (!formData.zip_code.trim()) newErrors.zip_code = "Zip Code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const combinedAddress = `${formData.street}, ${formData.barangay}, ${formData.zip_code}`;

    const payload = {
      property_name: formData.property_name,
      address: combinedAddress,
      city: formData.city,
      total_rooms: formData.generated_rooms.length,
      rooms: formData.generated_rooms,
    };

    try {
      const result = await createProperty(payload);
      if (result.success) {
        navigate("/landlord/properties");
      } else {
        setErrors((prev) => ({
          ...prev,
          apiError: result.message || "Failed to create property",
        }));
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setErrors((prev) => ({
        ...prev,
        apiError: "An unexpected network error occurred.",
      }));
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "Maintenance":
        return "text-amber-700 bg-amber-100 border-amber-200";
      case "Occupied":
        return "text-blue-700 bg-blue-100 border-blue-200";
      default:
        return "text-slate-700 bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col sm:justify-center sm:items-center sm:p-6">
      {/* DESKTOP HEADER (Hidden on Mobile) */}
      <div className="hidden sm:flex w-full max-w-5xl justify-between items-center mb-4 animate-in fade-in slide-in-from-top-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            New Property
          </h1>
          <p className="text-slate-500 text-sm">
            Configure your building details and unit layout.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors bg-white px-4 py-2 rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm"
        >
          <XCircle size={18} className="mr-2" /> Cancel
        </button>
      </div>

      {/* MAIN CARD CONTAINER */}
      {/* overflow-hidden ensures inner scrollbars work correctly */}
      <div className="w-full h-full sm:h-[80vh] max-w-5xl bg-white sm:rounded-2xl shadow-none sm:shadow-2xl border-0 sm:border border-slate-200 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        {/* SIDEBAR / TOPBAR */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-8 shrink-0 flex flex-col justify-center md:justify-start">
          {/* --- MOBILE VIEW: Text Stepper --- */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Step {step} / 2
              </span>
              <span className="text-sm font-bold text-slate-800">
                {step === 1 ? "Property Info" : "Unit Config"}
              </span>
            </div>
            {/* Simple Mobile Progress Bar */}
            <div className="flex gap-1">
              <div
                className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                  step >= 1 ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
              <div
                className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                  step >= 2 ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            </div>
          </div>

          {/* --- DESKTOP VIEW: Circle Stepper --- */}
          <div className="hidden md:flex flex-col gap-8">
            {/* Step 1 */}
            <div
              className={`flex items-start gap-4 whitespace-nowrap ${
                step === 1 ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === 1
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110"
                    : "bg-white border-2 border-slate-300 text-slate-400"
                }`}
              >
                {step > 1 ? <CheckCircle2 size={16} /> : "1"}
              </div>
              <div className="hidden md:block">
                <p
                  className={`text-sm font-bold ${
                    step === 1 ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  Property Info
                </p>
                <p className="text-xs text-slate-400 mt-1">Location & Name</p>
              </div>
            </div>

            {/* Connector */}
            <div className="hidden md:block w-0.5 h-12 bg-slate-200 ml-4 -my-2"></div>

            {/* Step 2 */}
            <div
              className={`flex items-start gap-4 whitespace-nowrap ${
                step === 2 ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === 2
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110"
                    : "bg-white border-2 border-slate-300 text-slate-400"
                }`}
              >
                2
              </div>
              <div className="hidden md:block">
                <p
                  className={`text-sm font-bold ${
                    step === 2 ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  Unit Config
                </p>
                <p className="text-xs text-slate-400 mt-1">Rooms & Pricing</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA - h-full and overflow-hidden here are key */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-white h-full overflow-hidden">
          {/* MOBILE CONTENT HEADER */}
          <div className="sm:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="font-bold text-slate-800">
              {step === 1 ? "Property Details" : "Unit Configuration"}
            </span>
            <div className="w-8" />
          </div>

          {/* API ERROR */}
          {errors.apiError && (
            <div className="absolute top-0 left-0 right-0 bg-red-50 p-4 border-b border-red-100 flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2 z-30">
              <XCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{errors.apiError}</p>
            </div>
          )}

          {/* SCROLLABLE FORM AREA */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-4">
            {/* STEP 1 FORM */}
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="hidden sm:block">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Building className="text-emerald-600" size={24} /> Basic
                    Information
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Property Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="property_name"
                      value={formData.property_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sunset Boulevard Apartments"
                      className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        errors.property_name
                          ? "border-red-500 focus:border-red-500 bg-red-50"
                          : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                      }`}
                      autoFocus
                    />
                    {errors.property_name && (
                      <p className="text-red-500 text-xs mt-1 font-medium">
                        {errors.property_name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white appearance-none"
                        >
                          <option value="Cebu City">Cebu City</option>
                          <option value="Mandaue City">Mandaue City</option>
                          <option value="Lapu-Lapu City">Lapu-Lapu City</option>
                          <option value="Talisay City">Talisay City</option>
                        </select>
                        <ChevronRight
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                        placeholder="e.g. 6000"
                        className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                          errors.zip_code
                            ? "border-red-500 focus:border-red-500 bg-red-50"
                            : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                        }`}
                      />
                      {errors.zip_code && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.zip_code}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="House No., Street Name"
                        className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                          errors.street
                            ? "border-red-500 focus:border-red-500 bg-red-50"
                            : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                        }`}
                      />
                      {errors.street && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.street}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Barangay <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="barangay"
                        value={formData.barangay}
                        onChange={handleInputChange}
                        placeholder="e.g. Lahug"
                        className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                          errors.barangay
                            ? "border-red-500 focus:border-red-500 bg-red-50"
                            : "border-slate-200 focus:border-emerald-500 focus:bg-white"
                        }`}
                      />
                      {errors.barangay && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.barangay}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 FORM */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                <div className="mb-6 hidden sm:block">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="text-emerald-600" size={24} /> Unit
                    Configuration
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Review the automatically generated units or add them
                    manually.
                  </p>
                </div>

                {/* Generator Control Panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Wand2 size={16} className="text-purple-500" /> Bulk
                      Generator
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 select-none">
                      <span>Auto-fill</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="auto_generate"
                          checked={formData.auto_generate}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                    </label>
                  </div>

                  <div
                    className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-opacity duration-200 ${
                      !formData.auto_generate
                        ? "opacity-40 pointer-events-none"
                        : "opacity-100"
                    }`}
                  >
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Prefix
                      </label>
                      <input
                        type="text"
                        name="room_prefix"
                        value={formData.room_prefix}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Start #
                      </label>
                      <input
                        type="number"
                        name="starting_number"
                        value={formData.starting_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Count
                      </label>
                      <input
                        type="number"
                        name="total_rooms"
                        value={formData.total_rooms}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Rent (₱)
                      </label>
                      <input
                        type="number"
                        name="default_rent"
                        value={formData.default_rent}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Table Header Stats */}
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-sm font-bold text-slate-700">
                    {formData.generated_rooms.length} Units Configured
                  </span>
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <Wallet size={14} />₱{" "}
                    {formData.generated_rooms
                      .reduce((acc, curr) => acc + Number(curr.monthly_rent), 0)
                      .toLocaleString()}
                  </div>
                </div>

                {/* Units Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col bg-white">
                  <div className="overflow-y-auto flex-1 scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-bold tracking-wider shadow-sm">
                        <tr>
                          <th className="px-6 py-3 border-b border-slate-200">
                            Room
                          </th>
                          <th className="px-6 py-3 border-b border-slate-200">
                            Rent
                          </th>
                          <th className="px-6 py-3 border-b border-slate-200">
                            Status
                          </th>
                          <th className="px-6 py-3 border-b border-slate-200 text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.generated_rooms.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-20 text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4 text-slate-300">
                                <Layers size={32} />
                              </div>
                              <p className="text-slate-500 font-medium">
                                No units added yet.
                              </p>
                              <button
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    generated_rooms: [
                                      {
                                        room_number: "101",
                                        monthly_rent: 5000,
                                        room_status: "Available",
                                      },
                                    ],
                                  }))
                                }
                                className="mt-2 text-emerald-600 font-bold hover:underline"
                              >
                                Add First Unit
                              </button>
                            </td>
                          </tr>
                        ) : (
                          formData.generated_rooms.map((room, index) => (
                            <tr key={index} className="hover:bg-slate-50 group">
                              <td className="px-6 py-2">
                                <input
                                  type="text"
                                  value={room.room_number}
                                  onChange={(e) =>
                                    handleRoomChange(
                                      index,
                                      "room_number",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-emerald-500 rounded px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none transition-all"
                                />
                              </td>
                              <td className="px-6 py-2">
                                <input
                                  type="number"
                                  value={room.monthly_rent}
                                  onChange={(e) =>
                                    handleRoomChange(
                                      index,
                                      "monthly_rent",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-emerald-500 rounded px-2 py-1 text-sm font-medium text-slate-600 focus:outline-none transition-all"
                                />
                              </td>
                              <td className="px-6 py-2">
                                <select
                                  value={room.room_status}
                                  onChange={(e) =>
                                    handleRoomChange(
                                      index,
                                      "room_status",
                                      e.target.value
                                    )
                                  }
                                  className={`text-xs font-bold px-2 py-1 rounded-md border appearance-none cursor-pointer focus:outline-none ${getStatusColor(
                                    room.room_status
                                  )}`}
                                >
                                  <option value="Available">Available</option>
                                  <option value="Maintenance">
                                    Maintenance
                                  </option>
                                  <option value="Occupied">Occupied</option>
                                </select>
                              </td>
                              <td className="px-6 py-2 text-center">
                                <button
                                  onClick={() => {
                                    const newRooms =
                                      formData.generated_rooms.filter(
                                        (_, i) => i !== index
                                      );
                                    setFormData((prev) => ({
                                      ...prev,
                                      generated_rooms: newRooms,
                                    }));
                                  }}
                                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        generated_rooms: [
                          ...prev.generated_rooms,
                          {
                            room_number: `${formData.room_prefix}${
                              Number(formData.starting_number) +
                              prev.generated_rooms.length
                            }`,
                            monthly_rent: formData.default_rent,
                            room_status: "Available",
                          },
                        ],
                      }))
                    }
                    className="w-full py-3 bg-slate-50 border-t border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Custom Unit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS - Fixed bottom with shadow and safe area padding */}
          <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex justify-between items-center shrink-0 pb-safe z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:shadow-none">
            {step === 1 ? (
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={handleNext}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                Save Property
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
