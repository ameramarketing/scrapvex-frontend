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
        transition: "opacity 0.15s ease-in-out",
        height: "100%",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}
