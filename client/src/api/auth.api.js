import axios from "axios";
import backendConnection from "./backendConnection.js";

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
    if (response.data.success) {
      sessionStorage.setItem("authToken", response.data.data.token);
      // sessionStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return {
      success: true,
      message: "Logged In Successfully!",
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};
