import React, { useState } from "react";
import {
  FaTruck, FaMoneyBillWave, FaShieldAlt, FaRecycle, FaCheckCircle,
  FaArrowRight, FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaPlus, FaMinus
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PickupForm from "../components/PickupForm";

function BookPickup() {
  return (
    <div style={{background:"var(--bg-main)"}}>
      <Navbar />

      {/* HERO SECTION */}
      <div className="container section-padding grid-2" style={{alignItems:"center"}}>
        <div className="hero-card-mobile fade-up">
          <p style={tag}>Doorstep Scrap Pickup in Jammu & Kashmir </p>
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
           <div className="card-premium" style={{padding:"0"}}>
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
      <div className="container" style={{paddingBottom:"80px"}}>
         <div className="card-premium trust-box" style={trustBoxInner}>
            <div style={trustIcon}><FaRecycle /></div>
            <div>
               <h2 style={{fontSize:"24px", marginBottom:"10px", color:"var(--text-main)"}}>Eco-Friendly Recycling</h2>
               <p style={{color:"var(--text-muted)", lineHeight:"1.6", fontSize:"15px"}}>
                  We ensure your scrap is responsibly recycled, reducing the environmental footprint and helping keep our city clean and green.
               </p>
            </div>
         </div>
      </div>

      {/* CTA SECTION */}
      <div className="container" style={{paddingBottom:"80px"}}>
         <div className="btn-premium" style={ctaBanner}>
            <h2 style={{color:"#fff", fontSize:"32px", marginBottom:"15px"}}>Ready to declutter?</h2>
            <p style={{color:"rgba(255,255,255,0.9)", marginBottom:"25px"}}>Join thousands of happy users recycling with us.</p>
            <button className="btn-premium" style={{background:"var(--card-bg)", color:"var(--primary)"}} onClick={() => window.scrollTo({top:0, behavior:"smooth"})}>
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

/* REUSABLE */
function SectionTitle({ text }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
       <h2 style={{color: "var(--text-main)"}}>{text}</h2>
       <div style={{width:"50px", height:"3px", background:"var(--primary)", margin:"12px auto"}} />
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="card-premium" style={{textAlign:"center", padding:"30px"}}>
      <div style={{fontSize:"35px", color:"var(--primary)", marginBottom:"15px"}}>{icon}</div>
      <h3 style={{fontSize:"18px", color: "var(--text-main)"}}>{title}</h3>
      <p style={{color:"var(--text-muted)", marginTop:"10px", fontSize:"14px"}}>{text}</p>
    </div>
  );
}

/* STYLES */
const tag = { color: "var(--primary)", fontWeight: "bold", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" };
const title = { margin: "18px 0 14px", lineHeight: "1.1", color: "var(--text-main)" };
const sub = { color: "var(--text-muted)", fontSize: "clamp(16px, 2.5vw, 18px)", lineHeight: "1.7", maxWidth: "500px" };
const badgeWrap = { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "30px" };
const pill = { background: "var(--card-bg)", padding: "10px 18px", borderRadius: "99px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)", display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "var(--text-main)", border: "1px solid var(--glass-border)" };
const trustBoxInner = { display: "flex", gap: "30px", alignItems: "center", background: "var(--card-bg)" };
const trustIcon = { fontSize: "50px", color: "var(--primary)" };
const ctaBanner = { width: "100%", padding: "60px 20px", borderRadius: "30px", textAlign: "center", flexDirection: "column" };

export default BookPickup;