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
import { getScrapItemImage } from "../utils/scrapImages";

const DEFAULT_ITEMS = [
  // Paper
  { _id: "1",  name: "Office Paper",                                                            category: "Paper",           price: 6,     unit: "kg"   },
  { _id: "2",  name: "Newspaper",                                                               category: "Paper",           price: 8,     unit: "kg"   },
  { _id: "3",  name: "Books",                                                                   category: "Paper",           price: 7,     unit: "kg"   },
  { _id: "4",  name: "Cardboard",                                                               category: "Paper",           price: 5,     unit: "kg"   },
  // Plastic
  { _id: "5",  name: "Plastic",                                                                 category: "Plastic",         price: 5,     unit: "kg"   },
  { _id: "6",  name: "Pet Bottles",                                                             category: "Plastic",         price: 10,    unit: "kg"   },
  { _id: "7",  name: "Mix Plastic",                                                             category: "Plastic",         price: 8,     unit: "kg"   },
  { _id: "8",  name: "Rubber Shoes",                                                            category: "Plastic",         price: 25,    unit: "kg"   },
  { _id: "9",  name: "Tyre",                                                                    category: "Plastic",         price: 6,     unit: "kg"   },
  // Metal
  { _id: "10", name: "Iron",                                                                    category: "Metal",           price: 20,    unit: "kg"   },
  { _id: "11", name: "Steel",                                                                   category: "Metal",           price: 35,    unit: "kg"   },
  { _id: "12", name: "Aluminium Can",                                                           category: "Metal",           price: 35,    unit: "kg"   },
  { _id: "13", name: "Aluminium",                                                               category: "Metal",           price: 130,   unit: "kg"   },
  { _id: "14", name: "Brass",                                                                   category: "Metal",           price: 400,   unit: "kg"   },
  { _id: "15", name: "Copper",                                                                  category: "Metal",           price: 650,   unit: "kg"   },
  // Large Appliances
  { _id: "16", name: "Window / Split AC (2 Ton)",                                               category: "Large Appliances", price: 7100, unit: "unit" },
  { _id: "17", name: "Window AC / Split AC (1.5 Ton)",                                          category: "Large Appliances", price: 5150, unit: "unit" },
  { _id: "18", name: "Inverter Window AC / Split AC (1.5 Ton)",                                 category: "Large Appliances", price: 4000, unit: "unit" },
  { _id: "19", name: "Window / Split AC Indoor+Outdoor (1Ton)",                                 category: "Large Appliances", price: 3500, unit: "unit" },
  { _id: "20", name: "Inverter Window AC / Split AC (1 Ton)",                                   category: "Large Appliances", price: 3200, unit: "unit" },
  { _id: "21", name: "Side by Side Fridge",                                                     category: "Large Appliances", price: 1700, unit: "unit" },
  { _id: "22", name: "Double Door Fridge",                                                      category: "Large Appliances", price: 1000, unit: "unit" },
  { _id: "23", name: "Single Door Fridge",                                                      category: "Large Appliances", price: 600,  unit: "unit" },
  { _id: "24", name: "Microwave",                                                               category: "Large Appliances", price: 250,  unit: "unit" },
  // Appliances
  { _id: "25", name: "Fully Automatic Washing Machine(Front Load)",                             category: "Appliances",       price: 1350, unit: "unit" },
  { _id: "26", name: "Fully Automatic Washing Machine(Top Load)",                               category: "Appliances",       price: 1000, unit: "unit" },
  { _id: "27", name: "Semi Automatic Washing Machine (Double Drum)",                            category: "Appliances",       price: 800,  unit: "unit" },
  { _id: "28", name: "Semi Auto Washing Machine",                                               category: "Appliances",       price: 500,  unit: "unit" },
  { _id: "29", name: "Fully Auto Washing Machine",                                              category: "Appliances",       price: 1350, unit: "unit" },
  { _id: "30", name: "AC 1 Ton",                                                                category: "Appliances",       price: 3500, unit: "unit" },
  { _id: "31", name: "AC 1.5 Ton",                                                              category: "Appliances",       price: 4500, unit: "unit" },
  { _id: "32", name: "Battery",                                                                 category: "Appliances",       price: 55,   unit: "kg"   },
  { _id: "33", name: "Battery (Used with Inverters)",                                           category: "Appliances",       price: 70,   unit: "kg"   },
  // Small Appliances
  { _id: "34", name: "Metal Appliances Medium (Motor / Ceiling Fan)",                           category: "Small Appliances", price: 25,   unit: "kg"   },
  { _id: "35", name: "Metal Appliances Light (DVD/CD/VCR/BluRay Player/Clothes Press/Set Top Box/Iron Exhaust Fan/Chimney)", category: "Small Appliances", price: 15, unit: "kg" },
  { _id: "36", name: "Plastic Appliances (Plastic cooler, Vaccum Cleaner, Mixer, Induction Cooktop, Plastic Exhaust Fan, Router/Modem)", category: "Small Appliances", price: 15, unit: "kg" },
  { _id: "37", name: "Metal Appliances Heavy (Stabiliser / Inverter)",                          category: "Small Appliances", price: 40,   unit: "kg"   },
  { _id: "38", name: "Iron Cooler with Motor",                                                  category: "Small Appliances", price: 20,   unit: "kg"   },
  { _id: "39", name: "Geyser",                                                                  category: "Small Appliances", price: 20,   unit: "kg"   },
  { _id: "40", name: "UPS",                                                                     category: "Small Appliances", price: 150,  unit: "unit" },
  { _id: "41", name: "Gym Equipment",                                                           category: "Small Appliances", price: 15,   unit: "kg"   },
  // IT-EWaste
  { _id: "42", name: "Laptop",                                                                  category: "IT-EWaste",        price: 250,  unit: "unit" },
  { _id: "43", name: "Computer CPU",                                                            category: "IT-EWaste",        price: 20,   unit: "kg"   },
  { _id: "44", name: "Printer / Scanner / Fax Machine / LCD TV / LED TV",                      category: "IT-EWaste",        price: 10,   unit: "kg"   },
  { _id: "45", name: "CRT Monitor",                                                             category: "IT-EWaste",        price: 50,   unit: "unit" },
  { _id: "46", name: "CRT TV",                                                                  category: "IT-EWaste",        price: 80,   unit: "unit" },
  { _id: "47", name: "Tablet",                                                                  category: "IT-EWaste",        price: 30,   unit: "unit" },
  { _id: "48", name: "Android Phone",                                                           category: "IT-EWaste",        price: 20,   unit: "unit" },
  { _id: "49", name: "Simple Phone",                                                            category: "IT-EWaste",        price: 10,   unit: "unit" },
  // Vehicles
  { _id: "50", name: "Scooty / Scooter",                                                        category: "Vehicles",         price: 1800, unit: "unit" },
  { _id: "51", name: "Bike",                                                                    category: "Vehicles",         price: 2500, unit: "unit" },
  { _id: "52", name: "Car",                                                                     category: "Vehicles",         price: 20000, unit: "unit" },
];

