import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaPhoneAlt, FaEnvelope, FaLock, FaArrowRight, FaSpinner, FaUserPlus } from "react-icons/fa";
import { setCookie } from "../utils/cookies";

import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "" });
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
      const { data } = await API.post("/auth/register", form);
      
      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "user");

      // Store in Cookies
      setCookie("token", data.token);
      setCookie("user", JSON.stringify(data.user));
      setCookie("role", "user");

      showToast("success", "Registration Successful! 🎉");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:"var(--bg-main)", minHeight:"100vh"}}>
      <Navbar />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({...toast, show: false})} />

      <div className="container" style={wrap}>
        <div className="card-premium fade-up" style={card}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={iconCircle}><FaUserPlus /></div>
            <h1 style={{fontSize:"28px", margin:"10px 0", color: "var(--text-main)"}}>Create Account</h1>
            <p style={{ color: "var(--text-muted)", fontSize:"14px" }}>Start recycling smarter with Scrapvex</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={inputGroup}>
               <FaUser style={icon} />
               <input 
                 type="text" 
                 name="name"
                 placeholder="Full Name" 
                 value={form.name} 
                 onChange={handleChange} 
                 style={input} 
               />
            </div>

            <div style={inputGroup}>
               <FaPhoneAlt style={icon} />
               <input 
                 type="text" 
                 name="mobile"
                 placeholder="Mobile Number" 
                 value={form.mobile} 
                 onChange={handleChange} 
                 style={input} 
               />
            </div>

            <div style={inputGroup}>
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

            <div style={inputGroup}>
               <FaLock style={icon} />
               <input 
                 type="password" 
                 name="password"
                 placeholder="Password (Min 6 chars)" 
                 value={form.password} 
                 onChange={handleChange} 
                 style={input} 
               />
            </div>

            <button type="submit" className="btn-premium" style={{marginTop:"15px"}} disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <>Register <FaArrowRight /></>}
            </button>
          </form>

          <div style={{...footerText, color: "var(--text-muted)"}}>
             <p>Already have an account? <Link to="/login" style={{...authLink, color: "var(--primary)"}}>Login Here</Link></p>
          </div>
        </div>
      </div>

    </div>
  );
}

/* STYLES */
const wrap = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 200px)", padding: "40px 20px" };
const card = { width: "100%", maxWidth: "440px", padding: "40px" };
const iconCircle = { width: "80px", height: "80px", background: "var(--primary-light)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "35px", color: "var(--primary)", margin: "0 auto" };
const inputGroup = { display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-main)", padding: "14px 18px", borderRadius: "12px", border: "1px solid var(--glass-border)" };
const icon = { color: "#0b8f3a", fontSize: "14px" };
const input = { border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "15px", color: "var(--text-main)" };
const footerText = { marginTop: "30px", textAlign: "center", fontSize: "14px", color: "#666" };
const authLink = { color: "#0b8f3a", fontWeight: "700", textDecoration: "none" };

export default Register;