import React, { useState, useEffect } from "react";
import { 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, 
  FaPaperPlane, FaWhatsapp, FaComments, FaCheckCircle 
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function Contact() {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", text: "" });

  useEffect(() => {
    API.get("/settings")
      .then(res => {
        if (res.data.success) setSettings(res.data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const showToast = (type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: "success", text: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.message) {
      return showToast("error", "Name, mobile number and message are required!");
    }

    try {
      setLoading(true);
      const { data } = await API.post("/contacts", formData);
      if (data.success) {
        showToast("success", "Message sent successfully! Our team will contact you shortly.");
        setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)" }}>
      <Navbar />

      {/* MOBILE RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .contact-grid-wrap {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .contact-row-group {
            flex-direction: column !important;
          }
          .contact-hero-box {
            padding: 30px 16px !important;
            border-radius: 16px !important;
          }
          .contact-hero-title {
            font-size: 24px !important;
          }
          .contact-form-card {
            padding: 20px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      {/* TOAST */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "14px 24px",
          borderRadius: "12px",
          background: toast.type === "success" ? "#0b8f3a" : "#e11d48",
          color: "#fff",
          fontWeight: "bold",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <FaCheckCircle /> {toast.text}
        </div>
      )}

      {/* HERO SECTION */}
      <div style={heroWrap} className="container">
        <div style={heroBox} className="fade-up contact-hero-box">
          <p style={heroTag}><FaComments /> WE ARE HERE TO HELP</p>
          <h1 style={heroTitle} className="contact-hero-title">Contact ScrapVex Support</h1>
          <p style={heroSub}>
            Have questions about doorstep scrap pickup, rates, wallet payouts, or franchise opportunities? 
            Reach out to our team in Rajouri & Jammu & Kashmir!
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container section-padding">
        <div style={gridWrap} className="contact-grid-wrap">
          
          {/* LEFT: INFO CARDS */}
          <div style={infoCol}>
            <div style={cardStyle}>
              <div style={iconBadge}><FaPhoneAlt /></div>
              <div>
                <h4 style={cardHeading}>Call Us Directly</h4>
                <p style={cardText}>{settings?.contactPhone || "+91 8491028539"}</p>
                <small style={cardMuted}>Mon - Sat (9:00 AM - 7:00 PM)</small>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconBadge}><FaEnvelope /></div>
              <div>
                <h4 style={cardHeading}>Email Support</h4>
                <p style={cardText}>{settings?.contactEmail || "support@scrapvex.com"}</p>
                <small style={cardMuted}>Quick response within 24 hours</small>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconBadge}><FaMapMarkerAlt /></div>
              <div>
                <h4 style={cardHeading}>Head Office Address</h4>
                <p style={cardText}>{settings?.officeAddress || "ScrapVex HQ, Rajouri, Jammu & Kashmir, 185131"}</p>
                <small style={cardMuted}>J&K's 1st Digital Kabadiwala Platform</small>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconBadge}><FaClock /></div>
              <div>
                <h4 style={cardHeading}>Working Hours</h4>
                <p style={cardText}>{settings?.workingHours || "9:00 AM - 7:00 PM (Monday to Saturday)"}</p>
                <small style={cardMuted}>Sunday: Emergency Pickups Only</small>
              </div>
            </div>

            {/* WHATSAPP QUICK CHAT CARD */}
            <a 
              href={`https://wa.me/91${(settings?.contactPhone || "8491028539").replace(/\D/g, "")}`} 
              target="_blank" 
              rel="noreferrer"
              style={whatsappCard}
            >
              <FaWhatsapp style={{ fontSize: "28px" }} />
              <div>
                <strong style={{ display: "block", fontSize: "16px" }}>Chat on WhatsApp</strong>
                <span style={{ fontSize: "13px", opacity: 0.9 }}>Get instant help & rate inquiries on WhatsApp</span>
              </div>
            </a>
          </div>

          {/* RIGHT: INQUIRY FORM */}
          <div style={formCard} className="contact-form-card">
            <h3 style={formTitle}>Send Us a Message</h3>
            <p style={formSub}>Fill out the form below and our team will reach out to you immediately.</p>

            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={inputGroup}>
                <label style={labelStyle}>Your Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  style={inputStyle}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={rowGroup} className="contact-row-group">
                <div style={inputGroup}>
                  <label style={labelStyle}>Mobile Number *</label>
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number" 
                    style={inputStyle}
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Email Address (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    style={inputStyle}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Subject / Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pickup Inquiry, Rate Question, Franchise Opportunity" 
                  style={inputStyle}
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Message *</label>
                <textarea 
                  rows="4" 
                  placeholder="Write your query or message here..." 
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading ? "Sending Message..." : <>Send Message <FaPaperPlane /></>}
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

/* STYLES */
const heroWrap = { padding: "40px 0 20px 0" };
const heroBox = { 
  background: "linear-gradient(135deg, #0b8f3a 0%, #086d2c 100%)", 
  color: "#fff", 
  padding: "50px 30px", 
  borderRadius: "24px", 
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(11, 143, 58, 0.2)"
};
const heroTag = { display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: "30px", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase" };
const heroTitle = { fontSize: "36px", fontWeight: "800", margin: "15px 0 10px 0" };
const heroSub = { fontSize: "16px", opacity: 0.9, maxWidth: "650px", margin: "0 auto", lineHeight: "1.6" };

const gridWrap = { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "30px", alignItems: "start" };
const infoCol = { display: "flex", flexDirection: "column", gap: "16px" };

const cardStyle = { 
  display: "flex", 
  alignItems: "center", 
  gap: "16px", 
  background: "var(--card-bg)", 
  padding: "20px", 
  borderRadius: "16px", 
  boxShadow: "0 4px 15px rgba(0,0,0,0.04)", 
  border: "1px solid var(--glass-border)" 
};
const iconBadge = { 
  width: "50px", 
  height: "50px", 
  borderRadius: "12px", 
  background: "var(--primary-light)", 
  color: "var(--primary)", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: "20px",
  flexShrink: 0
};
const cardHeading = { fontSize: "15px", fontWeight: "bold", margin: "0 0 4px 0", color: "var(--text-main)" };
const cardText = { fontSize: "15px", fontWeight: "600", margin: 0, color: "var(--primary)" };
const cardMuted = { fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "2px" };

const whatsappCard = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  background: "#25D366",
  color: "#fff",
  padding: "20px",
  borderRadius: "16px",
  textDecoration: "none",
  boxShadow: "0 10px 25px rgba(37, 211, 102, 0.3)",
  transition: "0.3s"
};

const formCard = {
  background: "var(--card-bg)",
  padding: "35px",
  borderRadius: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  border: "1px solid var(--glass-border)"
};
const formTitle = { fontSize: "22px", fontWeight: "bold", margin: "0 0 6px 0", color: "var(--text-main)" };
const formSub = { fontSize: "14px", color: "var(--text-muted)", margin: "0 0 25px 0" };
const formStyle = { display: "flex", flexDirection: "column", gap: "18px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "6px", flex: 1 };
const rowGroup = { display: "flex", gap: "15px" };
const labelStyle = { fontSize: "13px", fontWeight: "bold", color: "var(--text-main)" };
const inputStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  background: "var(--bg-main)",
  color: "var(--text-main)",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box"
};
const submitBtn = {
  background: "linear-gradient(135deg, #0b8f3a 0%, #086d2c 100%)",
  color: "#fff",
  border: "none",
  padding: "14px 24px",
  borderRadius: "12px",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  boxShadow: "0 10px 25px rgba(11, 143, 58, 0.25)",
  marginTop: "10px"
};

export default Contact;
