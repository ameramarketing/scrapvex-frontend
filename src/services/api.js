import axios from "axios";
import { getCookie, eraseCookie } from "../utils/cookies";

let envUrl = import.meta.env.VITE_API_URL || "";

// Support custom override or native platform fallback
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("CUSTOM_API_URL");
    if (customUrl) return `${customUrl.replace(/\/$/, "")}/api`;
  }
  if (!envUrl && typeof window !== "undefined") {
    envUrl = window.location.origin;
  }
  return `${envUrl.replace(/\/$/, "")}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});

API.interceptors.request.use((req) => {
  // Ensure baseURL stays fresh if CUSTOM_API_URL is updated
  req.baseURL = getBaseURL();
  let token = localStorage.getItem("token");

  // Fallback to cookies if localStorage was cleared/not loaded
  if (!token) {
    token = getCookie("token");
    if (token) {
      localStorage.setItem("token", token);
      const user = getCookie("user");
      const role = getCookie("role");
      if (user) localStorage.setItem("user", user);
      if (role) localStorage.setItem("role", role);
    }
  }

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.clear();
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
