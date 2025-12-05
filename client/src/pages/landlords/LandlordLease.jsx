import {
  Archive,
  Ban,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'leases' table
const MOCK_LEASES = [
  {
    id: 101,
    tenant: "Alice Smith",
    property: "Sunset Heights",
    room: "101",
    start: "2025-01-01",
    end: "2026-01-01",
    payment_due_day: 5,
    status: "Active",
    rent: 15000,
    deposit: 30000,
  },
  {
    id: 102,
    tenant: "Bob Jones",
    property: "Sunset Heights",
    room: "102",
    start: "2024-06-01",
    end: "2025-12-05",
    payment_due_day: 1,
    status: "Active",
    rent: 12000,
    deposit: 24000,
  },
  {
    id: 103,
    tenant: "Charlie Day",
    property: "Ocean View Apts",
    room: "A1",
    start: "2024-01-01",
    end: "2025-01-01",
    payment_due_day: 15,
    status: "Expired",
    rent: 10000,
    deposit: 20000,
  },
  {
    id: 104,
    tenant: "Diana Prince",
    property: "Green Valley",
    room: "B2",
    start: "2024-03-01",
    end: "2024-08-01",
    payment_due_day: 1,
    status: "Terminated",
    rent: 18000,
    deposit: 36000,
  },
  // Added data for pagination demo
  {
    id: 105,
    tenant: "Evan Wright",
    property: "Sunset Heights",
    room: "105",
    start: "2025-02-01",
    end: "2026-02-01",
    payment_due_day: 5,
    status: "Active",
    rent: 16000,
    deposit: 32000,
  },
  {
    id: 106,
    tenant: "Fiona Gallagher",
    property: "Ocean View Apts",
    room: "A3",
    start: "2025-03-01",
    end: "2026-03-01",
    payment_due_day: 15,
    status: "Active",
    rent: 11000,
    deposit: 22000,
  },
];

const ITEMS_PER_PAGE = 4;

const LandlordLeases = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'card'
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Data based on Tab
  const filteredLeases = MOCK_LEASES.filter((lease) => {
    if (activeTab === "active") return lease.status === "Active";
    return ["Expired", "Terminated", "Archived"].includes(lease.status);
  });

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredLeases.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Helper: Expiration Check
  const isExpiringSoon = (endDate) => {
    const today = new Date("2025-12-01");
    const end = new Date(endDate);
    const diffTime = Math.abs(end - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && end > today;
  };

  // Helper: Format Ordinal Date (1st, 2nd, etc.)
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Lease Management
          </h2>
          <p className="text-sm text-slate-600">
            Track agreements, deposits, and expirations.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-all">
          <Plus size={16} /> New Agreement
        </button>
      </div>

      {/* Control Bar: Tabs, Search & View Toggle */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg w-full xl:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 xl:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "active"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active Leases
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 xl:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "history"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            History / Archived
          </button>
        </div>

        {/* Search & Toggle Group */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-grow xl:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search tenant..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-emerald-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "card"
                  ? "bg-white shadow-sm text-emerald-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredLeases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
          <Filter size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500">No {activeTab} leases found.</p>
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tenant Details</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Financial Terms</th>
                  <th className="px-6 py-4">Due Day</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((lease) => (
                  <tr
                    key={lease.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {lease.tenant.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {lease.tenant}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            {lease.property}{" "}
                            <span className="text-slate-300">•</span>{" "}
                            {lease.room}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{lease.start}</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            isExpiringSoon(lease.end) &&
                            lease.status === "Active"
                              ? "text-amber-600 font-bold"
                              : ""
                          }`}
                        >
                          <Calendar
                            size={12}
                            className={
                              isExpiringSoon(lease.end) &&
                              lease.status === "Active"
                                ? "text-amber-600"
                                : "text-slate-400"
                            }
                          />
                          <span>{lease.end}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        ₱{lease.rent.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        Dep: ₱{lease.deposit.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">
                        <Clock size={12} />
                        {getOrdinal(lease.payment_due_day)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        color={
                          lease.status === "Active"
                            ? isExpiringSoon(lease.end)
                              ? "amber"
                              : "green"
                            : lease.status === "Expired"
                            ? "red"
                            : lease.status === "Terminated"
                            ? "gray"
                            : "blue"
                        }
                      >
                        {lease.status === "Active" && isExpiringSoon(lease.end)
                          ? "Expiring Soon"
                          : lease.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab === "active" ? (
                          <>
                            <button
                              title="View Details"
                              className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              title="Terminate Lease"
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            title="Archive Record"
                            className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentData.map((lease) => (
            <div
              key={lease.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group relative"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {lease.tenant.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">
                      {lease.tenant}
                    </h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <User size={10} /> Tenant ID: #{lease.id}
                    </span>
                  </div>
                </div>
                <div className="absolute top-5 right-5">
                  <button className="text-slate-300 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-3">
                {/* Property Info */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="text-emerald-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {lease.property}
                    </p>
                    <p className="text-xs text-slate-500">Unit {lease.room}</p>
                  </div>
                </div>

                {/* Dates & Status */}
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Calendar size={12} className="text-slate-400" />{" "}
                      {lease.start}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-xs ${
                        isExpiringSoon(lease.end) && lease.status === "Active"
                          ? "text-amber-600 font-bold"
                          : "text-slate-600"
                      }`}
                    >
                      <Calendar
                        size={12}
                        className={
                          isExpiringSoon(lease.end) && lease.status === "Active"
                            ? "text-amber-600"
                            : "text-slate-400"
                        }
                      />{" "}
                      {lease.end}
                    </div>
                  </div>
                  <Badge
                    color={
                      lease.status === "Active"
                        ? isExpiringSoon(lease.end)
                          ? "amber"
                          : "green"
                        : lease.status === "Expired"
                        ? "red"
                        : lease.status === "Terminated"
                        ? "gray"
                        : "blue"
                    }
                  >
                    {lease.status === "Active" && isExpiringSoon(lease.end)
                      ? "Expiring"
                      : lease.status}
                  </Badge>
                </div>

                {/* Financials */}
                <div className="flex justify-between items-end pt-1">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Monthly Rent
                    </span>
                    <div className="text-xl font-bold text-slate-800">
                      ₱{lease.rent.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      <Clock size={12} /> Due:{" "}
                      {getOrdinal(lease.payment_due_day)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {filteredLeases.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4">
          <span className="text-sm text-slate-500 text-center sm:text-left">
            Showing{" "}
            <span className="font-medium text-slate-900">{startIndex + 1}</span>{" "}
            to{" "}
            <span className="font-medium text-slate-900">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredLeases.length)}
            </span>{" "}
            of {filteredLeases.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordLeases;
