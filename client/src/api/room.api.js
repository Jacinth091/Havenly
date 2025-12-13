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
    const response = await axios.get(`${backendConnection()}/landlord/rooms`, {
      params: finalParams,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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

export const createRoomForProperty = async (property_id, roomData) => {
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
      `${backendConnection()}/landlord/properties/${property_id}/rooms/create`,
      roomData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error occurred in createRoomPerProperty API: ", error);
    return null;
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

    // 1. Prepare params (Updated to match React Component keys)
    const apiParams = {
      page: queryParams.page || 1, // Component sends 'page', not 'current_page'
      limit: queryParams.limit || 10,
      search: queryParams.search || "",
      status: queryParams.status || queryParams.statusTab || "All", // Handle both keys
      property_id: property_id,
    };

    // console.log("Query Params: ", apiParams);

    const response = await axios.get(
      `${backendConnection()}/landlord/properties/${property_id}/rooms`,
      {
        params: apiParams,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      // 2. Updated Data Mapping (Matches new flattened Controller response)
      // The controller now returns { property, rooms, summary, pagination } at root.
      const data = response.data;

      return {
        success: true,
        message: data.message || "Rooms successfully fetched!",
        property: data.property,
        summary: data.summary,
        rooms: data.rooms, // Now a direct array, not nested in .data
        pagination: data.pagination, // Now a direct object
      };
    } else {
      return {
        success: false,
        message: "Rooms not fetched successfully!",
        property: null,
        summary: null,
        rooms: [],
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
      message: error.response?.data?.message || "Failed to fetch rooms",
      error: error,
    };
  }
};
export const updateRoom = async (roomId, roomData) => {
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

    // Prepare payload (only send what changed)
    const payload = {
      room_number: roomData.room_number,
      monthly_rent: roomData.monthly_rent,
      room_status: roomData.room_status,
    };

    const response = await axios.put(
      `${backendConnection()}/landlord/rooms/${roomId}`,
      payload,
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
        message: "Room updated successfully!",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to update room.",
      };
    }
  } catch (error) {
    // Handle the 409 Conflict (Active Lease) specifically if needed
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update room",
      error: error,
    };
  }
};

// --- ARCHIVE ROOM ---
export const archiveRoom = async (roomId) => {
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

    const response = await axios.patch(
      `${backendConnection()}/landlord/rooms/${roomId}/archive`,
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
        message: response.data.message, // "Room successfully archived/activated"
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to archive room.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to archive room",
      error: error,
    };
  }
};

// --- DELETE ROOM ---
export const deleteRoom = async (roomId) => {
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
      `${backendConnection()}/landlord/rooms/${roomId}`,
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
        message: "Room deleted successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to delete room.",
      };
    }
  } catch (error) {
    // This catches the 409 error if the room has an active lease
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete room",
      error: error,
    };
  }
};
