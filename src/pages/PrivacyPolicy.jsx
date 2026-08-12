import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { 
  FaShieldAlt, FaDatabase, FaExchangeAlt, FaCookieBite, 
  FaUserCheck, FaLock, FaUserSecret, FaClipboardList, FaArrowLeft
} from "react-icons/fa";

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "var(--bg-main, #f8fafc)", minHeight: "100vh", color: "var(--text-main, #0f172a)" }}>
      
      {/* NATIVE MOBILE HEADER WITH BACK BUTTON */}
      <header style={{
        background: "var(--card-bg, #ffffff)",
        padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px 12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderBottom: "1px solid var(--card-border, #e2e8f0)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "var(--bg-main, #f1f5f9)",
            border: "none",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-main, #0f172a)",
            cursor: "pointer",
            fontSize: "15px",
            flexShrink: 0
          }}
          title="Go Back"
        >
          <FaArrowLeft />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ background: "#f0fdf4", color: "#0b8f3a", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center" }}>
            <FaShieldAlt size={16} />
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "900", margin: 0, lineHeight: 1.2 }}>Privacy Policy</h1>
            <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)" }}>ScrapVex Security & Compliance</span>
          </div>
        </div>
      </header>

      {/* CONTENT CONTAINER */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px 14px 40px 14px" }}>
        
        {/* HERO BADGE CARD */}
        <div style={{
          background: "var(--card-bg, #ffffff)",
          borderRadius: "18px",
          padding: "24px 20px",
          border: "1px solid var(--card-border, #e2e8f0)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          marginBottom: "16px",
          textAlign: "center"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            color: "#0b8f3a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            margin: "0 auto 12px auto",
            border: "1px solid #bbf7d0"
          }}>
            <FaShieldAlt />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 6px 0", color: "var(--text-main, #0f172a)" }}>
            Your Privacy is Our Priority
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: 0, lineHeight: 1.5 }}>
            ScrapVex is committed to safeguarding your personal and financial information with bank-grade encryption and privacy controls.
          </p>
          <div style={{ marginTop: "12px" }}>
            <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "3px 10px", borderRadius: "10px", fontSize: "10px", fontWeight: "800" }}>
              ✓ Last Updated: 15 August 2026
            </span>
          </div>
        </div>

        {/* SECTION CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Section 1 */}
          <div className="privacy-section-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconPillStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaUserSecret /></div>
              <h3 style={sectionTitleStyle}>1. Introduction & Consent</h3>
            </div>
            <p style={sectionTextStyle}>
              ScrapVex is a state-of-the-art platform designed to facilitate the sale, donation, and recycling of paper, plastic, metal, and electronic scrap materials. We deeply understand the importance of privacy and are fully committed to maintaining the confidentiality of your personal information. By using our website or mobile application, you hereby consent to our Privacy Policy and agree to its terms and conditions.
            </p>
          </div>

          {/* Section 2 */}
          <div className="privacy-section-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconPillStyle, background: "#eff6ff", color: "#2563eb" }}><FaDatabase /></div>
              <h3 style={sectionTitleStyle}>2. Collection of Information</h3>
            </div>
            <p style={sectionTextStyle}>
              To provide hassle-free doorstep pickup services, we only collect information that is strictly necessary for account security and service execution. This includes your name, contact number, residential/business address, geographical coordinates, and bank details (such as account number, IFSC code, or UPI ID) to process instant real-time payments directly to your wallet or bank account.
            </p>
          </div>

          {/* Section 3 */}
          <div className="privacy-section-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconPillStyle, background: "#fef3c7", color: "#d97706" }}><FaExchangeAlt /></div>
              <h3 style={sectionTitleStyle}>3. Use of Personal Data</h3>
            </div>
            <p style={sectionTextStyle}>
              The information you provide is utilized to verify user identities, manage secure registration profiles, schedule collectors for doorstep scrap pickups, provide responsive customer support, and process secure financial transfers. Marketing communications or service updates are dispatched only with your explicit consent and can be opted out of at any time.
            </p>
          </div>

          {/* Section 4 */}
          <div className="privacy-section-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconPillStyle, background: "#ecfdf5", color: "#059669" }}><FaLock /></div>
              <h3 style={sectionTitleStyle}>4. Disclosure & Security Measures</h3>
            </div>
            <p style={sectionTextStyle}>
              Your personal data is treated with the highest security standards. We do not sell or trade user data. Access is strictly limited to authorized personnel and verified banking partners to execute your instant wallet withdrawals. While we employ enterprise-grade security controls to protect your data from unauthorized access or theft, we advise keeping your account credentials confidential.
            </p>
          </div>

          {/* Section 5 */}
          <div className="privacy-section-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconPillStyle, background: "#fff7ed", color: "#ea580c" }}><FaCookieBite /></div>
              <h3 style={sectionTitleStyle}>5. Cookies Policy</h3>
            </div>
            <p style={sectionTextStyle}>
              We use secure cookies to store session-specific information, optimize your dashboard browsing experience, and eliminate the need to repeatedly re-enter account details. You can customize, restrict, or disable cookies directly through your browser preferences.
            </p>
          </div>

          {/* Section 6 */}
          <div className="privacy-section-card" style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconPillStyle, background: "#f5f3ff", color: "#7c3aed" }}><FaUserCheck /></div>
              <h3 style={sectionTitleStyle}>6. Protection of Minors</h3>
            </div>
            <p style={sectionTextStyle}>
              ScrapVex services are not intended for individuals under the age of 18. We do not knowingly collect information from minors. If you believe a minor has registered without guardian consent, please contact our support team immediately to have their details removed.
            </p>
          </div>

          {/* Section 7 - Grievance Officer Card */}
          <div className="privacy-section-card" style={{ ...sectionCardStyle, border: "1.5px dashed #0b8f3a", background: "var(--card-bg, #ffffff)" }}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconPillStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaClipboardList /></div>
              <h3 style={sectionTitleStyle}>7. Grievance & Compliance Officer</h3>
            </div>
            <p style={{ ...sectionTextStyle, marginBottom: "14px" }}>
              If you have any questions, feedback, or grievances regarding data processing, please reach out to our dedicated Grievance Officer:
            </p>
            <div style={{
              background: "var(--bg-main, #f8fafc)",
              borderRadius: "12px",
              padding: "14px",
              border: "1px solid var(--card-border, #e2e8f0)",
              fontSize: "12px",
              color: "var(--text-muted, #64748b)",
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: "800", color: "var(--text-main, #0f172a)", marginBottom: "4px", fontSize: "13px" }}>
                Grievance Officer Details
              </div>
              <div><strong style={{ color: "var(--text-main, #0f172a)" }}>Name:</strong> Mr. Sameer Carpenter</div>
              <div><strong style={{ color: "var(--text-main, #0f172a)" }}>Email:</strong> sameer@scrapvex.com</div>
              <div><strong style={{ color: "var(--text-main, #0f172a)" }}>Support:</strong> support@scrapvex.com</div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

const sectionCardStyle = {
  background: "var(--card-bg, #ffffff)",
  borderRadius: "16px",
  padding: "16px",
  border: "1px solid var(--card-border, #e2e8f0)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "8px"
};

const iconPillStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  flexShrink: 0
};

const sectionTitleStyle = {
  fontSize: "14px",
  fontWeight: "800",
  color: "var(--text-main, #0f172a)",
  margin: 0
};

const sectionTextStyle = {
  fontSize: "12px",
  color: "var(--text-muted, #64748b)",
  margin: 0,
  lineHeight: 1.6
};

export default PrivacyPolicy;
