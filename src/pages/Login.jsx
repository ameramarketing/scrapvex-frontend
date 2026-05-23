import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaArrowRight, FaSpinner, FaUserShield } from "react-icons/fa";
import { setCookie, getCookie } from "../utils/cookies";

import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user") || getCookie("user");
    const role = localStorage.getItem("role") || getCookie("role");
    if (rawUser && role === "user") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) return showToast("error", "Enter valid 10-digit mobile number");
    if (!password) return showToast("error", "Enter your password");

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { mobile, password });
      
      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "user");

      // Store in Cookies
      setCookie("token", data.token);
      setCookie("user", JSON.stringify(data.user));
      setCookie("role", "user");

      showToast("success", "Welcome back! 🎉");
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh" }}>
      <Navbar />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <div className="container" style={wrap}>
        <div className="card-premium fade-up" style={card}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={iconCircle}><FaUserShield /></div>
            <h1 style={{ fontSize: "28px", margin: "10px 0" }}>Login</h1>
            <p style={{ color: "#666", fontSize: "14px" }}>Manage your scrap bookings easily</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={inputGroup}>
              <FaPhoneAlt style={icon} />
              <input
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={input}
              />
            </div>

            <div style={inputGroup}>
              <FaLock style={icon} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={input}
              />
            </div>

            <div style={{ textAlign: "right" }}>
              <Link to="/forgot-password?role=user" style={forgotLink}>Forgot Password?</Link>
            </div>

            <button type="submit" className="btn-premium" style={{ marginTop: "10px" }} disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <>Login <FaArrowRight /></>}
            </button>
          </form>

          <div style={footerText}>
            <p>New user? <Link to="/register" style={authLink}>Create Account</Link></p>
            <div style={divider} />
            <Link to="/collector-login" style={{ ...authLink, fontSize: "13px", opacity: 0.8 }}>Login as Collector</Link>
          </div>
        </div>
      </div>

    </div>
  );
}

/* STYLES */
const wrap = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 200px)", padding: "40px 20px" };
const card = { width: "100%", maxWidth: "420px", padding: "40px" };
const iconCircle = { width: "80px", height: "80px", background: "var(--primary-light)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "35px", color: "var(--primary)", margin: "0 auto" };
const inputGroup = { display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-main)", padding: "14px 18px", borderRadius: "12px", border: "1px solid var(--glass-border)" };
const icon = { color: "#0b8f3a", fontSize: "14px" };
const input = { border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "15px", color: "var(--text-main)" };
const forgotLink = { color: "#0b8f3a", fontSize: "13px", textDecoration: "none", fontWeight: "600" };
const footerText = { marginTop: "30px", textAlign: "center", fontSize: "14px", color: "#666" };
const authLink = { color: "#0b8f3a", fontWeight: "700", textDecoration: "none" };
const divider = { height: "1px", background: "#eee", margin: "15px auto", width: "50%" };

export default Login;