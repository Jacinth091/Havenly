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

export const getLandlordLeases = async (queryParams = {}) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return { success: false, message: "No token provided!" };
    }

    const apiParams = {
      page: queryParams.current_page || 1,
      limit: queryParams.limit || 6,
      search: queryParams.search || "",
      status: queryParams.statusTab || "All",
    };

    const response = await axios.get(`${backendConnection()}/landlord/lease`, {
      params: apiParams,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Lease Response:", response);

    if (response.status === 200 && response.data.success) {
      const payload = response.data;

      // UPDATE: Direct mapping because backend now sends these keys at the root level
      return {
        success: true,
        message: payload.message || "Leases fetched successfully!",
        leases: payload.leases,
        summary: payload.summary,
        pagination: payload.pagination,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "No leases found!",
        leases: [],
        summary: { All: 0, Active: 0, Expiring: 0, History: 0 },
        pagination: { current_page: 1, last_page: 1, total_items: 0, limit: 6 },
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch leases",
      error: error,
      leases: [],
      summary: { All: 0, Active: 0, Expiring: 0, History: 0 },
      pagination: { current_page: 1, last_page: 1, total_items: 0, limit: 6 },
    };
  }
};

export const terminateLeaseApi = async (id, reason) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    const response = await axios.patch(
      `${backendConnection()}/landlord/lease/${id}/terminate`,
      { reason: reason },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // New Controller returns: { success: true, message: "...", data: {...} }
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Termination failed");
    }
  } catch (error) {
    // Axios throws if status code is 4xx/5xx
    // We want to extract the backend's specific error message if available
    const errorMessage =
      error.response?.data?.message ||
      "An error occurred while terminating the lease.";
    throw new Error(errorMessage);
  }
};

export const archiveLeaseApi = async (id) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    const response = await axios.patch(
      `${backendConnection()}/landlord/lease/${id}/archive`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Archiving failed");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "An error occurred while archiving the lease.";
    throw new Error(errorMessage);
  }
};
