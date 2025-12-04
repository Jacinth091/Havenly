import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { userLogin, userRegister, verifyUser } from "../api/auth.api.js";

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

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("auth_token");
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
