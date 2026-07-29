import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPhoneAlt,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaShieldAlt,
  FaKey,
  FaWhatsapp,
  FaSms,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

import Navbar from "../components/Navbar";
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
  const [debugOtp, setDebugOtp] = useState("");
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
        if (data.debugOtp) setDebugOtp(data.debugOtp);
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
    if (otp.length !== 4) return showToast("error", "Enter 4 digit OTP");
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
    <div style={{ background: "var(--bg-main)", minHeight: "100vh" }}>
      <Navbar />
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div style={wrap}>
        <div style={card} className="rate-card">
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{...iconCircle, background: "var(--primary-light)", color: "var(--primary)"}}>
              {step === 1 && <FaPhoneAlt style={mainIcon} />}
              {step === 2 && <FaShieldAlt style={mainIcon} />}
              {step === 3 && <FaKey style={mainIcon} />}
            </div>
            <h2 style={{color: "var(--text-main)"}}>{step === 1 ? "Forgot Password" : (step === 2 ? "Verify OTP" : "Reset Password")}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {step === 1 ? `Recover your ${role} account` : (step === 2 ? `Enter OTP sent to ${mobile}` : "Create a strong new password")}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={(e) => handleSendOTP(e, "whatsapp")}>
              <div style={{...inputWrap, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
                <FaPhoneAlt style={{...icon, color: "var(--primary)"}} />
                <input 
                  type="text" 
                  placeholder="Mobile Number *" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                  style={{...input, color: "var(--text-main)"}} 
                  required 
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                <button
                  type="button"
                  style={{ ...btn, background: "#25D366" }}
                  disabled={loading}
                  onClick={(e) => handleSendOTP(e, "whatsapp")}
                >
                  {loading ? <FaSpinner className="spin" /> : <><FaWhatsapp style={{ fontSize: "18px" }} /> Get OTP on WhatsApp 💬</>}
                </button>

                <button
                  type="button"
                  style={{ ...btn, background: "var(--primary)" }}
                  disabled={loading}
                  onClick={(e) => handleSendOTP(e, "sms")}
                >
                  {loading ? <FaSpinner className="spin" /> : <><FaSms style={{ fontSize: "18px" }} /> Get OTP via SMS 📱</>}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div style={{...inputWrap, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
                <FaShieldAlt style={{...icon, color: "var(--primary)"}} />
                <input 
                  type="text" 
                  placeholder="Enter 4-digit OTP *" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.slice(0, 4))} 
                  style={{...input, color: "var(--text-main)"}} 
                  required 
                />
              </div>
              {debugOtp && (
                <div style={{ marginBottom: "16px", padding: "10px 12px", borderRadius: "12px", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: "13px", textAlign: "center" }}>
                  🔑 Demo OTP: <strong>{debugOtp}</strong>
                </div>
              )}
              <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>
                {otpChannel === "whatsapp" ? "💬 OTP sent to your WhatsApp" : "📱 OTP sent via SMS"}
              </p>
              <button type="submit" style={{...btn, background: "var(--primary)", marginTop: "12px"}} disabled={loading}>
                {loading ? <FaSpinner className="spin" /> : <>Verify & Continue <FaArrowRight /></>}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ ...inputWrap, background: "var(--bg-main)", border: "1px solid var(--glass-border)", position: "relative" }}>
                <FaLock style={{ ...icon, color: "var(--primary)" }} />
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  placeholder="New Password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  style={{ ...input, color: "var(--text-main)", paddingRight: "45px" }} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", padding: "4px" }}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div style={{ ...inputWrap, background: "var(--bg-main)", border: `1px solid ${confirmPassword && newPassword !== confirmPassword ? '#e74c3c' : 'var(--glass-border)'}`, position: "relative" }}>
                <FaCheckCircle style={{ ...icon, color: confirmPassword && newPassword === confirmPassword ? '#0b8f3a' : 'var(--primary)' }} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  style={{ ...input, color: "var(--text-main)", paddingRight: "45px" }} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", padding: "4px" }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', textAlign: 'left' }}>⚠ Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p style={{ color: '#0b8f3a', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', textAlign: 'left' }}>✓ Passwords match</p>
              )}
              <button type="submit" style={{...btn, background: "var(--primary)"}} disabled={loading}>
                {loading ? <FaSpinner className="spin" /> : <>Reset Password <FaCheckCircle /></>}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-main)" }}>
            Remembered? <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "bold" }} onClick={() => navigate(-1)}>Go Back</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const wrap = { minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" };
const card = { width: "100%", maxWidth: "450px", background: "var(--card-bg)", padding: "40px", borderRadius: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.06)", border: "1px solid var(--glass-border)" };
const iconCircle = { width: "70px", height: "70px", background: "#eef8f1", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px", color: "#0b8f3a" };
const mainIcon = { fontSize: "30px" };
const inputWrap = { display: "flex", alignItems: "center", background: "#f8f9fa", padding: "15px 20px", borderRadius: "14px", marginBottom: "20px", border: "1px solid #eee" };
const icon = { color: "#0b8f3a", marginRight: "15px" };
const input = { border: "none", background: "transparent", outline: "none", fontSize: "16px", width: "100%" };
const btn = { width: "100%", background: "#0b8f3a", color: "#fff", border: "none", padding: "15px", borderRadius: "14px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", transition: "0.3s" };

export default ForgotPassword;
