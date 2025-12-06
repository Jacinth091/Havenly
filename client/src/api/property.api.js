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

    const defaultParams = {
      current_page: 1,
      last_page: 1,
      total_items: 0,
      limit: 10,
    };
    const finalParams = { ...defaultParams, ...queryParams };

    const response = await axios.get(
      `${backendConnection()}/landlord/properties/`,
      {
        params: finalParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.request.status === 200) {
      return {
        success: true,
        message: "Properties successfully fetched!",
        properties: response.data.properties.data,
        pagination: {
          current_page: response.data.properties.current_page,
          last_page: response.data.properties.current_page,
          total_items: response.data.properties.total,
          limit: response.data.properties.per_page,
        },
      };
    } else {
      return {
        success: false,
        message: "No properties fetched!",
        properties: response.data.properties.data,
        pagination: {
          current_page: response.data.properties.current_page,
          last_page: response.data.properties.current_page,
          total_items: response.data.properties.total,
          limit: response.data.properties.per_page,
        },
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

export const getRoomByProperty = async (property_id, queryParams = {}) => {
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

    const defaultParams = {
      current_page: 1,
      last_page: 1,
      total_items: 0,
      limit: 10,
    };
    const finalParams = { ...defaultParams, ...queryParams };

    const response = await axios.get(
      `${backendConnection()}/landlord/properties/${property_id}/rooms`,
      {
        params: finalParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      console.log("Response: ", response);
      const payload = response.data.data;
      return {
        success: true,
        message: "Properties successfully fetched!",
        property: payload.property,
        summary: payload.summary,
        rooms: payload.rooms.data,
        pagination: {
          current_page: payload.rooms.current_page,
          last_page: payload.rooms.last_page,
          total_items: payload.rooms.total,
          limit: payload.rooms.per_page,
        },
      };
    } else {
      return {
        success: false,
        message: "Rooms not fetched successfully!",
        // Return empty structures on failure to prevent UI crashes
        property: null,
        summary: null,
        rooms: [],
        pagination: defaultParams,
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch rooms",
      error: error,
    };
  }
};


