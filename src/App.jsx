import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import Home from "./pages/Home";
import Rates from "./pages/Rates";
import Login from "./pages/Login";
import BookPickup from "./pages/BookPickup";
import UserDashboard from "./pages/UserDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import TermsConditions from "./pages/TermsConditions";
import MyPickups from "./pages/MyPickups";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import FranchiseLogin from "./pages/FranchiseLogin";
import CollectorLogin from "./pages/CollectorLogin";
import CollectorRegister from "./pages/CollectorRegister";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Wallet from "./pages/Wallet";
import PrivacyPolicy from "./pages/PrivacyPolicy";

/* Components */
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import FloatingActions from "./components/FloatingActions";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book" element={<BookPickup />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* USER ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-pickups"
            element={
              <ProtectedRoute>
                <MyPickups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* FRANCHISE ROUTES */}
          <Route
            path="/franchise-login"
            element={<FranchiseLogin />}
          />

          <Route
            path="/franchise-dashboard"
            element={
              <ProtectedRoute role="franchise">
                <FranchiseDashboard />
              </ProtectedRoute>
            }
          />

          {/* COLLECTOR ROUTES */}
          <Route
            path="/collector-register"
            element={<CollectorRegister />}
          />

          <Route
            path="/collector-login"
            element={<CollectorLogin />}
          />

          <Route
            path="/collector-dashboard"
            element={
              <ProtectedRoute role="collector">
                <CollectorDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
        <FloatingActions />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;