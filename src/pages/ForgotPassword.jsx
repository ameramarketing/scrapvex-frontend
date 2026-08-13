import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaArrowRight, FaCheckCircle, FaShieldAlt, FaKey, FaWhatsapp, FaSms, FaEye, FaEyeSlash, FaRecycle } from "react-icons/fa";

import Toast from "../components/Toast";
import API from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialRole = query.get("role") || "user";

  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpChannel, setOtpChannel] = useState("whatsapp");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(initialRole);

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleSendOTP = async (e, selectedChannel = "whatsapp") => {
    if (e) e.preventDefault();
    if (mobile.length !== 10) return showToast("error", "Enter valid 10-digit mobile number");

    setLoading(true);
    setOtpChannel(selectedChannel);
    try {
      const { data } = await API.post("/auth/forgot-password", { mobile, role, channel: selectedChannel });
      if (data.success) {
        showToast("success", data.message || `OTP sent via ${selectedChannel.toUpperCase()}`);
        setStep(2);
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return showToast("error", "Enter 6 digit OTP");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/verify-otp", { mobile, otp });
      if (data.success) {
        setStep(3);
        showToast("success", "OTP Verified!");
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return showToast("error", "Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return showToast("error", "Passwords do not match!");

    setLoading(true);
    try {
      const { data } = await API.post("/auth/reset-password", { mobile, otp, role, newPassword });
      if (data.success) {
        showToast("success", "Password Reset Successfully!");
        setTimeout(() => {
          navigate(role === "collector" ? "/collector-login" : "/login");
        }, 1500);
      }
    } catch (error) {
      showToast("error", "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-main, #f8fafc)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <style>{`
        .forgot-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          padding: 30px 24px;
          border-radius: 20px;
          border: 1px solid rgba(15,23,42,0.06);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);
        }
        .forgot-logo-circle {
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
        .forgot-input-row {
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
        .forgot-input-row:focus-within {
          border-color: #0b8f3a;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(11, 143, 58, 0.15);
        }
        .forgot-input-field {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
        }
        .forgot-eye-btn {
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

      <div className="forgot-card fade-up">
        {/* LOGO AREA */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="forgot-logo-circle">
            {step === 1 && <FaPhoneAlt />}
            {step === 2 && <FaShieldAlt />}
            {step === 3 && <FaKey />}
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main, #0f172a)", margin: "0 0 4px 0" }}>
            {step === 1 ? "Forgot Password" : (step === 2 ? "Verify OTP" : "Reset Password")}
          </h1>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "12px", margin: 0 }}>
            {step === 1 ? `Recover your ${role} account` : (step === 2 ? `Enter OTP sent to ${mobile}` : "Create a strong new password")}
          </p>
        </div>

        {/* STEP 1: ENTER MOBILE & REQUEST OTP */}
        {step === 1 && (
          <form onSubmit={(e) => handleSendOTP(e, "whatsapp")} style={{ display: "flex", flexDirection: "column" }}>
            <div className="forgot-input-row">
              <FaPhoneAlt style={{ color: "#0b8f3a", fontSize: "14px" }} />
              <input 
                type="text" 
                placeholder="Mobile Number *" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                className="forgot-input-field"
                required 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                className="btn-premium"
                style={{ background: "#25D366", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", border: "none", height: "46px" }}
                disabled={loading}
                onClick={(e) => handleSendOTP(e, "whatsapp")}
              >
                {loading ? <FaRecycle className="spin" /> : <><FaWhatsapp style={{ fontSize: "16px" }} /> Get OTP on WhatsApp</>}
              </button>

              <button
                type="button"
                className="btn-premium"
                style={{ background: "#0b8f3a", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", border: "none", height: "46px" }}
                disabled={loading}
                onClick={(e) => handleSendOTP(e, "sms")}
              >
                {loading ? <FaRecycle className="spin" /> : <><FaSms style={{ fontSize: "16px" }} /> Get OTP via SMS</>}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column" }}>
            <div className="forgot-input-row">
              <FaShieldAlt style={{ color: "#0b8f3a", fontSize: "14px" }} />
              <input 
                type="text" 
                placeholder="Enter 6-Digit OTP *" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} 
                className="forgot-input-field"
                required 
              />
            </div>
            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted, #64748b)", margin: "0 0 16px 0" }}>
              {otpChannel === "whatsapp" ? "💬 OTP sent to your WhatsApp" : "📱 OTP sent via SMS"}
            </p>
            <button type="submit" className="btn-premium" style={{ height: "46px", border: "none", fontSize: "14px", fontWeight: "800" }} disabled={loading}>
              {loading ? <FaRecycle className="spin" /> : <>Verify & Continue <FaArrowRight style={{ fontSize: "11px" }} /></>}
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column" }}>
            <div className="forgot-input-row">
              <FaLock style={{ color: "#0b8f3a", fontSize: "14px" }} />
              <input 
                type={showNewPassword ? "text" : "password"} 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="forgot-input-field"
                style={{ paddingRight: "40px" }}
                required 
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="forgot-eye-btn"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="forgot-input-row" style={{ border: `1.5px solid ${confirmPassword && newPassword !== confirmPassword ? '#ef4444' : '#e2e8f0'}` }}>
              <FaCheckCircle style={{ color: confirmPassword && newPassword === confirmPassword ? '#0b8f3a' : '#0b8f3a', fontSize: "14px" }} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="forgot-input-field"
                style={{ paddingRight: "40px" }}
                required 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="forgot-eye-btn"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {confirmPassword && newPassword !== confirmPassword && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-8px', marginBottom: '14px', textAlign: 'left', fontWeight: "600" }}>⚠ Passwords do not match</p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p style={{ color: '#0b8f3a', fontSize: '11px', marginTop: '-8px', marginBottom: '14px', textAlign: 'left', fontWeight: "600" }}>✓ Passwords match</p>
            )}

            <button type="submit" className="btn-premium" style={{ height: "46px", border: "none", fontSize: "14px", fontWeight: "800" }} disabled={loading}>
              {loading ? <FaRecycle className="spin" /> : <>Reset Password <FaCheckCircle style={{ fontSize: "12px" }} /></>}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px" }}>
          <span style={{ color: "#0b8f3a", cursor: "pointer", fontWeight: "800" }} onClick={() => navigate(-1)}>
            ← Go Back
          </span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
