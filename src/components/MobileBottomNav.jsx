import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTruck, FaTag, FaClipboardList, FaUser } from "react-icons/fa";

function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide bottom nav on admin dashboard, collector dashboard, franchise dashboard
  const hideOnRoutes = ["/admin-dashboard", "/collector-dashboard", "/franchise-dashboard", "/admin-login", "/collector-login", "/franchise-login"];
  if (hideOnRoutes.some(r => location.pathname.startsWith(r))) {
    return null;
  }

  const user = localStorage.getItem("user");
  const profileRoute = user ? "/profile" : "/login";

  const navItems = [
    { label: "Book Pickup", icon: <FaTruck />, path: "/book" },
    { label: "Rates", icon: <FaTag />, path: "/rates" },
    { label: "My Pickups", icon: <FaClipboardList />, path: user ? "/my-pickups" : "/login" },
    { label: "Profile", icon: <FaUser />, path: profileRoute },
  ];

  return (
    <>
      <div className="mobile-bottom-nav">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path === "/book" && location.pathname === "/");
          return (
            <button
              key={idx}
              className={`mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--card-bg, #ffffff);
          border-top: 1px solid var(--glass-border, rgba(0,0,0,0.08));
          box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
          z-index: 9999;
          justify-content: space-around;
          align-items: center;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .mobile-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-muted, #718096);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 6px 0;
        }

        .nav-icon {
          font-size: 20px;
          margin-bottom: 2px;
          transition: transform 0.2s ease;
        }

        .mobile-nav-item.active {
          color: var(--primary, #0b8f3a);
        }

        .mobile-nav-item.active .nav-icon {
          transform: translateY(-2px) scale(1.1);
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
          }
          body {
            padding-bottom: 64px;
          }
        }
      `}</style>
    </>
  );
}

export default MobileBottomNav;
