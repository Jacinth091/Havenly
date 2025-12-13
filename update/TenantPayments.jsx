import {
  Banknote,
  CheckCircle,
  Download,
  FileText,
  Filter,
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import jsPDF from "jspdf";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/Search";
import {
  StatusControlTab,
  ViewToggles,
} from "../../components/ui/StatusControlTab";

// --- Import Components ---
import PaymentsCard from "../../components/dashboard/tenants/payments/PaymentCard";
import PaymentsList from "../../components/dashboard/tenants/payments/PaymentList";
import PaymentDetailsModal from "../../components/modal/PaymentDetailsModal";
import { getTenantPayments } from "../../api/tenant.api";

const TenantPayments = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- DATA STATE ---
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ All: 0, Verified: 0, Pending: 0 });
  const [tenantInfo, setTenantInfo] = useState(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_items: 0,
    limit: 6,
  });

  // --- MODAL STATE ---
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FETCH DATA ---
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTenantPayments({
        current_page: currentPage,
        limit: limit,
        search: searchTerm,
        status: statusFilter,
      });

      if (result.success) {
        setPayments(result.payments || []);
        setSummary(result.summary || { All: 0, Verified: 0, Pending: 0 });
        setTenantInfo(result.tenant || null);
        setPagination(result.pagination || {
          current_page: 1,
          last_page: 1,
          total_items: 0,
          limit: 6,
        });
      } else {
        setError(result.message || "Failed to load payments.");
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, limit]);

  // --- TABS CONFIG ---
  const paymentTabs = [
    { id: "All", label: "All Records", count: summary.All || 0 },
    {
      id: "Verified",
      label: "Verified",
      count: summary.Verified || 0,
      color: "emerald",
    },
    {
      id: "Pending",
      label: "Pending",
      count: summary.Pending || 0,
      color: "amber",
    },
  ];

  // --- EXPORT FUNCTION ---
  const handleExport = () => {
    if (payments.length === 0) return;

    const headers = ["ID", "Tenant", "Property", "Unit", "Amount", "Date", "Status", "Method", "Reference"];

    const csvRows = [
      headers.join(","),
      ...payments.map((payment) => {
        return [
          payment.id,
          `"${payment.tenant}"`,
          `"${payment.property}"`,
          `"${payment.unit}"`,
          payment.amount,
          payment.date,
          payment.status,
          `"${payment.method}"`,
          `"${payment.ref}"`,
        ].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const filename = `payments_export_${dateStr}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RECEIPT PDF GENERATION ---
  const handleDownloadReceipt = (payment) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    const drawLine = (x1, y1, x2, y2) => {
      doc.setLineWidth(0.5);
      doc.line(x1, y1, x2, y2);
    };

    const drawBox = (x, y, width, height) => {
      doc.setLineWidth(0.5);
      doc.rect(x, y, width, height);
    };

    // ========== RECEIPT HEADER ==========
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT RECEIPT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Havenly Property Management", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.text("Property Management System", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // ========== RECEIPT DETAILS ==========
    const receiptDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const receiptTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt No.: REC-${payment.id}`, margin, yPosition);
    doc.text(`Date: ${receiptDate}`, pageWidth - margin, yPosition, { align: "right" });
    yPosition += 5;
    doc.text(`Time: ${receiptTime}`, pageWidth - margin, yPosition, { align: "right" });
    yPosition += 10;

    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // ========== PAYMENT INFORMATION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT INFORMATION", margin, yPosition);
    yPosition += 8;

    drawBox(margin, yPosition, contentWidth, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Tenant Name: ${payment.tenant || tenantInfo?.name || "N/A"}`, margin + 3, yPosition + 7);
    doc.text(`Property: ${payment.property}`, margin + 3, yPosition + 13);
    doc.text(`Unit: ${payment.unit}`, margin + 3, yPosition + 19);

    const paymentDate = payment.date ? new Date(payment.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) : payment.date;

    doc.text(`Payment Date: ${paymentDate}`, margin + 3, yPosition + 25);
    doc.text(`Payment Method: ${payment.method}`, margin + 3, yPosition + 31);
    if (payment.ref && payment.ref !== "-") {
      doc.text(`Reference: ${payment.ref}`, margin + 3, yPosition + 37);
    }
    doc.text(`Status: ${payment.status}`, margin + 3, yPosition + 43);

    yPosition += 55;
    yPosition += 10;

    // ========== AMOUNT SECTION ==========
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Amount Paid:", margin, yPosition);
    doc.setFontSize(16);
    doc.text(`₱${payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin, yPosition, { align: "right" });
    yPosition += 10;

    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // ========== LANDLORD INFORMATION ==========
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Received By:", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Landlord: ${payment.landlord_name || "N/A"}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Contact: ${payment.landlord_contact || "N/A"}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Email: ${payment.landlord_email || "N/A"}`, margin, yPosition);
    yPosition += 10;

    // ========== FOOTER ==========
    const footerY = pageHeight - 20;
    drawLine(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("This is a computer-generated receipt. No signature required.", pageWidth / 2, footerY, { align: "center" });
    doc.text("For inquiries, please contact your landlord or Havenly support.", pageWidth / 2, footerY + 4, { align: "center" });
    doc.setTextColor(0, 0, 0);

    const dateStr = payment.date ? payment.date.replace(/\s+/g, "_") : new Date().toISOString().split("T")[0];
    const fileName = `Receipt_${payment.id}_${dateStr}.pdf`;
    doc.save(fileName);
  };

  // --- MODAL HANDLERS ---
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPayment(null), 200);
  };

  // --- MENU ACTION HANDLER ---
  const handleMenuAction = (actionId, payment) => {
    if (actionId === "view") {
      handleViewPayment(payment);
    } else if (actionId === "download") {
      handleDownloadReceipt(payment);
    }
  };

  // --- HELPERS ---
  const getInitials = (name) =>
    name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
      : "?";

  const getMenuOptions = (status) => {
    const base = [
      { id: "view", label: "View Details", icon: FileText },
      { id: "download", label: "Download Receipt", icon: Download },
    ];
    return base;
  };

  // --- LOADING STATE ---
  if (loading && payments.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your payments...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error && payments.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Payments</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => fetchPayments()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      {/* --- MODAL INJECTION --- */}
      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payment={selectedPayment}
        onDownload={handleDownloadReceipt}
        tenantInfo={tenantInfo}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Financial Records
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track your rent payments and download receipts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={payments.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* --- CONTROLS TOOLBAR --- */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search property, unit, or reference..."
          />
          <ViewToggles mode={viewMode} setMode={setViewMode} />
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          <StatusControlTab
            tabs={paymentTabs}
            current={statusFilter}
            onChange={setStatusFilter}
            summary={{}}
            total={0}
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-slate-500 text-sm font-medium">
            Loading records...
          </p>
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
          <div className="p-4 bg-slate-50 rounded-full mb-3">
            <Filter size={24} className="opacity-50" />
          </div>
          <p className="text-base font-medium text-slate-600">
            No payments found
          </p>
          <p className="text-sm">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your filters"
              : "You don't have any payment records yet"}
          </p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <PaymentsList
              data={payments}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={(actionId, payment) => handleMenuAction(actionId, payment)}
            />
          ) : (
            <PaymentsCard
              data={payments}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={(actionId, payment) => handleMenuAction(actionId, payment)}
            />
          )}

          {/* --- PAGINATION --- */}
          <div className="mt-2 pt-4 border-t border-slate-200">
            <Pagination
              currentPage={pagination.current_page}
              totalItems={pagination.total_items}
              limit={pagination.limit}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TenantPayments;
