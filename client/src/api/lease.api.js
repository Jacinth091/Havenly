import axios from "axios";
import backendConnection from "./backendConnection";
export const createLease = async (leaseData) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "Authentication Error: No token found.",
      };
    }
    const payload = {
      property_id: leaseData.property_id,
      room_id: leaseData.room_id,
      tenant_id: leaseData.tenant_id,
      start_date: leaseData.start_date,
      end_date: leaseData.end_date,
      monthly_rent: leaseData.monthly_rent,
      security_deposit: leaseData.security_deposit || 0,
      payment_due_day: leaseData.payment_due_day,
      notes: leaseData.notes || "",
      transaction: {
        amount: leaseData.initial_payment_amount, // Ensure this matches your form field name
        payment_method: leaseData.payment_method,
        reference_number: leaseData.reference_number || "SYSTEM_GENERATED",
        payment_for_month: leaseData.payment_for_month,
      },
    };

    const response = await axios.post(
      `${backendConnection()}/landlord/lease/create`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201 && response.data.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to create lease.",
      };
    }
  } catch (error) {
    console.error("Create Lease Error:", error);

    // Handle Validation Errors (422) specifically if you want to show field errors
    if (error.response && error.response.status === 422) {
      return {
        success: false,
        message: "Validation Error",
        errors: error.response.data.errors, // Pass specific field errors back
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Server Error encountered.",
      error: error,
    };
  }
};
