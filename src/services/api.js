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
  timeout: 60000,
});

// Fast In-Memory & Session Cache for 100x Instant Rendering (0ms latency on repeated views)
const apiCache = new Map();
const CACHE_TTL_MS = 25000; // 25 seconds fast freshness window

API.interceptors.request.use(async (req) => {
  req.baseURL = getBaseURL();

  // Invalidate cache on mutations (POST, PUT, DELETE, PATCH)
  if (req.method && req.method.toLowerCase() !== "get") {
    apiCache.clear();
  }

  // Primary: Async retrieval (Secure Keystore on Android, localStorage on Web)
  let token = null;
  try {
    token = await getAuthToken();
  } catch (e) {}

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // Fast Cache Check for public & frequent GET requests
  if (req.method?.toLowerCase() === "get" && !req.headers["x-skip-cache"]) {
    const cacheKey = `${req.baseURL || ""}${req.url || ""}`;
    const cachedEntry = apiCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      req.adapter = () => Promise.resolve({
        data: JSON.parse(JSON.stringify(cachedEntry.data)),
        status: 200,
        statusText: "OK (Memory-Cached)",
        headers: req.headers,
        config: req,
        request: {}
      });
    }
  }

  return req;
});

API.interceptors.response.use(
  (response) => {
    const isCap = isNativeApp();
    const url = response.config?.url || "";

    // Cache successful GET responses for instant future rendering
    if (response.config?.method?.toLowerCase() === "get" && response.status === 200 && response.data) {
      const cacheKey = `${response.config.baseURL || ""}${url}`;
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    if (isCap) {
      if (url.includes("login") || url.includes("rates")) {
        console.log(`[CAPACITOR-API-SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.baseURL}${url}`);
        console.log(`[CAPACITOR-API-SUCCESS] Status: ${response.status}`);
        if (url.includes("rates")) {
          console.log(`[CAPACITOR-API-SUCCESS] Data:`, response.data);
        }
      }
    }
    return response;
  },
  async (error) => {
    const isCap = isNativeApp();
    const url = error.config?.url || "";

    // Log login failure
    if (url.includes("login")) {
      console.log(`[LOGIN RESPONSE] Status: ${error.response?.status} | Data:`, error.response?.data);
    }

    if (isCap || window.location.search.includes("app=true")) {
      const msg = `[API ERROR] Method: ${error.config?.method?.toUpperCase()} | URL: ${error.config?.baseURL}${error.config?.url} | Msg: ${error.message} | Status: ${error.response?.status}`;
      console.log(msg);
      // Removed alert(msg) per production rules
    }

    // Auto-logout on 401/403 for non-login and non-public endpoints
    // Public endpoints (scrap-items, price-history, cities, etc.) should NOT trigger logout
    const publicEndpoints = ["scrap-items", "price-history", "cities", "pickups/vote-area", "settings"];
    const isPublicEndpoint = publicEndpoints.some(ep => url.includes(ep));

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !url.includes("login") &&
      !isPublicEndpoint
    ) {
      await clearAuthData();
      eraseCookie("token");
      eraseCookie("user");
      eraseCookie("role");
      // Redirect to login page instead of home to avoid confusing redirects on public pages
      window.location.href = "/login";
    }

    // Map custom messages to propagate to UI Toast components
    if (error.response) {
      const status = error.response.status;
      const backendMessage = error.response.data?.message;

      if (status === 400) {
        error.customMessage = backendMessage || "Invalid request parameters.";
      } else if (status === 401) {
        error.customMessage = "Invalid mobile number or password.";
      } else if (status === 403) {
        error.customMessage = "Access denied. You do not have permission for this action.";
      } else if (status >= 500) {
        error.customMessage = "Server is temporarily unavailable. Please try again later.";
      } else {
        error.customMessage = backendMessage || `Request failed: HTTP ${status}`;
      }
    } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      error.customMessage = "Unable to connect to server. Please check your internet connection.";
    }

    return Promise.reject(error);
  },
);

export default API;
