import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaMapMarkerAlt, FaChevronDown, FaCrosshairs, FaExclamationTriangle, 
  FaVoteYea, FaCheckCircle, FaRecycle, FaBars, FaTimes, FaUser, 
  FaDownload, FaPhoneAlt, FaEnvelope, FaUserShield, FaSignOutAlt,
  FaMoon, FaSun
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";
import { performLogout } from "../utils/auth";

function MobileHeader({ onSelectCity }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [activeCities, setActiveCities] = useState([]);
  const [votedAreas, setVotedAreas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("voted_areas") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [voting, setVoting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const user = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  const defaultLocation = user?.area || user?.address || user?.assignedCity || "Rajouri Town, J&K";
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("user_selected_location") || defaultLocation;
  });

  useEffect(() => {
    const fetchActiveCities = async () => {
      try {
        const { data } = await API.get("/pickups/active-cities");
        if (data.success) {
          setActiveCities(data.cities || []);
        }
      } catch (e) {
        console.error("Failed to fetch active cities", e);
      }
    };
    fetchActiveCities();
  }, []);

  const isServiced = (() => {
    if (!selectedLocation || activeCities.length === 0) return true;
    const locLower = selectedLocation.toLowerCase();
    return activeCities.some(city => {
      const cityLower = city.toLowerCase();
      return locLower.includes(cityLower) || cityLower.includes(locLower);
    });
  })();

  const isVoted = votedAreas.includes(selectedLocation);

  const handleVoteArea = async () => {
    if (isVoted) return;
    setVoting(true);
    try {
      const { data } = await API.post("/pickups/vote-area", {
        area: selectedLocation,
        mobile: user?.mobile || ""
      });
      const newVoted = [...votedAreas, selectedLocation];
      setVotedAreas(newVoted);
      localStorage.setItem("voted_areas", JSON.stringify(newVoted));
      setToastMsg(data.message || `Vote recorded for ${selectedLocation}! 🎉`);
      setTimeout(() => setToastMsg(""), 4000);
    } catch (e) {
      const newVoted = [...votedAreas, selectedLocation];
      setVotedAreas(newVoted);
      localStorage.setItem("voted_areas", JSON.stringify(newVoted));
      setToastMsg("Vote recorded! We are planning expansion to your area soon. 🎉");
      setTimeout(() => setToastMsg(""), 4000);
    } finally {
      setVoting(false);
    }
  };

  const locations = [
    "Rajouri Town, J&K",
    "Gujjar Mandi, Rajouri",
    "Jawahar Nagar, Rajouri",
    "Kheora (College Area), Rajouri",
    "Salani Bridge, Rajouri",
    "Darhal, Rajouri",
    "Thanamandi, Rajouri",
    "Nowshera, Rajouri",
    "Kalakote, Rajouri"
  ];

  const detectLiveLocation = () => {
    if ("geolocation" in navigator) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const liveName = data.address?.suburb || data.address?.neighbourhood || data.address?.city || data.address?.town || data.address?.county || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            const fullLoc = `${liveName}, Rajouri`;
            setSelectedLocation(fullLoc);
            localStorage.setItem("user_selected_location", fullLoc);
            if (onSelectCity) onSelectCity(fullLoc);
          } catch (e) {
            console.error("Geocoding failed", e);
            if (user?.area || user?.address) {
              const loc = user.area || user.address;
              setSelectedLocation(loc);
            }
          } finally {
            setGeoLoading(false);
            setShowLocationModal(false);
          }
        },
        (error) => {
          console.warn("GPS error", error);
          setGeoLoading(false);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("user_selected_location")) {
      detectLiveLocation();
    }
  }, []);

  const handleLogout = async () => {
    await performLogout();
    setShowDrawer(false);
    navigate("/login");
  };

  return (
    <>
      <header style={headerContainer}>
        <div style={topRow}>
          {/* Logo Branding */}
          <div style={logoBranding} onClick={() => navigate("/")}>
            <FaRecycle style={{ color: "#0b8f3a", fontSize: "18px" }} />
            <span style={logoText}>ScrapVex</span>
          </div>

          {/* Location Picker */}
          <div style={locationPicker} onClick={() => setShowLocationModal(true)}>
            <div style={locationIconBox}>
              <FaMapMarkerAlt />
            </div>
            <span style={locationTitleText}>
              {selectedLocation.split(",")[0]}
            </span>
            <FaChevronDown style={{ fontSize: "8px", color: "#0b8f3a" }} />
          </div>

          {/* Right Action Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Dark Mode Theme Toggle */}
            <button 
              style={{
                background: "none",
                border: "none",
                fontSize: "16px",
                color: isDarkMode ? "#f1c40f" : "#64748b",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }} 
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light" : "Switch to Dark"}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* Hamburger Drawer Trigger */}
            <button style={menuTriggerBtn} onClick={() => setShowDrawer(true)}>
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      {/* Unserviced Area Warning & Voting Banner */}
      {!isServiced && (
        <div style={unservicedBannerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#92400e", fontWeight: "700", fontSize: "12px" }}>
            <FaExclamationTriangle style={{ color: "#d97706", fontSize: "14px" }} />
            <span>Pickup service not available in {selectedLocation} yet.</span>
          </div>
          <p style={{ margin: "4px 0 8px 0", fontSize: "11px", color: "#78350f" }}>
            Want ScrapVex doorstep pickup here? Vote to help us launch in your area!
          </p>
          <button
            style={isVoted ? votedBtnStyle : voteBtnStyle}
            onClick={handleVoteArea}
            disabled={voting || isVoted}
          >
            {voting ? <FaRecycle className="spin" /> : isVoted ? <FaCheckCircle /> : <FaVoteYea />}
            <span>{isVoted ? `Vote Recorded! 🎉` : `Vote to Start Service`}</span>
          </button>
          {toastMsg && <div style={toastBannerStyle}>{toastMsg}</div>}
        </div>
      )}

      {/* Location Picker Modal Sheet */}
      {showLocationModal && (
        <div style={modalBackdrop} onClick={() => setShowLocationModal(false)}>
          <div style={modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={sheetHandle} />
            <h3 style={sheetTitle}>Select Your Location</h3>
            <p style={sheetSubtitle}>Choose area for instant doorstep pickup availability</p>

            <button
              style={gpsDetectBtn}
              onClick={detectLiveLocation}
              disabled={geoLoading}
            >
              {geoLoading ? <FaRecycle className="spin" /> : <FaCrosshairs style={{ color: "#0b8f3a" }} />}
              <span>{geoLoading ? "Detecting Live Location..." : "Use Current Live GPS Location"}</span>
            </button>

            <div style={locationList}>
              {locations.map((loc, idx) => (
                <div
                  key={idx}
                  style={{
                    ...locationItem,
                    background: selectedLocation === loc ? "#f0fdf4" : "transparent",
                    borderColor: selectedLocation === loc ? "#0b8f3a" : "#f1f5f9"
                  }}
                  onClick={() => {
                    setSelectedLocation(loc);
                    localStorage.setItem("user_selected_location", loc);
                    setShowLocationModal(false);
                    if (onSelectCity) onSelectCity(loc);
                  }}
                >
                  <FaMapMarkerAlt style={{ color: selectedLocation === loc ? "#0b8f3a" : "#94a3b8" }} />
                  <span style={{ fontWeight: selectedLocation === loc ? "700" : "500", color: "#0f172a" }}>{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIDE DRAWER MENU */}
      {showDrawer && (
        <div style={drawerBackdrop} onClick={() => setShowDrawer(false)}>
          <div style={drawerSheet} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={drawerHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={logoIconSquare}><FaRecycle /></div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a" }}>ScrapVex</span>
                  <span style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8" }}>Smart Recycling J&K</span>
                </div>
              </div>
              <button style={drawerCloseBtn} onClick={() => setShowDrawer(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Profile Greeting Section */}
            <div style={drawerUserBanner}>
              <div style={drawerUserAvatar}>
                <FaUser />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                  {user ? user.name : "Guest User"}
                </span>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#0b8f3a", textTransform: "uppercase" }}>
                  {user ? "Customer Account" : "Access Services"}
                </span>
              </div>
            </div>

            {/* Drawer Menu Items */}
            <div style={drawerMenuLinks}>
              
              {/* Core Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <Link to="/contact" className="drawer-link-item" style={drawerLinkStyle} onClick={() => setShowDrawer(false)}>
                  <FaPhoneAlt style={{ color: "#0b8f3a", fontSize: "13px" }} />
                  <span>Contact Customer Support</span>
                </Link>

                <a href="/ScrapVex.apk" download="ScrapVex.apk" style={drawerLinkStyle} onClick={() => setShowDrawer(false)}>
                  <FaDownload style={{ color: "#0b8f3a", fontSize: "13px" }} />
                  <span>Download Mobile App</span>
                </a>
              </div>

              <div style={drawerDivider} />

              {/* Login / Actions (Non-duplicate check) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {!user ? (
                  <>
                    <Link to="/login" style={drawerLinkStyle} onClick={() => setShowDrawer(false)}>
                      <FaUser style={{ color: "#64748b", fontSize: "13px" }} />
                      <span>Customer Login</span>
                    </Link>

                    <Link to="/admin-login" style={drawerLinkStyle} onClick={() => setShowDrawer(false)}>
                      <FaUserShield style={{ color: "#64748b", fontSize: "13px" }} />
                      <span>Admin Login Portal</span>
                    </Link>

                    <Link to="/collector-login" style={drawerLinkStyle} onClick={() => setShowDrawer(false)}>
                      <FaUser style={{ color: "#64748b", fontSize: "13px" }} />
                      <span>Collector Login</span>
                    </Link>
                  </>
                ) : (
                  <button onClick={handleLogout} style={drawerLogoutBtn}>
                    <FaSignOutAlt style={{ fontSize: "13px" }} />
                    <span>Log Out Account</span>
                  </button>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div style={drawerFooter}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#0f172a" }}>ScrapVex App v2.4.2</span>
              <span style={{ fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>Support: support@scrapvex.in | 8491028539</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────
   STYLING DEFINITIONS
   ──────────────────────────────────────────────────────── */
const headerContainer = {
  background: "#ffffff",
  padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px 10px 16px",
  position: "sticky",
  top: 0,
  zIndex: 100,
  borderBottom: "1px solid #f1f5f9",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%"
};

const logoBranding = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer"
};

const logoText = {
  fontSize: "15px",
  fontWeight: "900",
  color: "#0f172a",
  letterSpacing: "-0.5px"
};

const locationPicker = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: "8px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0"
};

const locationIconBox = {
  color: "#0b8f3a",
  fontSize: "11px",
  display: "flex",
  alignItems: "center"
};

const locationTitleText = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#334155",
  maxWidth: "90px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const menuTriggerBtn = {
  background: "none",
  border: "none",
  color: "#0f172a",
  fontSize: "16px",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center"
};

const unservicedBannerStyle = {
  background: "#fffbeb",
  borderBottom: "1px solid #fde68a",
  padding: "10px 16px"
};

const voteBtnStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #d97706, #b45309)",
  color: "#ffffff",
  fontWeight: "800",
  fontSize: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  cursor: "pointer"
};

const votedBtnStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#15803d",
  fontWeight: "800",
  fontSize: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  cursor: "default"
};

const toastBannerStyle = {
  marginTop: "6px",
  padding: "6px 10px",
  borderRadius: "6px",
  background: "#dcfce7",
  color: "#166534",
  fontSize: "11px",
  fontWeight: "600",
  textAlign: "center"
};

const gpsDetectBtn = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#15803d",
  fontWeight: "700",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "pointer",
  marginBottom: "12px"
};

const modalBackdrop = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(15, 23, 42, 0.5)",
  backdropFilter: "blur(4px)",
  zIndex: 9999,
  display: "flex",
  alignItems: "flex-end"
};

const modalSheet = {
  background: "#ffffff",
  width: "100%",
  maxWidth: "500px",
  margin: "0 auto",
  borderTopLeftRadius: "24px",
  borderTopRightRadius: "24px",
  padding: "20px"
};

const sheetHandle = {
  width: "40px",
  height: "4px",
  background: "#cbd5e1",
  borderRadius: "2px",
  margin: "0 auto 16px auto"
};

const sheetTitle = {
  fontSize: "17px",
  fontWeight: "800",
  color: "#0f172a",
  margin: "0 0 4px 0"
};

const sheetSubtitle = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 16px 0"
};

const locationList = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxHeight: "260px",
  overflowY: "auto"
};

const locationItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #f1f5f9",
  cursor: "pointer"
};

/* ─── SIDE DRAWER OVERLAY STYLES ─── */
const drawerBackdrop = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(15, 23, 42, 0.4)",
  backdropFilter: "blur(3px)",
  zIndex: 100000,
  display: "flex",
  justifyContent: "flex-end"
};

const drawerSheet = {
  background: "#ffffff",
  width: "80%",
  maxWidth: "300px",
  height: "100%",
  boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  padding: "20px 16px"
};

const drawerHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "16px",
  borderBottom: "1px solid #f1f5f9"
};

const logoIconSquare = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  background: "#f0fdf4",
  color: "#0b8f3a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  border: "1px solid #dcfce7"
};

const drawerCloseBtn = {
  background: "none",
  border: "none",
  color: "#64748b",
  fontSize: "16px",
  cursor: "pointer",
  padding: "4px"
};

const drawerUserBanner = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  margin: "16px 0",
  padding: "12px",
  background: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #f1f5f9"
};

const drawerUserAvatar = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: "#ffffff",
  border: "1.5px solid #0b8f3a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0b8f3a",
  fontSize: "14px"
};

const drawerMenuLinks = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  flex: 1
};

const drawerLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 10px",
  borderRadius: "10px",
  textDecoration: "none",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "700",
  transition: "background 0.2s"
};

const drawerLogoutBtn = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 10px",
  borderRadius: "10px",
  border: "none",
  background: "none",
  width: "100%",
  textAlign: "left",
  color: "#dc2626",
  fontSize: "13px",
  fontWeight: "800",
  cursor: "pointer"
};

const drawerDivider = {
  height: "1px",
  background: "#f1f5f9",
  margin: "6px 0"
};

const drawerFooter = {
  paddingTop: "16px",
  borderTop: "1px solid #f1f5f9",
  display: "flex",
  flexDirection: "column",
  textAlign: "center"
};

export default MobileHeader;
