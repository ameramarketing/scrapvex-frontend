import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaRecycle, FaBars, FaTimes, FaUserCircle, FaHome, FaTags,
  FaPlusCircle, FaInfoCircle, FaFileContract, FaUserShield, FaMoon, FaSun, FaDownload
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";
import { getCookie, eraseCookie } from "../utils/cookies";
import { performLogout } from "../utils/auth";

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
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("cachedSettings");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    API.get("/settings").then(res => {
      if (res.data?.success) {
        setSettings(res.data.data);
        localStorage.setItem("cachedSettings", JSON.stringify(res.data.data));
      }
    }).catch(err => console.error(err));
  }, []);

  const getLogoSrc = (path) => {
    if (!path) return "/04_Square_Logo.png";
    if (path.startsWith("http")) return path;
    const base = (import.meta.env.VITE_API_URL || "https://scrapvex-backend.onrender.com").replace(/\/$/, "");
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    if (settings?.favicon) {
      const faviconUrl = getLogoSrc(settings.favicon);
      let faviconLink = document.querySelector("link[rel*='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "shortcut icon";
        document.getElementsByTagName("head")[0].appendChild(faviconLink);
      }
      faviconLink.href = faviconUrl;
    }
  }, [settings?.favicon]);

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
    { name: "Scrap Rates", path: "/rates", icon: <FaTags /> },
    { name: "Book Pickup", path: "/book", icon: <FaPlusCircle /> },
    { name: "About Us", path: "/about", icon: <FaInfoCircle /> },
    { name: "Contact", path: "/contact", icon: <FaFileContract /> },
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
          <img 
            src={getLogoSrc(settings?.brandLogo)} 
            alt="ScrapVex" 
            onError={(e) => { e.target.src = "/04_Square_Logo.png"; }}
            style={{width: "42px", height: "42px", borderRadius: "12px", objectFit: "cover", border: "1.5px solid var(--primary)"}} 
          />
          <span style={logoText}>Scrapvex</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav style={desktopNav} className="hide-on-mobile">
          {navLinks.map((link, i) => (
            <Link 
              key={i} 
              to={link.path} 
              style={{
                ...navLink,
                color: location.pathname === link.path ? "var(--primary)" : "var(--text-main)",
                fontWeight: location.pathname === link.path ? "800" : "600",
              }}
              className="nav-link-glow"
            >
              {link.name}
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

          <a 
            href={settings?.appDownloadLink && settings.appDownloadLink !== "#" ? settings.appDownloadLink : "/ScrapVex.apk"} 
            download="ScrapVex.apk" 
            style={downloadBtn} 
            className="hide-on-mobile logo-zoom"
          >
            <FaDownload /> App
          </a>

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
            <a 
              href={settings?.appDownloadLink && settings.appDownloadLink !== "#" ? settings.appDownloadLink : "/ScrapVex.apk"} 
              download="ScrapVex.apk"
              style={{...mobileNavLink, color: "var(--primary)"}} 
              className="nav-link-glow" 
              onClick={closeMenu}
            >
              <FaDownload /> Download App
            </a>
            <div style={divider} />
            {!user ? (
              <>
                <Link to="/login" onClick={closeMenu} style={mobileNavLink} className="nav-link-glow">Customer Login</Link>
                <Link to="/admin-login" onClick={closeMenu} style={{...mobileNavLink, color: "var(--primary)"}} className="nav-link-glow"><FaUserShield /> Admin Login</Link>
              </>
            ) : (
              <button 
                onClick={async () => { 
                  await performLogout();
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
const headerWrap = {
  position: "sticky",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s",
  backdropFilter: "blur(12px)",
};
const navInner = { display: "flex", justifyContent: "space-between", alignItems: "center", height: "72px" };
const logo = { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--text-main)" };
const logoText = { fontSize: "21px", fontWeight: "900", letterSpacing: "-0.5px", color: "var(--text-main)" };
const desktopNav = { display: "flex", gap: "6px", alignItems: "center" };
const navLink = {
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "600",
  transition: "color 0.2s ease",
  padding: "8px 12px",
  borderRadius: "8px",
  position: "relative",
  display: "inline-block",
};
const actions = { display: "flex", alignItems: "center", gap: "8px" };
const userWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "var(--primary-light)",
  padding: "8px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  border: "1.5px solid rgba(11,143,58,0.2)",
  color: "var(--text-main)",
  transition: "all 0.2s ease",
};
const loginBtn = {
  background: "var(--primary)",
  color: "#fff",
  textDecoration: "none",
  padding: "9px 20px",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "700",
  boxShadow: "0 3px 10px rgba(11,143,58,0.25)",
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
};
const downloadBtn = {
  background: "var(--text-main)",
  color: "var(--card-bg)",
  textDecoration: "none",
  padding: "9px 16px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  transition: "all 0.2s ease",
};
const themeBtn = {
  border: "1.5px solid var(--card-border)",
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 0.25s ease",
  fontSize: "16px",
};
const menuBtn = {
  background: "var(--bg-subtle)",
  border: "1.5px solid var(--card-border)",
  width: "42px",
  height: "42px",
  borderRadius: "11px",
  fontSize: "19px",
  color: "var(--text-main)",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const mobileOverlay = {
  position: "fixed",
  top: "10px",
  right: "10px",
  bottom: "10px",
  width: "280px",
  background: "var(--card-bg)",
  zIndex: 9999,
  transition: "transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  padding: "28px 24px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "22px",
  border: "1px solid var(--card-border)",
};
const overlayHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" };
const closeBtn = { background: "var(--bg-subtle)", border: "1.5px solid var(--card-border)", width: "36px", height: "36px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "var(--text-muted)", cursor: "pointer" };
const mobileLinks = { display: "flex", flexDirection: "column", gap: "4px", flex: 1 };
const mobileNavLink = { textDecoration: "none", color: "var(--text-main)", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "14px", padding: "12px 10px", borderRadius: "10px", transition: "background 0.2s" };
const divider = { height: "1px", background: "var(--card-border)", margin: "12px 0" };
const overlayFooter = { marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--card-border)", fontSize: "12px", color: "var(--text-light)", textAlign: "center" };
const backdrop = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", zIndex: 9998 };

export default Navbar;