import React, { useState, useEffect } from "react";
import { FaRecycle } from "react-icons/fa";
import API from "../services/api";

function GlobalLoader() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  // Intercept API requests to show loader only for long-running cold starts (> 2.5s)
  useEffect(() => {
    let reqCount = 0;
    let timer = null;

    const reqInterceptor = API.interceptors.request.use((config) => {
      if (config.hideLoader) return config;
      reqCount++;
      if (reqCount === 1) {
        // Show clean loader if backend takes > 2500ms
        timer = setTimeout(() => {
          setLoading(true);
          setLoadingText("Loading...");
        }, 2500);
      }
      return config;
    });

    const resInterceptor = API.interceptors.response.use(
      (response) => {
        if (response.config?.hideLoader) return response;
        reqCount = Math.max(0, reqCount - 1);
        if (reqCount === 0) {
          clearTimeout(timer);
          setLoading(false);
        }
        return response;
      },
      (error) => {
        if (error.config?.hideLoader) return Promise.reject(error);
        reqCount = Math.max(0, reqCount - 1);
        if (reqCount === 0) {
          clearTimeout(timer);
          setLoading(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.request.eject(reqInterceptor);
      API.interceptors.response.eject(resInterceptor);
    };
  }, []);

  if (!loading) return null;

  return (
    <div style={overlayStyle}>
      <div style={cardStyle} className="pulse-card">
        <div style={logoCircleStyle}>
          <FaRecycle style={iconStyle} className="spin" />
        </div>
        <h3 style={titleStyle}>{loadingText}</h3>
        <p style={subStyle}>Jammu & Kashmir's Digital Recycling Portal</p>
        <div style={barWrapStyle}>
          <div style={barInnerStyle} className="animated-progress-bar" />
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(9, 13, 22, 0.75)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 99999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px"
};

const cardStyle = {
  background: "var(--card-bg, #ffffff)",
  padding: "30px 40px",
  borderRadius: "24px",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  maxWidth: "340px",
  width: "100%",
  border: "1.5px solid var(--card-border, rgba(11, 143, 58, 0.2))"
};

const logoCircleStyle = {
  width: "65px",
  height: "65px",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #0b8f3a 0%, #086b2b 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 8px 20px rgba(11, 143, 58, 0.35)"
};

const iconStyle = {
  fontSize: "32px",
  color: "#ffffff"
};

const titleStyle = {
  margin: "6px 0 0 0",
  fontSize: "16px",
  fontWeight: "800",
  color: "var(--text-main, #0f172a)",
  letterSpacing: "-0.3px"
};

const subStyle = {
  margin: 0,
  fontSize: "12px",
  color: "var(--text-muted, #64748b)",
  fontWeight: "500"
};

const barWrapStyle = {
  width: "100%",
  height: "6px",
  background: "#e2e8f0",
  borderRadius: "999px",
  overflow: "hidden",
  marginTop: "10px"
};

const barInnerStyle = {
  height: "100%",
  width: "100%",
  background: "linear-gradient(90deg, #0b8f3a, #10b981, #0b8f3a)",
  backgroundSize: "200% 100%",
  borderRadius: "999px"
};

export default GlobalLoader;
