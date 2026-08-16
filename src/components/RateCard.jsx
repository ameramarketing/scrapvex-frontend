import React from "react";

function RateCard({ icon, name, price }) {
  return (
    <div style={card} className="rate-card hover-lift">
      
      {/* ICON / REAL PHOTO */}
      <div style={iconBox}>
        {typeof icon === "string" && (icon.startsWith("http") || icon.startsWith("/") || icon.startsWith("data:")) ? (
          <img src={icon} alt={name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} />
        ) : (
          icon
        )}
      </div>

      {/* NAME */}
      <h3 style={title}>
        {name}
      </h3>

      {/* PRICE */}
      <p style={priceText}>
        {price}
      </p>

      {/* SUBTEXT */}
      <span style={smallText}>
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