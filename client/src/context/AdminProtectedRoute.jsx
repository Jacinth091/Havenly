import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // ✅ FIXED

  console.log("AdminProtectedRoute - User:", user);
  console.log("AdminProtectedRoute - Loading:", loading);

  // ✅ Correct loading guard
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // ✅ Auth check AFTER loading
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toLowerCase();

  // ✅ Strict admin-only check
  if (role !== "admin") {
    if (role === "tenant") {
      return <Navigate to="/tenant/dashboard" replace />;
    }

    if (role === "landlord") {
      return <Navigate to="/landlord/dashboard" replace />;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