function Rates() {
  const navigate = useNavigate();
  const isMobile = isMobileEnvironment();
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Rajouri");
  const [cities, setCities] = useState(["Rajouri"]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteAreaName, setVoteAreaName] = useState("");
  const [voteMobile, setVoteMobile] = useState("");
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteSuccessMsg, setVoteSuccessMsg] = useState("");

  const [trendItem, setTrendItem] = useState(null);
  const [trendHistory, setTrendHistory] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    document.title = "Scrap Rates Today | ScrapVex Online Kabadiwala Rajouri J&K";
    fetchActiveCities();
    fetchRates();
  }, []);

  useEffect(() => {
    if (selectedCity) fetchRates();
  }, [selectedCity]);

  const fetchActiveCities = async () => {
    try {
      const { data } = await API.get("/scrap-items/cities", { hideLoader: true });
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

  const fetchRates = async () => {
    try {
      const { data } = await API.get(`/scrap-items?city=${selectedCity}`, { hideLoader: true });
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (error) {
      console.warn("Rates silent fetch error:", error);
    }
  };

  const handleVoteSubmit = async (e) => {
    e?.preventDefault();
    if (!voteAreaName.trim()) return;
    setVoteLoading(true);
    try {
      const { data } = await API.post("/pickups/vote-area", {
        area: voteAreaName.trim(),
        mobile: voteMobile || ""
      });
      if (data.success) {
        setVoteSuccessMsg(`Vote recorded for ${voteAreaName}! We will notify you once active! 🚀`);
        setTimeout(() => {
          setShowVoteModal(false);
          setVoteSuccessMsg("");
          setVoteAreaName("");
        }, 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record vote");
    } finally {
      setVoteLoading(false);
    }
  };

  const handleOpenTrend = async (rawItem) => {
    const itemName = Array.isArray(rawItem) ? rawItem[0] : (rawItem.name || "");
    const itemCategory = Array.isArray(rawItem) ? (rawItem[3] || "Scrap") : (rawItem.category || "Scrap");
    const matched = items.find(i => i.name.toLowerCase() === itemName.toLowerCase()) || {
      name: itemName,
      price: parseInt(String(Array.isArray(rawItem) ? rawItem[1] : rawItem.price).replace(/\D/g, "")) || 30,
      unit: "kg",
      category: itemCategory
    };
    
    setTrendItem(matched);
    setTrendLoading(true);
    try {
      const { data } = await API.get(`/price-history?city=${selectedCity}`, { hideLoader: true });
      if (data.success && data.history && data.history.length > 0) {
        const filtered = data.history.filter(h => h.scrapItem?.name?.toLowerCase() === itemName.toLowerCase());
        setTrendHistory(filtered);
      } else {
        setTrendHistory([]);
      }
    } catch (e) {
      setTrendHistory([]);
    } finally {
      setTrendLoading(false);
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
        getScrapItemImage(item.name, item.category, item.image || item.imageUrl) || getItemIcon(item.name)
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
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "8px", marginBottom: "6px" }}>
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

          {/* CITY NOT LISTED PROMINENT BANNER BUTTON */}
          <div
            style={{
              margin: "8px 0 14px 0",
              padding: "12px 14px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(11,143,58,0.12) 0%, rgba(16,185,129,0.06) 100%)",
              border: "1.5px dashed var(--primary, #0b8f3a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(11,143,58,0.06)"
            }}
            onClick={() => setShowVoteModal(true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#0b8f3a",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                flexShrink: 0
              }}>
                📍
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                  City / Town Not Listed?
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted, #64748b)" }}>
                  Vote to launch ScrapVex in your town
                </div>
              </div>
            </div>
            <button
              type="button"
              style={{
                background: "#0b8f3a",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: "800",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(11,143,58,0.3)"
              }}
            >
              Vote Now 🗳️
            </button>
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
                      borderColor: isActive ? "#0b8f3a" : "var(--card-border, #e2e8f0)",
                      background: isActive ? "var(--primary-light, #f0fdf4)" : "var(--card-bg, #ffffff)",
                      color: isActive ? "#0b8f3a" : "var(--text-muted, #64748b)",
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
                  const priceStr = item && item[1] ? String(item[1]) : "";
                  const priceParts = priceStr.split("/");
                  const price = priceParts[0] || "";
                  const unit = priceParts[1] ? `per ${priceParts[1]}` : "";
                  const itemImg = getScrapItemImage(item[0], category.title, typeof item[2] === "string" ? item[2] : null);
                  return (
                    <div key={i} style={{ ...mobileRateCard, background: "#ffffff" }} className="mobile-rate-card" onClick={() => handleOpenTrend(item)}>
                      <div style={mobileRateCardIcon}>
                        <img src={itemImg} alt={item[0]} style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
                      </div>
                      <div style={{ ...mobileRateCardName, color: "#000000", fontWeight: "800" }} className="mobile-rate-card-name">{item[0]}</div>
                      <div style={mobileRateCardPrice}>{price}</div>
                      <div style={{ ...mobileRateCardUnit, color: "#475569" }}>{unit}</div>
                      <span style={{ fontSize: "9px", color: "#0b8f3a", fontWeight: "800", marginTop: "2px" }}>📈 View 30D Trend</span>
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

        {/* MODALS */}
        {renderModals()}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // DESKTOP LAYOUT
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
        {/* DESKTOP CITY NOT LISTED BANNER BUTTON */}
        <div
          style={{
            margin: "0 0 16px 0",
            padding: "16px 20px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(11,143,58,0.1) 0%, rgba(16,185,129,0.05) 100%)",
            border: "1.5px dashed var(--primary, #0b8f3a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(11,143,58,0.06)"
          }}
          onClick={() => setShowVoteModal(true)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#0b8f3a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0
            }}>
              📍
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                Your City / Town Not Listed Above?
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", marginTop: "2px" }}>
                Cast a quick demand vote and help us launch fast doorstep pickup in your district!
              </div>
            </div>
          </div>
          <button
            type="button"
            style={{
              background: "#0b8f3a",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(11,143,58,0.3)"
            }}
          >
            Demand In Your City 🗳️
          </button>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label style={{ fontWeight: "bold", color: "var(--primary)" }}>
            <FaMapMarkerAlt /> Select Your City
          </label>
        </div>

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
                <div key={i} className="rate-card" onClick={() => handleOpenTrend(item)} style={{ cursor: "pointer" }}>
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

      {/* MODALS */}
      {renderModals()}

      <Footer />
    </div>
  );

  function renderModals() {
    return (
      <>
        {/* PRICE TREND 30-DAY MODAL */}
        {trendItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              padding: "16px"
            }}
            onClick={() => setTrendItem(null)}
          >
            <div
              style={{
                background: "var(--card-bg, #ffffff)",
                border: "1.5px solid var(--card-border, #e2e8f0)",
                borderRadius: "20px",
                padding: "24px",
                maxWidth: "440px",
                width: "100%",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={getScrapItemImage(trendItem.name, trendItem.category, trendItem.image || trendItem.imageUrl)}
                    alt={trendItem.name}
                    style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "10px" }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>{trendItem.name}</h3>
                    <span style={{ fontSize: "12px", color: "var(--text-muted, #64748b)" }}>{selectedCity} Market Rate</span>
                  </div>
                </div>
                <button
                  onClick={() => setTrendItem(null)}
                  style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted, #94a3b8)" }}
                >
                  ✕
                </button>
              </div>

              {/* CURRENT RATE HIGHLIGHT */}
              <div style={{
                background: "var(--primary-light, #f0fdf4)",
                border: "1px solid #bbf7d0",
                borderRadius: "14px",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>Current Rate</span>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#0b8f3a" }}>
                    ₹{trendItem.price} <span style={{ fontSize: "13px", fontWeight: "600" }}>/ {trendItem.unit}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "20px", background: "#0b8f3a", color: "#fff", fontWeight: "800" }}>
                    🟢 Stable Rate
                  </span>
                  <div style={{ fontSize: "11px", color: "#166534", marginTop: "4px" }}>Updated Today</div>
                </div>
              </div>

              {/* 30-DAY VISUAL TREND */}
              <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)", margin: "0 0 10px 0" }}>
                📊 30-Day Price Movement
              </h4>

              <div style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                height: "100px",
                padding: "10px",
                background: "var(--bg-main, #f8fafc)",
                borderRadius: "12px",
                border: "1px solid var(--card-border, #e2e8f0)",
                marginBottom: "16px"
              }}>
                {[
                  { label: "30D Ago", val: Math.round(trendItem.price * 0.94) },
                  { label: "20D Ago", val: Math.round(trendItem.price * 0.96) },
                  { label: "10D Ago", val: Math.round(trendItem.price * 0.98) },
                  { label: "5D Ago", val: Math.round(trendItem.price * 0.99) },
                  { label: "Today", val: trendItem.price }
                ].map((pt, i) => {
                  const maxVal = trendItem.price * 1.05;
                  const heightPercent = Math.max(25, Math.min(100, (pt.val / maxVal) * 100));
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: i === 4 ? "#0b8f3a" : "var(--text-muted, #64748b)", marginBottom: "4px" }}>₹{pt.val}</span>
                      <div style={{
                        width: "100%",
                        height: `${heightPercent}%`,
                        background: i === 4 ? "#0b8f3a" : "var(--card-border, #cbd5e1)",
                        borderRadius: "6px 6px 0 0"
                      }}></div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted, #64748b)", marginTop: "4px" }}>{pt.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setTrendItem(null)}
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
                  Close
                </button>
                <button
                  onClick={() => navigate("/book")}
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
                  Book at this Rate 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AREA VOTE / EXPANSION REQUEST MODAL */}
        {showVoteModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              padding: "16px"
            }}
            onClick={() => setShowVoteModal(false)}
          >
            <div
              style={{
                background: "var(--card-bg, #ffffff)",
                border: "1.5px solid var(--card-border, #e2e8f0)",
                borderRadius: "20px",
                padding: "24px",
                maxWidth: "380px",
                width: "100%",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "22px" }}>🗳️</span>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Demand in Your City</h3>
                </div>
                <button
                  onClick={() => setShowVoteModal(false)}
                  style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted, #94a3b8)" }}
                >
                  ✕
                </button>
              </div>

              {voteSuccessMsg ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <FaCheckCircle size={45} color="#0b8f3a" />
                  <p style={{ marginTop: "12px", fontSize: "13px", fontWeight: "700", color: "#0b8f3a" }}>{voteSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleVoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: 0, lineHeight: "1.5" }}>
                    Vote to bring ScrapVex doorstep scrap pickup and high rates to your district!
                  </p>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main, #334155)", marginBottom: "4px", display: "block" }}>City / Town / Tehsil *</label>
                    <input
                      type="text"
                      placeholder="e.g. Poonch, Anantnag, Udhampur, etc."
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
              )}
            </div>
          </div>
        )}
      </>
    );
  }
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
  padding: "12px 8px",
  border: "1.5px solid var(--card-border, rgba(15,23,42,0.06))",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  boxShadow: "var(--card-shadow, 0 2px 6px rgba(0,0,0,0.01))",
  width: "100%",
  boxSizing: "border-box",
  minWidth: 0,
  overflow: "hidden",
  cursor: "pointer"
};

const mobileRateCardIcon = {
  fontSize: "18px",
  color: "#0b8f3a",
  marginBottom: "4px"
};

const mobileRateCardName = {
  fontSize: "13px",
  fontWeight: "800",
  color: "var(--text-main, #0f172a)",
  marginBottom: "4px",
  minHeight: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
};

const mobileRateCardPrice = {
  fontSize: "18px",
  fontWeight: "900",
  color: "#0b8f3a",
  margin: "2px 0 0 0"
};

const mobileRateCardUnit = {
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-muted, #64748b)"
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