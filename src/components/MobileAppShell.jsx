import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTruck, FaTags, FaHistory, FaUser, FaPlus, FaWallet, FaRecycle, FaHome, FaChartLine, FaBoxes, FaStore } from "react-icons/fa";
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

  useBackButton();

  const hideShellRoutes = [
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

  const isCollector = user?.role === "collector" || location.pathname.startsWith("/collector-dashboard");
  const isFranchise = user?.role === "franchise" || location.pathname.startsWith("/franchise-dashboard");
  const isAdmin = user?.role === "admin" || location.pathname.startsWith("/admin-dashboard");

  const collectorNavItems = [
    { label: "Overview", icon: <FaRecycle />, tab: "overview", path: "/collector-dashboard?tab=overview" },
    { label: "Pickups", icon: <FaTruck />, tab: "mypickups", path: "/collector-dashboard?tab=mypickups" },
    { label: "Wallet", icon: <FaWallet />, tab: "wallet", path: "/collector-dashboard?tab=wallet" },
    { label: "History", icon: <FaHistory />, tab: "history", path: "/collector-dashboard?tab=history" },
    { label: "Account", icon: <FaUser />, tab: "profile", path: "/collector-dashboard?tab=profile" }
  ];

  const franchiseNavItems = [
    { label: "Home", icon: <FaHome />, tab: "overview", path: "/franchise-dashboard?tab=overview" },
    { label: "Pickups", icon: <FaTruck />, tab: "pickups", path: "/franchise-dashboard?tab=pickups" },
    { label: "Accounting", icon: <FaChartLine />, tab: "accounting", path: "/franchise-dashboard?tab=accounting" },
    { label: "Inventory", icon: <FaBoxes />, tab: "inventory", path: "/franchise-dashboard?tab=inventory" },
    { label: "Wallet", icon: <FaWallet />, tab: "wallet", path: "/franchise-dashboard?tab=wallet" },
    { label: "Account", icon: <FaUser />, tab: "account", path: "/franchise-dashboard?tab=account" }
  ];

  const adminNavItems = [
    { label: "Overview", icon: <FaRecycle />, tab: "overview", path: "/admin-dashboard?tab=overview" },
    { label: "Pickups", icon: <FaTruck />, tab: "pickups", path: "/admin-dashboard?tab=pickups" },
    { label: "Franchise", icon: <FaStore />, tab: "franchises", path: "/admin-dashboard?tab=franchises" },
    { label: "Wallet", icon: <FaWallet />, tab: "wallet", path: "/admin-dashboard?tab=wallet" },
    { label: "Account", icon: <FaUser />, tab: "account", path: "/admin-dashboard?tab=account" }
  ];

  const userNavItems = [
    { label: "Home", icon: <FaTruck />, path: "/" },
    { label: "Rates", icon: <FaTags />, path: "/rates" },
    { label: "Book", icon: <FaPlus />, path: "/book", isCenterBtn: true },
    { label: "My Pickups", icon: <FaHistory />, path: user ? "/my-pickups" : "/login" },
    { label: "Account", icon: <FaUser />, path: user ? "/profile" : "/login" }
  ];

  const bottomNavItems = isCollector
    ? collectorNavItems
    : isFranchise
    ? franchiseNavItems
    : isAdmin
    ? adminNavItems
    : userNavItems;

  if (!isMobileDevice) {
    return children;
  }

  const isCustomDashboard = isCollector || isFranchise || isAdmin;

  return (
    <div style={nativeAppWrapper}>
      {!isCustomDashboard && <MobileHeader />}
      <main style={nativeMainContent}>
        <NativePageTransition>{children}</NativePageTransition>
      </main>

      {/* Native Bottom Navigation Bar */}
      <nav style={nativeBottomNav}>
        {bottomNavItems.map((item, idx) => {
          const currentTab = new URLSearchParams(location.search).get("tab") || "overview";
          const isActive = isCustomDashboard ? (currentTab === item.tab) : (location.pathname === item.path);
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
                color: isActive ? "#0b8f3a" : "#64748b"
              }}
            >
              <div style={{ fontSize: "17px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: "9px",
                fontWeight: isActive ? "800" : "600",
                marginTop: "2px",
                lineHeight: "1.1",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
                textAlign: "center"
              }}>
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
  background: "var(--bg-main)",
  display: "flex",
  flexDirection: "column",
  paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
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
  height: "62px",
  background: "var(--card-bg, #ffffff)",
  borderTop: "1px solid var(--card-border, #e2e8f0)",
  boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  zIndex: 99999,
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
  boxSizing: "border-box"
};

const navTabBtn = {
  background: "none",
  border: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flex: "1 1 0px",
  width: 0,
  minWidth: 0,
  height: "100%",
  padding: "2px 0",
  transition: "transform 0.15s ease",
  outline: "none"
};

const centerFabBtn = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #0b8f3a 0%, #16a34a 100%)",
  color: "#ffffff",
  border: "2.5px solid #ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  boxShadow: "0 8px 20px rgba(11,143,58,0.3)",
  cursor: "pointer",
  transform: "translateY(-12px)",
  transition: "transform 0.15s ease",
  outline: "none"
};

export default MobileAppShell;
