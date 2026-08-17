import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTruck, FaMoneyBillWave, FaShieldAlt, FaRecycle, FaCheckCircle,
  FaArrowRight, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaLeaf
} from "react-icons/fa";

import Footer from "../components/Footer";
import PickupForm from "../components/PickupForm";
import API from "../services/api";
import { isMobileEnvironment } from "../platform/platform";

function BookPickup() {
  const navigate = useNavigate();
  const isMobile = isMobileEnvironment();
  const [rates, setRates] = useState([
    { _id: "1", name: "Cardboard", price: 5, unit: "kg" },
    { _id: "2", name: "Plastic", price: 5, unit: "kg" },
    { _id: "3", name: "Mix plastic", price: 8, unit: "kg" },
    { _id: "4", name: "Iron", price: 20, unit: "kg" }
  ]);
  const [user, setUser] = useState(null);

  const baseURL = (API.defaults.baseURL || "").replace(/\/api$/, "") || "https://scrapvex-backend.onrender.com";

  useEffect(() => {
    // Get user details if logged in
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch (e) {
      console.warn("Failed to parse user storage", e);
    }

    // Fetch scrap rates preview in background
    API.get("/scrap-items", { hideLoader: true })
      .then(({ data }) => {
        if (data.success && data.data && data.data.length > 0) {
          const popular = data.data.filter(item => 
            ["iron", "newspaper", "plastic", "copper", "brass", "cardboard"].some(p => 
              item.name.toLowerCase().includes(p)
            )
          );
          setRates(popular.length > 0 ? popular.slice(0, 4) : data.data.slice(0, 4));
        }
      })
      .catch((err) => console.warn("Rates preview load failed", err));
  }, []);

  const handleScheduleClick = () => {
    const element = document.getElementById("booking-form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ────────────────────────────────────────────────────────
  // MOBILE / NATIVE LAYOUT
  // ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ background: "var(--bg-main, #f8fafc)", minHeight: "100vh", paddingBottom: "40px" }}>
        
        {/* COMPACT GREETING & PROFILE ACCESS */}
        <div style={mobileHeaderGreetingStyle}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)", fontWeight: "700", letterSpacing: "0.5px" }}>WELCOME BACK</span>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main, #0f172a)", margin: "2px 0 0 0" }}>
              {user ? user.name.split(" ")[0] : "Scrap Recycler"} 👋
            </h2>
          </div>
          <div style={profileIconCircleStyle} onClick={() => navigate(user ? "/profile" : "/login")}>
            {user && user.profilePhoto ? (
              <img src={`${baseURL}${user.profilePhoto}`} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <FaUser style={{ color: "#0b8f3a", fontSize: "15px" }} />
            )}
          </div>
        </div>

        {/* PREMIUM COMPACT HERO */}
        <div className="container" style={{ padding: "0 16px 16px 16px" }}>
          <div style={mobileHeroCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <span style={heroPill}><FaLeaf style={{ fontSize: "10px" }} /> GO GREEN</span>
            </div>
            <h1 style={{ ...mobileHeroTitle, color: "#ffffff" }}>Sell your scrap.<br />We pick it up.</h1>
            <p style={{ ...mobileHeroSub, color: "#ffffff", opacity: 0.95 }}>
              Schedule environment-friendly pickup for household & commercial scrap with instant digital payout.
            </p>
            <button style={mobileHeroCta} onClick={handleScheduleClick}>
              SCHEDULE PICKUP <FaArrowRight style={{ fontSize: "12px" }} />
            </button>
          </div>
        </div>

        {/* SCRAP RATES PREVIEW */}
        {rates.length > 0 && (
          <div className="container" style={{ padding: "0 16px 20px 16px" }}>
            <div style={ratesPreviewCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted, #64748b)", letterSpacing: "0.5px" }}>SCRAP RATES PREVIEW</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)", fontWeight: "600" }}>Jammu & Kashmir</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                {rates.map(item => (
                  <div key={item._id} style={rateItemStyle}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main, #0f172a)" }}>{item.name}</span>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#0b8f3a" }}>₹{item.price}/{item.unit}</span>
                  </div>
                ))}
              </div>
              <button style={viewAllRatesBtnStyle} onClick={() => navigate("/rates")}>
                View All Rates →
              </button>
            </div>
          </div>
        )}

        {/* BOOKING FORM SECTION */}
        <div id="booking-form-section" className="container" style={{ padding: "0 16px 24px 16px" }}>
          <div style={{ marginBottom: "12px", borderLeft: "4px solid #0b8f3a", paddingLeft: "8px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-main, #0f172a)", margin: 0 }}>Request a Pickup</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: "2px 0 0 0" }}>Fill details to assign verified collector</p>
          </div>
          <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "18px", border: "1px solid var(--card-border, rgba(15,23,42,0.06))", boxShadow: "var(--card-shadow, 0 4px 12px rgba(0,0,0,0.02))" }}>
            <PickupForm />
          </div>
        </div>

        {/* ECO-FRIENDLY TRUST BANNER (ONE STRONG CTA) */}
        <div className="container" style={{ padding: "0 16px 20px 16px" }}>
          <div style={mobileTrustCard}>
            <div style={trustIconStyle}><FaRecycle /></div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main, #0f172a)", margin: "0 0 4px 0" }}>Eco-Friendly Recycling</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: 0, lineHeight: "1.5" }}>
                We process your scrap responsibly to lower environmental impact and keep communities clean.
              </p>
            </div>
          </div>
        </div>

        {/* WHY CHOOSE COMPACT STATS */}
        <div className="container" style={{ padding: "0 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <div style={compactFeatureCard}>
              <FaTruck style={{ fontSize: "16px", color: "#0b8f3a", marginBottom: "4px" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main, #0f172a)" }}>Doorstep</span>
              <span style={{ fontSize: "9px", color: "var(--text-muted, #64748b)" }}>Free Pickup</span>
            </div>
            <div style={compactFeatureCard}>
              <FaMoneyBillWave style={{ fontSize: "16px", color: "#0b8f3a", marginBottom: "4px" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main, #0f172a)" }}>UPI / Cash</span>
              <span style={{ fontSize: "9px", color: "var(--text-muted, #64748b)" }}>Instant Pay</span>
            </div>
            <div style={compactFeatureCard}>
              <FaShieldAlt style={{ fontSize: "16px", color: "#0b8f3a", marginBottom: "4px" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main, #0f172a)" }}>Verified</span>
              <span style={{ fontSize: "9px", color: "var(--text-muted, #64748b)" }}>Safe Agents</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // DESKTOP LAYOUT (100% Unmodified Safety)
  // ────────────────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg-main)" }}>
      {/* HERO SECTION */}
      <div className="container section-padding grid-2" style={{ alignItems: "center" }}>
        <div className="hero-card-mobile fade-up">
          <p style={tag}>Doorstep Scrap Pickup in Jammu & Kashmir</p>
          <h1 style={title}>
            Book Scrap Pickup <br /> In Just Minutes
          </h1>
          <p style={sub}>
            Sell paper, plastic, iron, appliances and e-waste at best market price with instant payment and accurate weighing.
          </p>

          <div style={badgeWrap} className="text-center-mobile">
            <span style={pill}><FaCheckCircle /> Trusted Service</span>
            <span style={pill}><FaMoneyBillWave /> Instant Payment</span>
          </div>
        </div>

        <div className="slide-right">
          <div className="card-premium" style={{ padding: "0" }}>
            <PickupForm />
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section-padding">
        <div className="container">
          <SectionTitle text="Why Book With Scrapvex?" />
          <div className="grid-3">
            <FeatureCard icon={<FaTruck />} title="Doorstep Pickup" text="Fast and reliable pickup at your preferred time from your location." />
            <FeatureCard icon={<FaMoneyBillWave />} title="Best Market Rates" text="Transparent and daily updated market rates for all scrap items." />
            <FeatureCard icon={<FaShieldAlt />} title="Verified Team" text="Safe and secure collection by our professional and verified collectors." />
          </div>
        </div>
      </div>

      {/* TRUST BANNER */}
      <div className="container" style={{ paddingBottom: "80px" }}>
        <div className="card-premium trust-box" style={trustBoxInner}>
          <div style={trustIcon}><FaRecycle /></div>
          <div>
            <h2 style={{ fontSize: "24px", marginBottom: "10px", color: "var(--text-main)" }}>Eco-Friendly Recycling</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.6", fontSize: "15px" }}>
              We ensure your scrap is responsibly recycled, reducing the environmental footprint and helping keep our city clean and green.
            </p>
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="container" style={{ paddingBottom: "80px" }}>
        <div style={ctaBanner}>
          <h2 style={{ color: "#ffffff", fontSize: "32px", fontWeight: "900", marginBottom: "12px", marginTop: 0 }}>Ready to declutter?</h2>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", marginBottom: "24px", marginTop: 0 }}>Join thousands of happy users recycling with us.</p>
          <button 
            type="button"
            style={{ 
              background: "#ffffff", 
              color: "#0b8f3a", 
              border: "none", 
              padding: "14px 28px", 
              borderRadius: "14px", 
              fontSize: "15px", 
              fontWeight: "900", 
              cursor: "pointer", 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease" 
            }} 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Book Your Pickup Now <FaArrowRight />
          </button>
        </div>
      </div>

      <Footer />

      <style>{`
         @media (max-width: 768px) {
            .trust-box { flex-direction: column; text-align: center; padding: 30px 20px !important; }
            .trust-box div:first-child { margin-bottom: 15px; }
            
            .hero-card-mobile {
               background: var(--card-bg);
               padding: 30px 20px;
               border-radius: 24px;
               box-shadow: 0 10px 40px rgba(0,0,0,0.03);
               border: 1px solid var(--glass-border);
               margin-bottom: 25px;
               text-align: center;
            }
            .hero-card-mobile p {
               margin-left: auto !important;
               margin-right: auto !important;
            }
            .hero-card-mobile .text-center-mobile {
               justify-content: center !important;
            }
         }
      `}</style>
    </div>
  );
}

/* REUSABLE DESKTOP COMPONENTS */
function SectionTitle({ text }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <h2 style={{ color: "var(--text-main)" }}>{text}</h2>
      <div style={{ width: "50px", height: "3px", background: "var(--primary)", margin: "12px auto" }} />
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="card-premium" style={{ textAlign: "center", padding: "30px" }}>
      <div style={{ fontSize: "35px", color: "var(--primary)", marginBottom: "15px" }}>{icon}</div>
      <h3 style={{ fontSize: "18px", color: "var(--text-main)" }}>{title}</h3>
      <p style={{ color: "var(--text-muted)", marginTop: "10px", fontSize: "14px" }}>{text}</p>
    </div>
  );
}

/* STYLES DESKTOP */
const tag = { color: "var(--primary)", fontWeight: "bold", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" };
const title = { margin: "18px 0 14px", lineHeight: "1.1", color: "var(--text-main)" };
const sub = { color: "var(--text-muted)", fontSize: "clamp(16px, 2.5vw, 18px)", lineHeight: "1.7", maxWidth: "500px" };
const badgeWrap = { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "30px" };
const pill = { background: "var(--card-bg)", padding: "10px 18px", borderRadius: "99px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)", display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "var(--text-main)", border: "1px solid var(--glass-border)" };
const trustBoxInner = { display: "flex", gap: "30px", alignItems: "center", background: "var(--card-bg)" };
const trustIcon = { fontSize: "50px", color: "var(--primary)" };
const ctaBanner = { width: "100%", padding: "50px 24px", borderRadius: "28px", textAlign: "center", flexDirection: "column", background: "linear-gradient(135deg, #0b8f3a 0%, #056627 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", boxShadow: "0 15px 35px rgba(11, 143, 58, 0.25)" };

/* ────────────────────────────────────────────────────────
   MOBILE INLINE STYLES
   ──────────────────────────────────────────────────────── */
const mobileHeaderGreetingStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 16px 12px 16px",
  background: "var(--bg-main, #f8fafc)"
};

const profileIconCircleStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: "#f0fdf4",
  border: "1.5px solid #0b8f3a",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  overflow: "hidden"
};

const mobileHeroCard = {
  background: "linear-gradient(135deg, #0b8f3a 0%, #16a34a 100%)",
  padding: "20px",
  borderRadius: "18px",
  color: "#ffffff",
  boxShadow: "0 8px 24px rgba(11,143,58,0.15)"
};

const heroPill = {
  background: "rgba(255, 255, 255, 0.25)",
  color: "#ffffff",
  padding: "3px 10px",
  borderRadius: "99px",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  display: "flex",
  alignItems: "center",
  gap: "4px"
};

const mobileHeroTitle = {
  fontSize: "24px",
  fontWeight: "900",
  lineHeight: "1.15",
  margin: "0 0 8px 0",
  color: "#ffffff"
};

const mobileHeroSub = {
  fontSize: "13px",
  lineHeight: "1.5",
  color: "#ffffff",
  opacity: 0.95,
  margin: "0 0 16px 0",
  fontWeight: "500",
  maxWidth: "290px"
};

const mobileHeroCta = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: "var(--card-bg, #ffffff)",
  color: "#0b8f3a",
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const ratesPreviewCardStyle = {
  background: "var(--card-bg, #ffffff)",
  padding: "16px",
  borderRadius: "18px",
  border: "1px solid var(--card-border, rgba(15,23,42,0.06))",
  boxShadow: "var(--card-shadow, 0 4px 12px rgba(0,0,0,0.02))"
};

const rateItemStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "12px",
  borderRadius: "12px",
  background: "var(--input-bg, #f8fafc)",
  border: "1px solid var(--card-border, #f1f5f9)"
};

const viewAllRatesBtnStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  color: "#0b8f3a",
  fontWeight: "700",
  fontSize: "13px",
  cursor: "pointer",
  textAlign: "center"
};

const mobileTrustCard = {
  background: "var(--card-bg, #ffffff)",
  padding: "16px",
  borderRadius: "18px",
  border: "1.5px solid var(--card-border, #dcfce7)",
  display: "flex",
  gap: "14px",
  alignItems: "flex-start"
};

const trustIconStyle = {
  fontSize: "24px",
  color: "#0b8f3a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px",
  background: "var(--bg-subtle, #f0fdf4)",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(11,143,58,0.1)"
};

const compactFeatureCard = {
  background: "var(--card-bg, #ffffff)",
  padding: "12px 8px",
  borderRadius: "14px",
  border: "1px solid var(--card-border, rgba(15,23,42,0.05))",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  boxShadow: "var(--card-shadow, 0 2px 6px rgba(0,0,0,0.01))"
};

export default BookPickup;