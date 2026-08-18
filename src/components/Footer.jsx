import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaRecycle, FaFacebookF, FaInstagram, FaWhatsapp, FaPhoneAlt,
  FaEnvelope, FaMapMarkerAlt, FaArrowRight, FaLinkedinIn
} from "react-icons/fa";
import API from "../services/api";

function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get("/settings").then(res => {
      if (res.data.success) setSettings(res.data.data);
    }).catch(err => console.error(err));
  }, []);

  return (
    <footer style={footer} className="hide-on-mobile">
      <div className="container grid-4 section-padding">
        
        {/* BRAND */}
        <div style={brandBox}>
          <Link to="/" style={logoWrap} className="logo-zoom">
            <div style={logoIcon}><FaRecycle /></div>
            <h2 style={logoText}>Scrapvex</h2>
          </Link>
          <p style={desc}>
            Your hassle-free door-to-door scrap pickup service in Rajouri. Book online, recycle smarter, and get paid instantly.
          </p>
          <div style={socialWrap}>
            {settings?.facebookUrl && settings.facebookUrl !== "#" ? (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="social-glow" style={{borderRadius:"10px"}}><Social icon={<FaFacebookF />} /></a>
            ) : <Social icon={<FaFacebookF />} />}
            
            {settings?.instagramUrl && settings.instagramUrl !== "#" ? (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="social-glow" style={{borderRadius:"10px"}}><Social icon={<FaInstagram />} /></a>
            ) : <Social icon={<FaInstagram />} />}
            
            {settings?.linkedinUrl && settings.linkedinUrl !== "#" ? (
              <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="social-glow" style={{borderRadius:"10px"}}><Social icon={<FaLinkedinIn />} /></a>
            ) : <Social icon={<FaLinkedinIn />} />}

            <a href={settings?.whatsappUrl || (settings?.whatsappNumber ? `https://wa.me/91${settings.whatsappNumber}` : "https://wa.me/918491028539")} target="_blank" rel="noreferrer" className="social-glow" style={{borderRadius:"10px"}}><Social icon={<FaWhatsapp />} /></a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="text-center-mobile">
          <h3 style={title}>Quick Links</h3>
          <div style={linkCol}>
            <FooterLink to="/" text="Home" />
            <FooterLink to="/rates" text="Scrap Rates" />
            <FooterLink to="/book" text="Book Pickup" />
            <a href="/ScrapVex.apk" download="ScrapVex.apk" style={linkItem} className="nav-link-glow">
              <FaArrowRight style={{ fontSize: "10px", color: "#0b8f3a" }} />
              Download Android App (APK)
            </a>
            <FooterLink to="/terms" text="Terms & Conditions" />
            <FooterLink to="/about" text="About Us" />
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="text-center-mobile">
          <h3 style={title}>Account</h3>
          <div style={linkCol}>
            <FooterLink to="/login" text="User Login" />
            <FooterLink to="/dashboard" text="Dashboard" />
            <FooterLink to="/profile" text="My Profile" />
            <FooterLink to="/collector-login" text="Collector Portal" />
            <FooterLink to="/franchise-login" text="Franchise Portal" />
          </div>
        </div>

        {/* CONTACT */}
        <div className="text-center-mobile">
          <h3 style={title}>Get In Touch</h3>
          <div style={infoCol}>
             <InfoRow icon={<FaPhoneAlt />} text="+91 8491028539" />
             <InfoRow icon={<FaEnvelope />} text={settings?.contactEmail || "support@scrapvex.in"} />
             <InfoRow icon={<FaMapMarkerAlt />} text="Rajouri, J&K, India" />
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={bottom}>
        <div className="container" style={bottomFlex}>
           <span>© 2026 Scrapvex. All Rights Reserved.</span>
           <div style={{display:"flex", gap:"20px"}}>
              <Link to="/privacy" style={bottomLink} className="nav-link-glow">Privacy Policy</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}

/* REUSABLE */
function FooterLink({ to, text }) {
  return (
    <Link to={to} style={linkItem} className="nav-link-glow">
      <FaArrowRight style={{ fontSize: "10px", color: "#0b8f3a" }} />
      {text}
    </Link>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div style={infoRow}>
      <span style={{color: "#0b8f3a", marginTop: "4px"}}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Social({ icon }) {
  return (
    <button style={socialBtn} className="social-glow">
      {icon}
    </button>
  );
}

/* STYLES */
const footer = { background: "var(--card-bg)", color: "var(--text-main)", marginTop: "auto", borderTop: "1px solid var(--glass-border)" };
const brandBox = { display: "flex", flexDirection: "column", gap: "20px" };
const logoWrap = { display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "var(--text-main)" };
const logoIcon = { width: "45px", height: "45px", borderRadius: "12px", background: "var(--primary)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", color: "#fff" };
const logoText = { margin: 0, fontSize: "24px", fontWeight: "800" };
const desc = { color: "var(--text-muted)", lineHeight: "1.7", fontSize: "14px" };
const socialWrap = { display: "flex", gap: "10px" };
const socialBtn = { width: "40px", height: "40px", borderRadius: "10px", border: "1.5px solid var(--glass-border)", background: "var(--glass-border)", color: "var(--text-main)", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease" };
const title = { marginBottom: "25px", fontSize: "18px", fontWeight: "700", position: "relative", color: "var(--text-main)" };
const linkCol = { display: "flex", flexDirection: "column", gap: "12px" };
const infoCol = { display: "flex", flexDirection: "column", gap: "15px" };
const linkItem = { textDecoration: "none", color: "var(--text-muted)", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", transition: "0.3s" };
const infoRow = { display: "flex", gap: "12px", alignItems: "flex-start", color: "var(--text-muted)", fontSize: "14px" };
const bottom = { borderTop: "1px solid var(--glass-border)", padding: "25px 0", color: "var(--text-muted)", fontSize: "13px" };
const bottomFlex = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" };
const bottomLink = { color: "inherit", textDecoration: "none", fontSize: "12px" };

export default Footer;