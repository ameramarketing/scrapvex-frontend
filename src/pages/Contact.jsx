import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, 
  FaPaperPlane, FaWhatsapp, FaComments, FaCheckCircle, FaArrowLeft, FaHeadset
} from "react-icons/fa";
import Footer from "../components/Footer";
import API from "../services/api";

function Contact() {
  const navigate = useNavigate();
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
    document.title = "Contact ScrapVex | Doorstep Scrap Dealer Helpline Rajouri J&K";
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
    <div style={{ background: "var(--bg-main, #f8fafc)", minHeight: "100vh", color: "var(--text-main, #0f172a)" }}>
      
      {/* NATIVE MOBILE HEADER WITH BACK BUTTON */}
      <header style={{
        background: "var(--card-bg, #ffffff)",
        padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px 12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderBottom: "1px solid var(--card-border, #e2e8f0)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "var(--bg-main, #f1f5f9)",
            border: "none",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-main, #0f172a)",
            cursor: "pointer",
            fontSize: "15px",
            flexShrink: 0
          }}
          title="Go Back"
        >
          <FaArrowLeft />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ background: "#eff6ff", color: "#2563eb", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center" }}>
            <FaHeadset size={16} />
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "900", margin: 0, lineHeight: 1.2 }}>Help & Support</h1>
            <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)" }}>ScrapVex Customer Care</span>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          padding: "12px 20px",
          borderRadius: "12px",
          background: toast.type === "success" ? "#0b8f3a" : "#e11d48",
          color: "#fff",
          fontWeight: "800",
          fontSize: "13px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          maxWidth: "90%",
          boxSizing: "border-box"
        }}>
          <FaCheckCircle /> {toast.text}
        </div>
      )}

      {/* CONTENT CONTAINER */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px 14px 40px 14px" }}>
        
        {/* HERO BADGE CARD (HIGH CONTRAST WHITE TEXT) */}
        <div style={{
          background: "linear-gradient(135deg, #0b8f3a 0%, #086d2c 100%)",
          borderRadius: "18px",
          padding: "24px 20px",
          color: "#ffffff",
          boxShadow: "0 8px 24px rgba(11,143,58,0.25)",
          marginBottom: "16px",
          textAlign: "center"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.2)",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "800",
            color: "#ffffff",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            <FaComments /> We Are Here To Help
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 8px 0", color: "#ffffff" }}>
            Contact ScrapVex Support
          </h2>
          <p style={{ fontSize: "13px", color: "#ffffff", margin: 0, lineHeight: 1.5, opacity: 0.95, fontWeight: "500" }}>
            Have questions about doorstep scrap pickup, rates, wallet payouts, or franchise opportunities? Reach out to our team in Rajouri & Jammu & Kashmir!
          </p>
        </div>

        {/* CONTACT CARDS GRID */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          
          {/* Call Us Directly */}
          <div style={contactCardStyle}>
            <div style={{ ...iconPillStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaPhoneAlt /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Call Us Directly</div>
              <a href={`tel:${settings?.contactPhone || "+918491028539"}`} style={{ fontSize: "14px", fontWeight: "900", color: "#0b8f3a", textDecoration: "none", display: "block", marginTop: "2px" }}>
                {settings?.contactPhone || "+91 8491028539"}
              </a>
              <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)" }}>Mon - Sat (9:00 AM - 7:00 PM)</span>
            </div>
          </div>

          {/* Email Support */}
          <div style={contactCardStyle}>
            <div style={{ ...iconPillStyle, background: "#eff6ff", color: "#2563eb" }}><FaEnvelope /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Email Support</div>
              <a href={`mailto:${settings?.contactEmail || "support@scrapvex.in"}`} style={{ fontSize: "13px", fontWeight: "800", color: "#2563eb", textDecoration: "none", display: "block", marginTop: "2px" }}>
                {settings?.contactEmail || "support@scrapvex.in"}
              </a>
              <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)" }}>Quick response within 24 hours</span>
            </div>
          </div>

          {/* WhatsApp Direct Chat */}
          <a
            href={`https://wa.me/${(settings?.whatsappNumber || "8491028539").replace(/[^0-9]/g, "")}?text=Hi%20ScrapVex%20Team,%20I%20need%20help%20with%20my%20scrap%20pickup.`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              color: "#ffffff",
              padding: "14px 16px",
              borderRadius: "14px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(37, 211, 102, 0.25)"
            }}
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              <FaWhatsapp />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: "900", color: "#ffffff" }}>Instant WhatsApp Chat</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.9)" }}>Click to open chat with support team</div>
            </div>
          </a>

          {/* Office Address & Hours */}
          <div style={contactCardStyle}>
            <div style={{ ...iconPillStyle, background: "#fef3c7", color: "#d97706" }}><FaMapMarkerAlt /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Head Office Address</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", marginTop: "2px" }}>
                {settings?.officeAddress || "ScrapVex HQ, Rajouri, Jammu & Kashmir, 185131"}
              </div>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#0b8f3a", background: "#f0fdf4", padding: "2px 6px", borderRadius: "6px", display: "inline-block", marginTop: "4px" }}>
                J&K's #1 Digital Scrap Recycling Platform
              </span>
            </div>
          </div>

        </div>

        {/* SEND US A MESSAGE FORM */}
        <div style={{
          background: "var(--card-bg, #ffffff)",
          borderRadius: "18px",
          padding: "20px 16px",
          border: "1px solid var(--card-border, #e2e8f0)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "900", color: "var(--text-main, #0f172a)", margin: "0 0 4px 0" }}>
            Send Us a Message
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: "0 0 16px 0" }}>
            Fill out the details below and our team will call you back.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={labelStyle}>YOUR FULL NAME *</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>MOBILE NUMBER *</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>EMAIL ADDRESS (OPTIONAL)</label>
              <input
                type="email"
                placeholder="e.g. rahul@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>SUBJECT</label>
              <input
                type="text"
                placeholder="e.g. Scrap Rates Inquiry / Franchise"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>MESSAGE *</label>
              <textarea
                rows={4}
                placeholder="Describe your inquiry or question..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{ ...inputStyle, resize: "none", height: "80px" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--primary, #0b8f3a)",
                color: "#ffffff",
                border: "none",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "4px"
              }}
            >
              <FaPaperPlane /> {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

      </div>

      <Footer />
    </div>
  );
}

const contactCardStyle = {
  background: "var(--card-bg, #ffffff)",
  borderRadius: "16px",
  padding: "14px 16px",
  border: "1px solid var(--card-border, #e2e8f0)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
};

const iconPillStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  flexShrink: 0
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "var(--text-muted, #64748b)",
  display: "block",
  marginBottom: "4px",
  letterSpacing: "0.5px"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1.5px solid var(--card-border, #cbd5e1)",
  background: "var(--bg-main, #f8fafc)",
  color: "var(--text-main, #0f172a)",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  fontWeight: "500"
};

export default Contact;
