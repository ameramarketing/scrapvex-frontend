import axios from "axios";
import { eraseCookie } from "../utils/cookies";
import { getAuthToken, clearAuthData } from "../utils/auth";

let envUrl = import.meta.env.VITE_API_URL || "https://scrapvex-backend.onrender.com";

// Support custom override or native platform fallback
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("CUSTOM_API_URL");
    if (customUrl) return `${customUrl.replace(/\/$/, "")}/api`;

    const origin = window.location.origin || "";
    if (origin.includes("localhost") || origin.includes("capacitor://") || origin.includes("127.0.0.1")) {
      return "https://scrapvex-backend.onrender.com/api";
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
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear auth via unified mechanism
      await clearAuthData();
      // Clear legacy cookies if still present
      eraseCookie("token");
      eraseCookie("user");
      eraseCookie("role");
      window.location.href = "/";
    }
    if (!error.response && (error.message === "Network Error" || error.code === "ERR_NETWORK")) {
      error.customMessage = "Server unreachable. Ensure mobile device can connect to backend server IP!";
    }
    return Promise.reject(error);
  }
);

export default API;
