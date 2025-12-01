import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AuthLayout from "./components/layouts/AuthLayout";
import { default as DashboardLayout } from "./components/layouts/DashboardLayout";
import HomeLayout from "./components/layouts/HomeLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HavenlyDashboard from "./pages/Dashboard";
import LandlordDashboard from "./pages/landlords/LandlordDashboard";
import Login from "./pages/Login";
import TenantDashboard from "./pages/tenants/TenantDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<HomeLayout />} path="/">
          <Route element={<div>Landing Page</div>} />
        </Route>

        {/* Authentication Routes */}
        <Route element={<AuthLayout />} path="/">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<div>Register</div>} />
          <Route path="forgot-password" element={<div>Forgot Password</div>} />
          <Route
            path="reset-password/:token"
            element={<div>Reset Password</div>}
          />
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
