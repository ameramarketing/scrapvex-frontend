import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaArrowRight, FaEye, FaEyeSlash, FaRecycle, FaHome } from "react-icons/fa";
import { saveAuthData, getAuthUser, getAuthRole } from "../utils/auth";
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
    const checkLogged = async () => {
      const rawUser = await getAuthUser();
      const role = await getAuthRole();
      if (rawUser && role === "user") {
        navigate("/dashboard");
      }
    };
    checkLogged();
  }, [navigate]);

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) return showToast("error", "Enter valid 10-digit mobile number");
    if (!password) return showToast("error", "Enter your password");

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { mobile, password });
      
      // Securely store auth data
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
    <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          padding: 30px 24px;
          border-radius: 20px;
          border: 1px solid rgba(15,23,42,0.06);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);
        }
        .login-logo-circle {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: #f0fdf4;
          color: #0b8f3a;
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          border: 1.5px solid #dcfce7;
        }
        .login-input-row {
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
        .login-input-row:focus-within {
          border-color: #0b8f3a;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(11, 143, 58, 0.15);
        }
        .login-input-field {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
          text-align: left !important;
        }
        .login-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .login-role-btn {
          display: block;
          padding: 11px;
          border-radius: 10px;
          background: #f8fafc;
          color: #475569;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
          border: 1.5px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .login-role-btn:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }
      `}</style>

      <div className="login-card fade-up">
        {/* LOGO AREA */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="login-logo-circle"><FaRecycle /></div>
          <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px 0" }}>Welcome Back</h1>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>Login to schedule & track scrap pickups</p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="login-mobile">Registered Mobile</label>
          <div className="login-input-row">
            <FaPhoneAlt style={{ color: "#0b8f3a", fontSize: "14px" }} />
            <input
              id="login-mobile"
              type="text"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="login-input-field"
              required
            />
          </div>

          <label htmlFor="login-password">Password</label>
          <div className="login-input-row">
            <FaLock style={{ color: "#0b8f3a", fontSize: "14px" }} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input-field"
              style={{ paddingRight: "40px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-eye-btn"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div style={{ textAlign: "right", marginBottom: "16px" }}>
            <Link to="/forgot-password?role=user" style={{ color: "#0b8f3a", fontSize: "12px", textDecoration: "none", fontWeight: "700" }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-premium" style={{ border: "none" }} disabled={loading}>
            {loading ? <FaRecycle className="spin" /> : <>Login <FaArrowRight style={{ fontSize: "11px" }} /></>}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
          <p style={{ margin: 0 }}>New user? <Link to="/register" style={{ color: "#0b8f3a", fontWeight: "700", textDecoration: "none" }}>Create Account</Link></p>
          
          <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link to="/collector-login" className="login-role-btn">Login as Collector</Link>
            <Link to="/franchise-login" className="login-role-btn">Login as Franchise Partner</Link>
            <Link to="/admin-login" className="login-role-btn" style={{ background: "#f1f5f9", border: "1.5px solid #cbd5e1" }}>Login as System Admin</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;