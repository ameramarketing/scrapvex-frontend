import axios from "axios";
import { getCookie, eraseCookie } from "../utils/cookies";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

API.interceptors.request.use((req) => {
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
    return Promise.reject(error);
  }
);

export default API;
