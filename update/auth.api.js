import axios from "axios";
import backendConnection from "./backendConnection.js";

const token =
  sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

export const userLogin = async (formData) => {
  try {
    console.log("Attempting login for:", formData.email);
    const response = await axios.post(
      `${backendConnection()}/auth/login`,
      { email: formData.email, password: formData.password },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15 second timeout
      }
    );
    
    console.log("Login response received:", response.status, response.data);
    
    // Fix: Use response.status instead of response.request.status
    if (response.status === 201 || response.status === 200) {
      if (!response.data.access_token) {
        console.error("Missing access_token in response:", response.data);
        return {
          success: false,
          message: "Invalid response from server",
        };
      }
      
      return {
        success: true,
        message: "Logged In Successfully!",
        user: response.data.user,
        token: response.data.access_token,
      };
    } else {
      return {
        success: false,
        message: "An error occured while logging in!",
      };
    }
  } catch (error) {
    console.error("Error in Login Api: ", error);
    
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: "Request timed out. Please check your connection.",
      };
    }
    
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.errMsg || "Login failed",
      };
    } else if (error.request) {
      // Request was made but no response
      return {
        success: false,
        message: "No response from server. Please check if the server is running.",
      };
    } else {
      // Something else
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  }
};

export const userRegister = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/auth/register`,

      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.request.status === 201) {
      return {
        success: true,
        message: "Account created successfully created!",
        user: response.data.user,
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

export const verifyUser = async () => {
  try {
    const token = sessionStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "No token found",
      };
    }
    const response = await axios.post(
      `${backendConnection()}/auth/verify`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.user;
  } catch (error) {
    console.error("Error in verifyUser:", error);
    return null;
  }
};

export const userLogout = async () => {
  try {
    const token = sessionStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        message: "No token found",
      };
    }
    const response = await axios.post(
      `${backendConnection()}/auth/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.user;
  } catch (error) {
    console.error("Error in userLogout Api:", error);
    return null;
  }
};
