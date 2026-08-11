/**
 * src/utils/auth.js
 *
 * SCRAPVEX — Centralised Authentication Storage Layer
 *
 * Architecture:
 *   - PRIMARY store: capacitor-secure-storage-plugin on Android
 *     (backed by Android Keystore via AES-256 encrypted SharedPreferences)
 *   - FALLBACK store: localStorage only (web browser, Capacitor not available)
 *   - document.cookie is NOT used for JWT or role storage.
 *     Cookies are retained only for legacy UI compatibility for non-auth data.
 *
 * IMPORTANT: This module intentionally does NOT use document.cookie for tokens.
 * Cross-domain Vercel/Render architecture prevents HttpOnly server-set cookies.
 * Bearer token via Authorization header is the correct transport for this SPA/API topology.
 *
 * Token is NEVER placed in URL parameters, query strings, or route paths.
 */

import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import API from "../services/api";

// Determine if running inside a native Capacitor container (Android/iOS)
const isNativeApp = () =>
  typeof Capacitor !== "undefined" && Capacitor.isNativePlatform();

// Use static plugin import directly
const getSecureStorage = () => {
  return SecureStoragePlugin;
};
/* ─── Write Auth Data ─────────────────────────────────────────── */
export async function saveAuthData(token, user, role) {
  if (isNativeApp()) {
    try {
      const ss = SecureStoragePlugin;
      if (ss) {
        await ss.set({ key: "auth_token", value: token });
        await ss.set({ key: "auth_user", value: JSON.stringify(user) });
        await ss.set({ key: "auth_role", value: role });
        return; // stored natively — do NOT write to localStorage
      }
    } catch (e) {
      console.warn("[Auth] Native secure storage write failed:", e);
    }
  } else {
    // Web browser
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);
  }
}

/* ─── Read Token ──────────────────────────────────────────────── */
export async function getAuthToken() {
  if (isNativeApp()) {
    try {
      const ss = getSecureStorage();
      if (ss) {
        const result = await ss.get({ key: "auth_token" });
        return result?.value || null;
      }
    } catch {
      // fallthrough
    }
  }
  return localStorage.getItem("token") || null;
}

/* ─── Read User ───────────────────────────────────────────────── */
export async function getAuthUser() {
  if (isNativeApp()) {
    try {
      const ss = getSecureStorage();
      if (ss) {
        const result = await ss.get({ key: "auth_user" });
        if (result?.value) return JSON.parse(result.value);
      }
    } catch {
      // fallthrough
    }
  }
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ─── Read Role ───────────────────────────────────────────────── */
export async function getAuthRole() {
  if (isNativeApp()) {
    try {
      const ss = getSecureStorage();
      if (ss) {
        const result = await ss.get({ key: "auth_role" });
        return result?.value || null;
      }
    } catch {
      // fallthrough
    }
  }
  return localStorage.getItem("role") || null;
}

/* ─── Clear Auth Data (client-side) ──────────────────────────── */
export async function clearAuthData() {
  if (isNativeApp()) {
    try {
      const ss = getSecureStorage();
      if (ss) {
        await ss.remove({ key: "auth_token" });
        await ss.remove({ key: "auth_user" });
        await ss.remove({ key: "auth_role" });
      }
    } catch (e) {
      console.warn("[Auth] Native secure storage clear failed:", e);
    }
  }
  // Always clear localStorage (web) — on native this is a safety belt
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
}

/* ─── Full Logout ─────────────────────────────────────────────── */
/**
 * Performs server-side session invalidation then clears client-side storage.
 * The server removes the sessionId from user.activeSessions in MongoDB.
 * After this call, the old token returns 401 on any protected endpoint.
 */
export async function performLogout() {
  try {
    const token = await getAuthToken();
    if (token) {
      await API.post("/auth/logout"); // server removes this sessionId
    }
  } catch (e) {
    // Swallow network errors so logout always clears client state
    console.warn("[Auth] Server logout call failed (clearing client state anyway):", e?.message);
  }
  await clearAuthData();
}
