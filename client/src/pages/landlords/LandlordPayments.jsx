import {
  AlertCircle,
  Banknote,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Filter,
  Landmark,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'transactions' table
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    tenant: "Alice Smith",
    amount: 15000,
    date: "2025-10-01 09:30:00",
    payment_for: "2025-10-01",
    method: "Cash",
    status: "Completed",
    ref: "CASH-REC-001",
    room: "101",
    notes: "Handed personally",
  },
  {
    id: 2,
    tenant: "Bob Jones",
    amount: 12000,
    date: "2025-10-03 14:15:00",
    payment_for: "2025-10-01",
    method: "GCash",
    status: "Pending",
    ref: "GC-99382123",
    room: "102",
    notes: "Screenshot sent via Messenger",
  },
  {
    id: 3,
    tenant: "Charlie Day",
    amount: 10000,
    date: "2025-09-28 11:00:00",
    payment_for: "2025-09-01",
    method: "Bank Transfer",
    status: "Completed",
    ref: "BDO-7721-X99",
    room: "A1",
    notes: null,
  },
  {
    id: 4,
    tenant: "Diana Prince",
    amount: 18000,
    date: "2025-10-05 10:00:00",
    payment_for: "2025-10-01",
    method: "Check",
    status: "Cancelled",
    ref: "CHK-00123",
    room: "B2",
    notes: "Check bounced, re-issuing",
  },
  // Added extra data to demonstrate pagination
  {
    id: 5,
    tenant: "Evan Wright",
    amount: 15000,
    date: "2025-10-06 10:00:00",
    payment_for: "2025-10-01",
    method: "Cash",
    status: "Completed",
    ref: "CASH-REC-002",
    room: "105",
    notes: null,
  },
  {
    id: 6,
    tenant: "Fiona Gallagher",
    amount: 12500,
    date: "2025-10-07 11:30:00",
    payment_for: "2025-10-01",
    method: "PayMaya",
    status: "Completed",
    ref: "PM-88219",
    room: "201",
    notes: null,
  },
];

const ITEMS_PER_PAGE = 5;

const LandlordPayments = () => {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'card'
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const totalPages = Math.ceil(MOCK_TRANSACTIONS.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = MOCK_TRANSACTIONS.slice(
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

  // Helper to get icon based on Schema ENUM
  const getMethodIcon = (method) => {
    switch (method) {
      case "Cash":
        return <Banknote size={16} className="text-emerald-600" />;
      case "GCash":
      case "PayMaya":
        return <Smartphone size={16} className="text-blue-600" />;
      case "Bank Transfer":
      case "Check":
        return <Landmark size={16} className="text-purple-600" />;
      default:
        return <CreditCard size={16} className="text-slate-500" />;
    }
  };

  // Helper for Status Badge Color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "Pending":
        return "amber";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Financial Records
          </h2>
          <p className="text-sm text-slate-600">
            Manual transaction logging and history.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Total Collected (Oct)
            </span>
            <span className="font-bold text-emerald-600">₱27,000.00</span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showForm
                ? "bg-slate-200 text-slate-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            }`}
          >
            <Plus size={16} /> {showForm ? "Cancel Entry" : "Record Payment"}
          </button>
        </div>
      </div>

      {/* Manual Entry Form (Collapsible) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100 animate-slide-down">
          {/* ... Form Content (Same as previous) ... */}
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <FileText className="text-emerald-500" size={20} /> New
              Transaction Entry
            </h3>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> Manual Recording Only
            </span>
          </div>
          {/* Simplified form fields for brevity in this snippet */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Payer
              </label>
              <select className="w-full border p-2 rounded-lg text-sm bg-slate-50">
                <option>Select Lease...</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Amount
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg text-sm bg-slate-50"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Method
              </label>
              <select className="w-full border p-2 rounded-lg text-sm bg-slate-50">
                <option>Cash</option>
                <option>GCash</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Ref #
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg text-sm bg-slate-50"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm">
              Save Record
            </button>
          </div>
        </div>
      )}

      {/* Controls Bar: Search, Filter, View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search ref no. or tenant..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors">
            <Filter size={14} /> Filter
          </button>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
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
      {viewMode === "list" ? (
        /* LIST VIEW (TABLE) */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Reference Info</th>
                  <th className="px-6 py-4">Payer</th>
                  <th className="px-6 py-4">Coverage</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50 group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">
                        {tx.ref}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(tx.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        {tx.tenant}
                      </div>
                      <div className="text-xs text-slate-500">
                        Unit {tx.room}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(tx.payment_for).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        {getMethodIcon(tx.method)}
                        <span>{tx.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₱{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW (GRID) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentData.map((tx) => (
            <div
              key={tx.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all group relative"
            >
              {/* Card Header: Date & Status */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={14} />
                  <span>{new Date(tx.date).toLocaleDateString()}</span>
                </div>
                <Badge color={getStatusColor(tx.status)}>{tx.status}</Badge>
              </div>

              {/* Card Body: Main Info */}
              <div className="mb-4">
                <h4 className="font-bold text-slate-800 text-lg">
                  {tx.tenant}
                </h4>
                <p className="text-sm text-slate-500 mb-2">Unit {tx.room}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">
                    ₱{tx.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">PHP</span>
                </div>
              </div>

              {/* Card Footer: Metadata */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Coverage</span>
                  <span className="font-medium text-slate-700">
                    {new Date(tx.payment_for).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Method</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    {getMethodIcon(tx.method)} {tx.method}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ref #</span>
                  <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {tx.ref}
                  </span>
                </div>
                {tx.notes && (
                  <div className="mt-2 text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                    "{tx.notes}"
                  </div>
                )}
              </div>

              {/* Absolute Action Button */}
              <button className="absolute top-4 right-4 p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer (Visible in both views) */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <span className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-900">{startIndex + 1}</span>{" "}
          to{" "}
          <span className="font-medium text-slate-900">
            {Math.min(startIndex + ITEMS_PER_PAGE, MOCK_TRANSACTIONS.length)}
          </span>{" "}
          of {MOCK_TRANSACTIONS.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordPayments;
