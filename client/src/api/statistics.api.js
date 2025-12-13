import axios from "axios";
import backendConnection from "./backendConnection";

export const getLandlordDashboardStats = async () => {
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
      `${backendConnection()}/landlord/dashboard`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      const payload = response.data;
      console.log("Respobnse: ", response);
      return {
        success: true,
        message: "Dashboard data fetched!",
        stats: payload.stats,
        properties: payload.properties,
        recentTransactions: payload.recentTransactions,
        alerts: payload.alerts,
      };
    } else {
      return {
        success: false,
        message: "No dashboard data found!",
        stats: {},
        properties: [],
        recentTransactions: [],
        alerts: [],
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch dashboard data",
      error: error,
      stats: {},
      properties: [],
      recentTransactions: [],
      alerts: [],
    };
  }
};
