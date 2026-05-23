import React from "react";

function StatsCard({ title, value }) {
  return (
    <div className="card" style={{textAlign: "center"}}>
      <h3 style={{fontSize:"14px", color:"var(--text-muted)"}}>{title}</h3>
      <h2 style={{ color: "#0b8f3a", marginTop: "5px", fontSize:"28px", fontWeight:"800" }}>{value}</h2>
    </div>
  );
}

export default StatsCard;