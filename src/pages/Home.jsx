import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTruck, FaMoneyBillWave, FaBolt, FaUsers, FaRecycle,
  FaCalendarCheck, FaChevronDown, FaChevronUp, FaHome,
  FaBuilding, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaArrowRight,
  FaPlusCircle
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PickupForm from "../components/PickupForm";
import BannerCarousel from "../components/BannerCarousel";
import StatsCard from "../components/StatsCard";
import Toast from "../components/Toast";
import API from "../services/api";

function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/contacts", contactForm);
      if (data.success) {
        setToast({ show: true, message: data.message || "Message sent successfully! We will get back to you soon.", type: "success" });
        setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setToast({ show: true, message: data.message || "Failed to send message.", type: "danger" });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to connect to server.";
      setToast({ show: true, message: errMsg, type: "danger" });
    }
  };

  return (
    <div style={{background:"var(--bg-main)"}}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      <Navbar />

      {/* HERO SECTION */}
      <div className="container section-padding grid-2" style={{alignItems:"center"}}>
        <div className="hero-card-mobile fade-up">
          <p style={heroTag}>Trusted Scrap Pickup in Jammu & Kashmir </p>
          <h1 className="hero-title" style={heroTitle}>
            Smart Scrap Pickup <br /> at Your Doorstep
          </h1>
          <p style={heroSub}>
            Sell paper, plastic, metal, iron & e-waste online with fair rates and instant payment.
          </p>

          <div style={heroActions} className="text-center-mobile">
            <button className="btn-premium full-width-mobile" onClick={() => navigate("/rates")}>
              View Rates <FaArrowRight />
            </button>
            <button className="btn-secondary full-width-mobile hide-on-mobile" onClick={() => navigate("/book")}>
              Book Pickup
            </button>
          </div>
        </div>

        <div className="slide-right hide-on-mobile">
          <PickupForm />
        </div>
      </div>

      {/* MOBILE FORM CTA */}
      <div className="container show-on-mobile" style={{paddingBottom:"40px"}}>
         <button className="btn-premium full-width-mobile" style={{height:"60px", fontSize:"18px"}} onClick={() => navigate("/book")}>
            <FaPlusCircle /> Start Booking Now
         </button>
      </div>

      <div className="container">
        <BannerCarousel />
      </div>

      {/* WHY CHOOSE */}
      <div className="section-padding">
         <SectionHeading title="Why Choose Scrapvex?" />
         <div className="container grid-3">
            <Card icon={<FaTruck />} title="Doorstep Pickup" text="Quick pickup at your preferred time from any location." />
            <Card icon={<FaMoneyBillWave />} title="Best Prices" text="Transparent pricing with daily updated market rates." />
            <Card icon={<FaBolt />} title="Instant Payment" text="Get cash or digital payment (UPI) immediately after weighing." />
         </div>
      </div>

      {/* STATS */}
      <div style={{background:"var(--card-bg)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)"}}>
         <div className="container section-padding grid-4">
            <StatsCard title="Happy Users" value="10K+" />
            <StatsCard title="Collectors" value="50+" />
            <StatsCard title="Pickups Done" value="25K+" />
            <StatsCard title="Waste Recycled" value="500T+" />
         </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section-padding">
         <SectionHeading title="How It Works" />
         <div className="container grid-4">
            <Card icon={<FaUsers />} title="1. Book Online" text="Choose your preferred time and date on our website." />
            <Card icon={<FaTruck />} title="2. Pickup" text="Our verified collector arrives at your location." />
            <Card icon={<FaRecycle />} title="3. Weighing" text="Accurate digital weighing for all scrap items." />
            <Card icon={<FaCalendarCheck />} title="4. Payment" text="Get paid instantly via cash or UPI." />
         </div>
      </div>

      {/* SERVICES */}
      <div style={{background:"var(--primary-light)"}} className="section-padding">
         <SectionHeading title="Solutions for Everyone" />
         <div className="container grid-2">
            <div className="card-premium">
               <h3 style={{display:"flex", alignItems:"center", gap:"10px", color:"var(--primary)"}}><FaHome /> Household</h3>
               <p style={{color:"var(--text-muted)", marginTop:"10px"}}>Perfect for cleaning your home attic, garage, or kitchen waste.</p>
               <ul style={list}>
                  <li>Free doorstep pickup</li>
                  <li>Digital weighing scale</li>
                  <li>Best value for household items</li>
               </ul>
            </div>
            <div className="card-premium">
               <h3 style={{display:"flex", alignItems:"center", gap:"10px", color:"var(--primary)"}}><FaBuilding /> Business</h3>
               <p style={{color:"var(--text-muted)", marginTop:"10px"}}>Scalable waste management for offices, factories, and shops.</p>
               <ul style={list}>
                  <li>Bulk quantity support</li>
                  <li>Monthly subscription available</li>
                  <li>GST invoicing for corporate</li>
               </ul>
            </div>
         </div>
      </div>

      {/* FAQ */}
      <div className="section-padding">
         <SectionHeading title="Frequently Asked Questions" />
         <div className="container" style={{maxWidth:"800px"}}>
            {faqData.map((item, index) => (
              <div
                key={index}
                className="card-premium"
                style={{ marginBottom: "15px", cursor: "pointer", padding:"20px" }}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{fontSize:"15px"}}>Q.{index + 1} {item.q}</strong>
                  {openFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {openFaq === index && (
                  <p style={{ marginTop: "15px", color: "var(--text-muted)", lineHeight: "1.6", fontSize:"14px" }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
         </div>
      </div>

      {/* CONTACT */}
      <div className="section-padding" style={{background:"var(--card-bg)"}}>
         <SectionHeading title="Connect With Us" />
         <div className="container" style={{display: "flex", flexWrap: "wrap", gap: "40px"}}>
            <div style={{flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px"}}>
              <Card icon={<FaPhoneAlt />} title="Call Us" text="+91 8491028539" />
              <Card icon={<FaEnvelope />} title="Email" text="support@scrapvex.com" />
              <Card icon={<FaMapMarkerAlt />} title="Location" text="Rajouri, Jammu & Kashmir" />
            </div>
            <div style={{flex: 1, minWidth: "300px", padding: "30px"}} className="card-premium">
              <h3 style={{marginBottom: "20px", color: "var(--primary)"}}>Send us a Message</h3>
              <form onSubmit={handleContactSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                <input type="text" placeholder="Your Name" required style={inputStyle} value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                <input type="email" placeholder="Your Email" required style={inputStyle} value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                <input type="text" placeholder="Phone Number" required pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" maxLength="10" style={inputStyle} value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value.replace(/\D/g, '')})} />
                <input type="text" placeholder="Subject" required style={inputStyle} value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} />
                <textarea placeholder="Your Message" required style={{...inputStyle, minHeight: "120px", resize: "vertical"}} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})}></textarea>
                <button type="submit" className="btn-premium" style={{width: "100%", padding: "15px"}}>Send Message</button>
              </form>
            </div>
         </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
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

      <Footer />
    </div>
  );
}

/* REUSABLE */
function SectionHeading({ title }) {
  return (
    <div className="container" style={{ padding: "0 0 40px", textAlign: "center" }}>
      <h2>{title}</h2>
      <div style={{width:"60px", height:"4px", background:"var(--primary)", margin:"15px auto", borderRadius:"2px"}} />
    </div>
  );
}

function Card({ icon, title, text }) {
  return (
    <div className="card-premium" style={{textAlign:"center", padding:"30px"}}>
      <div style={{ fontSize: "35px", color: "var(--primary)", marginBottom:"20px" }}>{icon}</div>
      <h3>{title}</h3>
      <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize:"14px" }}>{text}</p>
    </div>
  );
}

const faqData = [
  { q: "What kind of scrap do you take?", a: "We accept paper, plastic, metal, e-waste, electronics, and large appliances." },
  { q: "What is the method of your payment?", a: "We weigh scrap on the spot and pay instantly via Cash or UPI (PhonePe, GPay)." },
  { q: "Do you take scrap in bulk quantity?", a: "Yes, we handle bulk quantities for both households and businesses. Contact us for bulk rates." },
  { q: "Do you charge for pickup?", a: "No, doorstep pickup is absolutely free for our users." },
  { q: "How do I track my pickup?", a: "You can track your active pickups and history from your User Dashboard after logging in." }
];

/* STYLES */
const heroTag = { color: "var(--primary)", fontWeight: "bold", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" };
const heroTitle = { margin: "15px 0" };
const heroSub = { fontSize: "clamp(16px, 2.5vw, 19px)", color: "var(--text-muted)", marginBottom: "35px", maxWidth: "550px" };
const heroActions = { display: "flex", gap: "15px", flexWrap: "wrap" };
const btnSecondary = { background: "var(--card-bg)", color: "var(--primary)", border: "2px solid var(--primary)", padding: "14px 28px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "15px" };
const list = { marginTop: "20px", lineHeight: "2.2", fontSize: "14px", color: "var(--text-main)", paddingLeft: "20px" };
const inputStyle = { padding: "14px", borderRadius: "10px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "15px", outline: "none" };

export default Home;