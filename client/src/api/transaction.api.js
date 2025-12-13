import axios from "axios";
import backendConnection from "./backendConnection.js";

// Helper to get token
const getToken = () =>
  sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

export const getTransactionsByTenant = async (tenantId, queryParams = {}) => {
  try {
    const token = getToken();
    if (!token)
      return {
        success: false,
        message: "Invalid api call, No token provided!",
      };

    const apiParams = {
      page: queryParams.current_page || 1,
      limit: queryParams.limit || 10,
      search: queryParams.search || "",
      start_date: queryParams.start_date || "",
      end_date: queryParams.end_date || "",
      status: queryParams.statusTab || "All",
    };

    const response = await axios.get(
      `${backendConnection()}/transactions/tenant/${tenantId}`,
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      const payload = response.data; // This matches the "data" object in your JSON

      return {
        success: true,
        // CORRECTION: Map to payload.transactions.data (the array)
        transactions: payload.transactions.data,

        summary: payload.summary, // Matches JSON structure

        // CORRECTION: Map to payload.transactions (the pagination meta)
        pagination: {
          current_page: payload.transactions.current_page,
          last_page: payload.transactions.last_page,
          total_items: payload.transactions.total,
          limit: payload.transactions.per_page,
        },
      };
    } else {
      return {
        success: false,
        message: "No transactions found.",
        transactions: [],
        summary: null,
        pagination: {
          current_page: 1,
          last_page: 1,
          total_items: 0,
          limit: 10,
        },
      };
    }
  } catch (error) {
    console.error("API Error (getTransactionsByTenant):", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch tenant transactions",
      error: error,
    };
  }
};

export const getLandlordTransactions = async (queryParams = {}) => {
  try {
    const token = getToken();
    if (!token)
      return {
        success: false,
        message: "Invalid api call, No token provided!",
      };

    const apiParams = {
      page: queryParams.current_page || 1,
      limit: queryParams.limit || 10,
      search: queryParams.search || "",
      property_id: queryParams.property_id || "All",
      start_date: queryParams.start_date || "",
      end_date: queryParams.end_date || "",
      status: queryParams.statusTab || "All",
    };

    const response = await axios.get(
      `${backendConnection()}/landlord/transactions`,
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      const payload = response.data;

      return {
        success: true,
        // CORRECTION: The JSON shows 'transactions' is the object containing 'data' (the array)
        transactions: payload.transactions.data,

        summary: payload.summary,

        // CORRECTION: Mapping directly to the 'transactions' object keys
        pagination: {
          current_page: payload.transactions.current_page,
          last_page: payload.transactions.last_page,
          total_items: payload.transactions.total,
          limit: payload.transactions.per_page,
        },
      };
    } else {
      return {
        success: false,
        message: "No transactions found.",
        transactions: [],
        summary: null,
        pagination: {
          current_page: 1,
          last_page: 1,
          total_items: 0,
          limit: 10,
        },
      };
    }
  } catch (error) {
    console.error("API Error (getLandlordTransactions):", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch landlord transactions",
      error: error,
    };
  }
};

export const getAllTransactionsAdmin = async (queryParams = {}) => {
  try {
    const token = getToken();
    if (!token)
      return {
        success: false,
        message: "Invalid api call, No token provided!",
      };

    const apiParams = {
      page: queryParams.current_page || 1,
      limit: queryParams.limit || 20,
      search: queryParams.search || "",
      start_date: queryParams.start_date || "",
      end_date: queryParams.end_date || "",
      status: queryParams.statusTab || "All",
    };

    const response = await axios.get(
      `${backendConnection()}/admin/transactions`,
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      const payload = response.data;

      return {
        success: true,
        // CORRECTION: Ensure consistency with other endpoints
        transactions: payload.transactions.data,

        summary: payload.summary,

        pagination: {
          current_page: payload.transactions.current_page,
          last_page: payload.transactions.last_page,
          total_items: payload.transactions.total,
          limit: payload.transactions.per_page,
        },
      };
    } else {
      return {
        success: false,
        message: "No transactions found.",
        transactions: [],
        summary: null,
        pagination: {
          current_page: 1,
          last_page: 1,
          total_items: 0,
          limit: 20,
        },
      };
    }
  } catch (error) {
    console.error("API Error (getAllTransactionsAdmin):", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch admin transactions",
      error: error,
    };
  }
};
export const recordPayment = async (paymentData) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "Invalid api call, No token provided!",
      };
    }

    const response = await axios.post(
      `${backendConnection()}/landlord/transactions/create`,
      paymentData,
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
        message: response.data.message || "Payment recorded successfully!",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to record payment.",
      };
    }
  } catch (error) {
    console.error("API Error (recordPayment):", error);

    // Special handling for 409 (Duplicate Payment)
    if (error.response?.status === 409) {
      return {
        success: false,
        message: "Duplicate payment detected for this month.",
        error: error,
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Failed to record payment",
      error: error,
    };
  }
};

export const verifyTransactionApi = async (transactionId) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "Invalid api call, No token provided!",
      };
    }

    const response = await axios.patch(
      `${backendConnection()}/landlord/transactions/${transactionId}/verify`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        message: response.data.message || "Transaction verified successfully",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to verify transaction",
      };
    }
  } catch (error) {
    console.error("Verify Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Verification failed",
      error: error,
    };
  }
};

export const rejectTransactionApi = async (transactionId) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "Invalid api call, No token provided!",
      };
    }

    const response = await axios.patch(
      `${backendConnection()}/landlord/transactions/${transactionId}/reject`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        message: response.data.message || "Transaction rejected successfully",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to reject transaction",
      };
    }
  } catch (error) {
    console.error("Reject Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Rejection failed",
      error: error,
    };
  }
};

export const archiveTransactionApi = async (transactionId) => {
  try {
    // Uses the getToken helper defined at the top of your file
    const token = getToken();

    if (!token) {
      return {
        success: false,
        message: "Invalid api call, No token provided!",
      };
    }

    const response = await axios.patch(
      `${backendConnection()}/landlord/transactions/${transactionId}/archive`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        message: response.data.message || "Transaction archived successfully",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to archive transaction",
      };
    }
  } catch (error) {
    console.error("Archive Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Archiving failed",
      error: error,
    };
  }
};
