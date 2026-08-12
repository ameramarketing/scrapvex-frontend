import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

function NotFound() {
  return (
    <div style={wrap}>
      <div style={card}>
        <FaExclamationTriangle style={icon} />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p style={{color: "var(--text-muted)"}}>
          The page you are looking for does not exist.
        </p>

        <Link to="/" style={btn}>
          <FaHome /> Go Home
        </Link>
      </div>
    </div>
  );
}

const wrap = {
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#f7f9fb"
};

const card = {
  background:"#fff",
  padding:"40px",
  borderRadius:"24px",
  textAlign:"center",
  width:"420px"
};

const icon = {
  fontSize:"60px",
  color:"#d62828",
  marginBottom:"15px"
};

const btn = {
  display:"inline-flex",
  gap:"8px",
  marginTop:"18px",
  padding:"12px 18px",
  background:"#0b8f3a",
  color:"#fff",
  textDecoration:"none",
  borderRadius:"12px"
};

export default NotFound;