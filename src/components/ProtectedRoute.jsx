import React, {
  useEffect,
  useState
} from "react";
import {
  Navigate
} from "react-router-dom";
import {
  FaRecycle
} from "react-icons/fa";


function ProtectedRoute({
  children,
  role
}) {
  const [loading, setLoading] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    const timer =
      setTimeout(() => {
        let user = localStorage.getItem("user");
        let currentRole = localStorage.getItem("role");

        /* Admin / Collector */
        if (role) {
          if (
            currentRole === role
          ) {
            setAllowed(true);
          } else {
            setAllowed(false);
          }
        } else {
          /* Normal User */
          if (user && (currentRole === "user" || !currentRole)) {
            setAllowed(true);
          } else {
            setAllowed(false);
          }
        }

        setLoading(false);
      }, 700);

    return () =>
      clearTimeout(timer);
  }, [role]);

  /* PREMIUM LOADER */
  if (loading) {
    return (
      <div style={loaderWrap}>
        <div style={loaderCard}>
          <div style={logoArea}>
             <div style={spinBox}><FaRecycle /></div>
             <h2 style={logoText}>Scrapvex</h2>
          </div>
          
          <div style={progressContainer}>
             <div style={progressBar}></div>
          </div>

          <p style={sub}>
             Establishing Secure Session...
          </p>
        </div>
      </div>
    );
  }

  /* BLOCKED */
  if (!allowed) {
    let redirectPath = "/login";
    if (role === "admin") redirectPath = "/admin-login";
    if (role === "collector") redirectPath = "/collector-login";
    if (role === "franchise") redirectPath = "/franchise-login";
    
    return (
      <Navigate to={redirectPath} />
    );
  }

  /* ALLOWED */
  return children;
}

/* styles */
const loaderWrap = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "var(--bg-main)",
  transition: "all 0.3s ease"
};

const loaderCard = {
  background: "var(--card-bg)",
  padding: "45px",
  borderRadius: "32px",
  textAlign: "center",
  minWidth: "350px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.1)",
  border: "1px solid var(--glass-border)"
};

const logoArea = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  marginBottom: "30px"
};

const logoText = {
  fontSize: "28px",
  fontWeight: "800",
  color: "var(--primary)",
  margin: 0,
  letterSpacing: "1px"
};

const spinBox = {
  width: "60px",
  height: "60px",
  borderRadius: "18px",
  background: "var(--primary-light)",
  color: "var(--primary)",
  fontSize: "28px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: "spin 2s linear infinite"
};

const progressContainer = {
  width: "100%",
  height: "6px",
  background: "var(--primary-light)",
  borderRadius: "10px",
  overflow: "hidden",
  marginBottom: "20px"
};

const progressBar = {
  width: "40%",
  height: "100%",
  background: "var(--primary)",
  borderRadius: "10px",
  animation: "loadingLine 1.5s ease-in-out infinite"
};

const sub = {
  color: "var(--text-muted)",
  fontSize: "14px",
  fontWeight: "500"
};

export default ProtectedRoute;