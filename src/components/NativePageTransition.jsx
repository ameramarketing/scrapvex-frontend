import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isNativeApp } from "../platform/platform";

export default function NativePageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) {
      setDisplayLocation(location);
      return;
    }

    if (location.pathname !== displayLocation.pathname) {
      setTransitioning(true);
      
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitioning(false);
      }, 150); // 150ms fade

      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  if (!isNativeApp()) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        opacity: transitioning ? 0.4 : 1,
        transform: transitioning ? "translateY(5px)" : "translateY(0px)",
        transition: "opacity 0.15s ease-in-out, transform 0.15s ease-out",
        height: "100%",
        width: "100%",
      }}
    >
      {/* We map the children's display over the displayLocation state to crossfade. 
          React Router usually handles this automatically if you wrap Routes, 
          but for simplicity in AppShell we just fade the container itself. */}
      {children}
    </div>
  );
}
