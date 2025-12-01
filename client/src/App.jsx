import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AuthLayout from "./components/layouts/AuthLayout";
import { default as DashboardLayout } from "./components/layouts/DashboardLayout";
import HomeLayout from "./components/layouts/HomeLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HavenlyDashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import LandlordDashboard from "./pages/landlords/LandlordDashboard";
import Login from "./pages/Login";
import FeaturesPage from "./pages/public/FeaturesPublic";
import LandingPage from "./pages/public/LandingPage";
import LandlordsPage from "./pages/public/LandlordPublic";
import TenantsPage from "./pages/public/TenantPublic";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import TenantDashboard from "./pages/tenants/TenantDashboard";

function App() {
  return (
    <Router>
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
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<HavenlyDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
