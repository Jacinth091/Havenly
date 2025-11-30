// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("havenly_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUsers = {
      "admin@havenly.com": {
        user_id: 1,
        username: "admin",
        email: "admin@havenly.com",
        role: "Admin",
        name: "System Administrator",
        avatar: "/avatars/admin.jpg",
      },
      "landlord@havenly.com": {
        user_id: 2,
        username: "john_landlord",
        email: "landlord@havenly.com",
        role: "Landlord",
        name: "John Property Owner",
        avatar: "/avatars/landlord.jpg",
      },
      "tenant@havenly.com": {
        user_id: 3,
        username: "sarah_tenant",
        email: "tenant@havenly.com",
        role: "Tenant",
        name: "Sarah Johnson",
        avatar: "/avatars/tenant.jpg",
      },
    };

    if (mockUsers[email] && password === "password") {
      const userData = mockUsers[email];
      setUser(userData);
      localStorage.setItem("havenly_user", JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("havenly_user");
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
