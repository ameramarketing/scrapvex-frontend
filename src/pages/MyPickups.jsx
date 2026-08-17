import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaClock, FaCheckCircle, FaArrowLeft, FaTrashAlt, FaTruck, FaPhoneAlt, 
  FaMapMarkerAlt, FaCalendarAlt, FaRupeeSign, FaStar, FaTimes, 
  FaPaperPlane, FaRecycle, FaChevronRight 
} from "react-icons/fa";

import Footer from "../components/Footer";
import Toast from "../components/Toast";
import API from "../services/api";
import { isMobileEnvironment } from "../platform/platform";

function MyPickups() {
  const navigate = useNavigate();
  const isMobile = isMobileEnvironment();
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [expandedCard, setExpandedCard] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingPickup, setTrackingPickup] = useState(null);

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

  if (loading) return <div style={loaderStyle}><FaRecycle className="spin" size={32} color="#0b8f3a" /></div>;

  const isCollector = JSON.parse(localStorage.getItem("user") || "{}").role === "collector";

  // Get localized display status values
  const getStatusDisplay = (status) => {
    switch (status) {
      case "Pending": return "Pending";
      case "Accepted": return "Confirmed";
      case "Assigned": return "Collector Assigned";
      case "Completed": return "Completed";
      case "Cancelled": return "Cancelled";
      default: return status;
    }
  };

  // Get status color styles
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return { bg: "#f0fdf4", text: "#16a34a" };
      case "Pending": return { bg: "#fff7ed", text: "#ea580c" };
      case "Cancelled": return { bg: "#fef2f2", text: "#dc2626" };
      default: return { bg: "#eff6ff", text: "#2563eb" }; // Confirmed / Assigned
    }
  };

  // ────────────────────────────────────────────────────────
  // MOBILE / NATIVE LAYOUT
  // ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ background: "var(--bg-main, #f8fafc)", minHeight: "100vh", paddingBottom: "40px" }}>
        <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

        {/* MOBILE HEADER */}
        <div style={{ padding: "20px 16px 10px 16px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main, #0f172a)", margin: 0 }}>My Pickups</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: "2px 0 0 0" }}>Track your recycle requests & history</p>
        </div>

        {/* LIST SECTION */}
        {pickups.length === 0 ? (
          <div className="container" style={{ padding: "40px 16px", textAlign: "center" }}>
            <div style={{ background: "var(--card-bg, #ffffff)", padding: "30px 20px", borderRadius: "18px", border: "1px solid rgba(15,23,42,0.06)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              <FaTruck style={{ fontSize: "40px", color: "#94a3b8", marginBottom: "12px" }} />
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main, #0f172a)", margin: "0 0 4px 0" }}>No Pickups Found</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", margin: "0 0 16px 0" }}>Your completed and upcoming pickups will appear here.</p>
              <button style={mobileBookBtn} onClick={() => navigate("/book")}>Schedule a Pickup</button>
            </div>
          </div>
        ) : (
          <div className="container" style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {pickups.map((item) => {
              const statusStyle = getStatusColor(item.status);
              const isExpanded = expandedCard === item._id;
              return (
                <div key={item._id} style={mobileCardStyle}>
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8" }}>
                      PICKUP #{item._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "6px", 
                      fontSize: "10px", 
                      fontWeight: "800", 
                      background: statusStyle.bg, 
                      color: statusStyle.text 
                    }}>
                      {getStatusDisplay(item.status).toUpperCase()}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main, #0f172a)", margin: 0 }}>{item.scrapType}</h3>
                    
                    <div style={mobileDetailRow}>
                      <FaCalendarAlt style={{ color: "#94a3b8", fontSize: "12px" }} />
                      <span>{item.pickupDate ? new Date(item.pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div style={mobileDetailRow}>
                      <FaMapMarkerAlt style={{ color: "#94a3b8", fontSize: "12px" }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.address}</span>
                    </div>

                    {/* CLEAN STEPPER BAR (NO DUPLICATE TEXT) */}
                    {item.status !== "Cancelled" && (
                      <div style={{ background: "var(--bg-main, #f8fafc)", borderRadius: "10px", padding: "8px 10px", border: "1px solid var(--card-border, #e2e8f0)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                          <div style={{ flex: 1, height: "5px", borderRadius: "4px", background: "#0b8f3a" }} title="Booked" />
                          <div style={{ flex: 1, height: "5px", borderRadius: "4px", background: ["Accepted", "Assigned", "Completed"].includes(item.status) ? "#0b8f3a" : "#cbd5e1" }} title="Collector Assigned" />
                          <div style={{ flex: 1, height: "5px", borderRadius: "4px", background: item.status === "Completed" ? "#0b8f3a" : "#cbd5e1" }} title="Completed" />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: "800", color: "var(--text-muted, #64748b)" }}>
                          <span style={{ color: "#0b8f3a" }}>1. Booked ✓</span>
                          <span style={{ color: ["Accepted", "Assigned", "Completed"].includes(item.status) ? "#0b8f3a" : "#64748b" }}>
                            {["Accepted", "Assigned"].includes(item.status) ? "2. Collector Assigned" : item.status === "Completed" ? "2. Assigned ✓" : "2. Assigning..."}
                          </span>
                          <span style={{ color: item.status === "Completed" ? "#0b8f3a" : "#64748b" }}>
                            {item.status === "Completed" ? "3. Completed ✓" : "3. Complete"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 4-DIGIT COMPLETION SECURITY CODE */}
                    {["Pending", "Assigned", "Accepted", "On The Way"].includes(item.status) && (
                      <div style={{
                        background: "var(--primary-light, #f0fdf4)",
                        border: "1.5px dashed #0b8f3a",
                        borderRadius: "10px",
                        padding: "8px 10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "800", color: "#166534", display: "block" }}>🔐 PICKUP COMPLETION OTP</span>
                          <span style={{ fontSize: "9px", color: "var(--text-muted, #64748b)" }}>Share with collector after weighing</span>
                        </div>
                        <div style={{
                          fontSize: "15px",
                          fontWeight: "900",
                          letterSpacing: "2px",
                          color: "#0b8f3a",
                          background: "var(--card-bg, #ffffff)",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          border: "1px solid #bbf7d0"
                        }}>
                          {item.verificationCode || item._id.slice(-4).toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/* ACTION BUTTONS (TRACK STATUS vs VIEW ITEMS) */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", fontWeight: "600" }}>
                        Est: <strong style={{ color: "#0b8f3a", fontSize: "14px" }}>₹{item.amount}</strong>
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {item.status !== "Cancelled" && (
                          <button
                            onClick={() => { setTrackingPickup(item); setShowTrackingModal(true); }}
                            style={{
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#0b8f3a",
                              padding: "5px 9px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "800",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            📍 Track Status
                          </button>
                        )}
                        <button 
                          style={{
                            background: isExpanded ? "#f1f5f9" : "var(--bg-main, #f8fafc)",
                            border: "1px solid var(--card-border, #cbd5e1)",
                            color: "var(--text-main, #334155)",
                            padding: "5px 9px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          onClick={() => setExpandedCard(isExpanded ? null : item._id)}
                        >
                          {isExpanded ? "Hide Items" : "Items & Bill"} <FaChevronRight style={{ fontSize: "9px", transform: isExpanded ? "rotate(90deg)" : "none", transition: "0.2s" }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={mobileExpandedBlock}>
                      <div style={{ height: "1px", background: "var(--bg-subtle, #f1f5f9)", margin: "10px 0" }} />
                      
                      {/* Items Breakdowns */}
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px" }}>ITEMS LIST</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {item.items?.map((it, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-main, #0f172a)" }}>
                            <span>{it.name} ({it.quantity} {it.unit})</span>
                            <strong style={{ color: "var(--text-main, #0f172a)" }}>₹{it.subtotal}</strong>
                          </div>
                        ))}
                      </div>

                      <div style={{ height: "1px", background: "var(--bg-subtle, #f1f5f9)", margin: "10px 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                        <span>Final Amount Paid:</span>
                        <span style={{ color: "#0b8f3a" }}>₹{item.amount}</span>
                      </div>

                      {/* Cancel Booking Action */}
                      {item.status === "Pending" && (
                        <button style={mobileCancelBtn} onClick={() => cancelPickup(item._id)}>
                          <FaTrashAlt /> Cancel Request
                        </button>
                      )}

                      {/* Rating Feedback Action */}
                      {item.status === "Completed" && (
                        <div style={{ marginTop: "12px" }}>
                          {!item.isReviewed ? (
                            <button style={mobileRateBtn} onClick={() => { setSelectedPickup(item); setShowReviewModal(true); }}>
                              <FaStar /> Rate Experience
                            </button>
                          ) : (
                            <div style={{ padding: "8px", background: "#f0fdf4", color: "#16a34a", borderRadius: "10px", fontSize: "11px", fontWeight: "700", textAlign: "center" }}>
                              ✓ Feedback Submitted
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* FEEDBACK BOTTOM SHEET MODAL */}
        {showReviewModal && (
          <div style={modalOverlay}>
            <div style={mobileModalCard} className="fade-up">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Rate Service</h3>
                <button style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted, #64748b)" }} onClick={() => setShowReviewModal(false)}><FaTimes /></button>
              </div>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
                {[1,2,3,4,5].map(s => (
                  <FaStar 
                    key={s} 
                    size={28} 
                    color={s <= rating ? "#fbbf24" : "#e2e8f0"} 
                    style={{ cursor: "pointer" }} 
                    onClick={() => setRating(s)} 
                  />
                ))}
              </div>
              
              <textarea 
                style={mobileTextarea} 
                placeholder="Share your experience (Optional)..." 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
              />
              
              <button style={mobileSubmitReviewBtn} onClick={handleReview}>
                <FaPaperPlane /> Submit Feedback
              </button>
            </div>
          </div>
        )}

      
        {/* LIVE TRACKING TIMELINE MODAL */}
        {showTrackingModal && trackingPickup && (
          <div style={modalOverlay} onClick={() => setShowTrackingModal(false)}>
            <div style={mobileModalCard} className="fade-up" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "900", color: "#0b8f3a", letterSpacing: "0.5px" }}>LIVE PICKUP TRACKER</span>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: "900", color: "var(--text-main, #0f172a)" }}>
                    PICKUP #${trackingPickup._id.slice(-6).toUpperCase()}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowTrackingModal(false)}
                  style={{ background: "var(--bg-subtle, #f1f5f9)", border: "none", width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", color: "var(--text-muted, #64748b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* TRACKING TIMELINE STEPS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 4px" }}>
                
                {/* Step 1: Requested */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0b8f3a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>✓</div>
                    <div style={{ width: "2px", height: "36px", background: ["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "#0b8f3a" : "#cbd5e1" }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Pickup Booking Confirmed</h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-muted, #64748b)" }}>
                      Requested on ${new Date(trackingPickup.createdAt).toLocaleDateString()} for ${trackingPickup.pickupDate ? new Date(trackingPickup.pickupDate).toLocaleDateString() : "Scheduled Slot"}
                    </p>
                  </div>
                </div>

                {/* Step 2: Collector Assigned */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ 
                      width: "24px", height: "24px", borderRadius: "50%", 
                      background: ["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "#0b8f3a" : "#e2e8f0", 
                      color: ["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "#fff" : "#94a3b8", 
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" 
                    }}>
                      {["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "✓" : "2"}
                    </div>
                    <div style={{ width: "2px", height: "36px", background: trackingPickup.status === "Completed" ? "#0b8f3a" : "#cbd5e1" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                      {["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "Collector Assigned" : "Assigning Scrap Collector..."}
                    </h4>
                    {["Accepted", "Assigned"].includes(trackingPickup.status) ? (
                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 10px", borderRadius: "10px", marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "800", color: "#166534" }}>${trackingPickup.collectorName || "ScrapVex Field Officer"}</div>
                          <div style={{ fontSize: "10px", color: "#15803d" }}>En-route for Rajouri doorstep pickup</div>
                        </div>
                        {trackingPickup.collectorMobile && (
                          <a href={`tel:${trackingPickup.collectorMobile}`} style={{ background: "#0b8f3a", color: "#fff", padding: "5px 9px", borderRadius: "6px", textDecoration: "none", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                            <FaPhoneAlt size={10} /> Call
                          </a>
                        )}
                      </div>
                    ) : (
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-muted, #64748b)" }}>
                        {trackingPickup.status === "Completed" ? "Collector completed pickup & weighing." : "Connecting nearest verified collector in your area..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3: Doorstep Weighing & Completed */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ 
                      width: "24px", height: "24px", borderRadius: "50%", 
                      background: trackingPickup.status === "Completed" ? "#0b8f3a" : "#e2e8f0", 
                      color: trackingPickup.status === "Completed" ? "#fff" : "#94a3b8", 
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" 
                    }}>
                      {trackingPickup.status === "Completed" ? "✓" : "3"}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                      {trackingPickup.status === "Completed" ? "Pickup Completed & Paid" : "Doorstep Weighing & Payout"}
                    </h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-muted, #64748b)" }}>
                      {trackingPickup.status === "Completed" ? `Paid ₹${trackingPickup.amount} via ${trackingPickup.paymentMethod || "Wallet/Cash"}` : `Est. Scrap Value: ₹${trackingPickup.amount}`}
                    </p>
                  </div>
                </div>

              </div>

              <button
                onClick={() => setShowTrackingModal(false)}
                style={{ width: "100%", padding: "11px", background: "#0b8f3a", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "13px", cursor: "pointer", marginTop: "10px" }}
              >
                Close Tracker
              </button>
            </div>
          </div>
        )}
</div>
    );
  }

  // ────────────────────────────────────────────────────────
  // DESKTOP LAYOUT (100% Unmodified Safety)
  // ────────────────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", color: "var(--text-main)" }}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <div className="container" style={{ padding: "40px 20px" }}>
        <div style={header}>
          <button style={{ ...backBtn, color: "var(--primary)" }} onClick={handleBack}><FaArrowLeft /> Back to Dashboard</button>
          <h1 style={{ margin: "10px 0", color: "var(--text-main)" }}>My Pickup History</h1>
        </div>

        {pickups.length === 0 ? (
          <div style={emptyState}>
            <FaTruck style={{ fontSize: "60px", color: "var(--text-muted)", marginBottom: "20px" }} />
            <h3 style={{ color: "var(--text-main)" }}>No Pickups Found</h3>
            <button style={{ ...bookBtn, background: "var(--primary)" }} onClick={() => navigate("/book")}>Book Your First Pickup</button>
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
                  <p style={{ ...detailText, color: "var(--text-muted)" }}><FaMapMarkerAlt /> {item.address}</p>

                  {/* 4-DIGIT COMPLETION SECURITY CODE */}
                  {["Pending", "Assigned", "Accepted", "On The Way"].includes(item.status) && (
                    <div style={{
                      background: "var(--primary-light, #f0fdf4)",
                      border: "1.5px dashed #0b8f3a",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      margin: "12px 0"
                    }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#166534", display: "block" }}>🔐 PICKUP COMPLETION OTP</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted, #64748b)" }}>Share with collector after scrap is weighed</span>
                      </div>
                      <div style={{
                        fontSize: "17px",
                        fontWeight: "900",
                        letterSpacing: "2px",
                        color: "#0b8f3a",
                        background: "var(--card-bg, #ffffff)",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        border: "1px solid #bbf7d0"
                      }}>
                        {item.verificationCode || item._id.slice(-4).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {item.status === "Completed" && (
                    <>
                      <div style={{ ...receipt, background: "var(--bg-main)", border: "1px solid var(--glass-border)" }}>
                        <p style={{ ...receiptTitle, color: "var(--primary)" }}>Transaction Summary</p>
                        {item.items?.map((it, idx) => (
                          <div key={idx} style={{ ...receiptRow, color: "var(--text-main)" }}><span>{it.name} ({it.quantity}{it.unit})</span><span>₹{it.subtotal}</span></div>
                        ))}
                        <div style={{ ...receiptTotal, borderTop: "1px solid var(--glass-border)", color: "var(--text-main)" }}><span>Final Amount Paid</span><span>₹{item.amount}</span></div>
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
          <div style={{ ...modal, background: "var(--card-bg)" }} className="premium-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "var(--text-main)" }}>Rate Collector</h3>
              <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-main)" }} onClick={() => setShowReviewModal(false)}><FaTimes /></button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
              {[1,2,3,4,5].map(s => <FaStar key={s} size={30} color={s <= rating ? "#f39c12" : "var(--glass-border)"} style={{ cursor: "pointer" }} onClick={() => setRating(s)} />)}
            </div>
            <textarea style={{ ...textarea, background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--glass-border)" }} placeholder="Write your feedback here..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button style={submitReviewBtn} onClick={handleReview}><FaPaperPlane /> Submit Review</button>
          </div>
        </div>
      )}

      {!isCollector && <Footer />}
    
        

        {/* LIVE TRACKING TIMELINE MODAL */}
        {showTrackingModal && trackingPickup && (
          <div style={modalOverlay} onClick={() => setShowTrackingModal(false)}>
            <div style={mobileModalCard} className="fade-up" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "900", color: "#0b8f3a", letterSpacing: "0.5px" }}>LIVE PICKUP TRACKER</span>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: "900", color: "var(--text-main, #0f172a)" }}>
                    PICKUP #${trackingPickup._id.slice(-6).toUpperCase()}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowTrackingModal(false)}
                  style={{ background: "var(--bg-subtle, #f1f5f9)", border: "none", width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", color: "var(--text-muted, #64748b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* TRACKING TIMELINE STEPS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 4px" }}>
                
                {/* Step 1: Requested */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0b8f3a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>✓</div>
                    <div style={{ width: "2px", height: "36px", background: ["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "#0b8f3a" : "#cbd5e1" }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>Pickup Booking Confirmed</h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-muted, #64748b)" }}>
                      Requested on ${new Date(trackingPickup.createdAt).toLocaleDateString()} for ${trackingPickup.pickupDate ? new Date(trackingPickup.pickupDate).toLocaleDateString() : "Scheduled Slot"}
                    </p>
                  </div>
                </div>

                {/* Step 2: Collector Assigned */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ 
                      width: "24px", height: "24px", borderRadius: "50%", 
                      background: ["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "#0b8f3a" : "#e2e8f0", 
                      color: ["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "#fff" : "#94a3b8", 
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" 
                    }}>
                      {["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "✓" : "2"}
                    </div>
                    <div style={{ width: "2px", height: "36px", background: trackingPickup.status === "Completed" ? "#0b8f3a" : "#cbd5e1" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                      {["Accepted", "Assigned", "Completed"].includes(trackingPickup.status) ? "Collector Assigned" : "Assigning Scrap Collector..."}
                    </h4>
                    {["Accepted", "Assigned"].includes(trackingPickup.status) ? (
                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 10px", borderRadius: "10px", marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "800", color: "#166534" }}>${trackingPickup.collectorName || "ScrapVex Field Officer"}</div>
                          <div style={{ fontSize: "10px", color: "#15803d" }}>En-route for Rajouri doorstep pickup</div>
                        </div>
                        {trackingPickup.collectorMobile && (
                          <a href={`tel:${trackingPickup.collectorMobile}`} style={{ background: "#0b8f3a", color: "#fff", padding: "5px 9px", borderRadius: "6px", textDecoration: "none", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                            <FaPhoneAlt size={10} /> Call
                          </a>
                        )}
                      </div>
                    ) : (
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-muted, #64748b)" }}>
                        {trackingPickup.status === "Completed" ? "Collector completed pickup & weighing." : "Connecting nearest verified collector in your area..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3: Doorstep Weighing & Completed */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ 
                      width: "24px", height: "24px", borderRadius: "50%", 
                      background: trackingPickup.status === "Completed" ? "#0b8f3a" : "#e2e8f0", 
                      color: trackingPickup.status === "Completed" ? "#fff" : "#94a3b8", 
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" 
                    }}>
                      {trackingPickup.status === "Completed" ? "✓" : "3"}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                      {trackingPickup.status === "Completed" ? "Pickup Completed & Paid" : "Doorstep Weighing & Payout"}
                    </h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-muted, #64748b)" }}>
                      {trackingPickup.status === "Completed" ? `Paid ₹${trackingPickup.amount} via ${trackingPickup.paymentMethod || "Wallet/Cash"}` : `Est. Scrap Value: ₹${trackingPickup.amount}`}
                    </p>
                  </div>
                </div>

              </div>

              <button
                onClick={() => setShowTrackingModal(false)}
                style={{ width: "100%", padding: "11px", background: "#0b8f3a", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "13px", cursor: "pointer", marginTop: "10px" }}
              >
                Close Tracker
              </button>
            </div>
          </div>
        )}
</div>
  );
}

/* DESKTOP STYLES */
const loaderStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" };
const header = { marginBottom: "30px" };
const backBtn = { background: "none", border: "none", color: "#0b8f3a", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const emptyState = { textAlign: "center", padding: "80px 20px", background: "var(--card-bg)", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const bookBtn = { background: "#0b8f3a", color: "#fff", border: "none", padding: "12px 30px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" };
const listGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" };
const card = { background: "var(--card-bg)", borderRadius: "24px", padding: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const cardTop = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const cardBody = { marginTop: "15px" };
const detailText = { color: "var(--text-muted)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", margin: "5px 0" };
const statusBadge = (status) => ({ padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", background: status === "Completed" ? "var(--primary-light)" : (status === "Pending" ? "rgba(243, 156, 18, 0.1)" : "rgba(79, 70, 229, 0.1)"), color: status === "Completed" ? "var(--primary)" : (status === "Pending" ? "#f39c12" : "#4f46e5") });
const cancelBtn = { marginTop: "20px", width: "100%", background: "#fff0f0", color: "#e74c3c", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };
const receipt = { marginTop: "15px", padding: "15px", background: "#fcfcfc", borderRadius: "16px", border: "1px solid #eee" };
const receiptTitle = { margin: "0 0 10px 0", fontSize: "13px", fontWeight: "bold", color: "#0b8f3a" };
const receiptRow = { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px", color: "var(--text-muted)" };
const receiptTotal = { borderTop: "1px solid #ddd", marginTop: "10px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "var(--text-main)", fontSize: "13px" };
const rateBtn = { background: "#fff9e6", color: "#f39c12", border: "1px solid #f39c12", padding: "8px", width: "100%", borderRadius: "10px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "15px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" };
const modal = { background: "var(--card-bg, #ffffff)", padding: "30px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60 rgba(0,0,0,0.2)" };
const textarea = { width: "100%", height: "100px", padding: "12px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "15px", outline: "none", resize: "none" };
const submitReviewBtn = { width: "100%", padding: "14px", background: "#0b8f3a", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };

/* ────────────────────────────────────────────────────────
   MOBILE INLINE STYLES
   ──────────────────────────────────────────────────────── */
const mobileCardStyle = {
  background: "var(--card-bg, #ffffff)",
  borderRadius: "16px",
  padding: "14px",
  border: "1px solid rgba(15,23,42,0.06)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.01)"
};

const mobileDetailRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12px",
  color: "var(--text-muted, #64748b)"
};

const mobileBookBtn = {
  background: "#0b8f3a",
  color: "#ffffff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "10px",
  fontSize: "12px",
  fontWeight: "800",
  cursor: "pointer"
};

const mobileDetailsBtn = {
  background: "none",
  border: "none",
  color: "#0b8f3a",
  fontWeight: "800",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  cursor: "pointer"
};

const mobileExpandedBlock = {
  animation: "fadeIn 0.2s ease-in-out"
};

const mobileCancelBtn = {
  marginTop: "12px",
  width: "100%",
  background: "#fef2f2",
  color: "#dc2626",
  border: "none",
  padding: "10px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "12px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px"
};

const mobileRateBtn = {
  background: "#fffbeb",
  color: "#d97706",
  border: "1px solid #fef3c7",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  fontSize: "12px",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px"
};

const mobileModalCard = {
  background: "var(--card-bg, #ffffff)",
  padding: "20px",
  borderRadius: "20px",
  width: "100%",
  maxWidth: "340px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
};

const mobileTextarea = {
  width: "100%",
  height: "70px",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  marginBottom: "12px",
  outline: "none",
  resize: "none",
  fontSize: "12px",
  color: "var(--text-main, #0f172a)"
};

const mobileSubmitReviewBtn = {
  width: "100%",
  padding: "10px",
  background: "#0b8f3a",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "12px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer"
};

export default MyPickups;