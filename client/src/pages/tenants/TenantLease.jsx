import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  History,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import Badge from "../../components/dashboard/Badge";
import LeaseDetailsModal from "../../components/modal/LeaseDetailModal"; // Import the modal

const TenantLease = () => {
  // --- MOCK DATA: ACTIVE LEASE ---
  const activeLease = {
    lease_id: 101,
    lease_status: "Active",
    start_date: "2025-01-01",
    end_date: "2026-01-01",
    payment_due_day: 5,
    monthly_rent: 15000.0,
    security_deposit: 30000.0,
    notes:
      "Tenant responsible for electricity (VECO) and water (MCWD). No pets allowed.",
    created_at: "2024-12-15",
    property_name: "Sunset Apartments",
    address: "123 Main Street",
    city: "Cebu City",
    unit: "101",
    landlord_name: "Maria Santos",
    landlord_contact: "0918-123-4567",
    landlord_email: "maria.santos@havenly.com",
  };

  // --- MOCK DATA: LEASE HISTORY ---
  const leaseHistory = [
    {
      id: 85,
      property: "Green Valley Homes",
      unit: "4B",
      start: "2023-01-01",
      end: "2024-01-01",
      status: "Expired",
      monthly_rent: 12000,
    },
    {
      id: 92,
      property: "Green Valley Homes",
      unit: "4B",
      start: "2024-01-01",
      end: "2024-12-31",
      status: "Terminated",
      monthly_rent: 12500,
    },
  ];

  // --- MOCK DATA: TENANT INFO (from TenantProfile.jsx structure) ---
  const tenantData = {
    user_id: 101,
    first_name: "Felix Vincent",
    middle_name: "C.",
    last_name: "Ybañez",
    contact_num: "0917-123-4567",
    email: "felix.ybanez@havenly.com",
  };

  // --- STATE FOR MODAL ---
  const [selectedLease, setSelectedLease] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewLease = (lease) => {
    setSelectedLease(lease);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedLease(null), 200); // Clear data after animation
  };

  // --- PDF GENERATION ---
  const handleDownloadPDF = () => {
    // Calculate tenant full name for use throughout the PDF
    const tenantFullName = `${tenantData.first_name}${tenantData.middle_name ? ` ${tenantData.middle_name}` : ""} ${tenantData.last_name}`;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text, x, y, maxWidth, fontSize = 10, fontStyle = "normal", align = "left") => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontStyle);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y, { align });
      return lines.length * (fontSize * 0.4);
    };

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

    // ========== HEADER SECTION ==========
    // Document Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LEASE AGREEMENT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;

    // Document Number and Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const docDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Document No.: LEASE-${activeLease.lease_id}`, margin, yPosition);
    doc.text(`Date: ${docDate}`, pageWidth - margin, yPosition, { align: "right" });
    yPosition += 12;

    // Divider line
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    checkPageBreak(60);

    // ========== PARTIES SECTION ==========
    // Two-column layout for Landlord and Tenant
    const colWidth = (contentWidth - 10) / 2;
    
    // Landlord Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LANDLORD", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, colWidth, 35);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(activeLease.landlord_name, margin + 3, yPosition + 6);
    doc.setFontSize(9);
    doc.text(`Contact: ${activeLease.landlord_contact}`, margin + 3, yPosition + 12);
    doc.text(`Email: ${activeLease.landlord_email}`, margin + 3, yPosition + 18);
    doc.setFont("helvetica", "bold");
    doc.text("Status: Verified", margin + 3, yPosition + 28);

    // Tenant Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TENANT", margin + colWidth + 10, yPosition - 6);
    
    drawBox(margin + colWidth + 10, yPosition, colWidth, 35);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(tenantFullName, margin + colWidth + 13, yPosition + 6);
    doc.setFontSize(9);
    doc.text(`Contact: ${tenantData.contact_num}`, margin + colWidth + 13, yPosition + 12);
    doc.text(`Email: ${tenantData.email}`, margin + colWidth + 13, yPosition + 18);
    
    yPosition += 40;
    yPosition += 8;

    checkPageBreak(50);

    // ========== PROPERTY INFORMATION SECTION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PROPERTY INFORMATION", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, contentWidth, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Property Name: ${activeLease.property_name}`, margin + 3, yPosition + 7);
    doc.text(`Address: ${activeLease.address}, ${activeLease.city}`, margin + 3, yPosition + 13);
    doc.text(`Unit Number: ${activeLease.unit}`, margin + 3, yPosition + 19);
    doc.text(`Lease Status: ${activeLease.lease_status}`, margin + 3, yPosition + 25);
    
    yPosition += 35;
    yPosition += 8;

    checkPageBreak(50);

    // ========== LEASE TERM SECTION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LEASE TERM", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, contentWidth, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Calculate dates for display
    const leaseStart = new Date(activeLease.start_date);
    const leaseEnd = new Date(activeLease.end_date);
    const today = new Date("2025-03-15");
    const durationDays = Math.ceil((leaseEnd - leaseStart) / (1000 * 60 * 60 * 24));
    const daysRemainingCalc = Math.ceil((leaseEnd - today) / (1000 * 60 * 60 * 24));
    
    const startDate = leaseStart.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endDate = leaseEnd.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Lease Start Date: ${startDate}`, margin + 3, yPosition + 7);
    doc.text(`Lease End Date: ${endDate}`, margin + 3, yPosition + 13);
    doc.text(`Duration: ${durationDays} days`, margin + 3, yPosition + 19);
    doc.text(`Days Remaining: ${daysRemainingCalc} days`, margin + 3, yPosition + 25);
    
    yPosition += 35;
    yPosition += 8;

    checkPageBreak(60);

    // ========== FINANCIAL TERMS SECTION (BILLING FORMAT) ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL TERMS", margin, yPosition);
    yPosition += 6;
    
    // Table header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, yPosition, contentWidth, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Description", margin + 3, yPosition + 5.5);
    doc.text("Amount", pageWidth - margin - 3, yPosition + 5.5, { align: "right" });
    yPosition += 8;
    
    // Table rows
    const rowHeight = 7;
    let tableY = yPosition;
    
    // Monthly Rent
    drawLine(margin, tableY, pageWidth - margin, tableY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Monthly Rent", margin + 3, tableY + 5);
    doc.text(`₱${activeLease.monthly_rent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 3, tableY + 5, { align: "right" });
    tableY += rowHeight;
    
    // Security Deposit
    drawLine(margin, tableY, pageWidth - margin, tableY);
    doc.text("Security Deposit", margin + 3, tableY + 5);
    doc.text(`₱${activeLease.security_deposit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 3, tableY + 5, { align: "right" });
    tableY += rowHeight;
    
    // Payment Due Day
    drawLine(margin, tableY, pageWidth - margin, tableY);
    doc.setFontSize(9);
    // Calculate next due date
    const todayForDue = new Date("2025-03-15");
    let nextDue = new Date(
      todayForDue.getFullYear(),
      todayForDue.getMonth(),
      activeLease.payment_due_day
    );
    if (todayForDue.getDate() > activeLease.payment_due_day) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    const nextDueDateStr = nextDue.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    doc.text(`Payment Due: ${activeLease.payment_due_day}th of each month`, margin + 3, tableY + 5);
    doc.text(`Next Due: ${nextDueDateStr}`, pageWidth - margin - 3, tableY + 5, { align: "right" });
    tableY += rowHeight;
    
    // Total line
    drawLine(margin, tableY, pageWidth - margin, tableY);
    tableY += 2;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const totalAmount = activeLease.monthly_rent + activeLease.security_deposit;
    doc.text("Total Initial Payment", margin + 3, tableY + 5);
    doc.text(`₱${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 3, tableY + 5, { align: "right" });
    tableY += rowHeight;
    drawLine(margin, tableY, pageWidth - margin, tableY);
    
    yPosition = tableY + 10;

    checkPageBreak(50);

    // ========== TERMS & CONDITIONS SECTION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & CONDITIONS", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, contentWidth, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(activeLease.notes, contentWidth - 6);
    doc.text(notesLines, margin + 3, yPosition + 6);
    
    yPosition += 30;
    yPosition += 8;

    checkPageBreak(50);

    // ========== SIGNATURE SECTION ==========
    checkPageBreak(40);
    yPosition += 5;
    
    const sigColWidth = (contentWidth - 20) / 2;
    
    // Landlord Signature
    drawLine(margin, yPosition, margin + sigColWidth, yPosition);
    yPosition += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(activeLease.landlord_name, margin + sigColWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Landlord Signature", margin + sigColWidth / 2, yPosition, { align: "center" });
    
    // Reset Y for Tenant signature
    yPosition -= 30;
    
    // Tenant Signature
    drawLine(margin + sigColWidth + 20, yPosition, margin + sigColWidth + 20 + sigColWidth, yPosition);
    yPosition += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(tenantFullName, margin + sigColWidth + 20 + sigColWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Tenant Signature", margin + sigColWidth + 20 + sigColWidth / 2, yPosition, { align: "center" });
    
    yPosition += 15;

    // ========== FOOTER ==========
    const footerY = pageHeight - 15;
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text(`This document was generated on ${docDate} by Havenly Property Management System.`, pageWidth / 2, footerY, { align: "center" });
    doc.text(`Document ID: LEASE-${activeLease.lease_id} | For inquiries, contact: ${activeLease.landlord_email}`, pageWidth / 2, footerY + 4, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Save the PDF
    const fileName = `Lease_Agreement_${activeLease.lease_id}_${activeLease.property_name.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
  };

  // --- PDF GENERATION FOR ARCHIVED LEASES ---
  const handleDownloadArchivedPDF = (archivedLease) => {
    // Calculate tenant full name for use throughout the PDF
    const tenantFullName = `${tenantData.first_name}${tenantData.middle_name ? ` ${tenantData.middle_name}` : ""} ${tenantData.last_name}`;
    
    // Use archived lease data, fallback to active lease data for missing fields
    const leaseData = {
      lease_id: archivedLease.id,
      property_name: archivedLease.property,
      unit: archivedLease.unit,
      start_date: archivedLease.start,
      end_date: archivedLease.end,
      monthly_rent: archivedLease.monthly_rent || 0,
      security_deposit: activeLease.security_deposit, // Use active lease as fallback
      payment_due_day: activeLease.payment_due_day, // Use active lease as fallback
      notes: activeLease.notes, // Use active lease as fallback
      address: activeLease.address, // Use active lease as fallback
      city: activeLease.city, // Use active lease as fallback
      landlord_name: activeLease.landlord_name, // Use active lease as fallback
      landlord_contact: activeLease.landlord_contact, // Use active lease as fallback
      landlord_email: activeLease.landlord_email, // Use active lease as fallback
      lease_status: archivedLease.status,
    };
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

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

    // ========== HEADER SECTION ==========
    // Document Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ARCHIVED LEASE AGREEMENT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;

    // Document Number and Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const docDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Document No.: LEASE-${leaseData.lease_id}`, margin, yPosition);
    doc.text(`Date: ${docDate}`, pageWidth - margin, yPosition, { align: "right" });
    yPosition += 12;

    // Divider line
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    checkPageBreak(60);

    // ========== PARTIES SECTION ==========
    const colWidth = (contentWidth - 10) / 2;
    
    // Landlord Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LANDLORD", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, colWidth, 35);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(leaseData.landlord_name, margin + 3, yPosition + 6);
    doc.setFontSize(9);
    doc.text(`Contact: ${leaseData.landlord_contact}`, margin + 3, yPosition + 12);
    doc.text(`Email: ${leaseData.landlord_email}`, margin + 3, yPosition + 18);
    doc.setFont("helvetica", "bold");
    doc.text("Status: Verified", margin + 3, yPosition + 28);

    // Tenant Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TENANT", margin + colWidth + 10, yPosition - 6);
    
    drawBox(margin + colWidth + 10, yPosition, colWidth, 35);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(tenantFullName, margin + colWidth + 13, yPosition + 6);
    doc.setFontSize(9);
    doc.text(`Contact: ${tenantData.contact_num}`, margin + colWidth + 13, yPosition + 12);
    doc.text(`Email: ${tenantData.email}`, margin + colWidth + 13, yPosition + 18);
    
    yPosition += 40;
    yPosition += 8;

    checkPageBreak(50);

    // ========== PROPERTY INFORMATION SECTION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PROPERTY INFORMATION", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, contentWidth, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Property Name: ${leaseData.property_name}`, margin + 3, yPosition + 7);
    doc.text(`Address: ${leaseData.address}, ${leaseData.city}`, margin + 3, yPosition + 13);
    doc.text(`Unit Number: ${leaseData.unit}`, margin + 3, yPosition + 19);
    doc.text(`Lease Status: ${leaseData.lease_status} (Archived)`, margin + 3, yPosition + 25);
    
    yPosition += 35;
    yPosition += 8;

    checkPageBreak(50);

    // ========== LEASE TERM SECTION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LEASE TERM", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, contentWidth, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const leaseStart = new Date(leaseData.start_date);
    const leaseEnd = new Date(leaseData.end_date);
    const durationDays = Math.ceil((leaseEnd - leaseStart) / (1000 * 60 * 60 * 24));
    
    const startDate = leaseStart.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endDate = leaseEnd.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Lease Start Date: ${startDate}`, margin + 3, yPosition + 7);
    doc.text(`Lease End Date: ${endDate}`, margin + 3, yPosition + 13);
    doc.text(`Duration: ${durationDays} days`, margin + 3, yPosition + 19);
    doc.text(`Status: ${leaseData.lease_status}`, margin + 3, yPosition + 25);
    
    yPosition += 35;
    yPosition += 8;

    checkPageBreak(60);

    // ========== FINANCIAL TERMS SECTION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL TERMS", margin, yPosition);
    yPosition += 6;
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPosition, contentWidth, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Description", margin + 3, yPosition + 5.5);
    doc.text("Amount", pageWidth - margin - 3, yPosition + 5.5, { align: "right" });
    yPosition += 8;
    
    const rowHeight = 7;
    let tableY = yPosition;
    
    // Monthly Rent
    drawLine(margin, tableY, pageWidth - margin, tableY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Monthly Rent", margin + 3, tableY + 5);
    doc.text(`₱${leaseData.monthly_rent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 3, tableY + 5, { align: "right" });
    tableY += rowHeight;
    
    // Security Deposit
    drawLine(margin, tableY, pageWidth - margin, tableY);
    doc.text("Security Deposit", margin + 3, tableY + 5);
    doc.text(`₱${leaseData.security_deposit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 3, tableY + 5, { align: "right" });
    tableY += rowHeight;
    
    // Total line
    drawLine(margin, tableY, pageWidth - margin, tableY);
    tableY += 2;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const totalAmount = leaseData.monthly_rent + leaseData.security_deposit;
    doc.text("Total Initial Payment", margin + 3, tableY + 5);
    doc.text(`₱${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 3, tableY + 5, { align: "right" });
    tableY += rowHeight;
    drawLine(margin, tableY, pageWidth - margin, tableY);
    
    yPosition = tableY + 10;

    checkPageBreak(50);

    // ========== TERMS & CONDITIONS SECTION ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & CONDITIONS", margin, yPosition);
    yPosition += 6;
    
    drawBox(margin, yPosition, contentWidth, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(leaseData.notes, contentWidth - 6);
    doc.text(notesLines, margin + 3, yPosition + 6);
    
    yPosition += 30;
    yPosition += 8;

    checkPageBreak(50);

    // ========== SIGNATURE SECTION ==========
    checkPageBreak(40);
    yPosition += 5;
    
    const sigColWidth = (contentWidth - 20) / 2;
    
    // Landlord Signature
    drawLine(margin, yPosition, margin + sigColWidth, yPosition);
    yPosition += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(leaseData.landlord_name, margin + sigColWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Landlord Signature", margin + sigColWidth / 2, yPosition, { align: "center" });
    
    yPosition -= 30;
    
    // Tenant Signature
    drawLine(margin + sigColWidth + 20, yPosition, margin + sigColWidth + 20 + sigColWidth, yPosition);
    yPosition += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(tenantFullName, margin + sigColWidth + 20 + sigColWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Tenant Signature", margin + sigColWidth + 20 + sigColWidth / 2, yPosition, { align: "center" });
    
    yPosition += 15;

    // ========== FOOTER ==========
    const footerY = pageHeight - 15;
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text(`This archived document was generated on ${docDate} by Havenly Property Management System.`, pageWidth / 2, footerY, { align: "center" });
    doc.text(`Document ID: LEASE-${leaseData.lease_id} | Status: ${leaseData.lease_status}`, pageWidth / 2, footerY + 4, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Save the PDF
    const fileName = `Archived_Lease_${leaseData.lease_id}_${leaseData.property_name.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
  };

  // --- LOGIC HELPERS ---
  const today = new Date("2025-03-15");
  const start = new Date(activeLease.start_date);
  const end = new Date(activeLease.end_date);

  const totalDuration = end - start;
  const elapsed = today - start;
  const progressPercent = Math.min(
    Math.max((elapsed / totalDuration) * 100, 0),
    100
  );
  const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

  const getNextDueDate = () => {
    let nextDue = new Date(
      today.getFullYear(),
      today.getMonth(),
      activeLease.payment_due_day
    );
    if (today.getDate() > activeLease.payment_due_day) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    return nextDue.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      {/* --- MODAL INJECTION --- */}
      <LeaseDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lease={selectedLease}
        onDownload={handleDownloadArchivedPDF}
      />

      {/* --- PAGE HEADER --- */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Lease Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          View your current agreement and rental history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LEFT COLUMN (Active Lease) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. ACTIVE PROPERTY CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <Badge color="emerald">ACTIVE CONTRACT</Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                <Home size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                  {activeLease.property_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <MapPin size={14} className="text-slate-400" />
                  {activeLease.address}, {activeLease.city}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    UNIT {activeLease.unit}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    • Lease #{activeLease.lease_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Contract Duration
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {Math.round(progressPercent)}% Elapsed
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Start
                    </p>
                    <p className="font-semibold text-slate-700">
                      {new Date(activeLease.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      End
                    </p>
                    <p className="font-semibold text-slate-700">
                      {new Date(activeLease.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Calendar size={14} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. FINANCIAL TERMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Rent
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                  <Banknote size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                ₱{activeLease.monthly_rent.toLocaleString()}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100 text-xs font-bold">
                <Clock size={12} /> Next Due: {getNextDueDate()}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Security Deposit
                </p>
                <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                ₱{activeLease.security_deposit.toLocaleString()}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 text-xs font-bold">
                <CheckCircle2 size={12} className="text-emerald-500" /> Fully
                Paid
              </div>
            </div>
          </div>

          {/* 3. NOTES */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" /> Terms &
              Conditions Note
            </h4>
            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed italic">
              "{activeLease.notes}"
            </p>
          </div>

          {/* --- HISTORY SECTION --- */}
          <div className="pt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-slate-400" /> Lease History
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Property</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Duration</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaseHistory.map((lease) => (
                    <tr
                      key={lease.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-700">
                          {lease.property}
                        </p>
                        <p className="text-xs text-slate-400">
                          Unit {lease.unit} • #{lease.id}
                        </p>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-slate-600">
                        {lease.start} - {lease.end}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          color={lease.status === "Expired" ? "slate" : "red"}
                          size="sm"
                        >
                          {lease.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleViewLease(lease)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Sidebar) --- */}
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
                {activeLease.landlord_name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {activeLease.landlord_name}
                </p>
                <p className="text-xs text-slate-500">verified_landlord</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Phone size={16} className="text-slate-400" />{" "}
                {activeLease.landlord_contact}
              </button>
              <button className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Mail size={16} className="text-slate-400" /> Send Message
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Documents</h3>
            <p className="text-xs text-slate-500 mb-4">
              Official signed copies.
            </p>
            <button
              onClick={handleDownloadPDF}
              className="w-full py-2.5 px-4 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantLease;
