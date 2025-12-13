import {
  Banknote,
  CheckCircle,
  Download,
  FileText,
  Filter,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/Search"; // Check path
import {
  StatusControlTab,
  ViewToggles,
} from "../../components/ui/StatusControlTab";

// --- Import New Components ---
import PaymentsCard from "../../components/dashboard/tenants/payments/PaymentCard";
import PaymentsList from "../../components/dashboard/tenants/payments/PaymentList";
import PaymentDetailsModal from "../../components/modal/PaymentDetailsModal";

// --- MOCK DATA ---
const MOCK_PAYMENTS = [
  {
    id: 1,
    tenant: "Alice Johnson",
    property: "Sunset Apts",
    unit: "101",
    amount: 15000,
    date: "2025-12-05",
    status: "Verified",
    method: "Bank Transfer",
    ref: "BDO-123",
  },
  {
    id: 2,
    tenant: "Mark Smith",
    property: "Sunset Apts",
    unit: "102",
    amount: 15000,
    date: "2025-12-06",
    status: "Pending",
    method: "GCash",
    ref: "GC-998",
  },
  {
    id: 3,
    tenant: "John Doe",
    property: "Downtown Lofts",
    unit: "3A",
    amount: 12500,
    date: "2025-12-04",
    status: "Overdue",
    method: "Cash",
    ref: "-",
  },
  {
    id: 4,
    tenant: "Sarah Lee",
    property: "Downtown Lofts",
    unit: "3B",
    amount: 12500,
    date: "2025-12-01",
    status: "Verified",
    method: "Cheque",
    ref: "CHQ-556",
  },
  {
    id: 5,
    tenant: "Mike Ross",
    property: "Sunset Apts",
    unit: "205",
    amount: 18000,
    date: "2025-11-28",
    status: "Verified",
    method: "Bank Transfer",
    ref: "BPI-777",
  },
  {
    id: 6,
    tenant: "Rachel Zane",
    property: "Pearson Tower",
    unit: "Penthouse",
    amount: 45000,
    date: "2025-12-07",
    status: "Pending",
    method: "Bank Transfer",
    ref: "UB-888",
  },
  {
    id: 7,
    tenant: "Harvey Specter",
    property: "Pearson Tower",
    unit: "Suit 500",
    amount: 55000,
    date: "2025-12-08",
    status: "Verified",
    method: "Cheque",
    ref: "CHQ-999",
  },
  {
    id: 8,
    tenant: "Louis Litt",
    property: "Pearson Tower",
    unit: "Suit 400",
    amount: 48000,
    date: "2025-12-08",
    status: "Verified",
    method: "Bank Transfer",
    ref: "BPI-111",
  },
  {
    id: 9,
    tenant: "Donna Paulsen",
    property: "Downtown Lofts",
    unit: "2B",
    amount: 13000,
    date: "2025-12-02",
    status: "Verified",
    method: "Cash",
    ref: "-",
  },
  {
    id: 10,
    tenant: "Jessica Pearson",
    property: "Pearson Tower",
    unit: "PH-1",
    amount: 60000,
    date: "2025-12-10",
    status: "Pending",
    method: "Bank Transfer",
    ref: "UB-222",
  },
];

const LandlordPayments = () => {
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // --- MODAL STATE ---
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- MOCK DATA: TENANT & LANDLORD INFO ---
  const tenantInfo = {
    name: "Felix Vincent C. Ybañez",
    contact: "0917-123-4567",
    email: "felix.ybanez@havenly.com",
  };

  const landlordInfo = {
    name: "Maria Santos",
    contact: "0918-123-4567",
    email: "maria.santos@havenly.com",
  };

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return MOCK_PAYMENTS.filter((p) => {
      const matchesSearch =
        p.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ref.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // --- PAGINATION LOGIC ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, limit]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, currentPage, limit]);

  // --- TABS CONFIG ---
  const paymentTabs = [
    { id: "All", label: "All Records", count: MOCK_PAYMENTS.length },
    {
      id: "Verified",
      label: "Verified",
      count: MOCK_PAYMENTS.filter((p) => p.status === "Verified").length,
      color: "emerald",
    },
    {
      id: "Pending",
      label: "Pending",
      count: MOCK_PAYMENTS.filter((p) => p.status === "Pending").length,
      color: "amber",
    },
    {
      id: "Overdue",
      label: "Overdue",
      count: MOCK_PAYMENTS.filter((p) => p.status === "Overdue").length,
      color: "red",
    },
  ];

  // --- EXPORT FUNCTION ---
  const handleExport = () => {
    // Prepare data for export (use filtered data or all data)
    const dataToExport = filteredData.length > 0 ? filteredData : MOCK_PAYMENTS;
    
    // Create CSV headers
    const headers = ["ID", "Tenant", "Property", "Unit", "Amount", "Date", "Status", "Method", "Reference"];
    
    // Convert data to CSV rows
    const csvRows = [
      headers.join(","),
      ...dataToExport.map((payment) => {
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
    
    // Create CSV content
    const csvContent = csvRows.join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date
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

    // Helper function to draw a line
    const drawLine = (x1, y1, x2, y2) => {
      doc.setLineWidth(0.5);
      doc.line(x1, y1, x2, y2);
    };

    // Helper function to draw a box
    const drawBox = (x, y, width, height) => {
      doc.setLineWidth(0.5);
      doc.rect(x, y, width, height);
    };

    // ========== RECEIPT HEADER ==========
    // Company/Header Section
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT RECEIPT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Havenly Property Management", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.text("123 Business Street, Cebu City, Philippines", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Divider line
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // ========== RECEIPT DETAILS ==========
    // Receipt Number and Date
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

    // Divider
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // ========== PAYMENT INFORMATION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT INFORMATION", margin, yPosition);
    yPosition += 8;

    // Payment details box
    drawBox(margin, yPosition, contentWidth, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Tenant Name: ${payment.tenant || tenantInfo.name}`, margin + 3, yPosition + 7);
    doc.text(`Property: ${payment.property}`, margin + 3, yPosition + 13);
    doc.text(`Unit: ${payment.unit}`, margin + 3, yPosition + 19);
    
    // Format payment date
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
    doc.text(`Landlord: ${landlordInfo.name}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Contact: ${landlordInfo.contact}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Email: ${landlordInfo.email}`, margin, yPosition);
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

    // Save the PDF
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
    setTimeout(() => setSelectedPayment(null), 200); // Clear data after animation
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
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);

  const getMenuOptions = (status) => {
    const base = [
      { id: "view", label: "View Details", icon: FileText },
      { id: "download", label: "Download Receipt", icon: Download },
    ];
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
        { type: "divider" },
        ...base,
      ];
    }
    return base;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      {/* --- MODAL INJECTION --- */}
      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payment={selectedPayment}
        onDownload={handleDownloadReceipt}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Financial Records
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track incoming rent, verify payments, and manage receipts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            <Download size={18} /> Export
          </button>
          <button className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:transform active:scale-95">
            <Banknote size={18} /> Record Payment
          </button>
        </div>
      </div>

      {/* --- CONTROLS TOOLBAR --- */}
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
      ) : filteredData.length === 0 ? (
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
              data={paginatedData}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={(actionId, payment) => handleMenuAction(actionId, payment)}
            />
          ) : (
            <PaymentsCard
              data={paginatedData}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={(actionId, payment) => handleMenuAction(actionId, payment)}
            />
          )}

          {/* --- PAGINATION --- */}
          <div className="mt-2 pt-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredData.length}
              limit={limit}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LandlordPayments;
