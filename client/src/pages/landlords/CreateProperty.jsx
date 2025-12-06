import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle2,
  ChevronRight,
  Hash,
  Home,
  Layers,
  Map,
  MapPin,
  Plus,
  Trash2,
  Wallet,
  XCircle, // Added for error alert
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

    // Address fields
    street: "",
    barangay: "",
    zip_code: "",

    // Generator Settings
    auto_generate: true,
    total_rooms: 5,
    room_prefix: "",
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
    // Clear API error if user types
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

  // --- INTEGRATED API LOGIC HERE ---
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({}); // Clear previous errors

    // 1. Combine Address
    const combinedAddress = `${formData.street}, ${formData.barangay}, ${formData.zip_code}`;

    // 2. Prepare Payload
    const payload = {
      property_name: formData.property_name,
      address: combinedAddress,
      city: formData.city,
      total_rooms: formData.generated_rooms.length,
      rooms: formData.generated_rooms, // Sends [] if empty, handled by backend
    };

    console.log("Submitting Payload:", payload);

    try {
      // 3. Call your API Function
      const result = await createProperty(payload);

      if (result.success) {
        // Success: Redirect
        console.log("Success:", result.message);
        navigate("/landlord/properties");
      } else {
        // Fail: Show Error
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
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Maintenance":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "Occupied":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const Stepper = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-xs relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 ease-out -z-10 rounded-full`}
          style={{ width: step === 1 ? "50%" : "100%" }}
        ></div>
        <div className="flex-1 flex justify-start">
          <div className="flex items-center gap-2 bg-slate-50 pr-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                step >= 1
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-500"
              }`}
            >
              1
            </div>
            <span
              className={`text-sm font-semibold hidden sm:block ${
                step >= 1 ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Property Info
            </span>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2 bg-slate-50 pl-4">
            <span
              className={`text-sm font-semibold hidden sm:block ${
                step >= 2 ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Review Units
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                step >= 2
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-500"
              }`}
            >
              2
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Add New Property
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Create a new building and configure its units
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Stepper />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative transition-all duration-300">
          {/* API ERROR BANNER */}
          {errors.apiError && (
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-center gap-3 text-red-700">
              <XCircle size={20} />
              <p className="text-sm font-medium">{errors.apiError}</p>
            </div>
          )}

          {/* --- STEP 1: PROPERTY DETAILS --- */}
          <div
            className={`${
              step === 1 ? "block" : "hidden"
            } p-6 sm:p-8 space-y-8 animate-fade-in`}
          >
            <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Building size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Property Details
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter the general location and information for this building.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Name */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Home
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    name="property_name"
                    value={formData.property_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Sunset Boulevard Apartments"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 ${
                      errors.property_name
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.property_name && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={14} /> {errors.property_name}
                  </p>
                )}
              </div>

              {/* City Selection */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="Cebu City">Cebu City</option>
                    <option value="Mandaue City">Mandaue City</option>
                    <option value="Lapu-Lapu City">Lapu-Lapu City</option>
                    <option value="Talisay City">Talisay City</option>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              {/* Zip Code */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="e.g. 6000"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 ${
                      errors.zip_code
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.zip_code && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={14} /> {errors.zip_code}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  House No. / Street <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Home
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="e.g. 123 Juan Luna St."
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 ${
                      errors.street
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.street && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={14} /> {errors.street}
                  </p>
                )}
              </div>

              {/* Barangay */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Barangay <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Map
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    placeholder="e.g. Lahug"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 ${
                      errors.barangay
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.barangay && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={14} /> {errors.barangay}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* --- STEP 2: UNIT CONFIGURATION --- */}
          <div
            className={`${
              step === 2 ? "block" : "hidden"
            } p-6 sm:p-8 space-y-8 animate-fade-in`}
          >
            <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Layers size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Unit Configuration
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Configure rooms for{" "}
                  <span className="font-semibold text-slate-800">
                    {formData.property_name}
                  </span>
                  .{" "}
                  <span className="text-slate-400 font-normal italic">
                    You can skip this and add rooms later.
                  </span>
                </p>
              </div>
            </div>

            {/* Generator Settings Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Bulk Generator
                </h3>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="auto_generate"
                      checked={formData.auto_generate}
                      onChange={handleInputChange}
                      className="peer sr-only"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                    Auto-fill
                  </span>
                </label>
              </div>

              <div
                className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ${
                  !formData.auto_generate
                    ? "opacity-40 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Prefix (Optional)
                  </label>
                  <input
                    type="text"
                    name="room_prefix"
                    value={formData.room_prefix}
                    onChange={handleInputChange}
                    placeholder="e.g. RM-"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Start Number
                  </label>
                  <input
                    type="number"
                    name="starting_number"
                    value={formData.starting_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Total Units
                  </label>
                  <input
                    type="number"
                    name="total_rooms"
                    value={formData.total_rooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Default Rent (₱)
                  </label>
                  <input
                    type="number"
                    name="default_rent"
                    value={formData.default_rent}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Room Review Section */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-sm font-bold text-slate-800">
                  Review Generated Units
                  <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                    {formData.generated_rooms.length}
                  </span>
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">
                    Projected Revenue:
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    <Wallet size={14} /> ₱{" "}
                    {formData.generated_rooms
                      .reduce((acc, curr) => acc + Number(curr.monthly_rent), 0)
                      .toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200">
                          Room #
                        </th>
                        <th className="px-4 py-3 border-b border-slate-200">
                          Rent (₱)
                        </th>
                        <th className="px-4 py-3 border-b border-slate-200">
                          Status
                        </th>
                        <th className="px-4 py-3 border-b border-slate-200 text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {formData.generated_rooms.map((room, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="px-4 py-2">
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
                              className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none py-1 font-semibold text-slate-700 transition-colors"
                            />
                          </td>
                          <td className="px-4 py-2">
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
                              className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none py-1 text-slate-600 font-medium transition-colors"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={room.room_status}
                              onChange={(e) =>
                                handleRoomChange(
                                  index,
                                  "room_status",
                                  e.target.value
                                )
                              }
                              className={`text-xs font-bold px-2 py-1 rounded-md border outline-none appearance-none cursor-pointer transition-colors ${getStatusColor(
                                room.room_status
                              )}`}
                            >
                              <option value="Available">Available</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Occupied">Occupied</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 text-center">
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
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {formData.generated_rooms.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                        <Layers size={24} />
                      </div>
                      <p className="text-sm font-medium">
                        No units configured yet.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              generated_rooms: [
                                {
                                  room_number: "RM-101",
                                  monthly_rent: 5000,
                                  room_status: "Available",
                                },
                              ],
                            }))
                          }
                          className="text-emerald-600 text-sm font-bold hover:text-emerald-700 hover:underline transition-colors"
                        >
                          Add A Unit
                        </button>
                        <span className="text-slate-300">or</span>
                        <button
                          onClick={handleSubmit}
                          className="text-slate-500 text-sm font-medium hover:text-slate-700 hover:underline transition-colors"
                        >
                          Save Property Only
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-2 border-t border-slate-200">
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
                    className="w-full py-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all text-xs font-bold uppercase tracking-wide"
                  >
                    <Plus size={14} /> Add Another Unit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="bg-slate-50 p-4 sm:p-6 border-t border-slate-200 flex justify-between items-center">
            {step === 1 ? (
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Confirm & Save
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
