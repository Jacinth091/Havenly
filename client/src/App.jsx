import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import HavenlyDashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Landing Page</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<HavenlyDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
