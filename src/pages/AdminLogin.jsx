import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserShield, FaEnvelope, FaLock, FaArrowRight, FaCheckCircle, FaSpinner, FaEye, FaEyeSlash
} from "react-icons/fa";
import Toast from "../components/Toast";
import API from "../services/api";
import { setCookie, getCookie } from "../utils/cookies";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  
  React.useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user") || getCookie("user");
      const role = localStorage.getItem("role") || getCookie("role");
      if (rawUser && rawUser !== "undefined" && rawUser !== "null" && role === "admin") {
        navigate("/admin-dashboard");
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [navigate]);

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) return showToast("error", "Enter admin email");
    if (!password) return showToast("error", "Enter password");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/admin-login", { email, password });
      
      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "admin");

      // Store in Cookies
      setCookie("token", data.token);
      setCookie("user", JSON.stringify(data.user));
      setCookie("role", "admin");

      showToast("success", "Admin Login Successful 🔐");
      setTimeout(() => navigate("/admin-dashboard"), 700);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      <div style={card} className="rate-card">
        <div style={topIcon}><FaUserShield /></div>
        <p style={tag}>Secure Hidden Access 🔒</p>
        <h1 style={title}>Admin Login</h1>
        <p style={sub}>Manage pickups, users, rates and analytics.</p>
        <div style={pillWrap}>
          <span style={pill}><FaCheckCircle /> Secure</span>
          <span style={pill}><FaCheckCircle /> Private</span>
        </div>
        <form onSubmit={handleLogin}>
          <div style={inputWrap}>
            <FaEnvelope style={icon} />
            <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
          </div>
          <div style={{ ...inputWrap, position: "relative" }}>
            <FaLock style={icon} />
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...input, paddingRight: "45px" }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", padding: "4px" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" style={btn} className="btn pulse-btn" disabled={loading}>
            {loading ? <><FaSpinner className="spin" /> Logging...</> : <>Login <FaArrowRight style={{ marginLeft: "8px" }} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "30px", background: "var(--bg-main)" };
const card = { width: "460px", background: "var(--card-bg)", padding: "36px", borderRadius: "28px", boxShadow: "0 25px 55px rgba(0,0,0,.08)", textAlign: "center", border: "1px solid var(--glass-border)" };
const topIcon = { fontSize: "70px", color: "var(--primary)", marginBottom: "10px" };
const tag = { color: "var(--primary)", fontWeight: "bold" };
const title = { margin: "12px 0", color: "var(--text-main)" };
const sub = { color: "var(--text-muted)", marginBottom: "18px" };
const pillWrap = { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "22px" };
const pill = { background: "var(--primary-light)", color: "var(--primary)", padding: "8px 12px", borderRadius: "999px", fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" };
const inputWrap = { display: "flex", gap: "12px", alignItems: "center", background: "var(--bg-main)", padding: "14px 16px", borderRadius: "14px", marginBottom: "14px", border: "1px solid var(--glass-border)" };
const icon = { color: "var(--primary)" };
const input = { border: "none", outline: "none", background: "transparent", width: "100%", color: "var(--text-main)" };
const btn = { width: "100%", border: "none", padding: "14px", borderRadius: "14px", background: "var(--primary)", color: "#fff", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" };

export default AdminLogin;