import {
  Archive,
  CheckCircle,
  Download,
  FileText,
  Filter,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/Search";
import {
  StatusControlTab,
  ViewToggles,
} from "../../components/ui/StatusControlTab";

import {
  archiveTransactionApi,
  getLandlordTransactions,
  rejectTransactionApi,
  verifyTransactionApi,
} from "../../api/transaction.api";
import { showToast } from "../../components/toast/Toast";

import PaymentsCard from "../../components/dashboard/tenants/payments/PaymentCard";
import PaymentsList from "../../components/dashboard/tenants/payments/PaymentList";
import PaymentDetailsModal from "../../components/modal/PaymentDetailModal";
import RecordPaymentModal from "../../components/modal/RecordPayemtnModal";
// 1. IMPORT YOUR ACTION MODAL
import ActionModal from "../../components/modal/ActionModal";

const LandlordPayments = () => {
  const [viewMode, setViewMode] = useState("list");

  // Modals State
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // 2. ADD STATE FOR ARCHIVE MODAL
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // --- API STATE ---
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_records: 0,
    verified_count: 0,
    pending_count: 0,
    overdue_count: 0,
  });
  const [loading, setLoading] = useState(false);

  // --- FILTER & PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total_items: 0,
    limit: 10,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        current_page: currentPage,
        limit: limit,
        search: searchTerm,
        statusTab: statusFilter,
      };

      const response = await getLandlordTransactions(queryParams);

      if (response.success) {
        setTransactions(response.transactions);
        if (response.summary) {
          setSummary(response.summary);
        }
        setPaginationMeta(response.pagination);
      } else {
        setTransactions([]);
        setPaginationMeta((prev) => ({ ...prev, total_items: 0 }));
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
      showToast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, statusFilter]);

  // 3. SEPARATE CONFIRMATION HANDLER FOR ARCHIVE
  const handleConfirmArchive = async () => {
    if (!itemToArchive) return;

    setIsArchiving(true);
    try {
      const result = await archiveTransactionApi(itemToArchive.id);

      if (result.success) {
        showToast("Transaction archived successfully.", "success");
        fetchTransactions(); // Refresh list
        setIsArchiveModalOpen(false); // Close modal
        setItemToArchive(null); // Clear selection
      } else {
        showToast(result.message || "Failed to archive transaction", "error");
      }
    } catch (error) {
      showToast("An error occurred while archiving", "error");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleTransactionAction = async (actionId, transaction) => {
    if (actionId === "verify") {
      const result = await verifyTransactionApi(transaction.id);
      if (result.success) {
        showToast("Payment verified successfully!", "success");
        fetchTransactions();
      } else {
        showToast(result.message || "Failed to verify payment", "error");
      }
    } else if (actionId === "reject") {
      if (!window.confirm("Are you sure you want to reject this payment?"))
        return;

      const result = await rejectTransactionApi(transaction.id);
      if (result.success) {
        showToast("Payment rejected.", "success");
        fetchTransactions();
      } else {
        showToast(result.message || "Failed to reject payment", "error");
      }
    } else if (actionId === "archive") {
      // 4. UPDATE ARCHIVE LOGIC TO OPEN MODAL INSTEAD OF WINDOW.CONFIRM
      setItemToArchive(transaction);
      setIsArchiveModalOpen(true);
    } else if (actionId === "view") {
      setSelectedPayment(transaction);
      setIsViewDetailsOpen(true);
    } else if (actionId === "download") {
      console.log("Downloading receipt for:", transaction);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const paymentTabs = [
    {
      id: "All",
      label: "All Records",
      count: summary.total_records || 0,
    },
    {
      id: "Completed",
      label: "Completed",
      count: summary.verified_count || 0,
      color: "emerald",
    },
    {
      id: "Pending",
      label: "Pending",
      count: summary.pending_count || 0,
      color: "amber",
    },
    {
      id: "Archived",
      label: "Archived",
      count: summary.archived_count || summary.overdue_count || 0,
      color: "slate",
    },
  ];

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
      : "--";

  const getMenuOptions = (transaction) => {
    const status = transaction.status || transaction.transaction_status;
    const base = [
      { id: "view", label: "View Details", icon: FileText },
      { id: "download", label: "Download Receipt", icon: Download },
    ];

    if (statusFilter === "Archived" || transaction.is_active === false) {
      return base;
    }

    if (status === "Pending") {
      return [
        {
          id: "verify",
          label: "Verify Payment",
          icon: CheckCircle,
          className: "text-emerald-600 font-medium",
        },
        {
          id: "reject",
          label: "Reject / Flag",
          icon: XCircle,
          className: "text-red-600",
        },
        ...base,
      ];
    }

    if (
      status === "Overdue" ||
      status === "Cancelled" ||
      status === "Verified" ||
      status === "Completed"
    ) {
      return [
        ...base,
        {
          id: "archive",
          label: "Archive Record",
          icon: Archive,
          className: "text-slate-500",
        },
      ];
    }
    return base;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Financial Records
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track incoming rent, verify payments, and manage receipts.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
            <Download size={18} /> Export
          </button>
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all hover:shadow-md active:transform active:scale-95"
          >
            <Plus size={18} /> Record Payment
          </button>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tenant, unit, or reference..."
          />
          <ViewToggles mode={viewMode} setMode={setViewMode} />
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          <StatusControlTab
            tabs={paymentTabs}
            current={statusFilter}
            onChange={setStatusFilter}
            summary={summary}
            total={summary.total_records}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-slate-500 text-sm font-medium">
            Loading records...
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
          <div className="p-4 bg-slate-50 rounded-full mb-3">
            <Filter size={24} className="opacity-50" />
          </div>
          <p className="text-base font-medium text-slate-600">
            No payments found
          </p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <PaymentsList
              data={transactions}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={handleTransactionAction}
            />
          ) : (
            <PaymentsCard
              data={transactions}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={handleTransactionAction}
            />
          )}

          <div className="mt-2 pt-4 border-t border-slate-200">
            <Pagination
              currentPage={paginationMeta.current_page}
              totalItems={paginationMeta.total_items}
              limit={paginationMeta.limit}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
            />
          </div>
        </>
      )}

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        payment={selectedPayment}
        footer={null}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onSuccess={() => {
          fetchTransactions();
        }}
      />

      <ActionModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setItemToArchive(null);
        }}
        onConfirm={handleConfirmArchive}
        title="Archive Transaction"
        description={`Are you sure you want to archive this payment from ${
          itemToArchive?.tenant || "this tenant"
        }? This will move it to the Archived tab.`}
        confirmLabel="Yes, Archive"
        type="neutral"
        loading={isArchiving}
      />
    </div>
  );
};

export default LandlordPayments;
