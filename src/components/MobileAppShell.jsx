import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTruck, FaTags, FaHistory, FaUser, FaPlus } from "react-icons/fa";
import MobileHeader from "./MobileHeader";
import NativePageTransition from "./NativePageTransition";
import { useBackButton } from "../hooks/useBackButton";
import { isMobileEnvironment } from "../platform/platform";

function MobileAppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileDevice, setIsMobileDevice] = useState(isMobileEnvironment());

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(isMobileEnvironment());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize back button handler for native apps
  useBackButton();

  // Hide mobile shell on Admin / Collector dashboards
  const hideShellRoutes = [
    "/admin-dashboard",
    "/collector-dashboard",
    "/franchise-dashboard",
    "/admin-login",
    "/collector-login",
    "/franchise-login",
    "/onboarding"
  ];
  if (hideShellRoutes.some((r) => location.pathname.startsWith(r))) {
    return children;
  }

  const user = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  const bottomNavItems = [
    { label: "Home", icon: <FaTruck />, path: "/book" },
    { label: "Rates", icon: <FaTags />, path: "/rates" },
    { label: "Book", icon: <FaPlus />, path: "/book", isCenterBtn: true },
    { label: "My Pickups", icon: <FaHistory />, path: user ? "/my-pickups" : "/login" },
    { label: "Account", icon: <FaUser />, path: user ? "/profile" : "/login" }
  ];

  // If viewing on Desktop Website, return children directly (100% original website layout, no preview bar)
  if (!isMobileDevice) {
    return children;
  }

  // Mobile Device Layout / Native APK Layout
  return (
    <div style={nativeAppWrapper}>
      <MobileHeader />
      <main style={nativeMainContent}>
        <NativePageTransition>{children}</NativePageTransition>
      </main>

      {/* Native Bottom Navigation Bar */}
      <nav style={nativeBottomNav}>
        {bottomNavItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          if (item.isCenterBtn) {
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                style={centerFabBtn}
              >
                <FaPlus />
              </button>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              style={{
                ...navTabBtn,
                color: isActive ? "#0b8f3a" : "#94a3b8"
              }}
            >
              <div style={{ fontSize: "18px" }}>{item.icon}</div>
              <span style={{ fontSize: "10px", fontWeight: isActive ? "700" : "500", marginTop: "2px" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* Inline Styles */
const nativeAppWrapper = {
  minHeight: "100vh",
  background: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  paddingBottom: "calc(76px + env(safe-area-inset-bottom, 0px))",
  overflowX: "hidden",
  width: "100%"
};

const nativeMainContent = {
  flex: 1
};

const nativeBottomNav = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: "68px",
  background: "#ffffff",
  borderTop: "1.5px solid #f1f5f9",
  boxShadow: "0 -6px 24px rgba(15,23,42,0.04)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  zIndex: 9999,
  paddingBottom: "env(safe-area-inset-bottom, 0px)"
};

const navTabBtn = {
  background: "none",
  border: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flex: 1,
  height: "100%",
  padding: "4px 0",
  transition: "transform 0.15s ease",
  outline: "none"
};

const centerFabBtn = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #0b8f3a 0%, #16a34a 100%)",
  color: "#ffffff",
  border: "2.5px solid #ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  boxShadow: "0 8px 20px rgba(11,143,58,0.3)",
  cursor: "pointer",
  transform: "translateY(-14px)",
  transition: "transform 0.15s ease",
  outline: "none"
};

export default MobileAppShell;
