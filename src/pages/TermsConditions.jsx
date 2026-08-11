import React from "react";
import Footer from "../components/Footer";
import { FaFileContract, FaShieldAlt, FaBalanceScale, FaUserLock } from "react-icons/fa";

function TermsConditions() {
  return (
    <div style={{background:"var(--bg-main)"}}>
      
      <div className="container section-padding">
        <div className="card-premium fade-up" style={contentBox}>
          <div style={header}>
            <div style={iconBox}><FaFileContract /></div>
            <h1>Terms & Conditions</h1>
            <p style={{color:"var(--text-muted)"}}>Last Updated: April 2026</p>
          </div>

          <div style={body}>
            <section style={section}>
              <h3 style={subTitle}><FaShieldAlt color="var(--primary)" /> 1. Service Overview</h3>
              <p>Scrapvex provides a platform for users to sell or donate their scrap materials at designated rates. By using our service, you agree to provide accurate information regarding the scrap items and your location.</p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaBalanceScale color="var(--primary)" /> 2. Pricing & Weighing</h3>
              <p>All scrap rates are subject to market fluctuations. The final price will be determined based on the actual weight measured by our digital scales at the time of pickup. We guarantee transparent and fair weighing practices.</p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaUserLock color="var(--primary)" /> 3. User Responsibilities</h3>
              <p>Users must ensure that the scrap items provided are free from hazardous materials or prohibited substances. You must be at least 18 years old or have parental consent to book a pickup.</p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaFileContract color="var(--primary)" /> 4. Cancellations</h3>
              <p>Cancellations should be made at least 2 hours prior to the scheduled pickup time. Repeated last-minute cancellations may result in account suspension.</p>
            </section>

            <section style={section}>
              <h3 style={subTitle}>5. Privacy</h3>
              <p>Your personal data is safe with us. We only use your location and contact details to facilitate the pickup service. Please read our Privacy Policy for more details.</p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const contentBox = { maxWidth: "900px", margin: "0 auto", padding: "50px", background: "var(--card-bg)", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", color: "var(--text-main)", border: "1px solid var(--glass-border)" };
const header = { textAlign: "center", marginBottom: "40px" };
const iconBox = { width: "70px", height: "70px", background: "var(--primary-light)", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "30px", color: "var(--primary)", margin: "0 auto 20px" };
const body = { lineHeight: "1.8", color: "var(--text-muted)" };
const section = { marginBottom: "35px" };
const subTitle = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px", color: "var(--text-main)", fontSize: "20px" };

export default TermsConditions;