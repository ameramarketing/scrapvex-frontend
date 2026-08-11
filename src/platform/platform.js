import { Capacitor } from "@capacitor/core";

/**
 * Platform Detection Utilities
 * Uses official Capacitor APIs to distinguish environments.
 */

// Returns true if running natively inside Android/iOS APK/IPA
export const isNativeApp = () => {
  return typeof Capacitor !== "undefined" && Capacitor.isNativePlatform();
};

// Returns true only on Android native
export const isAndroidApp = () => {
  return isNativeApp() && Capacitor.getPlatform() === "android";
};

// Returns true if running in ANY mobile environment (native or mobile web)
export const isMobileEnvironment = () => {
  if (isNativeApp()) return true;
  if (typeof window !== "undefined") {
    // Basic viewport check for mobile web fallback
    return window.innerWidth <= 768 || window.location.search.includes("app=true") || window.location.search.includes("view=mobile");
  }
  return false;
};

// Returns true if running purely on the web (desktop or mobile browser)
export const isWeb = () => {
  return !isNativeApp();
};
