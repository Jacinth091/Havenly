import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import AuthLayout from "./components/layouts/AuthLayout";
import { default as DashboardLayout } from "./components/layouts/DashboardLayout";
import HomeLayout from "./components/layouts/HomeLayout";
import AdminProtectedRoute from "./context/AdminProtectedRoute";
import ProtectedRoute from "./context/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUnderconstruction from "./pages/AdminUnderconstruction";
import ForgotPassword from "./pages/ForgotPassword";
import LandlordDashboard from "./pages/landlords/LandlordDashboard";
import Login from "./pages/Login";
import FeaturesPage from "./pages/public/FeaturesPublic";
import LandingPage from "./pages/public/LandingPage";
import LandlordsPage from "./pages/public/LandlordPublic";
import { default as TenantsPage } from "./pages/public/TenantPublic";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import TenantDashboard from "./pages/tenants/TenantDashboard";
import Unauthorized from "./pages/Unauthorized";
import Underconstruction from "./pages/UnderConstruction";

function App() {
  return (
    <Router>
      <Toaster richColors position="top-right" expand limit={2} />
      <Routes>
        {/* Public Routes */}
        <Route element={<HomeLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/landlords" element={<LandlordsPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route element={<AuthLayout />} path="/">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Role Protected Routes */}
        {/* <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        </Route> */}

        {/* Admin Routes */}
        <Route path="/admin/" element={<DashboardLayout />}>
          <Route
            path="dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <AdminProtectedRoute>
                <AdminUnderconstruction />
              </AdminProtectedRoute>
            }
          />
        </Route>

        {/* Tenant Routes */}
        <Route path="/tenant/" element={<DashboardLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <Underconstruction />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Landlord Routes */}
        <Route path="/landlord/" element={<DashboardLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <Underconstruction />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Root redirect based on role */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

        {/* Catch all - redirect to login */}
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
