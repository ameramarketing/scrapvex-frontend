import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaTruck, FaUser, FaPhoneAlt, FaEnvelope, FaLock, FaMapMarkerAlt, FaArrowRight, FaCheckCircle, FaUserPlus, FaKey, FaWhatsapp, FaSms, FaEye, FaEyeSlash, FaRecycle, FaHome } from "react-icons/fa";
import Toast from "../components/Toast";
import API from "../services/api";
import { setCookie, getCookie } from "../utils/cookies";
import { saveAuthData, getAuthUser, getAuthRole } from "../utils/auth";

function CollectorRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const [form, setForm] = useState({
    name: "", mobile: "", email: "", area: "", password: "", confirmPassword: ""
  });
  const [otp, setOtp] = useState("");
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

      <style>{`
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: var(--card-bg);
          padding: 30px 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
        }
        .auth-logo-circle {
          width: 56px !important;
          height: 56px !important;
          border-radius: 16px !important;
          background: #0b8f3a !important;
          color: #ffffff !important;
          font-size: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 auto 12px !important;
          border: 2px solid #08752f !important;
          box-shadow: 0 4px 12px rgba(11, 143, 58, 0.25) !important;
        }
        .auth-logo-circle svg {
          color: #ffffff !important;
          fill: #ffffff !important;
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
          <Link to="/collector-login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: "600", fontSize: "13px", textDecoration: "none", background: "var(--primary-light)", padding: "6px 12px", borderRadius: "8px" }}>
            <FaHome /> Back to Login
          </Link>
        </div>

        <div className="auth-logo-circle"><FaTruck /></div>
        <p style={{ color: "var(--primary)", fontWeight: "700", fontSize: "12px", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Join Our Team 🚚</p>
        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main)", margin: "4px 0" }}>Collector Registration</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "0 0 16px 0" }}>Register as a pickup collector and start earning.</p>

        <form onSubmit={(e) => handleRequestOtp(e, "whatsapp")} style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="col-reg-name">Full Name *</label>
          <div className="auth-input-row">
            <FaUser style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input id="col-reg-name" type="text" name="name" placeholder="Enter full name" value={form.name} onChange={handleChange} className="auth-input-field" required />
          </div>

          <label htmlFor="col-reg-mobile">Mobile Number *</label>
          <div className="auth-input-row">
            <FaPhoneAlt style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input id="col-reg-mobile" type="text" name="mobile" placeholder="Enter 10-digit mobile" value={form.mobile} onChange={handleChange} className="auth-input-field" required />
          </div>

          <label htmlFor="col-reg-email">Email (Optional)</label>
          <div className="auth-input-row">
            <FaEnvelope style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input id="col-reg-email" type="email" name="email" placeholder="Enter email address" value={form.email} onChange={handleChange} className="auth-input-field" />
          </div>

          <label htmlFor="col-reg-area">Operating Area / Locality *</label>
          <div className="auth-input-row">
            <FaMapMarkerAlt style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input id="col-reg-area" type="text" name="area" placeholder="e.g. Rajouri Main Market" value={form.area} onChange={handleChange} className="auth-input-field" required />
          </div>

          <label htmlFor="col-reg-password">Password *</label>
          <div className="auth-input-row">
            <FaLock style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input id="col-reg-password" type={showPassword ? "text" : "password"} name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} className="auth-input-field" style={{ paddingRight: "40px" }} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label htmlFor="col-reg-confirm">Confirm Password *</label>
          <div className="auth-input-row">
            <FaCheckCircle style={{ color: "var(--primary)", fontSize: "14px" }} />
            <input id="col-reg-confirm" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Verify password" value={form.confirmPassword} onChange={handleChange} className="auth-input-field" style={{ paddingRight: "40px" }} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="auth-eye-btn">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            <button type="button" style={{ background: "#25D366", color: "#fff", border: "none" }} className="btn-premium" disabled={loading} onClick={(e) => handleRequestOtp(e, "whatsapp")}>
              {loading ? <FaRecycle className="spin" /> : <><FaWhatsapp style={{ fontSize: "16px" }} /> Get OTP on WhatsApp</>}
            </button>

            <button type="button" style={{ background: "var(--primary)", color: "#fff", border: "none" }} className="btn-premium" disabled={loading} onClick={(e) => handleRequestOtp(e, "sms")}>
              {loading ? <FaRecycle className="spin" /> : <><FaSms style={{ fontSize: "16px" }} /> Get OTP via SMS</>}
            </button>
          </div>
        </form>

        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px", fontSize: "13px" }}>
          <span style={{ color: "var(--text-muted)" }}>Already registered?</span>
          <Link to="/collector-login" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>Login Here</Link>
        </div>
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div style={modalBackdrop}>
          <div style={modalCard} className="fade-up">
            <div style={modalHeaderIcon}><FaKey /></div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "12px 0 6px 0", color: "var(--text-main, #0f172a)" }}>Enter Collector OTP</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 16px 0", lineHeight: "1.5" }}>
              {otpChannel === "whatsapp" ? "💬 Secret OTP sent to WhatsApp inbox" : "📱 Secret OTP sent via SMS"} on <b>+91 {form.mobile}</b>.
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
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    setModalError("");
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  style={otpInput}
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-premium" style={{ width: "100%", marginTop: "16px", border: "none" }} disabled={loading}>
                {loading ? <FaRecycle className="spin" /> : <>Verify & Register <FaCheckCircle /></>}
              </button>
            </form>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button type="button" onClick={(e) => handleRequestOtp(e, otpChannel)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Resend OTP</button>
              <button type="button" onClick={() => setShowOtpModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const wrap = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", background: "var(--bg-main)" };
const modalBackdrop = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" };
const modalCard = { background: "var(--card-bg, #ffffff)", width: "100%", maxWidth: "360px", borderRadius: "20px", padding: "24px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" };
const modalHeaderIcon = { width: "50px", height: "50px", borderRadius: "50%", background: "#f0fdf4", color: "#0b8f3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", margin: "0 auto" };
const modalErrorBox = { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", marginBottom: "14px" };
const otpInputGroup = { background: "var(--bg-main, #f8fafc)", borderRadius: "12px", padding: "10px", border: "2px solid #0b8f3a" };
const otpInput = { width: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontSize: "24px", fontWeight: "800", letterSpacing: "8px", color: "var(--text-main, #0f172a)" };

export default CollectorRegister;
