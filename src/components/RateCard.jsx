import React from "react";
import { getScrapItemImage } from "../utils/scrapImages";

function RateCard({ icon, name, price }) {
  const scrapImg = typeof icon === "string" && (icon.startsWith("http") || icon.startsWith("/") || icon.startsWith("data:")) ? icon : getScrapItemImage(name, "", null);

  return (
    <div style={card} className="rate-card hover-lift">
      
      {/* REAL PHOTO THUMBNAIL */}
      <div style={iconBox}>
        <img src={scrapImg} alt={name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.12)", margin: "0 auto 8px auto", display: "block" }} />
      </div>

      {/* NAME */}
      <h3 style={{ ...title, color: "#000000", fontWeight: "800" }} className="rate-card-title">
        {name}
      </h3>

      {/* PRICE */}
      <p style={priceText}>
        {price}
      </p>

      {/* SUBTEXT */}
      <span style={{ ...smallText, color: "#64748b" }}>
        Live Rate
      </span>

    </div>
  );
}

const card = {
  background: "var(--card-bg)",
  borderRadius: "14px",
  padding: "14px",
  boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
  textAlign: "center",
  transition: "0.3s ease",
  cursor: "pointer",
  minHeight: "180px",
  border: "1px solid var(--glass-border)"
};

const iconBox = {
  fontSize: "22px",
  color: "var(--primary)",
  marginBottom: "10px"
};

const title = {
  fontSize: "16px",
  fontWeight: "700",
  lineHeight: "1.4",
  minHeight: "44px",
  marginBottom: "10px",
  color: "var(--text-main)"
};

const priceText = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "var(--primary)",
  marginBottom: "8px"
};

const smallText = {
  fontSize: "13px",
  color: "var(--text-muted)"
};

export default RateCard;