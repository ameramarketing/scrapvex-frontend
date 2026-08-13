import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Wallet from "./pages/Wallet";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import Onboarding from "./pages/Onboarding";
import SplashScreen from "./components/SplashScreen";
import Notifications from "./pages/Notifications";

/* Components */
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import FloatingActions from "./components/FloatingActions";
import Navbar from "./components/Navbar";
import MobileAppShell from "./components/MobileAppShell";
import GlobalLoader from "./components/GlobalLoader";
import NativeOfflineBanner from "./components/NativeOfflineBanner";
import { StatusBar, Style } from "@capacitor/status-bar";
import { requestNotificationPermission } from "./utils/pushNotifications";
import { isNativeApp, isMobileEnvironment } from "./platform/platform";

function InitialHomeScreen() {
  const isCapacitor = typeof window !== "undefined" && (
    (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
    window.location.search.includes("app=true")
  );
  
  const onboardingDone = localStorage.getItem("scrapvex_onboarding_done") === "true";
  
  if (isCapacitor && !onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }
  if (isCapacitor) {
    return <BookPickup />;
  }
  return <Home />;
}

const DASHBOARD_ROUTES = ["/admin-dashboard", "/collector-dashboard", "/franchise-dashboard"];

function NavbarWrapper() {
  const location = useLocation();
  const isDashboard = DASHBOARD_ROUTES.some(r => location.pathname.startsWith(r));
  if (isMobileEnvironment() || isDashboard) return null;
  return <Navbar />;
}

function App() {
  const [showSplash, setShowSplash] = React.useState(() => {
    // Show splash once per session or on app load
    const sessionSeen = sessionStorage.getItem("splash_seen");
    return !sessionSeen;
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem("splash_seen", "true");
    setShowSplash(false);
  };

  // Initialize Native Features & Push Notifications
  React.useEffect(() => {
    requestNotificationPermission();
    if (isNativeApp()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: "#0b8f3a" }).catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <NativeOfflineBanner />
      <BrowserRouter>
        <GlobalLoader />
        <NavbarWrapper />
        <MobileAppShell>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<InitialHomeScreen />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/splash" element={<SplashScreen onFinish={() => window.location.href="/onboarding"} />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/rates" element={<Rates />} />
            <Route path="/login" element={<Login />} />
            <Route path="/book" element={<BookPickup />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
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
            <Route path="/admin" element={<Navigate to="/admin-login" replace />} />
            <Route path="/admin/login" element={<Navigate to="/admin-login" replace />} />
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
            <Route path="/franchise" element={<Navigate to="/franchise-login" replace />} />
            <Route path="/franchise/login" element={<Navigate to="/franchise-login" replace />} />
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
            <Route path="/collector" element={<Navigate to="/collector-login" replace />} />
            <Route path="/collector/login" element={<Navigate to="/collector-login" replace />} />
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
        </MobileAppShell>
        <FloatingActions />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;