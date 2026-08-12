import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { 
  FaRecycle, FaLeaf, FaUsers, FaCalendarAlt, FaShieldAlt, 
  FaRupeeSign, FaTruck, FaGlobeAsia, FaHandshake, FaBolt, 
  FaStar, FaArrowLeft
} from "react-icons/fa";

function About() {
  const navigate = useNavigate();

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
          <div style={{ background: "#f0fdf4", color: "#0b8f3a", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center" }}>
            <FaRecycle size={16} />
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "900", margin: 0, lineHeight: 1.2 }}>About ScrapVex</h1>
            <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)" }}>J&K's #1 Digital Recycling Platform</span>
          </div>
        </div>
      </header>

      {/* CONTENT CONTAINER */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px 14px 40px 14px" }}>
        
        {/* HERO BADGE CARD */}
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
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            margin: "0 auto 12px auto"
          }}>
            <FaRecycle />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 8px 0", color: "#ffffff" }}>
            Revolutionizing Scrap Recycling ♻️
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.95)", margin: 0, lineHeight: 1.5 }}>
            Your trusted tech partner for hassle-free doorstep scrap collection, transparent pricing, and instant wallet payouts.
          </p>
        </div>

        {/* SECTION CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Who We Are */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ ...iconStyle, background: "#eff6ff", color: "#2563eb" }}><FaUsers /></div>
              <h3 style={titleStyle}>Who We Are</h3>
            </div>
            <p style={textStyle}>
              ScrapVex is a technology-driven waste management platform connecting households, shops, and corporate offices with verified scrap collectors across Rajouri and Jammu & Kashmir.
            </p>
            <p style={{ ...textStyle, marginTop: "8px" }}>
              Whether it's newspapers 📰, electronics 💻, metals ⚙️, or plastics 🥤 — we guarantee responsible recycling so scrap never ends up in landfills.
            </p>
          </div>

          {/* Our Mission */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ ...iconStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaLeaf /></div>
              <h3 style={titleStyle}>Our Mission & Vision</h3>
            </div>
            <p style={textStyle}>
              To simplify waste disposal through digital innovation, ensuring fair real-time returns for customers and a cleaner, greener planet 🌱 for future generations.
            </p>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 12px", borderRadius: "10px", marginTop: "10px", fontSize: "12px", fontWeight: "800", color: "#0b8f3a", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaStar color="#eab308" /> Recycling made simple. Rewards made fair.
            </div>
          </div>

          {/* What We Offer */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ ...iconStyle, background: "#fef3c7", color: "#d97706" }}><FaTruck /></div>
              <h3 style={titleStyle}>What We Offer</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <FeatureRow icon={<FaCalendarAlt color="#2563eb" />} title="Doorstep Pickup" desc="Schedule scrap pickups at your convenient time slot." />
              <FeatureRow icon={<FaShieldAlt color="#0b8f3a" />} title="Verified Collectors" desc="Background-checked, uniform-clad professional staff." />
              <FeatureRow icon={<FaRupeeSign color="#ca8a04" />} title="Live Rates & Instant Payouts" desc="Real-time scrap prices with instant wallet or cash payments." />
              <FeatureRow icon={<FaRecycle color="#0b8f3a" />} title="Zero Landfill Commitment" desc="100% material sent to certified industrial recyclers." />
            </div>
          </div>

          {/* Core Values */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ ...iconStyle, background: "#f5f3ff", color: "#7c3aed" }}><FaGlobeAsia /></div>
              <h3 style={titleStyle}>Our Core Values</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
              <ValueBadge icon={<FaHandshake color="#2563eb" />} title="Trust & Reliability" />
              <ValueBadge icon={<FaRupeeSign color="#0b8f3a" />} title="Fair Transparent Rates" />
              <ValueBadge icon={<FaBolt color="#eab308" />} title="Digital Innovation" />
              <ValueBadge icon={<FaLeaf color="#0b8f3a" />} title="Green Eco-Impact" />
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

const FeatureRow = ({ icon, title, desc }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "var(--bg-main, #f8fafc)", padding: "10px", borderRadius: "10px", border: "1px solid var(--card-border, #e2e8f0)" }}>
    <div style={{ fontSize: "16px", marginTop: "2px" }}>{icon}</div>
    <div>
      <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>{title}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted, #64748b)", marginTop: "2px" }}>{desc}</div>
    </div>
  </div>
);

const ValueBadge = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-main, #f8fafc)", padding: "10px", borderRadius: "10px", border: "1px solid var(--card-border, #e2e8f0)" }}>
    <div style={{ fontSize: "14px" }}>{icon}</div>
    <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>{title}</span>
  </div>
);

const cardStyle = {
  background: "var(--card-bg, #ffffff)",
  borderRadius: "16px",
  padding: "16px",
  border: "1px solid var(--card-border, #e2e8f0)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px"
};

const iconStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  flexShrink: 0
};

const titleStyle = {
  fontSize: "14px",
  fontWeight: "800",
  color: "var(--text-main, #0f172a)",
  margin: 0
};

const textStyle = {
  fontSize: "12px",
  color: "var(--text-muted, #64748b)",
  margin: 0,
  lineHeight: 1.6
};

export default About;