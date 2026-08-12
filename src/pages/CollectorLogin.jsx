import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaTruck, FaPhoneAlt, FaLock, FaArrowRight, FaCheckCircle, FaEye, FaEyeSlash, FaHome, FaRecycle } from "react-icons/fa";
import Toast from "../components/Toast";
import API from "../services/api";
import { saveAuthData, getAuthUser, getAuthRole } from "../utils/auth";

function CollectorLogin() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkLogged = async () => {
      const rawUser = await getAuthUser();
      const role = await getAuthRole();
      if (rawUser && role === "collector") {
        navigate("/collector-dashboard");
      }
    };
    checkLogged();
  }, [navigate]);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (mobile.length !== 10) return showToast("error", "Enter valid 10-digit mobile number");
    if (!password) return showToast("error", "Enter password");

    setLoading(true);
    try {
      const { data } = await API.post("/auth/collector-login", { mobile, password });

      await saveAuthData(data.token, data.user, "collector");

      showToast("success", "Collector Login Successful 🎉");
      setTimeout(() => navigate("/collector-dashboard"), 700);
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
        .google-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1e293b;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }
        .google-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
        .divider-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 18px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
      `}</style>

      <div className="auth-card fade-up" style={{ textAlign: "center" }}>
        <div style={{ textAlign: "left", marginBottom: "16px" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: "600", fontSize: "13px", textDecoration: "none", background: "var(--primary-light)", padding: "6px 12px", borderRadius: "8px" }}>
            <FaHome /> Back
          </Link>
        </div>

        <div className="auth-logo-circle"><FaTruck /></div>
        <p style={{ color: "var(--primary)", fontWeight: "700", fontSize: "12px", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pickup Staff Portal</p>
        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main)", margin: "4px 0" }}>Collector Login</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "0 0 16px 0" }}>Manage assigned pickups and complete orders.</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="col-mobile">Mobile Number</label>
          <div className="auth-input-row">
            <FaPhoneAlt style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input
              id="col-mobile"
              type="text"
              placeholder="Enter 10-digit number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="auth-input-field"
              required
            />
          </div>

          <label htmlFor="col-password">Password</label>
          <div className="auth-input-row">
            <FaLock style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input
              id="col-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
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

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "-4px", marginBottom: "16px" }}>
            <Link to="/login" style={{ color: "var(--primary)", fontSize: "12px", textDecoration: "none", fontWeight: "700" }}>Login as User</Link>
            <Link to="/forgot-password?role=collector" style={{ color: "var(--primary)", fontSize: "12px", textDecoration: "none", fontWeight: "700" }}>Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-premium" style={{ border: "none" }} disabled={loading}>
            {loading ? <FaRecycle className="spin" /> : <>Login <FaArrowRight style={{ fontSize: "11px" }} /></>}
          </button>
        </form>



        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px", fontSize: "13px" }}>
          <span style={{ color: "var(--text-muted)" }}>New Collector?</span>
          <Link to="/collector-register" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>Register Here</Link>
        </div>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", background: "var(--bg-main)" };

export default CollectorLogin;