import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaRecycle, FaBars, FaTimes, FaUserCircle, FaHome, FaTags,
  FaPlusCircle, FaInfoCircle, FaFileContract, FaUserShield, FaMoon, FaSun, FaDownload
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";
import { getCookie, eraseCookie } from "../utils/cookies";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  let user = null;
  try {
    const rawUser = localStorage.getItem("user") || getCookie("user");
    if (rawUser) {
      user = JSON.parse(rawUser);
    }
  } catch (e) {
    console.error(e);
  }
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get("/settings").then(res => {
      if (res.data.success) setSettings(res.data.data);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    if (open) { document.body.style.overflow = "hidden"; } else { document.body.style.overflow = "auto"; }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const navLinks = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Rates", path: "/rates", icon: <FaTags /> },
    { name: "Book Pickup", path: "/book", icon: <FaPlusCircle /> },
    { name: "Terms", path: "/terms", icon: <FaFileContract /> },
    { name: "About", path: "/about", icon: <FaInfoCircle /> },
  ];

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin-dashboard";
    if (user.role === "collector") return "/collector-dashboard";
    return "/dashboard";
  };

  const closeMenu = () => setOpen(false);

  return (
    <header style={{...headerWrap, background: scrolled ? "var(--glass)" : "var(--card-bg)", borderBottom: scrolled ? "1px solid var(--glass-border)" : "none", boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.08)" : "none"}}>
      <div className="container" style={navInner}>
        {/* LOGO */}
        <Link to="/" style={logo} onClick={closeMenu} className="logo-zoom">
          <div style={logoIcon}><FaRecycle /></div>
          <span style={logoText}>Scrapvex</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav style={desktopNav} className="hide-on-mobile">
          {navLinks.map((link, i) => (
            <Link 
              key={i} 
              to={link.path} 
              style={{...navLink, color: location.pathname === link.path ? "var(--primary)" : "var(--text-main)"}}
              className="nav-link-glow"
            >
              {link.name}
              {location.pathname === link.path && <div style={activeDot} />}
            </Link>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div style={actions}>
          {user ? (
            <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
              <div style={userWrapper} className="hide-on-mobile logo-zoom" onClick={() => navigate(getDashboardPath())}>
                 <FaUserCircle size={24} color="#0b8f3a" />
                 <span style={{fontWeight:"600", fontSize:"14px"}}>{user.name?.split(" ")[0]}</span>
              </div>
            </div>
          ) : (
            <Link to="/login" style={loginBtn} className="hide-on-mobile logo-zoom">Login</Link>
          )}

          {settings && (
            <a href={settings.appDownloadLink || "#"} target="_blank" rel="noreferrer" style={downloadBtn} className="hide-on-mobile logo-zoom">
              <FaDownload /> App
            </a>
          )}

          <button style={menuBtn} onClick={() => setOpen(!open)} className="show-on-mobile social-glow">
            {open ? <FaTimes /> : <FaBars />}
          </button>

          <button 
            style={{...themeBtn, background: isDarkMode ? "#f1c40f" : "#2c3e50"}} 
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light" : "Switch to Dark"}
            className="logo-zoom"
          >
            {isDarkMode ? <FaSun color="#111" /> : <FaMoon color="#fff" />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY MENU */}
      {open && <div style={backdrop} onClick={closeMenu} />}
      <div style={{...mobileOverlay, transform: open ? "translateX(0)" : "translateX(110%)", background: "var(--card-bg)"}}>
         <div style={overlayHeader}>
            <div style={logo} className="logo-zoom">
               <FaRecycle /> <span>Scrapvex</span>
            </div>
            <button style={closeBtn} onClick={closeMenu} className="social-glow"><FaTimes /></button>
         </div>

         <div style={mobileLinks}>
            {user && (
              <Link to={getDashboardPath()} onClick={closeMenu} style={mobileNavLink} className="nav-link-glow">
                <FaUserShield /> Dashboard
              </Link>
            )}
            {navLinks.map((link, i) => (
              <Link key={i} to={link.path} onClick={closeMenu} style={mobileNavLink} className="nav-link-glow">
                {link.icon} {link.name}
              </Link>
            ))}
            {settings && (
              <a 
                href={settings.appDownloadLink || "#"} 
                target="_blank" 
                rel="noreferrer" 
                style={{...mobileNavLink, color: "var(--primary)"}} 
                className="nav-link-glow" 
                onClick={closeMenu}
              >
                <FaDownload /> Download App
              </a>
            )}
            <div style={divider} />
            {!user ? (
              <Link to="/login" onClick={closeMenu} style={mobileNavLink} className="nav-link-glow">Login</Link>
            ) : (
              <button 
                onClick={() => { 
                  localStorage.clear(); 
                  eraseCookie("token");
                  eraseCookie("user");
                  eraseCookie("role");
                  window.location.href = "/login"; 
                }} 
                style={{...mobileNavLink, background:"none", border:"none", width:"100%", textAlign:"left", color:"#e74c3c"}}
              >
                Logout
              </button>
            )}
         </div>

         <div style={overlayFooter}>
            <p>© 2026 Scrapvex. Smart Recycling.</p>
         </div>
      </div>
    </header>
  );
}

/* STYLES */
const headerWrap = { position: "sticky", top: 0, left: 0, right: 0, zIndex: 1000, transition: "0.3s" };
const navInner = { display: "flex", justifyContent: "space-between", alignItems: "center", height: "75px" };
const logo = { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--text-main)" };
const logoIcon = { background: "#0b8f3a", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const logoText = { fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" };
const desktopNav = { display: "flex", gap: "30px", alignItems: "center" };
const navLink = { textDecoration: "none", fontSize: "15px", fontWeight: "600", transition: "0.2s" };
const activeDot = { position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", width: "5px", height: "5px", background: "#0b8f3a", borderRadius: "50%" };
const actions = { display: "flex", alignItems: "center", gap: "10px" };
const userWrapper = { display: "flex", alignItems: "center", gap: "10px", background: "var(--primary-light)", padding: "8px 15px", borderRadius: "12px", cursor: "pointer", border: "1.5px solid var(--primary)", color: "var(--text-main)" };
const loginBtn = { background: "#0b8f3a", color: "#fff", textDecoration: "none", padding: "10px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", boxShadow: "0 4px 15px rgba(11,143,58,0.3)" };
const downloadBtn = { background: "#111", color: "#fff", textDecoration: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" };
const themeBtn = { border: "none", width: "40px", height: "40px", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "0.3s", fontSize: "16px" };
const menuBtn = { background: "var(--card-bg)", border: "none", width: "45px", height: "45px", borderRadius: "12px", fontSize: "20px", color: "var(--text-main)", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" };

const mobileOverlay = { 
  position: "fixed", 
  top: "10px", 
  right: "10px", 
  bottom: "10px",
  width: "280px", 
  background: "var(--card-bg)", 
  zIndex: 9999, 
  transition: "0.4s cubic-bezier(0.165, 0.84, 0.44, 1)", 
  boxShadow: "-10px 0 40px rgba(0,0,0,0.1)", 
  padding: "30px", 
  display: "flex", 
  flexDirection: "column",
  borderRadius: "25px",
  border: "1px solid var(--glass-border)"
};
const overlayHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const closeBtn = { background: "none", border: "none", fontSize: "24px", color: "#999", cursor: "pointer" };
const mobileLinks = { display: "flex", flexDirection: "column", gap: "20px", flex: 1 };
const mobileNavLink = { textDecoration: "none", color: "var(--text-main)", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "15px" };
const divider = { height: "1px", background: "#eee", margin: "10px 0" };
const overlayFooter = { marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #eee", fontSize: "12px", color: "#999", textAlign: "center" };
const backdrop = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 9998 };

export default Navbar;