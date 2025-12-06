import axios from "axios";
import backendConnection from "./backendConnection";

export const getAllRooms = async (queryParams = {}) => {
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
      `${backendConnection()}/landlord/properties/rooms`,
      {
        params: finalParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response from API: ", response);
    if (response.status === 200) {
      const payload = response.data.data;
      return {
        success: true,
        message: "Rooms successfully fetched!",
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
        data: null,
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

export const getRoomDetails = async (property_id, room_id) => {
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

    const response = await axios.get(
      `${backendConnection()}/landlord/properties/${property_id}/rooms/${room_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      const roomPayload = response.data.data.rooms;

      return {
        success: true,
        message: "Room details successfully fetched!",
        data: roomPayload,
      };
    } else {
      return {
        success: false,
        message: "Room not fetched successfully!",
        data: null,
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch room details",
      error: error,
    };
  }
};
