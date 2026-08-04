import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaPhoneAlt, FaLock, FaMapMarkerAlt, FaCalendarAlt,
  FaClock, FaRecycle, FaGift, FaCheckCircle, FaSpinner, FaChevronRight, FaInfoCircle, FaPlus, FaMinus, FaCrosshairs
} from "react-icons/fa";
import Toast from "./Toast";
import API from "../services/api";

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

  const [form, setForm] = useState({
    name: "", phone: "", otp: "", address: "", city: "", pincode: "",
    date: "", time: "", mode: "sell", selectedItems: {}, lat: null, lng: null
  });

  const showToast = (type, message) => setToast({ show: true, type, message });
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

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
      const { data } = await API.post("/auth/send-booking-otp", { mobile: form.phone, channel }, { timeout: 10000 });
      setOtpSent(true);
      showToast("success", data.message || `OTP sent via ${channel.toUpperCase()}!`);
    } catch (e) {
      showToast("error", e.response?.data?.message || e.message || "Failed to send OTP. Check number.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (form.otp.length !== 4) return showToast("error", "Enter 4 digit OTP");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/verify-otp", { mobile: form.phone, otp: form.otp, name: form.name });
      if (data.success) {
        showToast("success", data.autoCreated ? "Verified & Account Created! ✨" : "Verified! ✨");
        setStep(2);
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) return showToast("error", "GPS Geolocation is not supported by your device");
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
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
          if (city) update("city", city.includes("Rajouri") ? "Rajouri Town, J&K" : city);
          if (postcode && postcode.length === 6) update("pincode", postcode);

          showToast("success", "Live GPS Location Pinned! 📍");
        } catch (err) {
          console.error("Geocoding error", err);
          update("address", `Live GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          showToast("success", "Live GPS Coordinates Pinned! 📍");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        showToast("error", "Could not detect live GPS. Please check location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nextAddress = () => {
    if (!form.address.trim() || !form.city.trim() || form.pincode.length !== 6) return showToast("error", "Fill all address details");
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
        latitude: form.lat, longitude: form.lng, notes: `Mode: ${form.mode.toUpperCase()}`
      };
      const { data } = await API.post("/pickups/create", pickupData);
      if (data.success) {
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
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
    <div style={formBox}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .step-circle { width: 35px; height: 35px; border-radius: 50%; border: 2px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-size: 14px; margin: 0 auto 5px; background: var(--card-bg); transition: 0.3s; }
        .step-active { border-color: var(--primary); color: var(--primary); background: var(--primary-light); box-shadow: 0 0 10px rgba(11,143,58,0.2); }
        .item-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 10px; max-height: 250px; overflow-y: auto; padding: 5px; }
        select option { background: var(--card-bg) !important; color: var(--text-main) !important; }
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
            <h3 style={stepTitle}>Identity & Verification Check</h3>
            <Input icon={<FaUser />} placeholder="Full Name *" value={form.name} onChange={v => update("name", v)} />
            <Input icon={<FaPhoneAlt />} placeholder="10-Digit Mobile *" value={form.phone} onChange={v => update("phone", v.replace(/\D/g, "").slice(0, 10))} />
            
            {!otpSent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn-premium full-width-mobile pulse-btn"
                  style={{ background: "#25D366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onClick={() => sendOtp("whatsapp")}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spin" /> : <> Get OTP on WhatsApp</>}
                </button>
                <button
                  type="button"
                  className="btn-premium full-width-mobile"
                  style={{ background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onClick={() => sendOtp("sms")}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spin" /> : <> Get OTP via SMS</>}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: "15px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  {otpChannel === "whatsapp" ? "💬 Secret OTP sent to your WhatsApp inbox" : "📱 Secret OTP sent via SMS"} on <b>+91 {form.phone}</b>.
                </p>
                <Input icon={<FaLock />} placeholder="Enter 4-Digit Verification Code" value={form.otp} onChange={v => update("otp", v.replace(/\D/g, "").slice(0, 4))} />
                <button className="btn-premium full-width-mobile" style={{ marginTop: "10px" }} onClick={verifyOtp} disabled={loading}>Verify OTP & Continue</button>
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
              style={{
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
                marginBottom: "14px"
              }}
            >
              {locationLoading ? <FaSpinner className="spin" /> : <FaCrosshairs style={{ color: "#0b8f3a" }} />}
              <span>{locationLoading ? "Detecting Live GPS Location..." : "📍 Detect My Live GPS Location (For Collector Navigation)"}</span>
            </button>

            <div style={{ position: "relative" }}>
              <Input icon={<FaMapMarkerAlt />} placeholder="House / Street / Area / Landmark" value={form.address} onChange={v => update("address", v)} />
              <button onClick={getLiveLocation} style={locBtn} title="Pin Live GPS">{locationLoading ? <FaSpinner className="spin" /> : <FaCrosshairs />}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={customInputWrap}>
                <FaMapMarkerAlt color="var(--primary)" />
                <select style={selectStyle} value={form.city} onChange={e => update("city", e.target.value)}>
                  <option value="">Select City</option>
                  {activeCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input icon={<FaMapMarkerAlt />} placeholder="Pincode" value={form.pincode} onChange={v => update("pincode", v.replace(/\D/g, "").slice(0, 6))} />
            </div>
            <button className="btn-premium full-width-mobile" onClick={nextAddress}>Continue <FaChevronRight /></button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up">
            <h3 style={stepTitle}>Select Slot</h3>
            <Input type="date" icon={<FaCalendarAlt />} value={form.date} min={new Date().toISOString().split("T")[0]} onChange={v => update("date", v)} />
            <div style={customInputWrap}>
              <FaClock color="var(--primary)" />
              <select style={selectStyle} value={form.time} onChange={e => update("time", e.target.value)}>
                <option value="">Choose Time Slot</option>
                {[
                  { label: "10AM - 12PM", hour: 10 },
                  { label: "12PM - 2PM", hour: 12 },
                  { label: "2PM - 4PM", hour: 14 },
                  { label: "4PM - 6PM", hour: 16 }
                ].map(slot => {
                  const isToday = form.date === new Date().toISOString().split("T")[0];
                  const isPast = isToday && new Date().getHours() >= slot.hour;
                  return <option key={slot.label} value={slot.label} disabled={isPast}>{slot.label} {isPast ? "(Passed)" : ""}</option>
                })}
              </select>
            </div>
            <button className="btn-premium full-width-mobile" onClick={nextSchedule}>Choose Items <FaChevronRight /></button>
          </div>
        )}

        {step === 4 && (
          <div className="fade-up">
            <h3 style={stepTitle}>Choose Items & Weight</h3>
            <div style={modeTabs}>
              <button style={{ ...modeBtn, background: form.mode === "sell" ? "var(--primary)" : "var(--bg-main)", color: form.mode === "sell" ? "#fff" : "var(--text-main)" }} onClick={() => update("mode", "sell")}><FaRecycle /> Sell</button>
              <button style={{ ...modeBtn, background: form.mode === "donate" ? "var(--primary)" : "var(--bg-main)", color: form.mode === "donate" ? "#fff" : "var(--text-main)" }} onClick={() => update("mode", "donate")}><FaGift /> Donate</button>
            </div>
            <div className="item-grid">
              {items.map(item => {
                const isSelected = form.selectedItems[item.name] !== undefined;
                return (
                  <div key={item._id} style={{ ...itemCard, borderColor: isSelected ? "var(--primary)" : "var(--glass-border)", background: isSelected ? "var(--primary-light)" : "var(--card-bg)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, cursor: "pointer" }} onClick={() => toggleItem(item.name)}>
                      <FaCheckCircle color={isSelected ? "var(--primary)" : "var(--glass-border)"} size={16} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.name}</span>
                        <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "bold" }}>₹{item.price}/{item.unit}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ ...qtyWrap, background: "var(--bg-main)", border: "1px solid var(--glass-border)" }}>
                        <button style={{ ...qtyBtn, background: "var(--primary-light)", color: "var(--primary)" }} onClick={(e) => { e.stopPropagation(); updateQty(item.name, -1) }}><FaMinus size={10} /></button>
                        <span style={qtyText}>{form.selectedItems[item.name]}</span>
                        <button style={{ ...qtyBtn, background: "var(--primary-light)", color: "var(--primary)" }} onClick={(e) => { e.stopPropagation(); updateQty(item.name, 1) }}><FaPlus size={10} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={totalBox}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Estimated Total:</span>
                <strong style={{ fontSize: "18px", color: "var(--primary)" }}>₹{calculateTotal().toFixed(0)}</strong>
              </div>
              {form.mode === "sell" && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: calculateTotal() >= settings.minAmount ? "var(--primary)" : "var(--error)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                    {calculateTotal() >= settings.minAmount ? <><FaCheckCircle /> Minimum Met</> : <><FaInfoCircle /> Min. ₹{settings.minAmount}</>}
                  </div>
                </div>
              )}
            </div>

            <button className="btn-premium full-width-mobile" onClick={submit} disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : "Confirm & Book Pickup"}
            </button>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <FaCheckCircle size={60} color="var(--primary)" />
            <h2 style={{ margin: "20px 0 10px 0" }}>Booking Confirmed!</h2>
            <p style={{ color: "var(--text-muted)" }}>Our collector will reach you as per your scheduled time. You can track this in your dashboard.</p>
            <button className="btn-premium" style={{ marginTop: "30px" }} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}

const Step = ({ icon, title, active }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div className={`step-circle ${active ? "step-active" : ""}`}>{icon}</div>
    <span className="step-text" style={{ fontSize: "11px", fontWeight: "700", opacity: active ? 1 : 0.4 }}>{title}</span>
  </div>
);

const Input = ({ icon, placeholder, value, onChange, type = "text", min = "" }) => (
  <div style={inputRow}>
    <div style={{ color: "var(--primary)" }}>{icon}</div>
    <input type={type} placeholder={placeholder} value={value} min={min} onChange={e => onChange(e.target.value)} style={{ ...inputField, color: "var(--text-main)" }} />
  </div>
);

const formBox = { padding: "25px", background: "var(--card-bg)", borderRadius: "25px", width: "100%", maxWidth: "450px", margin: "0 auto" };
const stepHeader = { display: "flex", justifyContent: "space-between", marginBottom: "30px" };
const stepContent = { minHeight: "280px", position: "relative", color: "var(--text-main)" };
const stepTitle = { fontSize: "18px", marginBottom: "20px", color: "var(--text-main)", borderLeft: "4px solid var(--primary)", paddingLeft: "12px" };
const inputRow = { display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-main)", padding: "14px 18px", borderRadius: "14px", marginBottom: "15px", border: "1px solid var(--glass-border)" };
const inputField = { border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "15px" };
const locBtn = { position: "absolute", right: "10px", top: "12px", background: "var(--primary-light)", border: "none", color: "var(--primary)", width: "35px", height: "35px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const customInputWrap = { display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-main)", padding: "14px 18px", borderRadius: "14px", marginBottom: "20px", border: "1px solid var(--glass-border)" };
const selectStyle = { border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "15px", fontWeight: "600", color: "var(--text-main)", appearance: "auto", WebkitAppearance: "auto", cursor: "pointer" };
const modeTabs = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" };
const modeBtn = { padding: "12px", borderRadius: "12px", border: "none", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", transition: "0.3s" };
const itemCard = { padding: "15px", borderRadius: "15px", border: "1.5px solid #eee", transition: "0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" };
const qtyWrap = { display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "5px 10px", borderRadius: "10px", border: "1px solid #eee" };
const qtyBtn = { width: "25px", height: "25px", borderRadius: "50%", border: "none", background: "#eef8f1", color: "#0b8f3a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const qtyText = { fontWeight: "bold", fontSize: "14px", minWidth: "20px", textAlign: "center" };
const totalBox = { margin: "20px 0", padding: "18px", background: "var(--primary-light)", borderRadius: "15px", border: "1px dashed var(--primary)", display: "flex", justifyContent: "space-between", alignItems: "center" };

export default PickupForm;