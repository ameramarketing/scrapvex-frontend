import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTruck,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaUserPlus
} from "react-icons/fa";

import Toast from "../components/Toast";
import API from "../services/api";
import { setCookie, getCookie } from "../utils/cookies";

function CollectorRegister() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user") || getCookie("user");
    const role = localStorage.getItem("role") || getCookie("role");
    if (rawUser && role === "collector") {
      navigate("/collector-dashboard");
    }
  }, [navigate]);

  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "", area: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "mobile") value = value.replace(/\D/g, "").slice(0, 10);
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("error", "Enter your full name");
    if (form.mobile.length !== 10) return showToast("error", "Enter valid 10-digit mobile number");
    if (form.password.length < 6) return showToast("error", "Password must be at least 6 characters");

    try {
      setLoading(true);
      const { data } = await API.post("/auth/collector-register", form);
      
      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "collector");

      // Store in Cookies
      setCookie("token", data.token);
      setCookie("user", JSON.stringify(data.user));
      setCookie("role", "collector");

      showToast("success", "Collector Registration Successful! 🎉");
      setTimeout(() => navigate("/collector-dashboard"), 800);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={inputWrap}>
            <FaUser style={icon} />
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={form.name}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputWrap}>
            <FaPhoneAlt style={icon} />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number *"
              value={form.mobile}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputWrap}>
            <FaEnvelope style={icon} />
            <input
              type="email"
              name="email"
              placeholder="Email (Optional)"
              value={form.email}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputWrap}>
            <FaMapMarkerAlt style={icon} />
            <input
              type="text"
              name="area"
              placeholder="Area / Locality (Optional)"
              value={form.area}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputWrap}>
            <FaLock style={icon} />
            <input
              type="password"
              name="password"
              placeholder="Password (Min 6 chars) *"
              value={form.password}
              onChange={handleChange}
              style={input}
            />
          </div>

          <button type="submit" style={btn} className="btn pulse-btn" disabled={loading}>
            {loading ? (
              <><FaSpinner className="spin" /> Registering...</>
            ) : (
              <>Register as Collector <FaArrowRight style={{ marginLeft: "8px" }} /></>
            )}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px", fontSize: "14px" }}>
          <span style={{ color: "var(--text-muted)" }}>Already registered?</span>
          <Link to="/collector-login" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>Login Here</Link>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
          <Link to="/register" style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "none" }}>Register as User instead</Link>
        </div>
      </div>
    </div>
  );
}

/* styles */
const wrap = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "30px",
  background: "var(--bg-main)"
};

const card = {
  width: "460px",
  background: "var(--card-bg)",
  padding: "36px",
  borderRadius: "28px",
  boxShadow: "0 25px 55px rgba(0,0,0,.08)",
  textAlign: "center",
  border: "1px solid var(--glass-border)"
};

const topIcon = {
  fontSize: "70px",
  color: "var(--primary)",
  marginBottom: "10px"
};

const tag = {
  color: "var(--primary)",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const title = {
  margin: "12px 0",
  color: "var(--text-main)"
};

const sub = {
  color: "var(--text-muted)",
  marginBottom: "18px"
};

const pillWrap = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginBottom: "22px"
};

const pill = {
  background: "var(--primary-light)",
  color: "var(--primary)",
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  display: "flex",
  gap: "6px",
  alignItems: "center"
};

const inputWrap = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  background: "var(--bg-main)",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid var(--glass-border)"
};

const icon = {
  color: "var(--primary)"
};

const input = {
  border: "none",
  outline: "none",
  background: "transparent",
  width: "100%",
  color: "var(--text-main)"
};

const btn = {
  width: "100%",
  border: "none",
  padding: "14px",
  borderRadius: "14px",
  background: "var(--primary)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  marginTop: "8px"
};

export default CollectorRegister;
