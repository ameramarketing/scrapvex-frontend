import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, FaPhoneAlt, FaLock, FaMapMarkerAlt, FaCalendarAlt, FaClock, 
  FaRecycle, FaGift, FaCheckCircle, FaChevronRight, FaInfoCircle, 
  FaPlus, FaMinus, FaCrosshairs, FaCheck, FaWhatsapp, FaSms 
} from "react-icons/fa";
import Toast from "./Toast";
import API from "../services/api";
import { saveAuthData } from "../utils/auth";

function PickupForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [sentOtpCode, setSentOtpCode] = useState("");
  const [otpChannel, setOtpChannel] = useState("whatsapp");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [settings, setSettings] = useState({ minAmount: 300 });
  const [locationLoading, setLocationLoading] = useState(false);
  const [activeCities, setActiveCities] = useState([]);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteAreaName, setVoteAreaName] = useState("");
  const [voteMobile, setVoteMobile] = useState("");
  const [voteLoading, setVoteLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", otp: "", address: "", city: "", pincode: "",
    date: "", time: "", mode: "sell", selectedItems: {}, lat: null, lng: null
  });

  const showToast = (type, message) => setToast({ show: true, type, message });
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleVoteSubmit = async (e) => {
    e?.preventDefault();
    if (!voteAreaName.trim()) return showToast("error", "Please enter your city/area name");
    setVoteLoading(true);
    try {
      const { data } = await API.post("/pickups/vote-area", {
        area: voteAreaName.trim(),
        mobile: voteMobile || form.phone || ""
      });
      if (data.success) {
        showToast("success", `Vote recorded for ${voteAreaName}! We will notify you once active! 🚀`);
        setShowVoteModal(false);
        setVoteAreaName("");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to submit area request");
    } finally {
      setVoteLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm(prev => ({ ...prev, name: user.name || "", phone: user.mobile || "" }));
      if (user.mobile) { setOtpSent(true); setStep(2); }
    }
    API.get("/scrap-items").then(({ data }) => data.success && setItems(data.data || []));
    API.get("/settings").then(({ data }) => {
      if (data.success) setSettings(data.data);
    });
    API.get("/scrap-items/cities").then(({ data }) => {
      if (data.success) setActiveCities(data.cities || []);
    });
  }, []);

  useEffect(() => {
    if (form.city) {
      setLoading(true);
      API.get(`/scrap-items?city=${form.city}`)
        .then(({ data }) => {
          if (data.success) setItems(data.data || []);
        })
        .finally(() => setLoading(false));
    }
  }, [form.city]);

  const sendOtp = async (channel = "whatsapp") => {
    if (!form.name.trim()) return showToast("error", "Enter your name");
    if (form.phone.length !== 10) return showToast("error", "Enter 10-digit mobile number");
    setLoading(true);
    setOtpChannel(channel);
    try {
      const { data } = await API.post("/auth/send-booking-otp", { mobile: form.phone, channel });
      setOtpSent(true);
      showToast("success", data.message || `OTP sent via ${channel.toUpperCase()}!`);
    } catch (e) {
      const msg = e.response?.data?.message || e.customMessage || e.message || "Failed to send OTP. Check number.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (form.otp.length !== 6) return showToast("error", "Enter 6 digit OTP");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/verify-otp", { mobile: form.phone, otp: form.otp, name: form.name });
      if (data.success) {
        showToast("success", data.autoCreated ? "Verified & Account Created! ✨" : "Verified! ✨");
        setStep(2);
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || e.customMessage || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) return showToast("error", "GPS Geolocation is not supported by your device");
    setLocationLoading(true);

    const onLocationSuccess = async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      update("lat", lat);
      update("lng", lng);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const addr = data.address;
        const road = addr?.road || addr?.suburb || addr?.neighbourhood || addr?.residential || "";
        const city = addr?.city || addr?.town || addr?.village || addr?.county || "Rajouri";
        const postcode = addr?.postcode || "185131";

        const formattedAddress = `${road ? road + ", " : ""}${city} (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        update("address", formattedAddress);
        
        if (city) {
          const matchedCity = (cities || []).find(c => c.toLowerCase() === city.toLowerCase());
          if (matchedCity) update("city", matchedCity.toLowerCase());
        }
        
        if (postcode && postcode.length === 6) update("pincode", postcode);

        showToast("success", "Live GPS Location Detected! 📍");
      } catch (err) {
        console.error("Geocoding error", err);
        update("address", `Live GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        showToast("success", "GPS Coordinates Pinned! 📍");
      } finally {
        setLocationLoading(false);
      }
    };

    // Try high accuracy first, if timeout or error, fallback to standard network location
    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      (highAccErr) => {
        if (highAccErr.code === 1) {
          // Permission explicitly denied
          setLocationLoading(false);
          return showToast("error", "Location access denied. Please enable Location in your phone Settings ⚙️");
        }
        // Fallback to low-accuracy network location
        navigator.geolocation.getCurrentPosition(
          onLocationSuccess,
          (coarseErr) => {
            setLocationLoading(false);
            if (coarseErr.code === 1) {
              showToast("error", "Please allow Location permission in your phone settings.");
            } else {
              showToast("error", "Could not fetch GPS. Please type your address manually.");
            }
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const nextAddress = () => {
    if (!form.address.trim()) return showToast("error", "Please enter your address");
    if (!form.city.trim()) return showToast("error", "Please select your city from the dropdown");
    if (!activeCities.includes(form.city)) return showToast("error", "Please select a valid city from the list");
    if (form.pincode.length !== 6) return showToast("error", "Enter a valid 6-digit pincode");
    setStep(3);
  };

  const nextSchedule = () => {
    if (!form.date || !form.time) return showToast("error", "Select date and time slot");
    const selectedDate = new Date(form.date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return showToast("error", "Past dates are not allowed");
    if (form.date === new Date().toISOString().split("T")[0]) {
      const currentHour = new Date().getHours();
      const slotHours = { "10AM - 12PM": 10, "12PM - 2PM": 12, "2PM - 4PM": 14, "4PM - 6PM": 16 };
      if (currentHour >= slotHours[form.time]) return showToast("error", "This slot has already passed for today");
    }
    setStep(4);
  };

  const calculateTotal = () => {
    return Object.entries(form.selectedItems).reduce((sum, [name, qty]) => {
      const item = items.find(it => it.name === name);
      return sum + (item?.price || 0) * qty;
    }, 0);
  };

  const submit = async () => {
    const total = calculateTotal();
    const selectedCount = Object.keys(form.selectedItems).length;
    if (selectedCount === 0) return showToast("error", "Select items to pickup");
    if (form.mode === "sell" && total < settings.minAmount) {
      return showToast("error", `Minimum pickup value required is ₹${settings.minAmount}`);
    }
    setLoading(true);
    try {
      const pickupData = {
        name: form.name, mobile: form.phone, address: form.address, city: form.city,
        pincode: form.pincode, scrapType: Object.keys(form.selectedItems).join(", "),
        pickupDate: form.date, pickupTime: form.time,
        items: Object.entries(form.selectedItems).map(([name, qty]) => ({
          name, quantity: qty, unit: items.find(it => it.name === name)?.unit || "kg",
          price: items.find(it => it.name === name)?.price || 0,
          subtotal: (items.find(it => it.name === name)?.price || 0) * qty
        })),
        amount: total,
        latitude: form.lat, longitude: form.lng, notes: `Mode: ${form.mode.toUpperCase()}`,
        isBulk: (total >= 5000 || Object.values(form.selectedItems).reduce((a, b) => a + b, 0) >= 100),
        estimatedWeight: Object.values(form.selectedItems).reduce((a, b) => a + b, 0)
      };
      const { data } = await API.post("/pickups/create", pickupData);
      if (data.success) {
        if (data.token && data.user) {
          await saveAuthData(data.token, data.user, "user");
        }
        showToast("success", "Success! Pickup Booked 🎉");
        setStep(5);
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Booking failed. Please try again.";
      showToast("error", errorMsg);
    } finally { setLoading(false); }
  };

  const toggleItem = (name) => {
    const current = { ...form.selectedItems };
    if (current[name]) delete current[name]; else current[name] = 1;
    update("selectedItems", current);
  };

  const updateQty = (name, delta) => {
    const current = { ...form.selectedItems };
    if (!current[name]) return;
    const newVal = current[name] + delta;
    if (newVal < 1) return;
    current[name] = newVal;
    update("selectedItems", current);
  };

  return (
    <div className="pickup-form-card" style={formBox}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .pickup-form-card {
          padding: 24px 20px;
          background: var(--card-bg, #ffffff);
          border-radius: 20px;
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid var(--card-border, #e2e8f0);
          box-shadow: var(--card-shadow, 0 10px 30px rgba(0,0,0,0.05));
          transition: all 0.3s ease;
        }

        .step-circle { 
          width: 38px; 
          height: 38px; 
          border-radius: 50%; 
          border: 2px solid #0b8f3a; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 15px; 
          margin: 0 auto 6px; 
          background: var(--bg-subtle, #f1f5f9); 
          color: #0b8f3a;
          transition: all 0.3s ease; 
          box-shadow: 0 2px 6px rgba(11,143,58,0.1);
        }
        .step-circle svg {
          width: 16px;
          height: 16px;
        }
        .step-active { 
          border-color: #0b8f3a !important; 
          color: #ffffff !important; 
          background: #0b8f3a !important; 
          box-shadow: 0 0 0 4px rgba(11,143,58,0.25) !important; 
          font-weight: bold;
        }
        .step-text {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted, #64748b);
          transition: 0.3s;
          display: block;
        }
        .step-text.active {
          color: #0b8f3a !important;
        }
        .modern-input-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--input-bg, #f8fafc);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 14px;
          border: 1.5px solid var(--card-border, #e2e8f0);
          transition: all 0.2s ease;
        }
        .modern-input-row:focus-within {
          border-color: #0b8f3a !important;
          background: var(--card-bg, #ffffff) !important;
          box-shadow: 0 0 0 3px rgba(11, 143, 58, 0.15) !important;
        }
        .modern-input-field {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          font-weight: 700;
        }
        .modern-select-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--input-bg, #f8fafc);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 14px;
          border: 1.5px solid var(--card-border, #e2e8f0);
          position: relative;
        }
        .modern-select {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          cursor: pointer;
          appearance: auto;
          WebkitAppearance: auto;
        }
        .item-grid { 
          display: grid; 
          grid-template-columns: repeat(1, 1fr); 
          gap: 10px; 
          max-height: 280px; 
          overflow-y: auto; 
          padding: 4px; 
        }
        .mode-tab-btn {
          padding: 10px;
          border-radius: 10px;
          border: 1.5px solid var(--card-border, #e2e8f0);
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          background: var(--card-bg, #ffffff);
          color: var(--text-muted, #64748b);
          transition: all 0.2s ease;
        }
        .mode-tab-btn.active {
          border-color: #0b8f3a !important;
          background: #f0fdf4 !important;
          color: #0b8f3a !important;
        }
        .scrap-item-card {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1.5px solid var(--card-border, #e2e8f0);
          background: var(--card-bg, #ffffff);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
        }
        .scrap-item-card.selected {
          border-color: #0b8f3a !important;
          background: #f0fdf4 !important;
        }
        .qty-counter-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--card-bg, #ffffff);
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid var(--card-border, #e2e8f0);
        }
        .qty-counter-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          background: #f0fdf4;
          color: #0b8f3a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 10px;
        }
        .qty-value {
          font-weight: 800;
          font-size: 13px;
          min-width: 16px;
          text-align: center;
          color: var(--text-main, #0f172a);
        }
        select option { 
          background: #ffffff !important; 
          color: #0f172a !important; 
        }

        body.dark-mode .pickup-form-card,
        [data-theme="dark"] .pickup-form-card {
          background-color: #152035 !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
        }

        body.dark-mode .step-circle:not(.step-active),
        [data-theme="dark"] .step-circle:not(.step-active) {
          background-color: #1a253d !important;
          border-color: #0b8f3a !important;
          color: #0b8f3a !important;
        }

        body.dark-mode .step-text:not(.active),
        [data-theme="dark"] .step-text:not(.active) {
          color: #cbd5e1 !important;
        }

        body.dark-mode .modern-input-row,
        body.dark-mode .modern-select-row,
        [data-theme="dark"] .modern-input-row,
        [data-theme="dark"] .modern-select-row {
          background-color: #0e1626 !important;
          border-color: rgba(255, 255, 255, 0.18) !important;
        }

        body.dark-mode .modern-input-field,
        body.dark-mode .modern-select,
        [data-theme="dark"] .modern-input-field,
        [data-theme="dark"] .modern-select {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        body.dark-mode select option,
        [data-theme="dark"] select option {
          background-color: #0e1626 !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* STEPS INDICATOR */}
      <div style={stepHeader}>
        <Step icon={<FaPhoneAlt />} title="Verify" active={step >= 1} />
        <Step icon={<FaMapMarkerAlt />} title="Address" active={step >= 2} />
        <Step icon={<FaCalendarAlt />} title="Schedule" active={step >= 3} />
        <Step icon={<FaRecycle />} title="Confirm" active={step >= 4} />
      </div>

      <div style={stepContent}>
        {step === 1 && (
          <div className="fade-up">
            <h3 style={stepTitle}>Identity & Verification</h3>
            <Input icon={<FaUser />} placeholder="Full Name *" value={form.name} onChange={v => update("name", v)} />
            <Input icon={<FaPhoneAlt />} placeholder="10-Digit Mobile *" value={form.phone} onChange={v => update("phone", v.replace(/\D/g, "").slice(0, 10))} />
            
            {!otpSent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  className="btn-premium full-width-mobile"
                  style={{ background: "#25D366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", border: "none", height: "46px", fontSize: "14px", fontWeight: "800", boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)" }}
                  onClick={() => sendOtp("whatsapp")}
                  disabled={loading}
                >
                  {loading ? <FaRecycle className="spin" /> : <><FaWhatsapp style={{ fontSize: "18px" }} /> Get OTP on WhatsApp</>}
                </button>

                <button
                  type="button"
                  className="btn-premium full-width-mobile"
                  style={{ background: "#0b8f3a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", border: "none", height: "46px", fontSize: "14px", fontWeight: "800", boxShadow: "0 4px 14px rgba(11, 143, 58, 0.25)" }}
                  onClick={() => sendOtp("sms")}
                  disabled={loading}
                >
                  {loading ? <FaRecycle className="spin" /> : <><FaSms style={{ fontSize: "18px" }} /> Get OTP via SMS</>}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: "15px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", marginBottom: "12px" }}>
                  {otpChannel === "sms" ? "📱 Verification OTP sent via SMS" : "💬 Verification OTP code sent to your WhatsApp"} on <b>+91 {form.phone}</b>.
                </p>
                <Input icon={<FaLock />} placeholder="Enter 6-Digit Code" value={form.otp} onChange={v => update("otp", v.replace(/\D/g, "").slice(0, 6))} />
                <button className="btn-premium full-width-mobile" style={{ marginTop: "10px", height: "46px", border: "none" }} onClick={verifyOtp} disabled={loading}>
                  {loading ? <FaRecycle className="spin" /> : "Verify & Continue"}
                </button>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => sendOtp(otpChannel)}
                    disabled={loading}
                    style={{ background: "none", border: "none", color: "#0b8f3a", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); update("otp", ""); }}
                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Change Number
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <h3 style={stepTitle}>Pickup Location</h3>

            <button
              type="button"
              onClick={getLiveLocation}
              disabled={locationLoading}
              style={gpsDetectBar}
            >
              {locationLoading ? <FaRecycle className="spin" /> : <FaCrosshairs style={{ color: "#0b8f3a" }} />}
              <span>{locationLoading ? "Detecting Live GPS..." : "📍 Detect Live GPS Location"}</span>
            </button>

            <div style={{ position: "relative" }}>
              <Input icon={<FaMapMarkerAlt />} placeholder="House / Street / Landmark" value={form.address} onChange={v => update("address", v)} />
              <button onClick={getLiveLocation} style={locBtn} title="Pin Live GPS">{locationLoading ? <FaRecycle className="spin" /> : <FaCrosshairs />}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "10px" }}>
              <div className="modern-select-row">
                <FaMapMarkerAlt color="#0b8f3a" />
                <select className="modern-select" value={form.city} onChange={e => update("city", e.target.value)}>
                  <option value="">Select City</option>
                  {activeCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input icon={<FaMapMarkerAlt />} placeholder="Pincode" value={form.pincode} onChange={v => update("pincode", v.replace(/\D/g, "").slice(0, 6))} />
            </div>

            <div style={{ marginTop: "4px", marginBottom: "12px", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setShowVoteModal(true)}
                style={{ background: "none", border: "none", color: "#0b8f3a", fontSize: "11px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
              >
                📍 City not listed? Vote to bring ScrapVex to your town
              </button>
            </div>

            <button className="btn-premium full-width-mobile" style={{ height: "46px", border: "none" }} onClick={nextAddress}>
              Continue <FaChevronRight style={{ fontSize: "11px" }} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up">
            <h3 style={stepTitle}>Select Slot</h3>
            <Input type="date" icon={<FaCalendarAlt />} value={form.date} min={new Date().toISOString().split("T")[0]} onChange={v => update("date", v)} />
            <div className="modern-select-row">
              <FaClock color="#0b8f3a" />
              <select className="modern-select" value={form.time} onChange={e => update("time", e.target.value)}>
                <option value="">Choose Time Slot</option>
                {[
                  { label: "10AM - 12PM", hour: 10 },
                  { label: "12PM - 2PM", hour: 12 },
                  { label: "2PM - 4PM", hour: 14 },
                  { label: "4PM - 6PM", hour: 16 }
                ].map(slot => {
                  const isToday = form.date === new Date().toISOString().split("T")[0];
                  const currentHour = new Date().getHours();
                  const isPassed = isToday && currentHour >= slot.hour;
                  return (
                    <option key={slot.label} value={slot.label} disabled={isPassed}>
                      {slot.label} {isPassed ? "(Passed)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <button className="btn-premium full-width-mobile" style={{ height: "46px", border: "none", marginTop: "10px" }} onClick={nextSchedule}>
              Continue <FaChevronRight style={{ fontSize: "11px" }} />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="fade-up">
            <h3 style={stepTitle}>Items & Weight</h3>
            <div style={modeTabs}>
              <button type="button" className={`mode-tab-btn ${form.mode === "sell" ? "active" : ""}`} onClick={() => update("mode", "sell")}><FaRecycle /> Sell</button>
              <button type="button" className={`mode-tab-btn ${form.mode === "donate" ? "active" : ""}`} onClick={() => update("mode", "donate")}><FaGift /> Donate</button>
            </div>
            <div className="item-grid">
              {items.map(item => {
                const isSelected = form.selectedItems[item.name] !== undefined;
                return (
                  <div key={item._id} className={`scrap-item-card ${isSelected ? "selected" : ""}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, cursor: "pointer" }} onClick={() => toggleItem(item.name)}>
                      <div style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        border: "2px solid #0b8f3a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isSelected ? "#0b8f3a" : "transparent"
                      }}>
                        {isSelected && <FaCheck size={9} color="#fff" />}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{item.name}</span>
                        <span style={{ fontSize: "11px", color: "#0b8f3a", fontWeight: "bold" }}>₹{item.price}/{item.unit}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="qty-counter-wrap">
                        <button type="button" className="qty-counter-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.name, -1) }}><FaMinus size={8} /></button>
                        <span className="qty-value">{form.selectedItems[item.name]}</span>
                        <button type="button" className="qty-counter-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.name, 1) }}><FaPlus size={8} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={totalBox}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Estimated Earnings</span>
                <strong style={{ fontSize: "18px", color: "#0b8f3a" }}>₹{calculateTotal().toFixed(0)}</strong>
              </div>
              {form.mode === "sell" && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: calculateTotal() >= settings.minAmount ? "#0b8f3a" : "#dc2626", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                    {calculateTotal() >= settings.minAmount ? <><FaCheckCircle /> Min Met</> : <><FaInfoCircle /> Min. ₹{settings.minAmount}</>}
                  </div>
                </div>
              )}
            </div>

            <button className="btn-premium full-width-mobile" style={{ height: "46px", border: "none" }} onClick={submit} disabled={loading}>
              {loading ? <FaRecycle className="spin" /> : "Confirm & Book Pickup"}
            </button>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <FaCheckCircle size={55} color="#0b8f3a" />
            <h2 style={{ margin: "16px 0 8px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Booking Confirmed!</h2>
            <p style={{ color: "#64748b", fontSize: "12px", margin: 0, lineHeight: "1.5" }}>Our verified collector will arrive as per your slot. Track request status in your dashboard.</p>
            <button className="btn-premium" style={{ marginTop: "24px", height: "44px", width: "100%", maxWidth: "200px", border: "none" }} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          </div>
        )}
      </div>

      {/* AREA VOTE / EXPANSION REQUEST MODAL */}
      {showVoteModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "16px"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            border: "1.5px solid var(--card-border, #e2e8f0)",
            borderRadius: "20px",
            padding: "24px",
            maxWidth: "380px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>🗳️</span>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Request Your City</h3>
              </div>
              <button
                onClick={() => setShowVoteModal(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted, #94a3b8)" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", marginTop: 0, marginBottom: "16px", lineHeight: "1.5" }}>
              Tell us where you want ScrapVex services! We launch new franchises based on user demand votes.
            </p>

            <form onSubmit={handleVoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main, #334155)", marginBottom: "4px", display: "block" }}>City / Town / Tehsil Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Poonch, Anantnag, Doda, etc."
                  value={voteAreaName}
                  onChange={(e) => setVoteAreaName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--card-border, #cbd5e1)",
                    background: "var(--bg-main, #f8fafc)",
                    color: "var(--text-main, #0f172a)",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main, #334155)", marginBottom: "4px", display: "block" }}>Your Mobile Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile"
                  value={voteMobile}
                  onChange={(e) => setVoteMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--card-border, #cbd5e1)",
                    background: "var(--bg-main, #f8fafc)",
                    color: "var(--text-main, #0f172a)",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid var(--card-border, #cbd5e1)",
                    background: "transparent",
                    color: "var(--text-main, #64748b)",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={voteLoading}
                  className="btn-premium"
                  style={{
                    flex: 1.5,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  {voteLoading ? "Recording..." : "Vote for City 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPACT COMPONENTS */
const Step = ({ icon, title, active }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div className={`step-circle ${active ? "step-active" : ""}`}>{icon}</div>
    <span className={`step-text ${active ? "active" : ""}`}>{title}</span>
  </div>
);

const Input = ({ icon, placeholder, value, onChange, type = "text", min = "" }) => (
  <div className="modern-input-row">
    <div style={{ color: "#0b8f3a", display: "flex", alignItems: "center" }}>{icon}</div>
    <input type={type} placeholder={placeholder} value={value} min={min} onChange={e => onChange(e.target.value)} className="modern-input-field" />
  </div>
);

/* INLINE STYLES */
const formBox = { padding: "16px", background: "var(--card-bg, #ffffff)", border: "1.5px solid var(--card-border, rgba(15,23,42,0.06))", borderRadius: "18px", width: "100%", boxSizing: "border-box" };
const stepHeader = { display: "flex", justifyContent: "space-between", marginBottom: "20px" };
const stepContent = { minHeight: "280px", position: "relative" };
const stepTitle = { fontSize: "15px", fontWeight: "800", marginBottom: "16px", color: "var(--text-main, #0f172a)", borderLeft: "3.5px solid #0b8f3a", paddingLeft: "8px" };
const locBtn = { position: "absolute", right: "8px", top: "8px", background: "#f0fdf4", border: "none", color: "#0b8f3a", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const modeTabs = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" };
const totalBox = { margin: "16px 0", padding: "12px 14px", background: "#f0fdf4", borderRadius: "12px", border: "1.5px dashed #0b8f3a", display: "flex", justifyContent: "space-between", alignItems: "center" };

const gpsDetectBar = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1.5px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#15803d",
  fontWeight: "700",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "pointer",
  marginBottom: "12px"
};

export default PickupForm;