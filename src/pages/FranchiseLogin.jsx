import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUserShield, FaEnvelope, FaLock, FaArrowRight, FaCheckCircle, FaSpinner, FaGoogle, FaEye, FaEyeSlash, FaHome
} from "react-icons/fa";
import Toast from "../components/Toast";
import API from "../services/api";
import { setCookie, getCookie } from "../utils/cookies";
import { triggerOfficialGoogleSignIn } from "../services/googleAuth";

function FranchiseLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  
  React.useEffect(() => {
    const rawUser = localStorage.getItem("user") || getCookie("user");
    const role = localStorage.getItem("role") || getCookie("role");
    if (rawUser && role === "franchise") {
      navigate("/franchise-dashboard");
    }
  }, [navigate]);

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleLogin = async (e) => {
    if (!email) return showToast("error", "Enter franchise email or mobile");
    if (!password) return showToast("error", "Enter password");
    setLoading(true);
    try {
      const loginPayload = email.includes("@") ? { email, password } : { mobile: email, password };
      const { data } = await API.post("/auth/franchise-login", loginPayload);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "franchise");

      setCookie("token", data.token);
      setCookie("user", JSON.stringify(data.user));
      setCookie("role", "franchise");

      showToast("success", "Franchise Login Successful 🔐");
      setTimeout(() => navigate("/franchise-dashboard"), 700);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Trigger Official Google Account Picker (accounts.google.com)
      const googleUser = await triggerOfficialGoogleSignIn({ role: "franchise" });

      const franchiseUserData = {
        _id: googleUser.googleId || "g_franchise_" + Date.now(),
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        role: "franchise",
        assignedCity: "Rajouri District"
      };

      const token = "google_auth_token_" + Date.now();

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(franchiseUserData));
      localStorage.setItem("role", "franchise");

      setCookie("token", token);
      setCookie("user", JSON.stringify(franchiseUserData));
      setCookie("role", "franchise");

      showToast("success", `Signed in as ${googleUser.name} (${googleUser.email})! 🏢`);
      setTimeout(() => navigate("/franchise-dashboard"), 800);
    } catch (err) {
      showToast("error", err.message || "Google Sign-In cancelled or failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      <div style={card} className="rate-card">
        <div style={{ textAlign: "left", marginBottom: "15px" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: "600", fontSize: "14px", textDecoration: "none", background: "var(--primary-light)", padding: "8px 14px", borderRadius: "10px" }}>
            <FaHome /> Back to Home
          </Link>
        </div>
        <div style={topIcon}><FaUserShield /></div>
        <p style={tag}>Secure Hidden Access 🔒</p>
        <h1 style={title}>Franchise Portal</h1>
        <p style={sub}>Manage your district pickups, collectors and billing.</p>
        <div style={pillWrap}>
          <span style={pill}><FaCheckCircle /> Secure</span>
          <span style={pill}><FaCheckCircle /> Private</span>
        </div>

        {/* OFFICIAL GOOGLE SIGN IN BUTTON */}
        <button type="button" onClick={handleGoogleLogin} style={googleBtn} disabled={googleLoading}>
          {googleLoading ? <FaSpinner className="spin" /> : <><FaGoogle style={{ color: "#ea4335", fontSize: "16px" }} /> Continue with Google</>}
        </button>

        <div style={dividerRow}>
          <div style={line} />
          <span style={orText}>OR LOGIN WITH CREDENTIALS</span>
          <div style={line} />
        </div>

        <div style={inputWrap}>
          <FaEnvelope style={icon} />
          <input type="text" placeholder="Franchise Email or Mobile" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
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
        <button style={btn} className="btn pulse-btn" onClick={handleLogin} disabled={loading}>
          {loading ? <><FaSpinner className="spin" /> Logging...</> : <>Login <FaArrowRight style={{ marginLeft: "8px" }} /></>}
        </button>
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

const googleBtn = {
  width: "100%",
  padding: "13px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#1e293b",
  fontSize: "14px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  transition: "0.2s"
};

const dividerRow = { display: "flex", alignItems: "center", gap: "10px", margin: "18px 0" };
const line = { flex: 1, height: "1px", background: "#e2e8f0" };
const orText = { fontSize: "11px", color: "#94a3b8", fontWeight: "700", letterSpacing: "0.5px" };

const inputWrap = { display: "flex", gap: "12px", alignItems: "center", background: "var(--bg-main)", padding: "14px 16px", borderRadius: "14px", marginBottom: "14px", border: "1px solid var(--glass-border)" };
const icon = { color: "var(--primary)" };
const input = { border: "none", outline: "none", background: "transparent", width: "100%", color: "var(--text-main)" };
const btn = { width: "100%", border: "none", padding: "14px", borderRadius: "14px", background: "var(--primary)", color: "#fff", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" };

export default FranchiseLogin;