import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaChevronDown, FaCrosshairs, FaExclamationTriangle, FaVoteYea, FaCheckCircle, FaRecycle } from "react-icons/fa";
import API from "../services/api";

function MobileHeader({ onSelectCity }) {
  const [showLocationModal, setShowLocationModal] = useState(false);
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

      {/* Unserviced Area Warning & Voting Banner */}
      {!isServiced && (
        <div style={unservicedBannerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#92400e", fontWeight: "700", fontSize: "13px" }}>
            <FaExclamationTriangle style={{ color: "#d97706", fontSize: "16px" }} />
            <span>We currently don't offer pickup service in {selectedLocation} yet.</span>
          </div>
          <p style={{ margin: "6px 0 10px 0", fontSize: "12px", color: "#78350f" }}>
            Want ScrapVex doorstep pickup in your area? Cast your vote to launch service here!
          </p>
          <button
            style={isVoted ? votedBtnStyle : voteBtnStyle}
            onClick={handleVoteArea}
            disabled={voting || isVoted}
          >
            {voting ? <FaRecycle className="spin" /> : isVoted ? <FaCheckCircle /> : <FaVoteYea />}
            <span>{isVoted ? `Vote Recorded for ${selectedLocation}! 🎉` : `Vote to Start Service in ${selectedLocation}`}</span>
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
    </>
  );
}

const headerContainer = {
  background: "#ffffff",
  padding: "calc(12px + env(safe-area-inset-top, 0px)) 16px 12px 16px",
  position: "sticky",
  top: 0,
  zIndex: 100,
  borderBottom: "1px solid #f1f5f9",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const unservicedBannerStyle = {
  background: "#fffbeb",
  borderBottom: "1px solid #fde68a",
  padding: "12px 16px",
  animation: "fadeIn 0.3s ease-in-out"
};

const voteBtnStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #d97706, #b45309)",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(217,119,6,0.3)"
};

const votedBtnStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#15803d",
  fontWeight: "700",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "default"
};

const toastBannerStyle = {
  marginTop: "8px",
  padding: "8px 12px",
  borderRadius: "8px",
  background: "#dcfce7",
  color: "#166534",
  fontSize: "12px",
  fontWeight: "600",
  textAlign: "center"
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
