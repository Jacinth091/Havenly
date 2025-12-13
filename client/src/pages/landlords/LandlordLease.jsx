import {
  Archive,
  Ban,
  Calendar,
  Download,
  FileText,
  FileWarning,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { showToast } from "../../components/toast/Toast";

import {
  archiveLeaseApi,
  getLandlordLeases,
  terminateLeaseApi,
} from "../../api/lease.api";

import { LeaseCard } from "../../components/dashboard/lease/Lease Details/LeaseCard";
import { LeaseList } from "../../components/dashboard/lease/Lease Details/LeaseList";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/Search";
import {
  StatusControlTab,
  ViewToggles,
} from "../../components/ui/StatusControlTab";

import ActionModal from "../../components/modal/ActionModal";
import CreateLeaseModal from "../../components/modal/CreateLeaseModal";
import LeaseDetailsModal from "../../components/modal/LeaseDetailModal";

const LandlordLeases = () => {
  // --- STATE MANAGEMENT ---
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Data State
  const [leases, setLeases] = useState([]);
  const [summaryCounts, setSummaryCounts] = useState({
    All: 0,
    Active: 0,
    Expiring: 0,
    History: 0,
  });

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // Action State
  const [selectedLease, setSelectedLease] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [formData, setFormData] = useState({ date: "", notes: "" });

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const result = await getLandlordLeases({
        current_page: currentPage,
        limit: limit,
        search: searchTerm,
        statusTab: statusFilter,
      });
      console.log("Recieved from API: ", result);
      if (result.success) {
        // The API now returns the flat structure directly, so we just set it.
        setLeases(result.leases);
        setSummaryCounts(result.summary);
        setTotalItems(result.pagination.total_items);

        if (
          result.pagination.last_page > 0 &&
          currentPage > result.pagination.last_page
        ) {
          setCurrentPage(1);
        }
      } else {
        setLeases([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Failed to load leases", error);
      showToast("Failed to load lease data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when params change
  useEffect(() => {
    // Debounce search to prevent API spam
    const timer = setTimeout(() => {
      fetchLeases();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, limit, searchTerm, statusFilter]);

  const handleLeaseAction = (actionId, lease) => {
    setFormData({ date: "", notes: "" }); // Reset form

    if (actionId === "view") {
      // UPDATE: The lease object is already flat and formatted from the backend.
      // We no longer need to manually map 'unit' from 'room' or 'monthly_rent'.
      setSelectedLease(lease);
      setIsDetailsModalOpen(true);
    } else if (actionId === "terminate") {
      setSelectedLease(lease);
      setActionType("terminate");
    } else if (actionId === "archive") {
      setSelectedLease(lease);
      setActionType("archive");
    } else if (actionId === "renew") {
      setSelectedLease(lease);
      setActionType("renew");
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedLease) return;
    try {
      if (actionType === "terminate") {
        // Uses the flat 'id' directly
        await terminateLeaseApi(selectedLease.id, formData.notes);
        showToast("Lease terminated successfully.", "success");
      } else if (actionType === "archive") {
        await archiveLeaseApi(selectedLease.id);
        showToast("Lease archived successfully.", "success");
      }
      fetchLeases();
      setActionType(null);
    } catch (error) {
      console.error("Action failed:", error);
      showToast(error.message || "Action failed.", "error");
    }
  };

  // --- MENU OPTIONS CONFIG ---
  const getMenuOptions = (lease) => {
    const baseOptions = [
      { id: "view", label: "View Details", icon: FileText },
      { id: "download", label: "Download Contract", icon: Download },
    ];

    if (lease.status === "Active") {
      return [
        ...baseOptions,
        { type: "divider" },
        {
          id: "terminate",
          label: "Terminate Lease",
          icon: Ban,
          className: "text-red-600 hover:bg-red-50",
        },
      ];
    }

    if (lease.status === "Expired" || lease.status === "Expiring") {
      return [
        ...baseOptions,
        { type: "divider" },
        {
          id: "renew",
          label: "Renew Lease",
          icon: RefreshCw,
          className: "text-emerald-600 hover:bg-emerald-50",
        },
        {
          id: "archive",
          label: "Archive Record",
          icon: Archive,
          className: "text-slate-500 hover:bg-slate-100",
        },
      ];
    }

    return [
      ...baseOptions,
      { type: "divider" },
      {
        id: "archive",
        label: "Archive Record",
        icon: Archive,
        className: "text-slate-500 hover:bg-slate-100",
      },
    ];
  };

  const leaseTabs = [
    { id: "All", label: "All Records", count: summaryCounts.All || 0 },
    {
      id: "Active",
      label: "Active",
      count: summaryCounts.Active || 0,
      color: "emerald",
    },
    {
      id: "Expiring",
      label: "Expiring Soon",
      count: summaryCounts.Expiring || 0,
      color: "amber",
    },
    {
      id: "History",
      label: "History",
      count: summaryCounts.History || 0,
      color: "slate",
    },
  ];

  const getActionModalConfig = () => {
    switch (actionType) {
      case "terminate":
        return {
          title: "Terminate Lease",
          description:
            "This will update the lease status to 'Terminated' and record the notes.",
          type: "danger",
          confirmLabel: "Terminate Lease",
          disabled: !formData.date || !formData.notes,
        };
      case "archive":
        return {
          title: "Archive Record",
          description:
            "This lease will be moved to archives (Status: Archived).",
          type: "neutral",
          confirmLabel: "Archive",
          disabled: false,
        };
      case "renew":
        return {
          title: "Renew Lease",
          description: "Create a new lease draft based on these terms.",
          type: "success",
          confirmLabel: "Proceed",
          disabled: false,
        };
      default:
        return { title: "", type: "neutral" };
    }
  };

  const modalConfig = getActionModalConfig();

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Lease Management
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track active agreements, deposits, and lease expirations.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
            <Download size={18} /> Export
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all hover:shadow-md active:transform active:scale-95"
          >
            <Plus size={18} /> New Agreement
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tenant, property, or unit..."
          />
          <ViewToggles mode={viewMode} setMode={setViewMode} />
        </div>

        <div className="w-full overflow-x-auto no-scrollbar pt-1">
          <StatusControlTab
            tabs={leaseTabs}
            current={statusFilter}
            onChange={(tabId) => {
              setStatusFilter(tabId);
              setCurrentPage(1);
            }}
            total={0}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-slate-500 text-sm font-medium">
            Loading leases...
          </p>
        </div>
      ) : leases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
          <div className="p-4 bg-slate-50 rounded-full mb-3">
            <Filter size={24} className="opacity-50" />
          </div>
          <p className="text-base font-medium text-slate-600">
            No leases found
          </p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <LeaseList
              data={leases}
              getMenuOptions={getMenuOptions}
              onAction={handleLeaseAction}
            />
          ) : (
            <LeaseCard
              data={leases}
              getMenuOptions={getMenuOptions}
              onAction={handleLeaseAction}
            />
          )}
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              limit={limit}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
            />
          </div>
        </>
      )}

      {/* CREATE MODAL */}
      <CreateLeaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchLeases();
          showToast("New lease agreement created!", "success");
        }}
      />
      <LeaseDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        lease={selectedLease}
        footer={null}
      />

      {/* ACTION MODAL */}
      <ActionModal
        isOpen={!!actionType}
        onClose={() => setActionType(null)}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        description={modalConfig.description}
        type={modalConfig.type}
        confirmLabel={modalConfig.confirmLabel}
        disabled={modalConfig.disabled}
      >
        {actionType === "terminate" && (
          <div className="space-y-4 pt-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
              <span className="text-slate-500">Tenant:</span>{" "}
              {/* Uses the flat 'tenant' string from the API */}
              <span className="font-semibold text-slate-800">
                {selectedLease?.tenant}
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Termination Date (Updates End Date)
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Notes (Reason)
              </label>
              <div className="relative">
                <FileWarning
                  className="absolute left-3 top-3 text-slate-400"
                  size={16}
                />
                <textarea
                  rows={3}
                  placeholder="Reason for termination..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </ActionModal>
    </div>
  );
};

export default LandlordLeases;
