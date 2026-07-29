import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaBell, FaChevronDown, FaUserCircle } from "react-icons/fa";

function MobileHeader({ onSelectCity }) {
  const navigate = useNavigate();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Rajouri Town, J&K");

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

  const user = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  return (
    <>
      <header style={headerContainer}>
        {/* Top Location Bar & Action Icons */}
        <div style={topRow}>
          <div style={locationPicker} onClick={() => setShowLocationModal(true)}>
            <div style={locationIconCircle}>
              <FaMapMarkerAlt />
            </div>
            <div style={locationTextWrap}>
              <span style={locationSubLabel}>SERVICING IN</span>
              <div style={locationMainTitle}>
                <span>{selectedLocation}</span>
                <FaChevronDown style={{ fontSize: "10px", color: "#0b8f3a" }} />
              </div>
            </div>
          </div>

          <div style={rightActions}>
            <button style={actionIconBtn} onClick={() => navigate("/notifications")}>
              <FaBell />
              <span style={notificationBadge} />
            </button>
            <button style={profileAvatarBtn} onClick={() => navigate(user ? "/profile" : "/login")}>
              {user ? (
                <div style={userInitialBadge}>{user.name?.charAt(0).toUpperCase() || "U"}</div>
              ) : (
                <FaUserCircle style={{ fontSize: "28px", color: "#0b8f3a" }} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Location Picker Modal Sheet */}
      {showLocationModal && (
        <div style={modalBackdrop} onClick={() => setShowLocationModal(false)}>
          <div style={modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={sheetHandle} />
            <h3 style={sheetTitle}>Select Your Location in Rajouri</h3>
            <p style={sheetSubtitle}>Choose area for instant doorstep pickup availability</p>

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
    </>
  );
}

const headerContainer = {
  background: "#ffffff",
  padding: "12px 16px",
  position: "sticky",
  top: 0,
  zIndex: 100,
  borderBottom: "1px solid #f1f5f9",
  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const locationPicker = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer"
};

const locationIconCircle = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "#f0fdf4",
  color: "#0b8f3a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px"
};

const locationTextWrap = {
  display: "flex",
  flexDirection: "column"
};

const locationSubLabel = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#0b8f3a",
  letterSpacing: "0.5px"
};

const locationMainTitle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  gap: "4px"
};

const rightActions = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const actionIconBtn = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  cursor: "pointer",
  position: "relative"
};

const notificationBadge = {
  position: "absolute",
  top: "8px",
  right: "8px",
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#ef4444"
};

const profileAvatarBtn = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer"
};

const userInitialBadge = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  background: "#0b8f3a",
  color: "#fff",
  fontWeight: "700",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalBackdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
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
  padding: "20px",
  animation: "slideUp 0.3s ease-out"
};

const sheetHandle = {
  width: "40px",
  height: "4px",
  background: "#cbd5e1",
  borderRadius: "2px",
  margin: "0 auto 16px auto"
};

const sheetTitle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#0f172a",
  margin: "0 0 4px 0"
};

const sheetSubtitle = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0 0 16px 0"
};

const locationList = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxHeight: "300px",
  overflowY: "auto"
};

const locationItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #f1f5f9",
  cursor: "pointer",
  transition: "0.2s"
};

export default MobileHeader;
