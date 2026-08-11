import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { isNativeApp } from "../platform/platform";
import { useNavigate, useLocation } from "react-router-dom";

export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNativeApp()) return;

    let canGoBack = true;

    // Listen to hardware back button
    const listener = CapacitorApp.addListener("backButton", ({ canGoBack: capCanGoBack }) => {
      // 1. If there's an open modal or sheet, you could close it here.
      // (This usually requires global state or a generic modal manager, 
      // but for now we'll handle standard navigation)

      // 2. Determine if we are at the root app screens
      const rootPaths = ["/book", "/dashboard", "/admin-dashboard", "/collector-dashboard", "/franchise-dashboard", "/login", "/onboarding"];
      const isRoot = rootPaths.includes(location.pathname) || location.pathname === "/";

      if (!isRoot && capCanGoBack) {
        navigate(-1);
      } else {
        // We are on a root screen. Allow Capacitor to minimize or exit the app.
        CapacitorApp.minimizeApp();
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate, location]);
}
