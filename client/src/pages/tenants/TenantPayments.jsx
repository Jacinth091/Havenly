import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Filter,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'transactions' table
const MOCK_PAYMENTS = [
  {
    id: 105,
    month_covered: "December 2025",
    amount: 15000,
    status: "Pending",
    date_paid: "2025-12-05",
    method: "GCash",
    ref: "GC-99887711",
  },
  {
    id: 104,
    month_covered: "November 2025",
    amount: 15000,
    status: "Completed",
    date_paid: "2025-11-05",
    method: "Cash",
    ref: "CASH-REC-005",
  },
  {
    id: 103,
    month_covered: "October 2025",
    amount: 15000,
    status: "Completed",
    date_paid: "2025-10-05",
    method: "Bank Transfer",
    ref: "BDO-123987",
  },
  {
    id: 102,
    month_covered: "September 2025",
    amount: 15000,
    status: "Completed",
    date_paid: "2025-09-06",
    method: "GCash",
    ref: "GC-11223344",
  },
  {
    id: 101,
    month_covered: "Security Deposit",
    amount: 30000,
    status: "Completed",
    date_paid: "2025-01-01",
    method: "Cash",
    ref: "DEP-001",
  },
  {
    id: 100,
    month_covered: "Advance Rent",
    amount: 15000,
    status: "Completed",
    date_paid: "2025-01-01",
    method: "Cash",
    ref: "ADV-001",
  },
];

const ITEMS_PER_PAGE = 4;

const TenantPayments = () => {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Search Filter
  const filteredPayments = MOCK_PAYMENTS.filter(
    (payment) =>
      payment.month_covered.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredPayments.slice(
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

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Payment History</h2>
          <p className="text-sm text-slate-600">
            Track your rent payments and view receipts.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-right">
          <p className="text-xs text-slate-500 font-bold uppercase">Next Due</p>
          <p className="font-bold text-emerald-600">Jan 05, 2026</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search month or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200">
            <Filter size={14} /> Filter
          </button>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "card"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer / Info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100">
        <Clock className="shrink-0 mt-0.5" size={18} />
        <div>
          <p className="font-bold">Payment Verification</p>
          <p className="opacity-90 mt-1">
            Payments made via manual methods (Cash/Transfer) may take 24-48
            hours to be reflected as "Completed".
          </p>
        </div>
      </div>

      {/* Content Area */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
          No payments found.
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Coverage</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date Paid</th>
                  <th className="px-6 py-4">Method & Ref</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        {payment.month_covered}
                      </div>
                      <div className="text-xs text-slate-500 hidden sm:block">
                        ID: #{payment.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₱{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {payment.date_paid}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {payment.method}
                        </span>
                        <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">
                          {payment.ref}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        color={
                          payment.status === "Completed" ? "green" : "amber"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === "Completed" ? (
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 ml-auto hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                          <Download size={14} /> Download
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          Pending
                        </span>
                      )}
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
          {currentData.map((payment) => (
            <div
              key={payment.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {payment.month_covered}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: #{payment.id}
                  </span>
                </div>
                <Badge
                  color={payment.status === "Completed" ? "green" : "amber"}
                >
                  {payment.status}
                </Badge>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-800">
                  ₱{payment.amount.toLocaleString()}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Paid On</span>
                  <span className="font-medium text-slate-700">
                    {payment.date_paid}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium text-slate-700">
                    {payment.method}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ref #</span>
                  <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {payment.ref}
                  </span>
                </div>
              </div>

              {/* Action */}
              {payment.status === "Completed" && (
                <button className="w-full mt-4 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  <Download size={14} /> Download Receipt
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4">
        <span className="text-sm text-slate-500 text-center sm:text-left">
          Showing{" "}
          <span className="font-medium text-slate-900">{startIndex + 1}</span>{" "}
          to{" "}
          <span className="font-medium text-slate-900">
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredPayments.length)}
          </span>{" "}
          of {filteredPayments.length} entries
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
    </div>
  );
};

export default TenantPayments;
