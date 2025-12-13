import axios from "axios";
import backendConnection from "./backendConnection.js";

export const getProperties = async (queryParams = {}) => {
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

    // Prepare params: map frontend naming to backend naming
    const apiParams = {
      page: queryParams.current_page || 1,
      limit: queryParams.limit || 10,
      search: queryParams.search || "",
      status: queryParams.statusTab || "All",
      city: queryParams.city || "All",
    };

    const response = await axios.get(
      `${backendConnection()}/landlord/properties/`,
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      // Based on your backend response:
      // { status: 'success', summary: {...}, available_cities: [...], properties: { data: [...] } }

      const paginator = response.data.properties;
      const cities = response.data.available_cities || []; // Capture the cities list

      return {
        success: true,
        message: "Properties successfully fetched!",
        properties: paginator.data,
        summary: response.data.summary || null,
        cities: cities, // Return this to populate your UI dropdown
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
        message: "No properties fetched!",
        properties: [],
        summary: null,
        cities: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          total_items: 0,
          limit: 10,
        },
      };
    }
  } catch (error) {
    console.error("API Error (getProperties):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch properties",
      error: error,
    };
  }
};



export const createProperty = async (propertyData) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");
    if (!token) {
      return {
        success: false,
        message: "Unauthorized Api call, No token provided!",
      };
    }
    const response = await axios.post(
      `${backendConnection()}/landlord/properties/create`,
      propertyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.request.status === 201 && response.data.success) {
      return {
        success: true,
        message: "Property Created Successfully!",
        property: response.data.property,
        rooms: response.data.rooms,
      };
    } else {
      return {
        success: false,
        message: "Error occured when creating property",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch properties",
      error: error,
    };
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "Unauthorized Api call, No token provided!",
      };
    }
    const response = await axios.put(
      `${backendConnection()}/landlord/properties/${id}`,
      propertyData,
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
        message: response.data.message || "Property updated successfully!",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to update property.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update property",
      error: error,
    };
  }
};

export const archiveProperty = async (id) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "Unauthorized Api call, No token provided!",
      };
    }

    // Method: PATCH
    const response = await axios.patch(
      `${backendConnection()}/landlord/properties/${id}/archive`,
      {}, // Empty body
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
        message: response.data.message || "Property status updated!",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to archive property.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to archive property",
      error: error,
    };
  }
};

export const deleteProperty = async (id) => {
  try {
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "Unauthorized Api call, No token provided!",
      };
    }
    const response = await axios.delete(
      `${backendConnection()}/landlord/properties/${id}`,
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
        message: response.data.message || "Property deleted successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to delete property.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete property",
      error: error,
    };
  }
};
