import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  FaShieldAlt, FaDatabase, FaExchangeAlt, FaCookieBite, 
  FaUserCheck, FaLock, FaUserSecret, FaClipboardList 
} from "react-icons/fa";

function PrivacyPolicy() {
  return (
    <div style={{ background: "var(--bg-main)" }}>
      <Navbar />

      <style>{`
        @media (max-width: 768px) {
          .privacy-card {
            padding: 35px 20px !important;
            border-radius: 16px !important;
          }
          .privacy-header h1 {
            font-size: 26px !important;
          }
          .privacy-header p {
            font-size: 13px !important;
          }
        }
      `}</style>

      <div className="container section-padding">
        <div className="card-premium fade-up privacy-card" style={contentBox}>
          <div style={header} className="privacy-header">
            <div style={iconBox}><FaShieldAlt /></div>
            <h1>Privacy Policy</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Last Updated: 15 August 2026</p>
          </div>

          <div style={body}>
            <section style={section}>
              <h3 style={subTitle}><FaUserSecret color="var(--primary)" /> 1. Introduction & Consent</h3>
              <p>
                Scrapvex is a state-of-the-art platform designed to facilitate the sale, donation, and recycling of paper, plastic, metal, and electronic scrap materials. We deeply understand the importance of privacy and are fully committed to maintaining the confidentiality of your personal information. By using our website or mobile application, you hereby consent to our Privacy Policy and agree to its terms and conditions.
              </p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaDatabase color="var(--primary)" /> 2. Collection of Information</h3>
              <p>
                To provide hassle-free doorstep pickup services, we only collect information that is strictly necessary for account security and service execution. This includes your name, contact number, residential/business address, geographical coordinates, and bank details (such as account number, IFSC code, or UPI ID) to process instant real-time payments directly to your wallet or bank account.
              </p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaExchangeAlt color="var(--primary)" /> 3. Use of Personal Data</h3>
              <p>
                The information you provide is utilized to verify user identities, manage secure registration profiles, schedule collectors for doorstep scrap pickups, provide responsive customer support, and process secure financial transfers. Marketing communications or service updates are dispatched only with your explicit consent and can be opted out of at any time.
              </p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaLock color="var(--primary)" /> 4. Disclosure & Security Measures</h3>
              <p>
                Your personal data is treated with the highest security standards. We do not sell or trade user data. Access is strictly limited to authorized personnel and verified banking partners to execute your instant wallet withdrawals. While we employ enterprise-grade security controls to protect your data from unauthorized access or theft, we advise keeping your account credentials confidential.
              </p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaCookieBite color="var(--primary)" /> 5. Cookies Policy</h3>
              <p>
                We use secure cookies to store session-specific information, optimize your dashboard browsing experience, and eliminate the need to repeatedly re-enter account details. You can customize, restrict, or disable cookies directly through your browser preferences.
              </p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaUserCheck color="var(--primary)" /> 6. Minors</h3>
              <p>
                Scrapvex services are not intended for individuals under the age of 18. We do not knowingly collect information from minors. If you believe a minor has registered without guardian consent, please contact our support team immediately to have their details removed.
              </p>
            </section>

            <section style={section}>
              <h3 style={subTitle}><FaClipboardList color="var(--primary)" /> 7. Policy Changes & Grievances</h3>
              <p>
                Any changes to this policy will be dynamically updated and posted on this page. If you have any questions, feedback, or grievance regarding data processing, please reach out to our dedicated Grievance Officer:
              </p>
              <div style={officerCard}>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--text-main)", marginBottom: "5px" }}>Grievance Officer Details</div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  <strong>Name:</strong> Mr. Sameer Carpenter <br />
                  <strong>Email:</strong> sameer@scrapvex.com <br />
                  <strong>General Support:</strong> support@scrapvex.com
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const contentBox = { 
  maxWidth: "900px", 
  margin: "0 auto", 
  padding: "50px 30px", 
  background: "var(--card-bg)", 
  borderRadius: "24px", 
  boxShadow: "0 10px 40px rgba(0,0,0,0.05)", 
  color: "var(--text-main)", 
  border: "1px solid var(--glass-border)",
  boxSizing: "border-box"
};
const header = { textAlign: "center", marginBottom: "40px" };
const iconBox = { width: "70px", height: "70px", background: "var(--primary-light)", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "30px", color: "var(--primary)", margin: "0 auto 20px" };
const body = { lineHeight: "1.8", color: "var(--text-muted)", fontSize: "14px" };
const section = { marginBottom: "35px" };
const subTitle = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px", color: "var(--text-main)", fontSize: "18px" };
const officerCard = { 
  background: "var(--bg-main)", 
  border: "1px dashed var(--glass-border)", 
  padding: "20px", 
  borderRadius: "15px", 
  marginTop: "20px" 
};

export default PrivacyPolicy;
