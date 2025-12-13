import {
  Banknote,
  Calendar,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import StatCard from "../../components/dashboard/StatCard";
import PaymentsCardView from "../../components/dashboard/tenants/payments/PaymentCard";
import PaymentsList from "../../components/dashboard/tenants/payments/PaymentList";
import { ViewToggles } from "../../components/ui/StatusControlTab";
import { getTenantDashboard } from "../../api/tenant.api";
import { useAuth } from "../../context/AuthProvider";

const TenantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard data from API
  const [tenantInfo, setTenantInfo] = useState(null);
  const [leaseInfo, setLeaseInfo] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getTenantDashboard();

        if (result.success) {
          setTenantInfo(result.data.tenant);
          setLeaseInfo(result.data.lease);
          setPaymentHistory(result.data.payment_history || []);
        } else {
          setError(result.message || "Failed to load dashboard data.");
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- DATA TRANSFORMATION ---
  const listViewData = paymentHistory.map(
    ({ tenant, property, unit, ...rest }) => rest
  );

  // --- HELPER FUNCTIONS ---
  const getInitials = (name) => (name ? name.charAt(0) : "?");

  const getMenuOptions = (status) => [
    { id: "download", label: "Download Receipt", icon: FileText },
  ];

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
    doc.text(leaseInfo?.address || "Address not available", pageWidth / 2, yPosition, { align: "center" });
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
    
    doc.text(`Tenant Name: ${payment.tenant || tenantInfo?.full_name || "N/A"}`, margin + 3, yPosition + 7);
    doc.text(`Property: ${payment.property || leaseInfo?.property || "N/A"}`, margin + 3, yPosition + 13);
    doc.text(`Unit: ${payment.unit || leaseInfo?.unit || "N/A"}`, margin + 3, yPosition + 19);
    doc.text(`Payment Date: ${payment.date}`, margin + 3, yPosition + 25);
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
    doc.text(`Landlord: ${leaseInfo?.landlord || "N/A"}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Contact: ${leaseInfo?.landlord_contact || "N/A"}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Email: ${leaseInfo?.landlord_email || "N/A"}`, margin, yPosition);
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

    const fileName = `Receipt_${payment.id}_${payment.date.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
  };

  // --- MENU ACTION HANDLER ---
  const handleMenuAction = (actionId, payment) => {
    if (actionId === "download") {
      handleDownloadReceipt(payment);
    }
  };

  const getNextDueDate = () => {
    if (!leaseInfo) return "N/A";
    
    const today = new Date();
    const dueDay = leaseInfo.due_day || 5;
    let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
    
    if (today.getDate() > dueDay) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    
    return nextDue.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // --- NO ACTIVE LEASE STATE ---
  if (!leaseInfo) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
        <div className="max-w-lg mx-auto mt-20">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Active Lease</h2>
            <p className="text-slate-500 mb-6">
              You don't have an active lease at the moment. Please contact your landlord if you believe this is an error.
            </p>
            {tenantInfo && (
              <div className="bg-slate-50 rounded-lg p-4 text-left">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Account:</span> {tenantInfo.full_name}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Email:</span> {tenantInfo.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back,{" "}
            <span className="font-medium text-slate-700">
              {tenantInfo?.first_name || "Tenant"}
            </span>.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Home size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Current Unit
            </p>
            <p className="text-sm font-bold text-slate-800">
              {leaseInfo.property} • {leaseInfo.unit}
            </p>
          </div>
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Next Payment Due"
          value={getNextDueDate()}
          subtext="Upcoming bill"
          icon={Calendar}
          color="green"
          showProgress={false}
        />
        <StatCard
          title="Monthly Rent"
          value={`₱${leaseInfo.rent.toLocaleString()}`}
          subtext={`Due on the ${leaseInfo.due_day}${getOrdinalSuffix(leaseInfo.due_day)}`}
          icon={Banknote}
          color="blue"
          showProgress={false}
        />
        <StatCard
          title="Lease Status"
          value={leaseInfo.status}
          subtext={`Expires ${leaseInfo.end_date}`}
          icon={FileText}
          color="purple"
          showProgress={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Section Header with Toggles */}
          <div className="flex flex-row sm:items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                Recent Payments
              </h3>
              <button
                onClick={() => navigate("/tenant/payments")}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                View All
              </button>
            </div>

            <div className="flex items-center self-start sm:self-auto">
              <ViewToggles mode={viewMode} setMode={setViewMode} />
            </div>
          </div>

          {/* Payment History */}
          {paymentHistory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <p className="text-slate-500">No payment history yet.</p>
            </div>
          ) : viewMode === "list" ? (
            <PaymentsList
              data={listViewData}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={(actionId, payment) => handleMenuAction(actionId, payment)}
            />
          ) : (
            <PaymentsCardView
              data={listViewData}
              getInitials={getInitials}
              getMenuOptions={getMenuOptions}
              onAction={(actionId, payment) => handleMenuAction(actionId, payment)}
            />
          )}
        </div>

        {/* --- RIGHT COLUMN: LANDLORD SIDEBAR --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Landlord Details
              </h3>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded border border-purple-100">
                Owner
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100">
                {leaseInfo.landlord?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-bold text-slate-800">{leaseInfo.landlord}</p>
                <p className="text-xs text-slate-500">Property Owner</p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                <Phone size={16} className="text-slate-400" />{" "}
                {leaseInfo.landlord_contact}
              </button>
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                <Mail size={16} className="text-slate-400" /> Send Message
              </button>

              <div className="pt-3 border-t border-slate-100 mt-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
                  Property Location
                </p>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  {leaseInfo.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get ordinal suffix
const getOrdinalSuffix = (day) => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

export default TenantDashboard;
