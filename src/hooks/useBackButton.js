import { useEffect, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { isNativeApp } from "../platform/platform";
import { useNavigate, useLocation } from "react-router-dom";

export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressRef = useRef(0);

  useEffect(() => {
    if (!isNativeApp()) return;

    // Listen to hardware back button / Android gesture navigation
    const listener = CapacitorApp.addListener("backButton", () => {
      // 1. If any modal, drawer, or overlay is open in the DOM, close it first
      const closeButtons = document.querySelectorAll(".modal-sheet button, .modal-overlay button, .modalBox button, [aria-label='Close'], .drawerCloseBtn");
      const openModal = document.querySelector(".modal-overlay, [style*='position: fixed'][style*='z-index: 9999'], [style*='position: fixed'][style*='z-index: 2000']");
      
      // Also dispatch Escape key event for standard dialogs
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

      // 2. Determine if user is at root home screen
      const isHome = location.pathname === "/" || location.pathname === "";

      if (!isHome) {
        // Navigate back in history
        navigate(-1);
      } else {
        // Double-tap to exit protection on root home screen
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          CapacitorApp.minimizeApp();
        } else {
          lastBackPressRef.current = now;
          const toast = document.createElement("div");
          toast.id = "back-exit-toast";
          toast.innerText = "Press back again to exit ScrapVex";
          toast.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.9);color:#ffffff;padding:10px 20px;border-radius:30px;font-size:12px;font-weight:700;z-index:9999999;box-shadow:0 10px 25px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);pointer-events:none;";
          document.body.appendChild(toast);
          setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
          }, 2000);
        }
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate, location]);
}
