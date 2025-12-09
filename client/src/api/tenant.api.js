import axios from "axios";
import backendConnection from "./backendConnection";

export const getTenantsByProperty = async (property_id, queryParams = {}) => {
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

    // MATCHING THE LOGIC OF getLandlordTenants EXACTLY
    const apiParams = {
      page: queryParams.current_page || 1, // Maps 'current_page' to backend 'page'
      limit: queryParams.limit || 10,
      search: queryParams.search || "",
      statusTab: queryParams.statusTab || "All",
      property_id: property_id,
    };

    const response = await axios.get(
      `${backendConnection()}/landlord/tenants/${property_id}`,
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      const payload = response.data.data; // Wrapper
      const paginator = payload.tenants; // Pagination object

      return {
        success: true,
        message: "Tenants successfully fetched!",
        summary: payload.summary, // Returns { All: X, Active: Y, ... }
        tenants: paginator.data,
        pagination: {
          current_page: paginator.current_page,
          last_page: paginator.last_page,
          total_items: paginator.total,
          limit: paginator.per_page,
        },
      };
    } else {
      return {
        success: false,
        message: response.data.message || "No tenants found!",
        summary: { All: 0, Active: 0, Expired: 0, Terminated: 0, Archived: 0 },
        tenants: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          total_items: 0,
          limit: 10,
        },
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch tenants",
      error: error,
    };
  }
};

export const getLandlordTenants = async (queryParams = {}) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return { success: false, message: "No token provided!" };
    }

    const apiParams = {
      page: queryParams.current_page || 1,
      limit: queryParams.limit || 10,
      search: queryParams.search || "",
      status: queryParams.statusTab || "All",
    };

    const response = await axios.get(
      `${backendConnection()}/landlord/tenants`,
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Tenant Rewsponse: ", response);

    if (response.status === 200 && response.data.success) {
      const payload = response.data.data; // Access the 'data' key wrapper
      const paginator = payload.tenants; // The paginated object inside

      return {
        success: true,
        message: "Tenants fetched successfully!",
        summary: payload.summary, // { All: X, Active: Y, History: Z }
        tenants: paginator.data, // The actual array of tenants
        pagination: {
          current_page: paginator.current_page,
          last_page: paginator.last_page,
          total_items: paginator.total,
          limit: paginator.per_page,
        },
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch tenants.",
        summary: { All: 0, Active: 0, History: 0 },
        tenants: [],
        pagination: { current_page: 1, total_items: 0, limit: 10 },
      };
    }
  } catch (error) {
    console.error("API Error (getLandlordTenants):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Server Error",
      error: error,
    };
  }
};

export const searchAvailableTenants = async (
  search = "",
  status = "Available"
) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) return { success: false, message: "No token provided!" };

    const apiParams = {
      search: search,
      status: status, // 'Available' or 'Renting'
    };

    const response = await axios.get(
      `${backendConnection()}/landlord/tenants/available`, // Update this route path if needed
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Tenants: ", response);
    if (response.status === 200 && response.data.success) {
      const payload = response.data.data;
      return {
        success: true,
        summary: payload.summary, // { All: X, Available: Y, Renting: Z }
        tenants: payload.tenants, // This is a flat array (limit 20), not paginated
      };
    } else {
      return { success: false, tenants: [], summary: null };
    }
  } catch (error) {
    console.error("API Error (searchAvailableTenants):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Server Error",
      tenants: [],
    };
  }
};

export const createTenantAccount = async (formData) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) return { success: false, message: "No token provided!" };

    const response = await axios.post(
      `${backendConnection()}/landlord/tenants/create`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.request.status === 201) {
      return {
        success: true,
        message: "Account created successfully created!",
        // user: response.data.user,
      };
    }
    return {
      success: false,
      message: "Account not created!",
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.errors,
    };
  }
};
