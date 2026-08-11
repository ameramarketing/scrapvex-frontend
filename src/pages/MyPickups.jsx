import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaCheckCircle, FaArrowLeft, FaTrashAlt, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaRupeeSign, FaStar, FaTimes, FaPaperPlane, FaRecycle } from "react-icons/fa";

import Footer from "../components/Footer";
import Toast from "../components/Toast";
import API from "../services/api";

function MyPickups() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  useEffect(() => {
    fetchMyPickups();
  }, []);

  const fetchMyPickups = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/pickups/my");
      if (data?.success) setPickups(data.pickups || []);
    } catch (error) {
      showToast("error", "Failed to load pickup history");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedPickup) return;
    try {
      const { data } = await API.post("/reviews", {
        pickupId: selectedPickup._id,
        rating,
        comment
      });
      if (data.success) {
        showToast("success", "Thank you for your feedback! ⭐");
        setShowReviewModal(false);
        setComment("");
        setRating(5);
        fetchMyPickups();
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to submit review");
    }
  };

  const cancelPickup = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this pickup?")) return;
    try {
      const { data } = await API.put(`/pickups/${id}/cancel`);
      if (data.success) {
        showToast("success", "Pickup cancelled successfully");
        fetchMyPickups();
      }
    } catch (error) { showToast("error", "Failed to cancel pickup"); }
  };

  const handleBack = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "admin") navigate("/admin-dashboard");
    else if (user.role === "collector") navigate("/collector-dashboard");
    else navigate("/dashboard");
  };

  if (loading) return <div style={loaderStyle}><FaRecycle className="spin" size={40} color="#0b8f3a" /></div>;

  const isCollector = JSON.parse(localStorage.getItem("user") || "{}").role === "collector";

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", color: "var(--text-main)" }}>
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <div className="container" style={{ padding: "40px 20px" }}>
        <div style={header}>
          <button style={{...backBtn, color: "var(--primary)"}} onClick={handleBack}><FaArrowLeft /> Back to Dashboard</button>
          <h1 style={{margin:"10px 0", color: "var(--text-main)"}}>My Pickup History</h1>
        </div>

        {pickups.length === 0 ? (
          <div style={emptyState}>
            <FaTruck style={{ fontSize: "60px", color: "var(--text-muted)", marginBottom: "20px" }} />
            <h3 style={{color: "var(--text-main)"}}>No Pickups Found</h3>
            <button style={{...bookBtn, background: "var(--primary)"}} onClick={() => navigate("/book")}>Book Your First Pickup</button>
          </div>
        ) : (
          <div style={listGrid}>
            {pickups.map((item) => (
              <div key={item._id} style={card} className="premium-card">
                <div style={cardTop}>
                  <div style={statusBadge(item.status)}>{item.status}</div>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}><FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                <div style={cardBody}>
                  <h3 style={{ margin: "10px 0", color: "var(--text-main)" }}>{item.scrapType}</h3>
                  <p style={{...detailText, color: "var(--text-muted)"}}><FaMapMarkerAlt /> {item.address}</p>
                  
                  {item.status === "Completed" && (
                    <>
                      <div style={{...receipt, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
                        <p style={{...receiptTitle, color: "var(--primary)"}}>Transaction Summary</p>
                        {item.items?.map((it, idx) => (
                          <div key={idx} style={{...receiptRow, color: "var(--text-main)"}}><span>{it.name} ({it.quantity}{it.unit})</span><span>₹{it.subtotal}</span></div>
                        ))}
                        <div style={{...receiptTotal, borderTop: "1px solid var(--glass-border)", color: "var(--text-main)"}}><span>Final Amount Paid</span><span>₹{item.amount}</span></div>
                      </div>
                      {!item.isReviewed ? (
                        <button style={rateBtn} onClick={() => { setSelectedPickup(item); setShowReviewModal(true); }}>
                          <FaStar /> Rate Experience
                        </button>
                      ) : (
                        <div style={{ marginTop: "15px", textAlign: "center", color: "var(--primary)", fontWeight: "bold", fontSize: "14px" }}>
                           <FaCheckCircle /> You have rated this experience
                        </div>
                      )}
                    </>
                  )}

                  {item.status === "Pending" && (
                    <button style={cancelBtn} onClick={() => cancelPickup(item._id)}><FaTrashAlt /> Cancel Booking</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div style={modalOverlay}>
          <div style={{...modal, background: "var(--card-bg)"}} className="premium-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "var(--text-main)" }}>Rate Collector</h3>
              <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-main)" }} onClick={() => setShowReviewModal(false)}><FaTimes /></button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
              {[1,2,3,4,5].map(s => <FaStar key={s} size={30} color={s <= rating ? "#f39c12" : "var(--glass-border)"} style={{ cursor: "pointer" }} onClick={() => setRating(s)} />)}
            </div>
            <textarea style={{...textarea, background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--glass-border)"}} placeholder="Write your feedback here..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button style={submitReviewBtn} onClick={handleReview}><FaPaperPlane /> Submit Review</button>
          </div>
        </div>
      )}

      {!isCollector && <Footer />}
    </div>
  );
}

const loaderStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" };
const header = { marginBottom: "30px" };
const backBtn = { background: "none", border: "none", color: "#0b8f3a", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const emptyState = { textAlign: "center", padding: "80px 20px", background: "var(--card-bg)", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const bookBtn = { background: "#0b8f3a", color: "#fff", border: "none", padding: "12px 30px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" };
const listGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" };
const card = { background: "var(--card-bg)", borderRadius: "24px", padding: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const cardTop = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const cardBody = { marginTop: "15px" };
const detailText = { color: "#666", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", margin: "5px 0" };
const statusBadge = (status) => ({ padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", background: status === "Completed" ? "var(--primary-light)" : (status === "Pending" ? "rgba(243, 156, 18, 0.1)" : "rgba(79, 70, 229, 0.1)"), color: status === "Completed" ? "var(--primary)" : (status === "Pending" ? "#f39c12" : "#4f46e5") });
const cancelBtn = { marginTop: "20px", width: "100%", background: "#fff0f0", color: "#e74c3c", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };
const receipt = { marginTop: "15px", padding: "15px", background: "#fcfcfc", borderRadius: "16px", border: "1px solid #eee" };
const receiptTitle = { margin: "0 0 10px 0", fontSize: "13px", fontWeight: "bold", color: "#0b8f3a" };
const receiptRow = { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px", color: "#555" };
const receiptTotal = { borderTop: "1px solid #ddd", marginTop: "10px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#333", fontSize:"13px" };
const rateBtn = { background: "#fff9e6", color: "#f39c12", border: "1px solid #f39c12", padding: "8px", width:"100%", borderRadius: "10px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent:"center", gap: "6px", marginTop: "15px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter:"blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding:"20px" };
const modal = { background: "#fff", padding: "30px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
const textarea = { width: "100%", height: "100px", padding: "12px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "15px", outline: "none", resize: "none" };
const submitReviewBtn = { width: "100%", padding: "14px", background: "#0b8f3a", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };

export default MyPickups;