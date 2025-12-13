import axios from "axios";
import backendConnection from "./backendConnection.js";

// Helper to get token
const getAuthHeaders = () => {
  const token =
    sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : null;
};

export const updateUserProfile = async (userData) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) return { success: false, message: "No token provided!" };

    // userData expected format:
    // {
    //   first_name: "John",
    //   last_name: "Doe",
    //   email: "john@example.com",
    //   contact_num: "09123456789",
    //   middle_name: "optional"
    // }

    const response = await axios.put(
      `${backendConnection()}/user/profile`,
      userData,
      { headers: headers }
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        message: response.data.message || "Profile updated successfully!",
        user: response.data.data, // Returns the updated user object
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to update profile.",
      };
    }
  } catch (error) {
    console.error("API Error (updateUserProfile):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile",
      errors: error.response?.data?.errors || null, // Capture validation errors (e.g. email taken)
    };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) return { success: false, message: "No token provided!" };

    // passwordData expected format:
    // {
    //   current_password: "oldPassword123",
    //   password: "newPassword123",
    //   password_confirmation: "newPassword123"
    // }

    const response = await axios.put(
      `${backendConnection()}/user/password`,
      passwordData,
      { headers: headers }
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        message: response.data.message || "Password changed successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to change password.",
      };
    }
  } catch (error) {
    console.error("API Error (changePassword):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change password",
      errors: error.response?.data?.errors || null, // specific field errors
    };
  }
};
