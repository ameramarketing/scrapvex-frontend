import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserShield, FaEnvelope, FaLock, FaArrowRight, FaCheckCircle, FaHome, FaRecycle, FaEye, FaEyeSlash } from "react-icons/fa";
import Toast from "../components/Toast";
import API from "../services/api";
import { saveAuthData, getAuthUser, getAuthRole } from "../utils/auth";

function AdminLogin() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkLogged = async () => {
      const rawUser = await getAuthUser();
      const role = await getAuthRole();
      if (rawUser && role === "admin") {
        navigate("/admin-dashboard");
      }
    };
    checkLogged();
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return showToast("error", "Enter email or mobile number");
    if (!password) return showToast("error", "Enter password");

    setLoading(true);
    try {
      const { data } = await API.post("/auth/admin-login", { email: email, password });

      await saveAuthData(data.token, data.user, "admin");

      showToast("success", "Admin Login Successful 🎉");
      setTimeout(() => navigate("/admin-dashboard"), 700);
    } catch (error) {
      showToast("error", error.response?.data?.message || error.customMessage || error.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--card-bg);
          padding: 30px 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
        }
        .auth-logo-circle {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: #f0fdf4;
          color: var(--primary);
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          border: 1.5px solid #dcfce7;
        }
        .auth-input-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 14px;
          border: 1.5px solid #e2e8f0;
          transition: all 0.2s ease;
          position: relative;
        }
        .auth-input-row:focus-within {
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .auth-input-field {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          color: var(--text-main);
          font-weight: 500;
          text-align: left !important;
        }
        .auth-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          padding: 4px;
        }
      `}</style>

      <div className="auth-card fade-up" style={{ textAlign: "center" }}>
        <div style={{ textAlign: "left", marginBottom: "16px" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: "600", fontSize: "13px", textDecoration: "none", background: "var(--primary-light)", padding: "6px 12px", borderRadius: "8px" }}>
            <FaHome /> Back
          </Link>
        </div>

        <div className="auth-logo-circle"><FaUserShield /></div>
        <p style={{ color: "var(--primary)", fontWeight: "700", fontSize: "12px", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Super Admin Console</p>
        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main)", margin: "4px 0" }}>Admin Login</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "0 0 16px 0" }}>Manage pickups, users, rates and analytics.</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="adm-username">Admin Email or Mobile</label>
          <div className="auth-input-row">
            <FaEnvelope style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input
              id="adm-username"
              type="text"
              placeholder="Enter email or mobile number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input-field"
              required
            />
          </div>

          <label htmlFor="adm-password">Password</label>
          <div className="auth-input-row">
            <FaLock style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input
              id="adm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input-field"
              style={{ paddingRight: "40px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-eye-btn"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div style={{ textAlign: "right", marginTop: "-6px", marginBottom: "14px" }}>
            <Link to="/forgot-password?role=admin" style={{ color: "#0b8f3a", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-premium" style={{ border: "none", marginTop: "4px" }} disabled={loading}>
            {loading ? <FaRecycle className="spin" /> : <>Access Console <FaArrowRight style={{ fontSize: "11px" }} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", background: "var(--bg-main)" };

export default AdminLogin;