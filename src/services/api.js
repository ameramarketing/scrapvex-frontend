import axios from "axios";
import { eraseCookie } from "../utils/cookies";
import { getAuthToken, clearAuthData } from "../utils/auth";
import { isNativeApp } from "../platform/platform";

let envUrl =
  import.meta.env.VITE_API_URL || "https://scrapvex-backend.onrender.com";

// Support custom override or native platform fallback
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("CUSTOM_API_URL");
    if (customUrl) return `${customUrl.replace(/\/$/, "")}/api`;

    // CRITICAL FIX: Capacitor Android uses https://localhost as its origin.
    // We must NOT route native apps to localhost:5000.
    const isCap = isNativeApp();
    
    // Only route to local backend if it's an actual browser in DEV mode
    if (!isCap && import.meta.env.DEV) {
      const origin = window.location.origin || "";
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return "http://localhost:5000/api";
      }
    }
  }
  
  const target = envUrl || "https://scrapvex-backend.onrender.com";
  return `${target.replace(/\/$/, "")}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000,
});

API.interceptors.request.use(async (req) => {
  req.baseURL = getBaseURL();

  // Primary: Async retrieval (Secure Keystore on Android, localStorage on Web)
  let token = null;
  try {
    token = await getAuthToken();
  } catch (e) {
    // Ignore read errors
  }

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => {
    // DIAGNOSTIC LOG (Success)
    const isCap = isNativeApp();
    if (isCap) {
      const url = response.config.url || "";
      if (url.includes("login") || url.includes("rates")) {
        console.log(`[CAPACITOR-API-SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.baseURL}${url}`);
        console.log(`[CAPACITOR-API-SUCCESS] Status: ${response.status}`);
        // NEVER log sensitive data for login, but log rates data
        if (url.includes("rates")) {
          console.log(`[CAPACITOR-API-SUCCESS] Data:`, response.data);
        }
      }
    }
    return response;
  },
  async (error) => {
    // DIAGNOSTIC LOG (Error)
    const isCap = isNativeApp();
    if (isCap || window.location.search.includes("app=true")) {
      const msg = `[API ERROR]\nMethod: ${error.config?.method?.toUpperCase()}\nURL: ${error.config?.baseURL}${error.config?.url}\nMsg: ${error.message}\nStatus: ${error.response?.status}`;
      console.log(msg);
      alert(msg);
    }

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Clear auth via unified mechanism
      await clearAuthData();
      // Clear legacy cookies if still present
      eraseCookie("token");
      eraseCookie("user");
      eraseCookie("role");
      window.location.href = "/";
    }
    if (
      !error.response &&
      (error.message === "Network Error" || error.code === "ERR_NETWORK")
    ) {
      error.customMessage =
        "Server unreachable. Ensure mobile device can connect to backend server IP!";
    }
    return Promise.reject(error);
  },
);

export default API;
