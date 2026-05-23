import React from "react";
import {
  FaRecycle,
  FaLeaf,
  FaUsers,
  FaCalendarAlt,
  FaShieldAlt,
  FaRupeeSign,
  FaTruck,
  FaGlobeAsia,
  FaHandshake,
  FaBolt,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <div>
      <Navbar />

      <div style={page}>
        {/* HERO */}
        <section style={hero} className="fade-up">
          <div style={heroIcon}>
            <FaRecycle />
          </div>

          <h1 style={heroTitle}>
            About Scrapvex ♻️
          </h1>

          <p style={heroText}>
            Your trusted partner for hassle-free scrap
            collection and sustainable recycling solutions.
          </p>
        </section>

        {/* WHO WE ARE */}
        <SectionTitle
          icon={<FaUsers />}
          title="Who We Are "
        />

        <div style={box}>
          <p style={para}>
            Scrapvex is a technology-driven waste
            management platform that connects
            individuals and businesses with verified
            scrap collectors.
          </p>

          <p style={para}>
            Whether it's newspapers 📰, electronics 💻,
            metals ⚙️ or plastics 🥤 — we ensure
            responsible recycling so waste never ends
            up in landfills.
          </p>
        </div>

        {/* MISSION */}
        <SectionTitle
          icon={<FaLeaf />}
          title="Our Mission "
        />

        <div style={box}>
          <p style={para}>
            To simplify waste disposal through
            innovation, ensuring fair returns and a
            greener planet 🌱 for future generations.
          </p>

          <div style={quote}>
            <FaStar /> Recycling made simple.
            Rewards made fair.
          </div>
        </div>

        {/* SERVICES */}
        <SectionTitle
          icon={<FaTruck />}
          title="What We Do "
        />

        <div style={grid}>
          <Card
            icon={<FaCalendarAlt />}
            title="Convenient Scheduling"
            text="Book pickups at your preferred time."
          />

          <Card
            icon={<FaShieldAlt />}
            title="Verified Collectors"
            text="Trusted, trained and professional staff."
          />

          <Card
            icon={<FaRupeeSign />}
            title="Transparent Pricing"
            text="Live rates based on type & weight."
          />

          <Card
            icon={<FaRecycle />}
            title="Sustainable Recycling"
            text="Reduce waste through proper recycling."
          />

          <Card
            icon={<FaTruck />}
            title="Doorstep Pickup"
            text="We collect directly from your home."
          />
        </div>

        {/* VALUES */}
        <SectionTitle
          icon={<FaGlobeAsia />}
          title="Our Core Values "
        />

        <div style={grid}>
          <Card
            icon={<FaGlobeAsia />}
            title="Environmental Responsibility"
            text="Building a circular economy."
          />

          <Card
            icon={<FaHandshake />}
            title="Trust & Reliability"
            text="Transparency in every interaction."
          />

          <Card
            icon={<FaRupeeSign />}
            title="Fair Pricing"
            text="Competitive real-time scrap rates."
          />

          <Card
            icon={<FaBolt />}
            title="Innovation"
            text="Modern tools for better service."
          />
        </div>

        {/* CONTACT */}
        <SectionTitle
          icon={<FaPhoneAlt />}
          title="Get In Touch "
        />

        <div style={contactBox}>
          <Row
            icon={<FaEnvelope />}
            text="team@scrapvex.com"
          />

          <Row
            icon={<FaPhoneAlt />}
            text="+91-8491028539"
          />

          <Row
            icon={<FaMapMarkerAlt />}
            text="Rajouri, Jammu & Kashmir, India"
          />
        </div>

        {/* FOOT NOTE */}
        <div style={footerNote}>
          Scrapvex ♻️ – Making waste management
          simple, rewarding and planet-friendly.
          Join us in building a cleaner tomorrow —
          one pickup at a time 
          
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* reusable */
function SectionTitle({ icon, title }) {
  return (
    <h2 style={{...sectionTitle, color: "var(--text-main)"}}>
      <span style={{ color: "var(--primary)" }}>{icon}</span>
      {title}
    </h2>
  );
}

function Card({ icon, title, text }) {
  return (
    <div style={card} className="rate-card">
      <div style={cardIcon}>{icon}</div>

      <h3 style={{ marginBottom: "10px", color: "var(--text-main)" }}>
        {title}
      </h3>

      <p style={{...muted, color: "var(--text-muted)"}}>{text}</p>
    </div>
  );
}

function Row({ icon, text }) {
  return (
    <div style={{...row, borderBottom: "1px solid var(--glass-border)", color: "var(--text-main)"}}>
      <span style={{ color: "var(--primary)" }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

/* styles */
const page = {
  padding: "40px 20px 90px",
  maxWidth: "1250px",
  margin: "auto"
};

const hero = {
  background: "var(--card-bg)",
  padding: "55px",
  borderRadius: "28px",
  textAlign: "center",
  marginBottom: "35px",
  border: "1px solid var(--glass-border)"
};

const heroIcon = {
  fontSize: "72px",
  color: "var(--primary)",
  marginBottom: "14px"
};

const heroTitle = {
  fontSize: "52px",
  marginBottom: "14px",
  color: "var(--text-main)"
};

const heroText = {
  color: "var(--text-muted)",
  fontSize: "18px",
  maxWidth: "700px",
  margin: "auto"
};

const sectionTitle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  margin: "28px 0 18px"
};

const box = {
  background: "var(--card-bg)",
  padding: "28px",
  borderRadius: "22px",
  boxShadow: "0 15px 30px rgba(0,0,0,.05)",
  border: "1px solid var(--glass-border)"
};

const para = {
  color: "var(--text-muted)",
  lineHeight: "1.8",
  marginBottom: "14px"
};

const quote = {
  background: "var(--primary-light)",
  color: "var(--primary)",
  padding: "14px",
  borderRadius: "14px",
  fontWeight: "bold",
  display: "inline-flex",
  gap: "8px",
  alignItems: "center"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: "18px"
};

const card = {
  background: "var(--card-bg)",
  padding: "24px",
  borderRadius: "22px",
  boxShadow: "0 15px 30px rgba(0,0,0,.05)",
  border: "1px solid var(--glass-border)"
};

const cardIcon = {
  fontSize: "28px",
  color: "var(--primary)",
  marginBottom: "14px"
};

const muted = {
  color: "var(--text-muted)",
  lineHeight: "1.7"
};

const contactBox = {
  background: "var(--card-bg)",
  padding: "26px",
  borderRadius: "22px",
  boxShadow: "0 15px 30px rgba(0,0,0,.05)",
  border: "1px solid var(--glass-border)"
};

const row = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  padding: "12px 0"
};

const footerNote = {
  marginTop: "35px",
  background: "var(--primary)",
  color: "#fff",
  padding: "24px",
  borderRadius: "22px",
  textAlign: "center",
  fontSize: "17px",
  lineHeight: "1.8"
};

export default About;