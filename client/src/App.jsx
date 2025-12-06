import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import AuthLayout from "./components/layouts/AuthLayout";
import { default as DashboardLayout } from "./components/layouts/DashboardLayout";
import HomeLayout from "./components/layouts/HomeLayout";
import AdminProtectedRoute from "./context/AdminProtectedRoute";
import ProtectedRoute from "./context/ProtectedRoute";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminProperties from "./pages/admin/AdminProperty";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUser";
import AdminUnderconstruction from "./pages/AdminUnderconstruction";
import ForgotPassword from "./pages/ForgotPassword";
import LandlordDashboard from "./pages/landlords/LandlordDashboard";
import LandlordLeases from "./pages/landlords/LandlordLease";
import LandlordPayments from "./pages/landlords/LandlordPayments";
import LandlordProfile from "./pages/landlords/LandlordProfile";
import LandlordProperties from "./pages/landlords/LandlordProperty";
import LandlordSettings from "./pages/landlords/LandlordSettings";
import LandlordTenants from "./pages/landlords/LandlordTenants";
import Login from "./pages/Login";
import LandingPage from "./pages/public/LandingPage";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import TenantDashboard from "./pages/tenants/TenantDashboard";
import TenantLease from "./pages/tenants/TenantLease";
import TenantPayments from "./pages/tenants/TenantPayments";
import TenantProfile from "./pages/tenants/TenantProfile";
import TenantRequests from "./pages/tenants/TenantREquest";
import TenantSettings from "./pages/tenants/TenantSettings";
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
          {/* <Route path="/features" element={<FeaturesPage />} />
          <Route path="/landlords" element={<LandlordsPage />} />
          <Route path="/tenants" element={<TenantsPage />} /> */}
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
            path="analytics"
            element={
              <AdminProtectedRoute>
                <AdminAnalytics />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="properties"
            element={
              <AdminProtectedRoute>
                <AdminProperties />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <AdminProtectedRoute>
                <AdminSettings />
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
            path="lease"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantLease />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantSettings />
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
            path="properties"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="tenants"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordTenants />
              </ProtectedRoute>
            }
          />
          <Route
            path="leases"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordLeases />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordProfile />
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
