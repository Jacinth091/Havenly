import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
// Import the new functions here
import {
  userLogin,
  userLogout,
  userRegister,
  verifyUser,
} from "../api/auth.api.js";
import { changePassword, updateUserProfile } from "../api/user.api.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isCheckingAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) return;

    isCheckingAuth.current = true;
    setLoading(true);

    try {
      const token = sessionStorage.getItem("auth_token");

      if (!token) {
        setUser(null);
        return;
      }

      const result = await verifyUser();
      console.log("Verify User Result:", result);
      if (result && result.user_id) {
        setUser(result);
      } else {
        setUser(null);
        sessionStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      setUser(null);
      sessionStorage.removeItem("auth_token");
    } finally {
      isCheckingAuth.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (formData) => {
    try {
      const result = await userLogin(formData);

      if (result.success) {
        sessionStorage.setItem("auth_token", result.token);
        setUser(result.user);
        return result;
      } else {
        return {
          success: false,
          message: result.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during login",
      };
    }
  };

  const register = async (formData) => {
    try {
      const result = await userRegister(formData);

      if (result.success) {
        sessionStorage.setItem("auth_token", result.token);
        setUser(result.user);
        return result;
      } else {
        return {
          success: false,
          message: result.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during registration",
      };
    }
  };

  const logout = async () => {
    try {
      const result = await userLogout();
      if (result.success) {
        setUser(null);
        sessionStorage.removeItem("auth_token");
        return result;
      } else {
        return {
          success: false,
          message: result.message || "Logout failed",
        };
      }
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during logout",
      };
    } finally {
      setUser(null);
      sessionStorage.removeItem("auth_token");
    }
  };

  // --- NEW WRAPPER FUNCTIONS ---

  const updateProfile = async (userData) => {
    try {
      const result = await updateUserProfile(userData);

      if (result.success && result.user) {
        // Immediately update local state so the UI reflects changes
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error("Update Profile error:", error);
      return { success: false, message: "An error occurred" };
    }
  };

  const changeUserPassword = async (passwordData) => {
    try {
      // No state update needed for password change usually
      return await changePassword(passwordData);
    } catch (error) {
      console.error("Change Password error:", error);
      return { success: false, message: "An error occurred" };
    }
  };

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  console.log("Auth Provider - User:", user, "Loading:", loading);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshAuth,
    updateProfile, // <--- Exposed in Context
    changeUserPassword, // <--- Exposed in Context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
