// AdminProtectedRoute.jsx (Enhanced)
import { Navigate } from "react-router-dom";
import RouteLoading from "../components/ui/RouteLoading";
import { useAuth } from "../context/AuthProvider";

const AdminProtectedRoute = ({ children }) => {
  const { user, loading, error } = useAuth();

  console.log("AdminProtectedRoute - User:", user);
  console.log("AdminProtectedRoute - Loading:", loading);

  // Loading state with role-specific message
  if (loading) {
    return <RouteLoading message="Verifying administrative access..." />;
  }

  // Error state
  if (error) {
    return (
      <Navigate
        to="/login"
        state={{
          error: "Authentication failed. Please login again.",
        }}
        replace
      />
    );
  }

  // Auth check AFTER loading
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toLowerCase();
  const userName = user?.name || user?.email?.split("@")[0];

  // Strict admin-only check with friendly redirects
  if (role !== "admin") {
    const redirectMessages = {
      tenant: `Hi ${userName}, redirecting you to your tenant dashboard...`,
      landlord: `Hi ${userName}, redirecting you to your landlord portal...`,
    };

    // Set a small delay to show message
    setTimeout(() => {
      console.log(redirectMessages[role] || "Redirecting to your dashboard...");
    }, 100);

    // Redirect based on role
    switch (role) {
      case "tenant":
        return <Navigate to="/tenant/dashboard" replace />;
      case "landlord":
        return <Navigate to="/landlord/dashboard" replace />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  }

  // Welcome admin message
  console.log(`Welcome, Admin ${userName}! Loading dashboard...`);

  return children;
};

export default AdminProtectedRoute;
