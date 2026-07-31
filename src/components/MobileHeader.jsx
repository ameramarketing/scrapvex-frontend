import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaChevronDown, FaCrosshairs, FaSpinner } from "react-icons/fa";

function MobileHeader({ onSelectCity }) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

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

  // Auto-detect live GPS location if available
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

  return (
    <>
      <header style={headerContainer}>
        {/* Top Location Bar ONLY (Bell & Profile removed per user request) */}
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
        </div>
      </header>

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
              {geoLoading ? <FaSpinner className="spin" /> : <FaCrosshairs style={{ color: "#0b8f3a" }} />}
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
