import axios from "axios";
import backendConnection from "./backendConnection.js";

const token =
  sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

export const userLogin = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/auth/login`,
      { email: formData.email, password: formData.password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.request.status === 201) {
      console.log("Response Data: ", response.data);
      // sessionStorage.setItem("auth_token", response.data.access_token);
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
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const userRegister = async (formData) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/auth/register`,
      {
        formData,
      },
      {
        header: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.request.status === 201) {
      return {
        succees: true,
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
      message: "Account creation failed!",
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
