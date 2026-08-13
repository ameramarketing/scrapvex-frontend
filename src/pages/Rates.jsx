import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRecycle,
  FaSnowflake,
  FaLaptop,
  FaCar,
  FaSearch,
  FaArrowRight,
  FaFileAlt,
  FaNewspaper,
  FaBook,
  FaCube,
  FaCog,
  FaTv,
  FaMotorcycle,
  FaBatteryFull,
  FaWeightHanging,
  FaStar,
  FaCheckCircle,
  FaPrescriptionBottle,
  FaMapMarkerAlt,
  FaBox
} from "react-icons/fa";

import Footer from "../components/Footer";
import RateCard from "../components/RateCard";
import API from "../services/api";
import { isMobileEnvironment } from "../platform/platform";

function Rates() {
  const navigate = useNavigate();
  const isMobile = isMobileEnvironment();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchActiveCities();
  }, []);

  useEffect(() => {
    if (selectedCity) fetchRates();
  }, [selectedCity]);

  const fetchActiveCities = async () => {
    try {
      const { data } = await API.get("/scrap-items/cities");
      if (data.success && data.cities.length > 0) {
        setCities(data.cities);
        setSelectedCity(data.cities[0]);
      } else {
        setCities(["Rajouri"]);
        setSelectedCity("Rajouri");
      }
    } catch (e) {
      setCities(["Rajouri"]);
      setSelectedCity("Rajouri");
    }
  };

  const defaultItems = [
    { _id: "1", name: "Office Paper", category: "Paper", price: 14, unit: "kg" },
    { _id: "2", name: "Newspaper", category: "Paper", price: 15, unit: "kg" },
    { _id: "3", name: "Books", category: "Paper", price: 12, unit: "kg" },
    { _id: "4", name: "Cardboard", category: "Paper", price: 8, unit: "kg" },
    { _id: "5", name: "Iron / Loha", category: "Metal", price: 25, unit: "kg" },
    { _id: "6", name: "Steel", category: "Metal", price: 42, unit: "kg" },
    { _id: "7", name: "Copper / Tamba", category: "Metal", price: 505, unit: "kg" },
    { _id: "8", name: "Brass / Peetal", category: "Metal", price: 325, unit: "kg" },
    { _id: "9", name: "Aluminium", category: "Metal", price: 112, unit: "kg" },
    { _id: "10", name: "Plastic", category: "Plastic", price: 5, unit: "kg" },
    { _id: "11", name: "Pet Bottles", category: "Plastic", price: 10, unit: "kg" },
    { _id: "12", name: "Semi Auto Washing Machine", category: "Appliances", price: 800, unit: "unit" },
    { _id: "13", name: "Single Door Fridge", category: "Appliances", price: 1100, unit: "unit" },
    { _id: "14", name: "AC 1.5 Ton", category: "Appliances", price: 4500, unit: "unit" },
    { _id: "15", name: "Inverter Battery", category: "Appliances", price: 81, unit: "kg" },
    { _id: "16", name: "Laptop", category: "Electronic", price: 500, unit: "unit" },
    { _id: "17", name: "Computer CPU", category: "Electronic", price: 400, unit: "unit" }
  ];

  const fetchRates = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/scrap-items?city=${selectedCity}`);
      if (data.success && data.data && data.data.length > 0) {
        const apiMap = new Map(data.data.map(item => [item.name.toLowerCase(), item]));
        const merged = defaultItems.map(dItem => {
          const found = apiMap.get(dItem.name.toLowerCase());
          return found || dItem;
        });
        data.data.forEach(item => {
          if (!merged.some(m => m.name.toLowerCase() === item.name.toLowerCase())) {
            merged.push(item);
          }
        });
        setItems(merged);
      } else {
        setItems(defaultItems);
      }
    } catch (error) {
      console.error("Rates error:", error);
      setItems(defaultItems);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Paper":         return <FaNewspaper />;
      case "Plastic":       return <FaRecycle />;
      case "Metal":         return <FaWeightHanging />;
      case "Electronic":
      case "IT-EWaste":     return <FaLaptop />;
      case "Appliances":
      case "Large Appliances": return <FaSnowflake />;
      case "Small Appliances": return <FaCog />;
      case "Battery":       return <FaBatteryFull />;
      case "Vehicles":      return <FaCar />;
      default:              return <FaCube />;
    }
  };

  const getCategoryTitle = (cat) => {
    switch (cat) {
      case "Paper":            return "Paper & Cardboard";
      case "Plastic":          return "Plastic";
      case "Metal":            return "Metal & Alloys";
      case "Electronic":
      case "IT-EWaste":        return "IT / E-Waste";
      case "Appliances":
      case "Large Appliances": return "Large Appliances";
      case "Small Appliances": return "Small Appliances";
      case "Battery":          return "Batteries";
      case "Vehicles":         return "Vehicles";
      default:                 return cat;
    }
  };

  const getItemIcon = (name) => {
    const lower = name.toLowerCase();
    
    // Paper & Cardboard
    if (lower.includes("newspaper") || lower.includes("news")) return <FaNewspaper />;
    if (lower.includes("book")) return <FaBook />;
    if (lower.includes("cardboard") || lower.includes("gatta")) return <FaBox />;
    if (lower.includes("paper")) return <FaFileAlt />;
    
    // Metals
    if (lower.includes("iron") || lower.includes("loha") || lower.includes("steel")) return <FaCog />;
    if (lower.includes("copper") || lower.includes("tamba") || lower.includes("brass") || lower.includes("peetal")) return <FaCube />;
    if (lower.includes("aluminium") || lower.includes("aluminum")) return <FaCube />;
    
    // E-Waste & IT
    if (lower.includes("laptop") || lower.includes("computer") || lower.includes("cpu")) return <FaLaptop />;
    if (lower.includes("tv") || lower.includes("monitor")) return <FaTv />;
    
    // Appliances
    if (lower.includes("fridge") || lower.includes("refrigerator") || lower.includes("ac ") || lower.includes("conditioner")) return <FaSnowflake />;
    if (lower.includes("washing") || lower.includes("microwave") || lower.includes("geyser") || lower.includes("ups") || lower.includes("appliance")) return <FaTv />;
    if (lower.includes("battery")) return <FaBatteryFull />;
    
    // Vehicles
    if (lower.includes("bike") || lower.includes("scooty") || lower.includes("scooter") || lower.includes("motorcycle")) return <FaMotorcycle />;
    if (lower.includes("car")) return <FaCar />;
    
    // Plastic
    if (lower.includes("bottle") || lower.includes("plastic")) return <FaPrescriptionBottle />;
    
    return <FaRecycle />;
  };

  // Get list of unique category names from loaded items
  const categoriesList = useMemo(() => {
    const unique = new Set(items.map(item => getCategoryTitle(item.category)));
    return ["All", ...Array.from(unique)];
  }, [items]);

  const groupedData = useMemo(() => {
    const groups = {};
    const filtered = items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const mappedCat = getCategoryTitle(item.category);
      const matchCat = activeCategory === "All" || mappedCat === activeCategory;
      return matchSearch && matchCat;
    });

    filtered.forEach(item => {
      const title = getCategoryTitle(item.category);
      if (!groups[title]) {
        groups[title] = {
          title: title,
          rawCategory: item.category,
          icon: getCategoryIcon(item.category),
          items: []
        };
      }
      groups[title].items.push([
        item.name,
        `₹${item.price}/${item.unit}`,
        getItemIcon(item.name)
      ]);
    });

    return Object.values(groups);
  }, [items, search, activeCategory]);

  // ────────────────────────────────────────────────────────
  // MOBILE / NATIVE LAYOUT
  // ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ background: "var(--bg-main, #f8fafc)", minHeight: "100vh", paddingBottom: "40px" }}>
        
        {/* COMPACT HEADER */}
        <div style={{ padding: "20px 16px 10px 16px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main, #0f172a)", margin: 0 }}>Scrap Rates</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: "2px 0 0 0" }}>Updated market rates for Jammu & Kashmir</p>
        </div>

        {/* CITY SELECTOR & SEARCH BAR */}
        <div className="container" style={{ padding: "0 16px 12px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "8px", marginBottom: "10px" }}>
            <div style={mobileSearchBox}>
              <FaMapMarkerAlt style={{ color: "#0b8f3a", fontSize: "13px" }} />
              <select
                style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "12px", fontWeight: "700", color: "var(--text-main, #0f172a)", textTransform: "capitalize", cursor: "pointer" }}
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={mobileSearchBox}>
              <FaSearch style={{ color: "#0b8f3a", fontSize: "13px" }} />
              <input
                type="text"
                placeholder="Search scrap item..."
                style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "12px", color: "var(--text-main, #0f172a)", fontWeight: "600" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* CATEGORY CHIPS */}
          {categoriesList.length > 1 && (
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
              {categoriesList.map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: "1.5px solid",
                      borderColor: isActive ? "#0b8f3a" : "#e2e8f0",
                      background: isActive ? "#f0fdf4" : "#ffffff",
                      color: isActive ? "#0b8f3a" : "#64748b",
                      fontSize: "11px",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      cursor: "pointer"
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RATES LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", fontWeight: "600" }}>Loading latest rates...</span>
          </div>
        ) : groupedData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", fontWeight: "600" }}>No items found for "{search}"</span>
          </div>
        ) : (
          groupedData.map((category, idx) => (
            <div key={idx} className="container" style={{ padding: "0 16px 16px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", borderLeft: "3.5px solid #0b8f3a", paddingLeft: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>{category.title.toUpperCase()}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {category.items.map((item, i) => {
                  const priceParts = item[1].split("/");
                  const price = priceParts[0];
                  const unit = priceParts[1] ? `per ${priceParts[1]}` : "";
                  return (
                    <div key={i} style={mobileRateCard}>
                      <div style={mobileRateCardIcon}>{item[2]}</div>
                      <div style={mobileRateCardName}>{item[0]}</div>
                      <div style={mobileRateCardPrice}>{price}</div>
                      <div style={mobileRateCardUnit}>{unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* IMPORTANT NOTE COMPACT */}
        <div className="container" style={{ padding: "0 16px 16px 16px" }}>
          <div style={mobileNoteBox}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#b45309", display: "block", marginBottom: "4px" }}>📌 Important Notes</span>
            <ul style={{ margin: 0, paddingLeft: "14px", fontSize: "11px", color: "#78350f", lineHeight: "1.6" }}>
              <li>Rates may differ for bulk scrap quantities. Call 8491028539.</li>
              <li>Glass, wooden items, and fabrics are not accepted.</li>
              <li>Minimum pickup value of ₹300 is required to book.</li>
            </ul>
          </div>
        </div>

        {/* COMPACT CTA */}
        <div className="container" style={{ padding: "0 16px" }}>
          <button style={mobileCtaBtn} onClick={() => navigate("/book")}>
            Book Free Doorstep Pickup <FaArrowRight style={{ fontSize: "11px" }} />
          </button>
        </div>

      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // DESKTOP LAYOUT (100% Unmodified Safety)
  // ────────────────────────────────────────────────────────
  return (
    <div>
      {/* HERO */}
      <div className="container" style={heroWrap}>
        <div className="fade-up" style={hero}>
          <p style={tag}>Updated Today • Best Market Prices</p>
          <h1 style={title}>Scrap Rates List</h1>
          <p style={sub}>
            Sell your scrap at transparent prices with accurate weighing and instant payment.
          </p>
          <div style={heroStats}>
            <span style={pill}><FaStar /> Trusted Service</span>
            <span style={pill}><FaCheckCircle /> Instant Payment</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="container" style={{ paddingBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "var(--primary)" }}>
          <FaMapMarkerAlt /> Select Your City
        </label>
        <div style={{ ...searchBox, width: "100%", marginBottom: "15px" }}>
          <FaMapMarkerAlt color="var(--primary)" />
          <select
            style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "16px", fontWeight: "600", color: "var(--text-main)", textTransform: "capitalize", cursor: "pointer", appearance: "auto", WebkitAppearance: "auto" }}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <style>{`
          select option {
            background: var(--card-bg) !important;
            color: var(--text-main) !important;
          }
        `}</style>

        <div style={searchBox}>
          <FaSearch style={{ color: "var(--primary)" }} />
          <input
            type="text"
            placeholder="Search scrap item..."
            style={{ ...searchInput, color: "var(--text-main)" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* NOTE */}
      <div className="container" style={{ paddingBottom: "45px" }}>
        <div style={noteBox}>
          <h3 style={{ color: "var(--primary)", marginBottom: "12px" }}>📌 Important Note</h3>
          <ul style={noteList}>
            <li>Rates may differ for bulk scrap.</li>
            <li>Call 8491028539 for bulk quote.</li>
            <li>No glass, wooden items, fabrics.</li>
            <li>Minimum pickup value ₹300 required.</li>
          </ul>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="container" style={{ textAlign: "center", padding: "40px" }}>
          <h2 style={{ color: "var(--text-main)" }}>Loading rates...</h2>
        </div>
      ) : groupedData.length === 0 ? (
        <div className="container" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "var(--text-main)" }}>No items found for "{search}"</h3>
        </div>
      ) : (
        groupedData.map((category, index) => (
          <div key={index} className="container" style={{ paddingBottom: "55px" }}>
            <div style={headingRow}>
              <div style={catIcon}>{category.icon}</div>
              <h2 style={{ margin: 0, color: "var(--text-main)" }}>{category.title}</h2>
            </div>
            <div style={grid3}>
              {category.items.map((item, i) => (
                <div key={i} className="rate-card">
                  <RateCard icon={item[2]} name={item[0]} price={item[1]} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* CTA */}
      <div className="container" style={{ paddingBottom: "70px" }}>
        <div style={cta}>
          <h2 style={ctaTitle}>Ready to Sell Scrap?</h2>
          <p style={ctaSub}>Book doorstep pickup now and get paid instantly.</p>
          <button style={btn} onClick={() => navigate("/book")}>
            Book Pickup <FaArrowRight />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* DESKTOP STYLES */
const heroWrap = { paddingTop: "20px", paddingBottom: "30px" };
const hero = { textAlign: "center", padding: "40px 18px", borderRadius: "24px", background: "var(--card-bg)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" };
const tag = { color: "var(--primary)", fontWeight: "bold" };
const title = { fontSize: "clamp(32px,6vw,56px)", margin: "16px 0 12px", color: "var(--text-main)" };
const sub = { color: "var(--text-muted)", fontSize: "clamp(15px,3vw,18px)", maxWidth: "720px", margin: "auto" };
const heroStats = { marginTop: "24px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" };
const pill = { background: "var(--bg-main)", color: "var(--text-main)", padding: "10px 14px", borderRadius: "999px", display: "flex", gap: "8px", alignItems: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const searchBox = { background: "var(--card-bg)", padding: "15px 18px", borderRadius: "14px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const searchInput = { border: "none", outline: "none", width: "100%", fontSize: "16px", background: "transparent", color: "var(--text-main)" };
const noteBox = { background: "var(--primary-light)", padding: "22px", borderRadius: "18px", border: "1px solid var(--primary)", color: "var(--text-main)" };
const noteList = { lineHeight: "2", paddingLeft: "18px" };
const headingRow = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", background: "var(--card-bg)", padding: "14px 18px", borderRadius: "14px", borderLeft: "5px solid var(--primary)", boxShadow: "0 10px 20px rgba(0,0,0,0.04)" };
const catIcon = { fontSize: "24px", color: "var(--primary)" };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "18px", marginTop: "22px" };
const cta = { textAlign: "center", padding: "42px 18px", borderRadius: "24px", background: "linear-gradient(135deg,#0b8f3a,#14a248)" };
const ctaTitle = { fontSize: "clamp(28px,5vw,42px)", color: "#fff", marginBottom: "12px" };
const ctaSub = { color: "#eaffef", marginBottom: "24px" };
const btn = { background: "var(--card-bg)", color: "var(--primary)", border: "none", padding: "14px 22px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "inline-flex", gap: "8px", alignItems: "center" };

/* ────────────────────────────────────────────────────────
   MOBILE INLINE STYLES
   ──────────────────────────────────────────────────────── */
const mobileSearchBox = {
  background: "var(--card-bg, #ffffff)",
  padding: "10px 14px",
  borderRadius: "10px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  border: "1.5px solid #e2e8f0"
};

const mobileRateCard = {
  background: "var(--card-bg, #ffffff)",
  borderRadius: "14px",
  padding: "12px",
  border: "1.5px solid rgba(15,23,42,0.06)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
};

const mobileRateCardIcon = {
  fontSize: "18px",
  color: "#0b8f3a",
  marginBottom: "4px"
};

const mobileRateCardName = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#475569",
  marginBottom: "4px",
  minHeight: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const mobileRateCardPrice = {
  fontSize: "18px",
  fontWeight: "900",
  color: "#0b8f3a",
  margin: "2px 0 0 0"
};

const mobileRateCardUnit = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#94a3b8"
};

const mobileNoteBox = {
  background: "#fffbeb",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1.5px solid #fef3c7"
};

const mobileCtaBtn = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #0b8f3a, #16a34a)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(11,143,58,0.15)"
};

export default Rates;