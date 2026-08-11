import React, { useEffect, useState } from "react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { isNativeApp } from "../platform/platform";

function NativeOfflineBanner() {
  const isOnline = useNetworkStatus();
  const [show, setShow] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;

    if (!isOnline) {
      setShow(true);
      setJustReconnected(false);
    } else if (isOnline && show) {
      // Transitioned from offline to online
      setJustReconnected(true);
      setTimeout(() => {
        setShow(false);
        setJustReconnected(false);
      }, 3000);
    }
  }, [isOnline]);

  if (!isNativeApp() || !show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px", // Just above bottom nav
        left: "50%",
        transform: "translateX(-50%)",
        background: justReconnected ? "#0b8f3a" : "#dc3545",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 10000,
        animation: "slideUp 0.3s ease-out",
        transition: "background 0.3s",
        whiteSpace: "nowrap"
      }}
    >
      {justReconnected ? "Back Online" : "No Internet Connection"}
    </div>
  );
}

export default NativeOfflineBanner;
