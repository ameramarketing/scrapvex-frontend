import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTruck, FaUser, FaPhoneAlt, FaEnvelope, FaLock, FaMapMarkerAlt,
  FaArrowRight, FaSpinner, FaCheckCircle, FaUserPlus, FaKey, FaWhatsapp, FaSms, FaEye, FaEyeSlash
} from "react-icons/fa";

import Toast from "../components/Toast";
import API from "../services/api";
import { setCookie, getCookie } from "../utils/cookies";
import { saveAuthData } from "../utils/auth";

function CollectorRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user") || getCookie("user");
    const role = localStorage.getItem("role") || getCookie("role");
    if (rawUser && role === "collector") {
      navigate("/collector-dashboard");
    }
  }, [navigate]);

  const [form, setForm] = useState({
    name: "", mobile: "", email: "", area: "", password: "", confirmPassword: ""
  });
  const [otp, setOtp] = useState("");
  const [sentOtpCode, setSentOtpCode] = useState("");
  const [otpChannel, setOtpChannel] = useState("whatsapp");
  const [modalError, setModalError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "mobile") value = value.replace(/\D/g, "").slice(0, 10);
    setForm({ ...form, [e.target.name]: value });
  };

  // Step 1: Request OTP via WhatsApp or SMS
  const handleRequestOtp = async (e, selectedChannel = "whatsapp") => {
    if (e) e.preventDefault();
    if (!form.name.trim()) return showToast("error", "Enter your full name");
    if (form.mobile.length !== 10) return showToast("error", "Enter valid 10-digit mobile number");
    if (!form.area.trim()) return showToast("error", "Enter your operating area / locality");
    if (form.password.length < 6) return showToast("error", "Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return showToast("error", "Passwords do not match!");

    try {
      setLoading(true);
      setModalError("");
      setOtpChannel(selectedChannel);
      const { data } = await API.post("/auth/send-register-otp", { mobile: form.mobile, channel: selectedChannel });
      showToast("success", data.message || `OTP sent via ${selectedChannel.toUpperCase()}!`);
      setShowOtpModal(true);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Collector Registration
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setModalError("");
    if (otp.length !== 6) {
      setModalError("Please enter 6-Digit OTP code");
      return showToast("error", "Please enter 6-Digit OTP code");
    }

    try {
      setLoading(true);
      const registerPayload = {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        area: form.area,
        password: form.password,
        otp
      };

      const { data } = await API.post("/auth/collector-register", registerPayload);

      await saveAuthData(data.token, data.user, "collector");

      showToast("success", "Collector Registration Successful! 🎉");
      setTimeout(() => navigate("/collector-dashboard"), 800);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Invalid OTP code. Please try again.";
      setModalError(errMsg);
      showToast("error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <div style={card} className="rate-card">
        <div style={topIcon}><FaTruck /></div>
        <p style={tag}><FaUserPlus style={{ marginRight: "6px" }} /> Join Our Team 🚚</p>
        <h1 style={title}>Collector Registration</h1>
        <p style={sub}>Register as a pickup collector and start earning.</p>

        <div style={pillWrap}>
          <span style={pill}><FaCheckCircle /> Secure</span>
          <span style={pill}><FaCheckCircle /> Fast</span>
          <span style={pill}><FaCheckCircle /> Easy</span>
        </div>

        <form onSubmit={(e) => handleRequestOtp(e, "whatsapp")} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={inputWrap}>
            <FaUser style={icon} />
            <input type="text" name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} style={input} />
          </div>

          <div style={inputWrap}>
            <FaPhoneAlt style={icon} />
            <input type="text" name="mobile" placeholder="Mobile Number *" value={form.mobile} onChange={handleChange} style={input} />
          </div>

          <div style={inputWrap}>
            <FaEnvelope style={icon} />
            <input type="email" name="email" placeholder="Email (Optional)" value={form.email} onChange={handleChange} style={input} />
          </div>

          <div style={inputWrap}>
            <FaMapMarkerAlt style={icon} />
            <input type="text" name="area" placeholder="Area / Locality *" value={form.area} onChange={handleChange} style={input} />
          </div>

          <div style={{ ...inputWrap, position: "relative" }}>
            <FaLock style={icon} />
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password (Min 6 chars) *" value={form.password} onChange={handleChange} style={{ ...input, paddingRight: "45px" }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", padding: "4px" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div style={{ ...inputWrap, position: "relative" }}>
            <FaCheckCircle style={icon} />
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password *" value={form.confirmPassword} onChange={handleChange} style={{ ...input, paddingRight: "45px" }} />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", padding: "4px" }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* DUAL OTP CHANNEL BUTTONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              style={{ ...btn, background: "#25D366" }}
              className="btn pulse-btn"
              disabled={loading}
              onClick={(e) => handleRequestOtp(e, "whatsapp")}
            >
              {loading ? <FaSpinner className="spin" /> : <><FaWhatsapp style={{ fontSize: "18px" }} /> Get OTP on WhatsApp 💬</>}
            </button>

            <button
              type="button"
              style={{ ...btn, background: "var(--primary)" }}
              className="btn pulse-btn"
              disabled={loading}
              onClick={(e) => handleRequestOtp(e, "sms")}
            >
              {loading ? <FaSpinner className="spin" /> : <><FaSms style={{ fontSize: "18px" }} /> Get OTP via SMS 📱</>}
            </button>
          </div>
        </form>

        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px", fontSize: "14px" }}>
          <span style={{ color: "var(--text-muted)" }}>Already registered?</span>
          <Link to="/collector-login" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>Login Here</Link>
        </div>
      </div>

      {/* OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div style={modalBackdrop}>
          <div style={modalCard} className="fade-up">
            <div style={modalHeaderIcon}><FaKey /></div>
            <h3 style={{ fontSize: "22px", margin: "10px 0 6px 0", color: "#0f172a" }}>Enter Collector OTP</h3>
            <p style={{ fontSize: "14px", color: "#475569", margin: "10px 0 20px 0", lineHeight: "1.5" }}>
              {otpChannel === "whatsapp" ? "💬 We have sent a 6-Digit secret OTP to your WhatsApp inbox" : "📱 We have sent a 6-Digit secret OTP via SMS"} on <b>+91 {form.mobile}</b>. Please enter the code below:
            </p>

            {modalError && (
              <div style={modalErrorBox}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleFinalRegister}>
              <div style={otpInputGroup}>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="0 0 0 0 0 0"
                  value={otp}
                  onChange={(e) => {
                    setModalError("");
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  style={otpInput}
                  autoFocus
                />
              </div>

              <button type="submit" className="btn pulse-btn" style={{ width: "100%", marginTop: "18px", padding: "14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "bold" }} disabled={loading}>
                {loading ? <FaSpinner className="spin" /> : <>Verify & Complete Registration <FaCheckCircle /></>}
              </button>
            </form>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button type="button" onClick={(e) => handleRequestOtp(e, otpChannel)} style={{ background: "none", border: "none", color: "#0b8f3a", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Resend OTP</button>
              <button type="button" onClick={() => setShowOtpModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* styles */
const wrap = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "30px", background: "var(--bg-main)" };
const card = { width: "460px", background: "var(--card-bg)", padding: "36px", borderRadius: "28px", boxShadow: "0 25px 55px rgba(0,0,0,.08)", textAlign: "center", border: "1px solid var(--glass-border)" };
const topIcon = { fontSize: "70px", color: "var(--primary)", marginBottom: "10px" };
const tag = { color: "var(--primary)", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" };
const title = { margin: "12px 0", color: "var(--text-main)" };
const sub = { color: "var(--text-muted)", marginBottom: "18px" };
const pillWrap = { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "22px" };
const pill = { background: "var(--primary-light)", color: "var(--primary)", padding: "8px 12px", borderRadius: "999px", fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" };
const inputWrap = { display: "flex", gap: "12px", alignItems: "center", background: "var(--bg-main)", padding: "14px 16px", borderRadius: "14px", border: "1px solid var(--glass-border)" };
const icon = { color: "var(--primary)" };
const input = { border: "none", outline: "none", background: "transparent", width: "100%", color: "var(--text-main)" };
const btn = { width: "100%", border: "none", padding: "14px", borderRadius: "14px", background: "var(--primary)", color: "#fff", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "8px" };

const modalBackdrop = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" };
const modalCard = { background: "#ffffff", width: "100%", maxWidth: "400px", borderRadius: "24px", padding: "30px 26px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" };
const modalHeaderIcon = { width: "60px", height: "60px", borderRadius: "50%", background: "#f0fdf4", color: "#0b8f3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto" };
const otpHintBox = { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" };
const modalErrorBox = { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", marginBottom: "14px" };
const otpInputGroup = { background: "#f8fafc", borderRadius: "16px", padding: "12px", border: "2px solid #0b8f3a" };
const otpInput = { width: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontSize: "28px", fontWeight: "800", letterSpacing: "12px", color: "#0f172a" };

export default CollectorRegister;

