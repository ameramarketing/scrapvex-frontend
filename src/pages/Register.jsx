import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaPhoneAlt, FaEnvelope, FaLock, FaArrowRight, FaUserPlus, FaCheckCircle, FaKey, FaWhatsapp, FaSms, FaEye, FaEyeSlash, FaRecycle } from "react-icons/fa";
import { saveAuthData } from "../utils/auth";
import Toast from "../components/Toast";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      showToast("error", error.response?.data?.message || error.customMessage || error.message || "Failed to send OTP");
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
        password: form.password,
        otp
      };

      const { data } = await API.post("/auth/register", registerPayload);

      await saveAuthData(data.token, data.user, "user");

      showToast("success", "Registration Successful! 🎉");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Invalid OTP code. Please try again.";
      setModalError(errMsg);
      showToast("error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .register-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          padding: 30px 24px;
          border-radius: 20px;
          border: 1px solid rgba(15,23,42,0.06);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);
        }
        .register-logo-circle {
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
        .register-input-row {
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
        .register-input-row:focus-within {
          border-color: #0b8f3a;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(11, 143, 58, 0.15);
        }
        .register-input-field {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
          text-align: left !important;
        }
        .register-eye-btn {
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
      `}</style>

      <div className="register-card fade-up">
        {/* HEADER AREA */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="register-logo-circle"><FaUserPlus /></div>
          <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px 0" }}>Create Account</h1>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>Join ScrapVex to recycle smarter</p>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={(e) => handleRequestOtp(e, "whatsapp")} style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="reg-name">Full Name *</label>
          <div className="register-input-row">
            <FaUser style={{ color: "#0b8f3a", fontSize: "14px" }} />
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              className="register-input-field"
              required
            />
          </div>

          <label htmlFor="reg-mobile">Mobile Number *</label>
          <div className="register-input-row">
            <FaPhoneAlt style={{ color: "#0b8f3a", fontSize: "14px" }} />
            <input
              id="reg-mobile"
              type="text"
              name="mobile"
              placeholder="Enter 10-digit mobile number"
              value={form.mobile}
              onChange={handleChange}
              className="register-input-field"
              required
            />
          </div>

          <label htmlFor="reg-email">Email (Optional)</label>
          <div className="register-input-row">
            <FaEnvelope style={{ color: "#0b8f3a", fontSize: "14px" }} />
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              className="register-input-field"
            />
          </div>

          <label htmlFor="reg-password">Password *</label>
          <div className="register-input-row">
            <FaLock style={{ color: "#0b8f3a", fontSize: "14px" }} />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              className="register-input-field"
              style={{ paddingRight: "40px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="register-eye-btn"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label htmlFor="reg-confirmPassword">Confirm Password *</label>
          <div className="register-input-row" style={{ border: `1.5px solid ${form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : '#e2e8f0'}` }}>
            <FaCheckCircle style={{ color: form.confirmPassword && form.password === form.confirmPassword ? '#0b8f3a' : '#cbd5e1', fontSize: "14px" }} />
            <input
              id="reg-confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Verify password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="register-input-field"
              style={{ paddingRight: "40px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="register-eye-btn"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-8px', marginBottom: '14px', textAlign: 'left', fontWeight: '600' }}>⚠ Passwords do not match</p>
          )}

          {/* DUAL OTP SEND BUTTONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              className="btn-premium"
              style={{ background: "#25D366", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", border: "none", height: "46px" }}
              disabled={loading}
              onClick={(e) => handleRequestOtp(e, "whatsapp")}
            >
              {loading ? <FaRecycle className="spin" /> : <><FaWhatsapp style={{ fontSize: "16px" }} /> Get OTP on WhatsApp</>}
            </button>

            <button
              type="button"
              className="btn-premium"
              style={{ background: "#0b8f3a", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", border: "none", height: "46px" }}
              disabled={loading}
              onClick={(e) => handleRequestOtp(e, "sms")}
            >
              {loading ? <FaRecycle className="spin" /> : <><FaSms style={{ fontSize: "16px" }} /> Get OTP via SMS</>}
            </button>
          </div>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
          <p style={{ margin: 0 }}>Already have an account? <Link to="/login" style={{ color: "#0b8f3a", fontWeight: "700", textDecoration: "none" }}>Login Here</Link></p>
        </div>
      </div>

      {/* OTP VERIFICATION MODAL SHEET */}
      {showOtpModal && (
        <div style={modalBackdrop}>
          <div style={modalCard} className="fade-up">
            <div style={modalHeaderIcon}>
              <FaKey />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "12px 0 6px 0", color: "#0f172a" }}>Enter 6-Digit OTP</h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.5" }}>
              {otpChannel === "whatsapp" ? "💬 Secret OTP sent to your WhatsApp inbox" : "📩 Secret OTP sent via SMS"} on <b>+91 {form.mobile}</b>.
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

              <button type="submit" className="btn-premium" style={{ width: "100%", marginTop: "16px", padding: "12px", height: "46px", border: "none" }} disabled={loading}>
                {loading ? <FaRecycle className="spin" /> : <>Verify & Complete <FaCheckCircle /></>}
              </button>
            </form>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button
                type="button"
                onClick={(e) => handleRequestOtp(e, otpChannel)}
                style={{ background: "none", border: "none", color: "#0b8f3a", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* MODAL STYLES */
const modalBackdrop = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(4px)",
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px"
};

const modalCard = {
  background: "#ffffff",
  width: "100%",
  maxWidth: "360px",
  borderRadius: "20px",
  padding: "24px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
};

const modalHeaderIcon = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  background: "#f0fdf4",
  color: "#0b8f3a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  margin: "0 auto"
};

const modalErrorBox = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#dc2626",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  marginBottom: "14px"
};

const otpInputGroup = {
  background: "#f8fafc",
  borderRadius: "12px",
  padding: "10px",
  border: "2px solid #0b8f3a"
};

const otpInput = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  textAlign: "center",
  fontSize: "24px",
  fontWeight: "800",
  letterSpacing: "8px",
  color: "#0f172a"
};

export default Register;
