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
import API from "./services/api";

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

  const [appSettings, setAppSettings] = useState(null);

  // Initialize Native Features & Push Notifications & Render Keep-Alive Ping
  React.useEffect(() => {
    requestNotificationPermission();
    if (isNativeApp()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: "#0b8f3a" }).catch(() => {});
    }

    // Fetch settings for maintenance mode check
    const pingBackend = () => {
      API.get("/settings", { hideLoader: true }).then(res => {
        if (res.data?.success) setAppSettings(res.data.data);
      }).catch(() => {});
    };

    // Check background notifications every 60 seconds, only if user is logged in
    const checkBackgroundNotifs = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        const { data } = await API.get("/notifications?limit=5", { hideLoader: true });
        if (data && data.success && Array.isArray(data.data)) {
          const unread = data.data.filter(n => n && !n.isRead);
          if (unread.length > 0) {
            const latest = unread[0];
            triggerNativeNotification(latest.title || "ScrapVex Notification", latest.message, latest._id);
          }
        }
      } catch (e) {}
    };

    pingBackend();
    const interval = setInterval(pingBackend, 5 * 60 * 1000);
    const notifStartDelay = setTimeout(() => {
      checkBackgroundNotifs();
    }, 10000);
    const notifInterval = setInterval(checkBackgroundNotifs, 60 * 1000);
    return () => {
      clearInterval(interval);
      clearInterval(notifInterval);
      clearTimeout(notifStartDelay);
    };
  }, []);

  const loggedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch(e) { return {}; }
  })();

  const isMaintenanceActive = appSettings?.isMaintenanceMode && loggedUser.role !== "admin" && !window.location.pathname.startsWith("/admin");

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <NativeOfflineBanner />
      {isMaintenanceActive ? (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background: "var(--bg-main, #f8fafc)",
          color: "var(--text-main, #0f172a)"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            border: "1.5px solid var(--card-border, #e2e8f0)",
            borderRadius: "24px",
            padding: "36px 24px",
            maxWidth: "460px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🛠️</div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 10px 0" }}>Under Scheduled Maintenance</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted, #64748b)", lineHeight: "1.6", margin: "0 0 20px 0" }}>
              {appSettings?.maintenanceMessage || "ScrapVex is undergoing scheduled upgrades to serve you better in Jammu & Kashmir. We will be back shortly!"}
            </p>
            <div style={{
              padding: "12px",
              background: "var(--primary-light, #f0fdf4)",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#166534"
            }}>
              📞 Urgent Queries? Call: {appSettings?.contactPhone || "8491028539"}
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </ThemeProvider>
  );
}

export default App;