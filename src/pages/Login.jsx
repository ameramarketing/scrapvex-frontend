import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaArrowRight, FaUserShield, FaEye, FaEyeSlash, FaRecycle } from "react-icons/fa";
import { saveAuthData } from "../utils/auth";

import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");
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
      
      // Securely store auth data (Keystore on Android, localStorage on web)
      await saveAuthData(data.token, data.user, "user");

      showToast("success", "Welcome back! 🎉");
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      showToast("error", error.response?.data?.message || error.customMessage || error.message || "Login Failed");
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

            <div style={{ ...inputGroup, position: "relative" }}>
              <FaLock style={icon} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...input, paddingRight: "45px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeBtn}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div style={{ textAlign: "right" }}>
              <Link to="/forgot-password?role=user" style={forgotLink}>Forgot Password?</Link>
            </div>

            <button type="submit" className="btn-premium" style={{ marginTop: "10px" }} disabled={loading}>
              {loading ? <FaRecycle className="spin" /> : <>Login <FaArrowRight /></>}
            </button>
          </form>

          <div style={footerText}>
            <p>New user? <Link to="/register" style={authLink}>Create Account</Link></p>
            <div style={divider} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
              <Link to="/collector-login" style={roleLoginBtn}> Login as Collector</Link>
              <Link to="/franchise-login" style={roleLoginBtn}> Login as Franchise Partner</Link>
              <Link to="/admin-login" style={{ ...roleLoginBtn, background: "#f8fafc", color: "#64748b" }}> Login as System Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const wrap = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
  padding: "20px 0"
};

const card = {
  width: "100%",
  maxWidth: "440px",
  padding: "35px 30px",
  borderRadius: "24px"
};

const iconCircle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.2))",
  color: "var(--primary)",
  fontSize: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 10px"
};

const inputGroup = {
  display: "flex",
  alignItems: "center",
  background: "var(--bg-main)",
  border: "1.5px solid var(--border-color)",
  borderRadius: "14px",
  padding: "0 15px",
  transition: "all 0.3s ease"
};

const icon = {
  color: "#94a3b8",
  marginRight: "12px",
  fontSize: "16px"
};

const input = {
  width: "100%",
  padding: "14px 0",
  border: "none",
  background: "transparent",
  color: "var(--text-main)",
  fontSize: "15px",
  outline: "none"
};

const eyeBtn = {
  position: "absolute",
  right: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  padding: "4px"
};

const forgotLink = {
  color: "var(--primary)",
  fontSize: "13px",
  textDecoration: "none",
  fontWeight: "500"
};

const authLink = {
  color: "var(--primary)",
  fontWeight: "600",
  textDecoration: "none"
};

const footerText = {
  textAlign: "center",
  marginTop: "25px",
  fontSize: "14px",
  color: "#64748b"
};

const divider = {
  height: "1px",
  background: "var(--border-color)",
  margin: "15px 0"
};

const roleLoginBtn = {
  display: "block",
  padding: "10px",
  borderRadius: "10px",
  background: "var(--bg-main)",
  color: "var(--text-main)",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: "600",
  textAlign: "center",
  border: "1px solid var(--border-color)"
};

export default Login;