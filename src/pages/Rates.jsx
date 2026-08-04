import React, { useMemo, useState } from "react";
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
  FaBolt,
  FaTrash,
  FaTv,
  FaMotorcycle,
  FaBatteryFull,
  FaWeightHanging,
  FaStar,
  FaCheckCircle,
  FaPrescriptionBottle,
  FaMapMarkerAlt
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RateCard from "../components/RateCard";
import API from "../services/api";

function Rates() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);

  React.useEffect(() => {
    fetchActiveCities();
  }, []);

  React.useEffect(() => {
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
      case "Paper":
      case "Plastic":
      case "Metal":
        return <FaRecycle />;
      case "Electronic":
        return <FaLaptop />;
      case "Appliances":
        return <FaSnowflake />;
      case "Vehicles":
        return <FaCar />;
      default:
        return <FaCube />;
    }
  };

  const getCategoryTitle = (cat) => {
    switch (cat) {
      case "Paper":
      case "Plastic":
      case "Metal":
        return "Normal Recyclables";
      case "Electronic":
        return "IT E-Waste";
      case "Appliances":
        return "Large Appliances";
      case "Vehicles":
        return "Vehicle Scrap";
      default:
        return "Other Items";
    }
  };

  const getItemIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("paper")) return <FaFileAlt />;
    if (lower.includes("news")) return <FaNewspaper />;
    if (lower.includes("book")) return <FaBook />;
    if (lower.includes("iron") || lower.includes("loha")) return <FaCog />;
    if (lower.includes("copper") || lower.includes("tamba")) return <FaBolt />;
    if (lower.includes("bottle")) return <FaPrescriptionBottle />;
    if (lower.includes("laptop")) return <FaLaptop />;
    if (lower.includes("washing")) return <FaCog />;
    if (lower.includes("fridge")) return <FaSnowflake />;
    if (lower.includes("ac ")) return <FaSnowflake />;
    if (lower.includes("bike") || lower.includes("scooty")) return <FaMotorcycle />;
    if (lower.includes("car")) return <FaCar />;
    return <FaRecycle />;
  };

  const groupedData = useMemo(() => {
    const groups = {};
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered.forEach(item => {
      const title = getCategoryTitle(item.category);
      if (!groups[title]) {
        groups[title] = {
          title: title,
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
  }, [items, search]);

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <div
        className="container"
        style={heroWrap}
      >
        <div
          className="fade-up"
          style={hero}
        >
          <p style={tag}>
            Updated Today 
            Best Market Prices
          </p>

          <h1 style={title}>
            Scrap Rates List
          </h1>

          <p style={sub}>
            Sell your scrap
            at transparent
            prices with
            accurate weighing
            and instant
            payment.
          </p>

          <div style={heroStats}>
            <span style={pill}>
              <FaStar />
              Trusted Service
            </span>

            <span style={pill}>
              <FaCheckCircle />
              Instant Payment
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div
        className="container"
        style={{
          paddingBottom: "15px"
        }}
      >
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
          <FaSearch
            style={{
              color:
                "var(--primary)"
            }}
          />

          <input
            type="text"
            placeholder="Search scrap item..."
            style={{ ...searchInput, color: "var(--text-main)" }}
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>
      </div>

      {/* NOTE */}
      <div
        className="container"
        style={{
          paddingBottom:
            "45px"
        }}
      >
        <div style={noteBox}>
          <h3
            style={{
              color:
                "var(--primary)",
              marginBottom:
                "12px"
            }}
          >
            📌 Important Note
          </h3>

          <ul style={noteList}>
            <li>
              Rates may differ
              for bulk scrap.
            </li>
            <li>
              Call
              8491028539 for
              bulk quote.
            </li>
            <li>
              No glass,
              wooden items,
              fabrics.
            </li>
            <li>
              Minimum pickup
              value ₹300
              required.
            </li>
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
          <div
            key={index}
            className="container"
            style={{
              paddingBottom:
                "55px"
            }}
          >
            <div
              style={
                headingRow
              }
            >
              <div
                style={
                  catIcon
                }
              >
                {
                  category.icon
                }
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "var(--text-main)"
                }}
              >
                {
                  category.title
                }
              </h2>
            </div>

            <div style={grid3}>
              {category.items.map(
                (
                  item,
                  i
                ) => (
                  <div
                    key={i}
                    className="rate-card"
                  >
                    <RateCard
                      icon={
                        item[2]
                      }
                      name={
                        item[0]
                      }
                      price={
                        item[1]
                      }
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )
        ))
      }

      {/* CTA */}
      <div
        className="container"
        style={{
          paddingBottom:
            "70px"
        }}
      >
        <div style={cta}>
          <h2 style={ctaTitle}>
            Ready to Sell
            Scrap?
          </h2>

          <p style={ctaSub}>
            Book doorstep
            pickup now and
            get paid
            instantly.
          </p>

          <button
            style={btn}
            onClick={() =>
            (window.location.href =
              "/book")
            }
          >
            Book Pickup{" "}
            <FaArrowRight />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* styles */
const heroWrap = {
  paddingTop: "20px",
  paddingBottom: "30px"
};

const hero = {
  textAlign: "center",
  padding: "40px 18px",
  borderRadius: "24px",
  background:
    "var(--card-bg)",
  boxShadow:
    "0 20px 40px rgba(0,0,0,0.05)"
};

const tag = {
  color: "var(--primary)",
  fontWeight: "bold"
};

const title = {
  fontSize:
    "clamp(32px,6vw,56px)",
  margin:
    "16px 0 12px",
  color: "var(--text-main)"
};

const sub = {
  color: "var(--text-muted)",
  fontSize:
    "clamp(15px,3vw,18px)",
  maxWidth: "720px",
  margin: "auto"
};

const heroStats = {
  marginTop: "24px",
  display: "flex",
  justifyContent:
    "center",
  gap: "12px",
  flexWrap: "wrap"
};

const pill = {
  background: "var(--bg-main)",
  color: "var(--text-main)",
  padding: "10px 14px",
  borderRadius: "999px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  boxShadow:
    "0 10px 20px rgba(0,0,0,0.05)",
  border: "1px solid var(--glass-border)"
};

const searchBox = {
  background: "var(--card-bg)",
  padding: "15px 18px",
  borderRadius: "14px",
  display: "flex",
  gap: "12px",
  alignItems: "center",
  boxShadow:
    "0 15px 35px rgba(0,0,0,0.05)",
  border: "1px solid var(--glass-border)"
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
  fontSize: "16px",
  background: "transparent",
  color: "var(--text-main)"
};

const noteBox = {
  background: "var(--primary-light)",
  padding: "22px",
  borderRadius: "18px",
  border:
    "1px solid var(--primary)",
  color: "var(--text-main)"
};

const noteList = {
  lineHeight: "2",
  paddingLeft: "18px"
};

const headingRow = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  background: "var(--card-bg)",
  padding: "14px 18px",
  borderRadius: "14px",
  borderLeft:
    "5px solid var(--primary)",
  boxShadow:
    "0 10px 20px rgba(0,0,0,0.04)"
};

const catIcon = {
  fontSize: "24px",
  color: "var(--primary)"
};

const grid3 = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginTop: "22px"
};

const cta = {
  textAlign: "center",
  padding: "42px 18px",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg,#0b8f3a,#14a248)"
};

const ctaTitle = {
  fontSize:
    "clamp(28px,5vw,42px)",
  color: "#fff",
  marginBottom: "12px"
};

const ctaSub = {
  color: "#eaffef",
  marginBottom: "24px"
};

const btn = {
  background: "var(--card-bg)",
  color: "var(--primary)",
  border: "none",
  padding: "14px 22px",
  borderRadius: "12px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "inline-flex",
  gap: "8px",
  alignItems: "center"
};

export default Rates;