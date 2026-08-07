import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle, FaTruck, FaRecycle, FaRupeeSign, FaClipboardList,
  FaChartLine, FaSignOutAlt, FaArrowRight, FaClock, FaUser,
  FaTags, FaPhoneAlt, FaBell, FaTimes, FaStar, FaPaperPlane,
  FaHome, FaHistory, FaPlusCircle, FaWallet, FaMapMarkerAlt, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaMobileAlt, FaUniversity, FaExclamationTriangle, FaSpinner, FaPlus, FaCamera
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import API from "../services/api";
import PickupForm from "../components/PickupForm";
import { eraseCookie } from "../utils/cookies";

/* ==========================================================
   SUB-COMPONENTS (Defined first to avoid Hoisting errors)
   ========================================================== */

const StatTile = ({ icon, title, value, grad }) => (
  <div style={{ ...statTileStyle, background: grad }} className="stat-card">
    <div style={statIconBoxStyle}>{icon}</div>
    <div>
       <div style={statValueStyle}>{value}</div>
       <div style={statLabelStyle}>{title}</div>
    </div>
  </div>
);

const SideLink = ({ icon, text, onClick, active }) => (
  <div style={{ ...sideLinkStyle, background: active ? "var(--primary-light)" : "transparent", color: active ? "var(--primary)" : "var(--text-main)" }} onClick={onClick}>
     {icon} <span>{text}</span>
  </div>
);

const ActionTile = ({ icon, title, desc, color, onClick }) => (
  <div style={actionTileStyle} className="quick-action" onClick={onClick}>
     <div style={{ ...actionIconStyle, color }}>{icon}</div>
     <div style={actionTitleStyle}>{title}</div>
     <div style={actionDescStyle}>{desc}</div>
  </div>
);

const BottomLink = ({ icon, text, onClick, active }) => (
  <div style={{ ...bottomLinkStyle, color: active ? "#0b8f3a" : "#666" }} onClick={onClick}>
     {icon} <span style={{fontSize:"10px", marginTop:"2px"}}>{text}</span>
  </div>
);

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [pickups, setPickups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ upiId: "scrapvex@okaxis" });
  useEffect(() => {
    API.get("/settings").then(({ data }) => {
      if (data?.success) setSettings(data.data);
    });
  }, []);
  const [wallet, setWallet] = useState({ balance: 0, pending: 0 });
  const [transactions, setTransactions] = useState([]);
  const [walletTab, setWalletTab] = useState("history"); // history, recharge, withdraw
  const [depositForm, setDepositForm] = useState({ amount: "", upiRefNo: "" });
  const [showDepositQR, setShowDepositQR] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rechargeForm, setRechargeForm] = useState({ mobile: "", operator: "", amount: "" });
  const [withdrawForm, setWithdrawForm] = useState({ upi: "", name: "", amount: "" });
  const [withdrawOtpSent, setWithdrawOtpSent] = useState(false);
  const [withdrawOtp, setWithdrawOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [ratesData, setRatesData] = useState([]);
  const [ratesCities, setRatesCities] = useState([]);
  const [selectedRatesCity, setSelectedRatesCity] = useState("");
  const [loadingRates, setLoadingRates] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", address: "", area: "", oldPassword: "", newPassword: "", confirmPassword: "" });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const profileFileInputRef = useRef(null);
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [showPasswordOtpModal, setShowPasswordOtpModal] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [tickets, setTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ subject: "", message: "", category: "General" });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  const showToast = (type, message) => setToast({ show: true, type, message });

  useEffect(() => {
    fetchData();
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    setProfileForm({ name: stored.name || "", email: stored.email || "", address: stored.address || "", area: stored.area || stored.assignedCity || "", oldPassword: "", newPassword: "", confirmPassword: "" });
    if (stored.profilePhoto) {
      setProfilePhotoPreview(`${baseURL}${stored.profilePhoto}`);
    }

    // Poll for new data every 10 seconds to catch OTP/Status updates (Silent fetch)
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [resP, resN, resW] = await Promise.all([
        API.get("/pickups/my"),
        API.get("/notifications"),
        API.get("/wallet/info")
      ]);
      if (resP.data.success) setPickups(resP.data.pickups || []);
      if (resN.data.success) setNotifications(resN.data.data || []);
      if (resW.data.success) {
        setWallet({ balance: resW.data.balance, pending: resW.data.pendingBalance });
        setTransactions(resW.data.transactions || []);
      }
    } catch (e) {
      console.error("Dashboard Fetch Error:", e);
    } finally {
      if (!isSilent) setLoading(false);
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
        setShowReviewModal(false); setComment(""); setRating(5); fetchData();
      }
    } catch (e) { showToast("error", "Failed to submit review"); }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await API.get("/support-tickets");
      if (data.success) setTickets(data.tickets || []);
    } catch (e) { console.error("Ticket fetch error", e); }
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject || !newTicketForm.message) return showToast("error", "Subject aur message zaroori hai");
    setSubmittingTicket(true);
    try {
      const { data } = await API.post("/support-tickets", newTicketForm);
      if (data.success) {
        showToast("success", "Ticket submit ho gayi! Admin jaldi jawab dega. ✅");
        setShowTicketModal(false);
        setNewTicketForm({ subject: "", message: "", category: "General" });
        fetchTickets();
      }
    } catch (e) { showToast("error", e.response?.data?.message || "Ticket submit nahi ho saki"); }
    finally { setSubmittingTicket(false); }
  };

  const logout = () => {
    localStorage.clear();
    eraseCookie("token");
    eraseCookie("user");
    eraseCookie("role");
    showToast("success", "Logged Out Successfully");
    setTimeout(() => navigate("/login"), 700);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositForm.amount || depositForm.amount <= 0) return showToast("error", "Amount zaroori hai aur 0 se bada hona chahiye");
    if (!depositForm.upiRefNo || depositForm.upiRefNo.replace(/\D/g, "").length !== 12) {
      return showToast("error", "Kripya valid 12-digit UPI Ref No/UTR enter karein");
    }
    setSubmitting(true);
    try {
      const { data } = await API.post("/wallet/deposit", depositForm);
      if (data.success) {
        showToast("success", "Deposit request submit ho gayi! Admin verify karke credit kar dega. ✅");
        setDepositForm({ amount: "", upiRefNo: "" });
        setShowDepositQR(false);
        fetchData();
        setWalletTab("history");
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Deposit request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (wallet.balance < rechargeForm.amount) return showToast("error", "Insufficient balance");
    setSubmitting(true);
    try {
      const { data } = await API.post("/wallet/recharge", rechargeForm);
      if (data.success) {
        showToast("success", "Recharge successful! 🎉");
        setRechargeForm({ mobile: "", operator: "", amount: "" });
        fetchData();
        setWalletTab("history");
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Recharge failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWithdrawalOTP = async (e) => {
    e.preventDefault();
    if (wallet.balance < withdrawForm.amount) return showToast("error", "Insufficient balance");
    if (withdrawForm.amount < 100) return showToast("error", "Min withdrawal ₹100");
    setSubmitting(true);
    try {
      const { data } = await API.post("/wallet/withdraw/otp", {
        amount: Number(withdrawForm.amount),
        upiId: withdrawForm.upi,
        name: withdrawForm.name
      });
      if (data.success) {
        showToast("success", "Security OTP sent to your WhatsApp!");
        setWithdrawOtpSent(true);
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawOtp) return showToast("error", "Please enter the security OTP");
    setSubmitting(true);
    try {
      const { data } = await API.post("/wallet/withdraw", {
        amount: Number(withdrawForm.amount),
        upiId: withdrawForm.upi,
        name: withdrawForm.name,
        otp: withdrawOtp
      });
      if (data.success) {
        showToast("success", "Withdrawal request submitted successfully! 🏦");
        setWithdrawForm({ upi: "", name: "", amount: "" });
        setWithdrawOtpSent(false);
        setWithdrawOtp("");
        setDemoOtp("");
        fetchData();
        setWalletTab("history");
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelWithdrawal = async (txId) => {
    if (!window.confirm("Are you sure you want to cancel this pending withdrawal request? The funds will be refunded to your wallet immediately.")) {
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await API.post(`/wallet/withdraw/cancel/${txId}`);
      if (data.success) {
        showToast("success", "Withdrawal request cancelled successfully!");
        fetchData();
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to cancel withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelPickup = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this pickup?")) return;
    try {
      const { data } = await API.put(`/pickups/${id}/cancel`);
      if (data.success) {
        showToast("success", "Pickup cancelled successfully");
        fetchData();
      }
    } catch (error) { showToast("error", "Failed to cancel pickup"); }
  };

  const markAllNotificationsRead = async () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return;
    try {
      await API.put("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      // Silently fail - not critical
    }
  };

  const fetchRatesCities = async () => {
    try {
      const { data } = await API.get("/scrap-items/cities");
      if (data.success && data.cities.length > 0) {
        setRatesCities(data.cities);
        setSelectedRatesCity(data.cities[0]);
      }
    } catch (e) { console.error(e); }
  };

  const fetchRates = async (city) => {
    if (!city) return;
    try {
      setLoadingRates(true);
      const { data } = await API.get(`/scrap-items?city=${city}`);
      if (data.success) setRatesData(data.data || []);
    } catch (error) {
      console.error("Rates error:", error);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    if (activeTab === "rates" && ratesCities.length === 0) {
      fetchRatesCities();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedRatesCity) fetchRates(selectedRatesCity);
  }, [selectedRatesCity]);

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfileClick = () => {
    if (!profileForm.name.trim()) return showToast("error", "Name is required");
    if (profileForm.newPassword) {
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        return showToast("error", "New passwords do not match");
      }
      if (!profileForm.oldPassword) {
        return showToast("error", "Old password is required to set a new password");
      }
      setShowPasswordOtpModal(true);
    } else {
      executeSaveProfile();
    }
  };

  const verifyPasswordOtpAndSave = () => {
    if (passwordOtp !== "1234") {
      return showToast("error", "Invalid OTP. Use 1234.");
    }
    setShowPasswordOtpModal(false);
    setPasswordOtp("");
    executeSaveProfile();
  };

  const executeSaveProfile = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      formData.append("address", profileForm.address);
      formData.append("area", profileForm.area);
      if (profileForm.oldPassword) formData.append("oldPassword", profileForm.oldPassword);
      if (profileForm.newPassword) formData.append("newPassword", profileForm.newPassword);
      if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);

      const { data } = await API.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileForm(prev => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
        showToast("success", "Profile updated successfully! ✨");
        setEditMode(false);
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const completedPickups = pickups.filter(p => p.status === "Completed");
    const validPickups = pickups.filter(p => !["Cancelled", "Rejected"].includes(p.status));
    
    const totalKg = completedPickups.reduce((s, i) => s + (Number(i.weight) || 0), 0);
    const earnings = completedPickups.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const active = pickups.find(p => ["Pending", "Accepted", "Assigned", "On The Way"].includes(p.status));
    const otpPickup = pickups.find(p => p.status === "Accepted" && p.verificationCode);
    
    return { 
      totalKg, 
      earnings, 
      active, 
      otpPickup,
      total: validPickups.length 
    };
  }, [pickups]);


  if (loading) return <div style={loaderStyle}><div className="premium-spinner"></div></div>;

  return (
    <div style={pageContainerStyle}>
      <Navbar />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({...toast, show: false})} />

      <style>{`
        .quick-action { transition: 0.3s ease; cursor: pointer; }
        .quick-action:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
        .stat-card { transition: 0.3s ease; }
        .stat-card:hover { transform: scale(1.02); }
        .premium-spinner { width: 45px; height: 45px; border: 4px solid #f3f3f3; border-top: 4px solid #0b8f3a; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { 
          .desktop-only { display: none !important; }
          .main-content { padding: 20px 15px 100px 15px !important; }
          .layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={headerSectionStyle}>
         <div className="container">
            <div style={greetingBoxStyle}>
               <div>
                  <h1 style={greetingTextStyle}>Hello, {user.name?.split(" ")?.[0] || "User"}! </h1>
                  <p style={subGreetingStyle}>Ready to declutter your space today?</p>
               </div>
               <div style={headerIconsStyle}>
                  <div style={iconBtnStyle} onClick={() => { 
                      if (showNotif) markAllNotificationsRead();
                      setShowNotif(!showNotif); 
                   }}>
                     <FaBell />
                     {notifications.filter(n=>!n.isRead).length > 0 && <span style={badgeCountStyle}>{notifications.filter(n=>!n.isRead).length}</span>}
                  </div>
                  <div style={iconBtnStyle} onClick={() => setActiveTab("profile")}><FaUserCircle /></div>
               </div>
            </div>
         </div>
      </div>

      <div className="container" style={{ marginTop: "-40px" }}>
        <div style={layoutGridStyle} className="layout-grid">
          {/* DESKTOP SIDEBAR */}
          <div style={sidebarStyle} className="desktop-only">
             <div style={sidebarProfileStyle}>
                <div style={bigAvatarStyle}><FaUserCircle/></div>
                <h3 style={{margin:"10px 0 5px 0"}}>{user.name}</h3>
                <p style={{color:"#666", fontSize:"13px"}}>{user.mobile}</p>
             </div>
             <div style={sideNavStyle}>
                <SideLink active={activeTab === "home"} icon={<FaHome/>} text="Dashboard" onClick={() => setActiveTab("home")} />
                <SideLink active={activeTab === "book"} icon={<FaPlusCircle/>} text="Book Pickup" onClick={() => setActiveTab("book")} />
                <SideLink active={activeTab === "wallet"} icon={<FaWallet/>} text="Wallet" onClick={() => setActiveTab("wallet")} />
                <SideLink active={activeTab === "history"} icon={<FaHistory/>} text="My Pickups" onClick={() => setActiveTab("history")} />
                <SideLink active={activeTab === "rates"} icon={<FaTags/>} text="Rates" onClick={() => setActiveTab("rates")} />
                <SideLink active={activeTab === "support"} icon={<FaPhoneAlt/>} text="Support" onClick={() => { setActiveTab("support"); fetchTickets(); }} />
                <SideLink active={activeTab === "profile"} icon={<FaUser/>} text="Profile" onClick={() => setActiveTab("profile")} />
                <button style={logoutBtnStyle} onClick={logout}><FaSignOutAlt/> Logout</button>
             </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={mainContentStyle} className="main-content">
             {activeTab === "home" && (
               <>
                   {stats.otpPickup && (
                      <div className="fade-up premium-card" style={{background:"linear-gradient(135deg, #0b8f3a 0%, #111 100%)", color:"#fff", padding:"20px", borderRadius:"25px", border:"2px solid #fff", boxShadow:"0 10px 30px rgba(11,143,58,0.3)", textAlign:"center", marginBottom: "20px"}}>
                         <div style={{fontSize:"12px", opacity:0.8, marginBottom:"5px"}}>SECURITY OTP FOR PICKUP</div>
                         <div style={{fontSize:"32px", fontWeight:"900", letterSpacing:"10px", margin:"10px 0"}}>{stats.otpPickup.verificationCode}</div>
                         <div style={{fontSize:"14px", fontWeight:"600"}}>Total Amount: ₹{stats.otpPickup.amount}</div>
                         <p style={{fontSize:"11px", opacity:0.7, marginTop:"10px"}}>Share this code with the collector only after weighing is done.</p>
                      </div>
                   )}
                   {/* STATS */}
                   <div style={statGridStyle}>
                     <StatTile icon={<FaClipboardList/>} title="Total Bookings" value={stats.total} grad="linear-gradient(135deg, #0b8f3a 0%, #20b050 100%)" />
                     <StatTile icon={<FaWallet/>} title="Wallet Balance" value={`₹${wallet.balance}`} grad="linear-gradient(135deg, #3498db 0%, #2980b9 100%)" />
                     <StatTile icon={<FaRupeeSign/>} title="Total Earnings" value={`₹${stats.earnings}`} grad="linear-gradient(135deg, #f39c12 0%, #e67e22 100%)" />
                     {wallet.pending > 0 && (
                       <StatTile icon={<FaClock/>} title="Locked (Pending)" value={`₹${wallet.pending}`} grad="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" />
                     )}
                   </div>

                   {wallet.pending > 0 && (
                     <div className="fade-up" style={{ background: "rgba(243,156,18,0.1)", border: "1px solid rgba(243,156,18,0.3)", borderRadius: "15px", padding: "12px 18px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#e67e22", marginTop: "-10px", marginBottom: "20px" }}>
                       <FaClock /> ₹{wallet.pending} locked — will be added to your wallet after pickup completion
                     </div>
                   )}

                 <h3 style={sectionTitleStyle}>Recent Pickup Request</h3>
                 {pickups.length > 0 ? (
                    <div style={orderCardStyle} className="premium-card">
                       <div style={{display:"flex", justifyContent:"space-between", marginBottom:"15px"}}>
                          <div style={statusBadgeStyle(pickups[0].status)}>{pickups[0].status}</div>
                          <span style={orderDateStyle}>{new Date(pickups[0].createdAt).toLocaleDateString()}</span>
                       </div>
                       <h4 style={orderTitleStyle}>{pickups[0].scrapType}</h4>
                       <p style={orderAddrStyle}><FaMapMarkerAlt/> {pickups[0].address}</p>
                       
                       {pickups[0].status === "Completed" && (
                         <div style={completedSectionStyle}>
                            <div style={totalPaidStyle}>
                               <span>Paid to you:</span>
                               <strong>₹{pickups[0].amount}</strong>
                            </div>
                            {!pickups[0].isReviewed && (
                              <button style={reviewBtnStyle} onClick={() => { setSelectedPickup(pickups[0]); setShowReviewModal(true); }}>
                                 <FaStar/> Rate Service
                              </button>
                            )}
                         </div>
                       )}
                       {["Pending", "Accepted", "Assigned"].includes(pickups[0].status) && (
                         <div style={progressBoxStyle}>
                            <div style={progressBarStyle}>
                               <div style={{...progressFillStyle, width: pickups[0].status === "Pending" ? "30%" : (pickups[0].status === "Accepted" ? "60%" : "90%")}} />
                            </div>
                            <small style={mutedTextStyle}>Collector will reach you soon.</small>
                         </div>
                       )}
                    </div>
                 ) : (
                   <div style={emptyStateStyle} className="premium-card">
                      <FaTruck size={40} style={{opacity:0.2, marginBottom:"10px"}} />
                      <p>No pickup history yet. Start recycling!</p>
                      <button style={primaryBtnStyle} onClick={() => setActiveTab("book")}>Book First Pickup</button>
                   </div>
                 )}
               </>
             )}

             {activeTab === "wallet" && (
                <div className="fade-up" style={{maxWidth:"600px", margin:"0 auto", width:"100%"}}>
                   {/* WALLET CARD */}
                   <div style={{ background: "linear-gradient(135deg, #0b8f3a 0%, #15b34d 100%)", borderRadius: "24px", padding: "25px", color: "#fff", boxShadow: "0 10px 30px rgba(11,143,58,0.3)", marginBottom: "30px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                         <div>
                            <span style={{fontSize:"14px", opacity:0.8}}>Available Balance</span>
                            <h1 style={{fontSize:"36px", fontWeight:"800", margin:"10px 0"}}>₹{wallet.balance.toFixed(2)}</h1>
                         </div>
                         <div style={{background:"rgba(255,255,255,0.9)", width:"50px", height:"50px", borderRadius:"15px", display:"flex", alignItems:"center", justifyContent:"center"}}>
                            <FaWallet size={24} color="#0b8f3a" />
                         </div>
                      </div>
                      {wallet.pending > 0 && (
                         <div style={{background: "rgba(255,255,255,0.15)", padding: "8px 15px", borderRadius: "10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", marginTop: "15px"}}>
                            <FaClock size={12} />
                            <span>Pending: ₹{wallet.pending.toFixed(2)} (Locked until pickup)</span>
                         </div>
                      )}
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginTop:"25px"}}>
                         <button style={{border:"none", padding:"10px 5px", borderRadius:"12px", fontWeight:"bold", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", cursor:"pointer", background: walletTab==="deposit"?"#fff":"rgba(255,255,255,0.2)", color: walletTab==="deposit"?"#0b8f3a":"#fff"}} onClick={()=>setWalletTab("deposit")}><FaPlusCircle/> Add Money</button>
                         <button style={{border:"none", padding:"10px 5px", borderRadius:"12px", fontWeight:"bold", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", cursor:"pointer", background: walletTab==="recharge"?"#fff":"rgba(255,255,255,0.2)", color: walletTab==="recharge"?"#0b8f3a":"#fff"}} onClick={()=>setWalletTab("recharge")}><FaMobileAlt/> Recharge</button>
                         <button style={{border:"none", padding:"10px 5px", borderRadius:"12px", fontWeight:"bold", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", cursor:"pointer", background: walletTab==="withdraw"?"#fff":"rgba(255,255,255,0.2)", color: walletTab==="withdraw"?"#0b8f3a":"#fff"}} onClick={()=>setWalletTab("withdraw")}><FaUniversity/> Withdraw</button>
                      </div>
                   </div>

                   {/* CONTENT */}
                   <div style={{background: "var(--card-bg)", borderRadius: "24px", padding: "25px", border: "1px solid var(--glass-border)"}} className="premium-card">
                      <div style={{display:"flex", gap:"20px", borderBottom:"1px solid var(--glass-border)", marginBottom:"20px"}}>
                         <h3 onClick={()=>setWalletTab("history")} style={{paddingBottom:"10px", fontSize:"16px", cursor:"pointer", color: walletTab==="history"?"var(--primary)":"var(--text-muted)", borderBottom: walletTab==="history"?"3px solid var(--primary)":"none"}}>
                            <FaHistory/> Transactions
                         </h3>
                      </div>

                      {walletTab === "history" && (
                         <div className="fade-up">
                            {transactions.length === 0 ? (
                               <div style={{textAlign:"center", padding:"40px", color:"#999"}}>No transactions yet</div>
                            ) : (
                               transactions.map(tx => (
                                  <div key={tx._id} style={{display:"flex", alignItems:"center", gap:"15px", padding:"15px 0", borderBottom:"1px solid var(--glass-border)"}}>
                                     <div style={{width:"40px", height:"40px", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", background: tx.type==="credit"?"var(--primary-light)":"rgba(231, 76, 60, 0.1)"}}>
                                        {tx.type === "credit" ? <FaArrowUp color="#0b8f3a" /> : <FaArrowDown color="#e74c3c" />}
                                     </div>
                                     <div style={{flex:1}}>
                                        <div style={{fontWeight:"bold", fontSize:"14px", color:"var(--text-main)"}}>{tx.description}</div>
                                        <div style={{fontSize:"11px", color:"var(--text-muted)"}}>{new Date(tx.createdAt).toLocaleString()}</div>
                                     </div>
                                     <div style={{textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px"}}>
                                        <div style={{fontWeight:"bold", color: tx.type==="credit"?"var(--primary)":"#e74c3c"}}>
                                           {tx.type==="credit"?"+":"-"}₹{tx.amount}
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                          {tx.type === "debit" && tx.source === "withdrawal" && tx.status === "pending" && (
                                            <button 
                                              type="button"
                                              style={{ 
                                                background: "rgba(231, 76, 60, 0.1)", 
                                                color: "#e74c3c", 
                                                border: "none", 
                                                borderRadius: "6px", 
                                                padding: "2px 8px", 
                                                fontSize: "10px", 
                                                fontWeight: "bold", 
                                                cursor: "pointer",
                                                transition: "0.2s"
                                              }}
                                              onClick={() => handleCancelWithdrawal(tx._id)}
                                            >
                                              Cancel & Refund
                                            </button>
                                          )}
                                          <div style={{fontSize:"10px", fontWeight:"bold", color: tx.status==="completed"?"var(--primary)":tx.status==="pending"?"#f39c12":"#e74c3c"}}>
                                             {tx.status}
                                          </div>
                                        </div>
                                     </div>
                                  </div>
                               ))
                            )}
                         </div>
                      )}

                      {walletTab === "deposit" && (
                          <div className="fade-up" style={{display:"flex", flexDirection:"column", gap:"15px"}}>
                             {!showDepositQR ? (
                               <form onSubmit={(e) => { e.preventDefault(); if (depositForm.amount > 0) setShowDepositQR(true); else alert("Kripya valid amount enter karein"); }} style={{display:"flex", flexDirection:"column", gap:"15px"}}>
                                  <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                                     <span style={{color:"var(--primary)", fontWeight:"bold", fontSize: "16px"}}>₹</span>
                                     <input 
                                       type="number" 
                                       placeholder="Enter Amount to Add (₹)" 
                                       required 
                                       value={depositForm.amount} 
                                       onChange={e=>setDepositForm({...depositForm, amount: e.target.value})} 
                                       style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)", fontSize: "16px", fontWeight: "bold"}} 
                                     />
                                  </div>
                                  <button type="submit" className="btn-premium" style={{width:"100%"}}>
                                     Generate UPI QR Code
                                  </button>
                               </form>
                             ) : (
                               <form onSubmit={handleDepositSubmit} style={{display:"flex", flexDirection:"column", gap:"15px", alignItems: "center"}}>
                                  <div style={{textAlign: "center", padding: "10px 0"}}>
                                     <div style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "5px"}}>SCAN QR TO PAY ₹{depositForm.amount}</div>
                                     <div style={{background: "#fff", padding: "15px", borderRadius: "16px", display: "inline-block", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "2px solid var(--primary)"}}>
                                        <img 
                                           src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId || "scrapvex@okaxis"}&pn=Scrapvex&am=${depositForm.amount}&tn=WalletDeposit`)}`} 
                                           alt="UPI QR Code" 
                                           style={{width: "160px", height: "160px", display: "block", margin: "0 auto"}}
                                        />
                                     </div>
                                     <div style={{marginTop: "8px", fontWeight: "bold", color: "var(--primary)", fontSize: "14px"}}>UPI ID: {settings.upiId || "scrapvex@okaxis"}</div>
                                  </div>

                                  {/* Mobile Deep Link */}
                                  <a 
                                     href={`upi://pay?pa=${settings.upiId || "scrapvex@okaxis"}&pn=Scrapvex&am=${depositForm.amount}&tn=WalletDeposit`} 
                                     className="btn-premium" 
                                     style={{width:"100%", textDecoration: "none", textAlign: "center"}}
                                  >
                                     📲 Pay via UPI App (PhonePe/GPay)
                                  </a>

                                  <div style={{ background: "rgba(11, 143, 58, 0.05)", borderLeft: "3px solid var(--primary)", padding: "12px", borderRadius: "12px", fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", width: "100%" }}>
                                     <strong>Step 2:</strong> Payment complete karne ke baad aapko jo <strong>12-digit UTR / UPI Ref No</strong> milega, use niche enter karke request submit karein.
                                  </div>

                                  <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)", width: "100%"}}>
                                     <span style={{color:"var(--primary)", fontWeight:"bold"}}>🔗</span>
                                     <input 
                                       type="text" 
                                       maxLength={12} 
                                       placeholder="Enter 12-Digit UPI Ref No / UTR" 
                                       required 
                                       value={depositForm.upiRefNo} 
                                       onChange={e=>setDepositForm({...depositForm, upiRefNo: e.target.value.replace(/\D/g,"")})} 
                                       style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)", fontWeight: "bold", letterSpacing: "2px", textAlign: "center"}} 
                                     />
                                  </div>

                                  <button type="submit" className="btn-premium" disabled={submitting} style={{width:"100%"}}>
                                     {submitting ? <FaSpinner className="spin" /> : "Submit Deposit Request"}
                                  </button>

                                  <button 
                                    type="button"
                                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", marginTop: "5px", width: "100%", textAlign: "center" }} 
                                    onClick={() => setShowDepositQR(false)}
                                  >
                                    ← Change Amount
                                  </button>
                               </form>
                             )}
                          </div>
                       )}

                       {walletTab === "recharge" && (
                         <form onSubmit={handleRecharge} className="fade-up" style={{display:"flex", flexDirection:"column", gap:"15px"}}>
                            <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                               <FaMobileAlt color="var(--primary)" />
                               <input type="text" placeholder="Mobile Number" required value={rechargeForm.mobile} onChange={e=>setRechargeForm({...rechargeForm, mobile: e.target.value.replace(/\D/g,"").slice(0,10)})} style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)"}} />
                            </div>
                            <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                               <FaUniversity color="var(--primary)" />
                               <select required value={rechargeForm.operator} onChange={e=>setRechargeForm({...rechargeForm, operator: e.target.value})} style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)"}}>
                                  <option value="">Select Operator</option>
                                  <option value="Jio">Jio</option>
                                  <option value="Airtel">Airtel</option>
                                  <option value="Vi">Vi</option>
                                  <option value="BSNL">BSNL</option>
                               </select>
                            </div>
                            <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                               <span style={{color:"var(--primary)", fontWeight:"bold"}}>₹</span>
                               <input type="number" placeholder="Amount" required value={rechargeForm.amount} onChange={e=>setRechargeForm({...rechargeForm, amount: e.target.value})} style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)"}} />
                            </div>
                            <button type="submit" className="btn-premium" disabled={submitting} style={{width:"100%"}}>
                               {submitting ? <FaSpinner className="spin" /> : "Recharge Now"}
                            </button>
                         </form>
                      )}

                      {walletTab === "withdraw" && (
                         <form onSubmit={withdrawOtpSent ? handleWithdraw : handleSendWithdrawalOTP} className="fade-up" style={{display:"flex", flexDirection:"column", gap:"15px"}}>
                            {!withdrawOtpSent ? (
                              <>
                                <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                                   <FaUniversity color="var(--primary)" />
                                   <input type="text" placeholder="UPI ID (e.g. user@okaxis)" required value={withdrawForm.upi} onChange={e=>setWithdrawForm({...withdrawForm, upi: e.target.value})} style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)"}} />
                                </div>
                                <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                                   <FaUser color="var(--primary)" />
                                   <input type="text" placeholder="Account Holder Name" required value={withdrawForm.name} onChange={e=>setWithdrawForm({...withdrawForm, name: e.target.value})} style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)"}} />
                                </div>
                                <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                                   <span style={{color:"var(--primary)", fontWeight:"bold"}}>₹</span>
                                   <input type="number" placeholder="Amount (Min ₹100)" required value={withdrawForm.amount} onChange={e=>setWithdrawForm({...withdrawForm, amount: e.target.value})} style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)"}} />
                                </div>

                                <div style={{ background: "rgba(11, 143, 58, 0.05)", borderLeft: "3px solid var(--primary)", padding: "12px", borderRadius: "12px", fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                                  <strong>🔒 Withdrawal Protection:</strong> A verification OTP will be sent to your registered mobile to ensure only you can withdraw funds.
                                </div>

                                <button type="submit" className="btn-premium" disabled={submitting} style={{width:"100%"}}>
                                   {submitting ? <FaSpinner className="spin" /> : "Verify & Send Security OTP"}
                                </button>
                              </>
                            ) : (
                              <>
                                <div style={{ background: "var(--bg-main)", padding: "15px", borderRadius: "12px", border: "1px solid var(--glass-border)", fontSize: "13px" }}>
                                  <div style={{ marginBottom: "5px", color: "var(--text-muted)" }}>Confirming UPI Transfer:</div>
                                  <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--primary)", marginBottom: "5px" }}>₹{withdrawForm.amount}</div>
                                  <div style={{ color: "var(--text-main)" }}><strong>UPI ID:</strong> {withdrawForm.upi}</div>
                                  <div style={{ color: "var(--text-main)", marginTop: "3px" }}><strong>Holder:</strong> {withdrawForm.name}</div>
                                </div>

                                <div style={{display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--primary)"}}>
                                  <span style={{color:"var(--primary)", fontWeight:"bold"}}>🔑</span>
                                  <input 
                                    type="text" 
                                    maxLength={4}
                                    placeholder="Enter 4-Digit OTP" 
                                    required 
                                    value={withdrawOtp} 
                                    onChange={e=>setWithdrawOtp(e.target.value.replace(/\D/g,""))} 
                                    style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)", fontWeight: "bold", textAlign: "center", letterSpacing: "4px"}} 
                                  />
                                </div>

                                <button type="submit" className="btn-premium" disabled={submitting} style={{width:"100%"}}>
                                  {submitting ? <FaSpinner className="spin" /> : "Confirm & Withdraw Funds"}
                                </button>

                                <button 
                                  type="button"
                                  style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", marginTop: "5px", width: "100%", textAlign: "center" }} 
                                  onClick={() => { setWithdrawOtpSent(false); setWithdrawOtp(""); }}
                                >
                                  ← Edit Transfer Details
                                </button>
                              </>
                            )}
                         </form>
                      )}
                   </div>
                </div>
             )}

             {activeTab === "book" && (
                <div className="fade-up">
                   <div style={{...orderCardStyle, padding:0, overflow:"hidden"}} className="premium-card">
                      <div style={{background:"var(--primary)", color:"#fff", padding:"30px 20px", textAlign:"center"}}>
                         <h2 style={{margin:0}}>Book a Pickup</h2>
                         <p style={{margin:"5px 0 0 0", opacity:0.8, fontSize:"14px"}}>Fill the form below to schedule</p>
                      </div>
                      <div style={{padding:"20px"}}>
                         <PickupForm />
                      </div>
                   </div>
                </div>
             )}

             {activeTab === "rates" && (
                <div className="fade-up" style={{paddingTop: "40px"}}>
                   <h3 style={{...sectionTitleStyle, marginBottom:"25px", textAlign:"center"}}>Current Scrap Rates</h3>
                   
                   <div style={{marginBottom:"20px", display:"flex", flexDirection:"column", gap:"8px"}}>
                      <label style={{fontSize:"13px", fontWeight:"bold", color:"var(--primary)"}}><FaMapMarkerAlt/> Select City</label>
                      <div style={{background:"var(--bg-main)", padding:"12px 15px", borderRadius:"12px", border:"1px solid var(--glass-border)", display:"flex", alignItems:"center"}}>
                         <select 
                           style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)", fontSize:"15px", fontWeight:"bold"}} 
                           value={selectedRatesCity} 
                           onChange={e => setSelectedRatesCity(e.target.value)}
                         >
                            {ratesCities.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                         </select>
                      </div>
                   </div>

                   {loadingRates ? (
                      <div style={{textAlign:"center", padding:"40px"}}><FaSpinner className="spin" size={30} color="var(--primary)" /></div>
                   ) : (
                      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:"15px"}}>
                         {ratesData.map(item => (
                            <div key={item._id} style={{background:"var(--card-bg)", padding:"15px", borderRadius:"20px", border:"1px solid var(--glass-border)", textAlign:"center"}} className="premium-card">
                               <div style={{fontSize:"24px", color:"var(--primary)", marginBottom:"10px"}}><FaRecycle /></div>
                               <div style={{fontWeight:"bold", fontSize:"14px", color:"var(--text-main)", marginBottom:"4px"}}>{item.name}</div>
                               <div style={{fontSize:"13px", color:"var(--primary)", fontWeight:"800"}}>₹{item.price}/{item.unit}</div>
                            </div>
                         ))}
                      </div>
                   )}
                   {ratesData.length === 0 && !loadingRates && (
                      <div style={{textAlign:"center", padding:"40px", color:"#999"}}>No rates available for this city yet.</div>
                   )}
                </div>
             )}

             {activeTab === "history" && (
                <div className="fade-up" style={{paddingTop: "40px"}}>
                   <h3 style={{...sectionTitleStyle, marginBottom:"25px", textAlign:"center"}}>Your Pickup History</h3>
                   <div style={{display:"flex", flexDirection:"column", gap:"15px"}}>
                      {pickups.length === 0 ? (
                         <div style={emptyStateStyle} className="premium-card">
                            <p>No history found.</p>
                         </div>
                      ) : (
                         pickups.map(p => (
                            <div key={p._id} style={{...orderCardStyle, padding:"20px"}} className="premium-card">
                               <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                                  <div style={statusBadgeStyle(p.status)}>{p.status}</div>
                                  <span style={orderDateStyle}>{new Date(p.createdAt).toLocaleDateString()}</span>
                               </div>
                               <h4 style={{margin:"5px 0", color:"var(--text-main)"}}>{p.scrapType}</h4>
                               <div style={orderAddrStyle}><FaMapMarkerAlt/> {p.address}</div>
                               {p.status === "Completed" && (
                                  <div style={{marginTop:"15px", textAlign:"right", color:"var(--primary)", fontWeight:"bold", fontSize:"16px"}}>₹{p.amount}</div>
                               )}
                               {p.status === "Pending" && (
                                  <button style={{marginTop:"15px", width:"100%", background:"#fff0f0", color:"#e74c3c", border:"none", padding:"10px", borderRadius:"12px", fontWeight:"bold", cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center", gap:"10px"}} onClick={() => cancelPickup(p._id)}>
                                     <FaTimes /> Cancel Booking
                                  </button>
                               )}
                            </div>
                         ))
                      )}
                   </div>
                </div>
             )}

             {activeTab === "profile" && (
                <div className="fade-up" style={{paddingTop: "20px"}}>
                   <div style={{background:"var(--card-bg)", padding:"30px", borderRadius:"30px", border:"1px solid var(--glass-border)"}} className="premium-card">
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", justifyContent: "center", flexDirection: "column" }}>
                        <div style={{ position: "relative" }}>
                          {profilePhotoPreview ? (
                            <img src={profilePhotoPreview} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary)" }} />
                          ) : (
                            <FaUserCircle size={100} color="var(--primary)" />
                          )}
                          {editMode && (
                            <div 
                              style={{ position: "absolute", bottom: "5px", right: "5px", width: "30px", height: "30px", background: "var(--primary)", color: "#fff", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid var(--card-bg)", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
                              onClick={() => profileFileInputRef.current.click()}
                            >
                              <FaCamera size={14} />
                            </div>
                          )}
                          <input type="file" ref={profileFileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfilePhotoChange} />
                        </div>
                        <div style={{textAlign: "center"}}>
                          <h2 style={{ margin: "5px 0", color: "var(--text-main)" }}>{user?.name}</h2>
                          <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", display: "inline-block", textTransform: "capitalize" }}>{user?.role || "User"}</div>
                        </div>
                      </div>

                      {editMode ? (
                         <div style={{display:"flex", flexDirection:"column", gap:"15px", marginBottom: "25px"}}>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>Name</label>
                               <input type="text" name="name" value={profileForm.name} onChange={handleProfileFormChange} style={{...activeInputStyle, background:"var(--bg-main)"}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>Mobile Number</label>
                               <input type="text" value={user?.mobile || ""} disabled style={{...disabledInputStyle, background:"var(--bg-main)", opacity: 0.7}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>Email</label>
                               <input type="email" name="email" value={profileForm.email} onChange={handleProfileFormChange} style={{...activeInputStyle, background:"var(--bg-main)"}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>Address</label>
                               <input type="text" name="address" value={profileForm.address} onChange={handleProfileFormChange} style={{...activeInputStyle, background:"var(--bg-main)"}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>Area (City)</label>
                               <input type="text" name="area" value={profileForm.area} onChange={handleProfileFormChange} style={{...activeInputStyle, background:"var(--bg-main)"}} />
                            </div>

                            <h4 style={{ margin: "10px 0 0 0", color: "var(--text-main)" }}>Change Password</h4>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>Old Password</label>
                               <input type="password" name="oldPassword" value={profileForm.oldPassword} onChange={handleProfileFormChange} autoComplete="new-password" style={{...activeInputStyle, background:"var(--bg-main)"}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>New Password</label>
                               <input type="password" name="newPassword" value={profileForm.newPassword} onChange={handleProfileFormChange} autoComplete="new-password" style={{...activeInputStyle, background:"var(--bg-main)"}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                               <label style={{fontSize:"12px", fontWeight:"bold", color:"var(--text-main)"}}>Confirm New Password</label>
                               <input type="password" name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileFormChange} autoComplete="new-password" style={{...activeInputStyle, background:"var(--bg-main)"}} />
                            </div>
                         </div>
                      ) : (
                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                            <ProfileField label="Mobile" value={user?.mobile || "-"} />
                            <ProfileField label="Email" value={user?.email || "-"} />
                            <ProfileField label="Address" value={user?.address || "-"} />
                            <ProfileField label="Area" value={user?.area || user?.assignedCity || "-"} />
                            <ProfileField label="Wallet" value={`₹${wallet.balance || 0}`} />
                         </div>
                      )}

                      <div style={{marginTop:"30px", display:"flex", gap:"10px"}}>
                         {!editMode ? (
                            <button className="btn-premium" style={{flex:1}} onClick={() => setEditMode(true)}>Edit Profile</button>
                         ) : (
                            <>
                               <button className="btn-premium" style={{flex:2}} onClick={handleSaveProfileClick} disabled={submitting}>
                                  {submitting ? <FaSpinner className="spin" /> : "Save Changes"}
                               </button>
                               <button style={{flex:1, background:"var(--bg-main)", border:"1px solid var(--glass-border)", borderRadius:"15px", color:"var(--text-muted)", fontWeight:"bold"}} onClick={() => { setEditMode(false); setProfileForm({ name: user?.name, email: user?.email, address: user?.address, area: user?.area || user?.assignedCity, oldPassword: "", newPassword: "", confirmPassword: "" }); }}>Cancel</button>
                            </>
                         )}
                      </div>
                      
                      {!editMode && (
                         <button style={{width:"100%", marginTop:"15px", background:"rgba(220, 53, 69, 0.12)", color:"#dc3545", border:"none", padding:"15px", borderRadius:"15px", fontWeight:"bold", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px"}} onClick={logout}>
                            <FaSignOutAlt /> Logout
                         </button>
                      )}
                   </div>
                </div>
              )}

              {activeTab === "support" && (
                <div className="fade-up" style={{ paddingTop: "40px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                    <h3 style={sectionTitleStyle}>My Support Tickets</h3>
                    <button className="btn-premium" style={{ padding: "10px 18px", fontSize: "13px" }} onClick={() => setShowTicketModal(true)}>
                      + Raise Ticket
                    </button>
                  </div>
                  {tickets.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px 20px", color: "#999" }}>
                      <FaPhoneAlt size={40} style={{ opacity: 0.15, marginBottom: "15px" }} />
                      <p>No tickets yet. Need help? Raise a support ticket!</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {tickets.map(t => (
                        <div key={t._id} style={{ ...orderCardStyle, padding: "20px" }} className="premium-card">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div>
                              <div style={{ fontWeight: "bold", fontSize: "15px", color: "var(--text-main)" }}>{t.subject}</div>
                              <div style={{ fontSize: "11px", color: "#999", marginTop: "3px" }}>{t.category} • {new Date(t.createdAt).toLocaleDateString()}</div>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", background: t.status === "open" ? "#e8f5e9" : t.status === "resolved" ? "#e3f2fd" : "#fff3e0", color: t.status === "open" ? "#2e7d32" : t.status === "resolved" ? "#1565c0" : "#e65100" }}>{t.status}</span>
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 10px 0" }}>{t.message}</p>
                          {t.replies?.length > 0 && (
                            <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "12px", borderLeft: "3px solid var(--primary)" }}>
                              <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--primary)", marginBottom: "5px" }}>Admin Reply:</div>
                              <div style={{ fontSize: "13px", color: "var(--text-main)" }}>{t.replies[t.replies.length - 1].message}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* RAISE TICKET MODAL */}
      {showTicketModal && (
        <div style={modalOverlayStyle} onClick={() => setShowTicketModal(false)}>
          <div style={{ ...centerModalStyle, maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0 }}>Raise Support Ticket</h3>
              <button style={closeBtnStyle} onClick={() => setShowTicketModal(false)}><FaTimes /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px", display: "block" }}>Category</label>
                <select style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none" }} value={newTicketForm.category} onChange={e => setNewTicketForm({ ...newTicketForm, category: e.target.value })}>
                  <option value="General">General</option>
                  <option value="Payment">Payment Issue</option>
                  <option value="Pickup">Pickup Problem</option>
                  <option value="Technical">Technical Bug</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px", display: "block" }}>Subject</label>
                <input style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box" }} placeholder="Short subject..." value={newTicketForm.subject} onChange={e => setNewTicketForm({ ...newTicketForm, subject: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px", display: "block" }}>Describe your problem</label>
                <textarea style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box", height: "100px", resize: "vertical" }} placeholder="Explain your issue clearly..." value={newTicketForm.message} onChange={e => setNewTicketForm({ ...newTicketForm, message: e.target.value })} />
              </div>
              <button className="btn-premium" style={{ width: "100%" }} onClick={handleCreateTicket} disabled={submittingTicket}>
                {submittingTicket ? <FaSpinner className="spin" /> : "Submit Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {showNotif && (
        <div style={modalOverlayStyle} onClick={() => { markAllNotificationsRead(); setShowNotif(false); }}>
           <div style={centerModalStyle} onClick={e => e.stopPropagation()}>
              <div style={modalHeaderStyle}>
                 <h3 style={{margin:0}}>New Alerts</h3>
                 <button style={closeBtnStyle} onClick={() => { markAllNotificationsRead(); setShowNotif(false); }}><FaTimes/></button>
              </div>
              <div style={{...notifListStyle, maxHeight:"400px"}}>
                 {notifications.filter(n => !n.isRead).map(n => (
                    <div key={n._id} style={notifRowStyle}>
                       <div style={{fontWeight:"bold", fontSize:"14px", color:"var(--text-main)"}}>{n.title}</div>
                       <p style={{margin:"5px 0", fontSize:"13px", color:"var(--text-muted)"}}>{n.message}</p>
                       <small style={mutedTextStyle}>{new Date(n.createdAt).toLocaleDateString()}</small>
                    </div>
                 ))}
                 {notifications.filter(n => !n.isRead).length === 0 && <p style={{textAlign:"center", padding:"40px", color:"#999"}}>No new alerts</p>}
              </div>
           </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div style={modalOverlayStyle}>
          <div style={centerModalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>How was it?</h3>
              <button style={closeBtnStyle} onClick={() => setShowReviewModal(false)}><FaTimes /></button>
            </div>
            <div style={starBoxStyle}>
              {[1,2,3,4,5].map(s => (
                <FaStar key={s} size={35} color={s <= rating ? "#f39c12" : "#eee"} style={{ cursor: "pointer" }} onClick={() => setRating(s)} />
              ))}
            </div>
            <textarea style={textareaStyle} placeholder="Anything else you'd like to share?" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button style={submitBtnStyle} onClick={handleReview}><FaPaperPlane /> Submit Feedback</button>
          </div>
        </div>
      )}

      {/* PASSWORD OTP MODAL */}
      {showPasswordOtpModal && (
        <div style={modalOverlayStyle}>
          <div style={centerModalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Security Verification</h3>
              <button style={closeBtnStyle} onClick={() => setShowPasswordOtpModal(false)}><FaTimes /></button>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
              We've sent a simulated OTP to your mobile number to verify this password change. (Hint: Use 1234)
            </p>
            <input 
              type="text" 
              placeholder="Enter OTP (1234)" 
              value={passwordOtp} 
              onChange={e => setPasswordOtp(e.target.value)} 
              style={{ ...activeInputStyle, background: "var(--bg-main)", marginBottom: "20px", textAlign: "center", letterSpacing: "5px", fontSize: "18px" }} 
            />
            <button style={submitBtnStyle} onClick={verifyPasswordOtpAndSave}>
              Verify & Save Profile
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION (MOBILE) */}
      <div style={bottomNavStyle} className="mobile-only">
         <BottomLink active={activeTab === "home"} icon={<FaHome/>} text="Home" onClick={() => setActiveTab("home")} />
         <BottomLink active={activeTab === "book"} icon={<FaPlusCircle/>} text="Book" onClick={() => setActiveTab("book")} />
         <BottomLink active={activeTab === "wallet"} icon={<FaWallet/>} text="Wallet" onClick={() => setActiveTab("wallet")} />
         <BottomLink active={activeTab === "history"} icon={<FaHistory/>} text="History" onClick={() => setActiveTab("history")} />
         <BottomLink active={activeTab === "support"} icon={<FaPhoneAlt/>} text="Support" onClick={() => { setActiveTab("support"); fetchTickets(); }} />
         <BottomLink active={activeTab === "profile"} icon={<FaUser/>} text="Profile" onClick={() => setActiveTab("profile")} />
      </div>

      {activeTab === "home" && <Footer />}
    </div>
  );
}

/* ==========================================================
   STYLES (Defined as constants to avoid ReferenceErrors)
   ========================================================== */

const pageContainerStyle = { background: "var(--bg-main)", minHeight: "100vh" };
const loaderStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" };
const headerSectionStyle = { background: "#0b8f3a", padding: "40px 0 80px 0", color: "#fff" };
const greetingBoxStyle = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const greetingTextStyle = { margin: 0, fontSize: "28px", fontWeight: "800" };
const subGreetingStyle = { margin: "5px 0 0 0", opacity: 0.8, fontSize: "14px" };
const headerIconsStyle = { display: "flex", gap: "15px" };
const iconBtnStyle = { width: "45px", height: "45px", borderRadius: "15px", background: "rgba(255,255,255,0.15)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", fontSize: "18px", position: "relative" };
const badgeCountStyle = { position: "absolute", top: "8px", right: "8px", background: "#e74c3c", color: "#fff", fontSize: "10px", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" };

const layoutGridStyle = { display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px", marginBottom: "50px" };
const sidebarStyle = { background: "var(--card-bg)", padding: "30px", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", height: "fit-content" };
const sidebarProfileStyle = { textAlign: "center", marginBottom: "30px" };
const bigAvatarStyle = { fontSize: "80px", color: "#0b8f3a" };
const sideNavStyle = { display: "flex", flexDirection: "column", gap: "5px" };
const sideLinkStyle = { display: "flex", alignItems: "center", gap: "15px", padding: "14px 20px", borderRadius: "15px", cursor: "pointer", fontWeight: "600", transition: "0.3s" };
const logoutBtnStyle = { width: "100%", display: "flex", alignItems: "center", gap: "15px", padding: "14px 20px", borderRadius: "15px", cursor: "pointer", fontWeight: "600", marginTop: "20px", color: "#e74c3c", border: "none", background: "transparent" };

const mainContentStyle = { display: "flex", flexDirection: "column", gap: "25px" };
const statGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" };
const statTileStyle = { padding: "20px", borderRadius: "25px", display: "flex", alignItems: "center", gap: "15px", color: "#fff", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" };
const statIconBoxStyle = { width: "45px", height: "45px", borderRadius: "15px", background: "rgba(255,255,255,0.2)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const statValueStyle = { fontSize: "22px", fontWeight: "bold" };
const statLabelStyle = { fontSize: "11px", opacity: 0.8 };

const sectionHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" };
const sectionTitleStyle = { margin: 0, fontSize: "18px", fontWeight: "bold", color: "var(--text-main)" };
const textBtnStyle = { background: "none", border: "none", color: "#0b8f3a", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" };

const actionGridStyle = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" };
const actionTileStyle = { background: "var(--card-bg)", padding: "20px 10px", borderRadius: "25px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" };
const actionIconStyle = { fontSize: "30px", marginBottom: "12px" };
const actionTitleStyle = { fontWeight: "bold", fontSize: "14px", color: "var(--text-main)" };
const actionDescStyle = { fontSize: "11px", color: "#999", marginTop: "4px" };

const orderCardStyle = { background: "var(--card-bg)", padding: "25px", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" };
const orderHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" };
const orderDateStyle = { fontSize: "12px", color: "#999" };
const orderTitleStyle = { margin: "0 0 8px 0", fontSize: "18px", fontWeight: "bold", color: "var(--text-main)" };
const orderAddrStyle = { fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "8px" };
const completedSectionStyle = { marginTop: "20px", padding: "20px", background: "var(--bg-main)", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const totalPaidStyle = { display: "flex", flexDirection: "column", gap: "2px" };
const reviewBtnStyle = { background: "#fff9e6", color: "#f39c12", border: "1px solid #f39c12", padding: "8px 15px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };

const progressBoxStyle = { marginTop: "20px" };
const progressBarStyle = { height: "8px", background: "#eee", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" };
const progressFillStyle = { height: "100%", background: "#0b8f3a", transition: "1s" };
const mutedTextStyle = { color: "#999", fontSize: "12px" };

const emptyStateStyle = { textAlign: "center", padding: "50px", background: "var(--card-bg)", borderRadius: "30px" };
const primaryBtnStyle = { background: "#0b8f3a", color: "#fff", border: "none", padding: "12px 30px", borderRadius: "15px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" };

const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center" };
const sideModalStyle = { position: "absolute", right: 0, top: 0, bottom: 0, width: "100%", maxWidth: "350px", background: "var(--card-bg)", padding: "30px", boxShadow: "-10px 0 50px rgba(0,0,0,0.1)" };
const centerModalStyle = { background: "var(--card-bg)", padding: "35px", borderRadius: "35px", width: "90%", maxWidth: "400px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
const modalHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const closeBtnStyle = { background: "none", border: "none", fontSize: "20px", color: "#999", cursor: "pointer" };
const notifListStyle = { overflowY: "auto", height: "calc(100% - 60px)" };
const notifRowStyle = { padding: "15px", borderBottom: "1px solid #f0f0f0" };

const starBoxStyle = { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "25px" };
const textareaStyle = { width: "100%", height: "100px", padding: "15px", borderRadius: "20px", background: "var(--bg-main)", border: "1px solid var(--glass-border)", color: "var(--text-main)", marginBottom: "20px", outline: "none", resize: "none" };
const submitBtnStyle = { width: "100%", padding: "15px", background: "#0b8f3a", color: "#fff", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };

const activeInputStyle = { padding: "12px 15px", borderRadius: "12px", border: "1.5px solid var(--primary)", fontSize: "14px", outline: "none", color: "var(--text-main)", width: "100%", boxSizing: "border-box" };
const disabledInputStyle = { padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", fontSize: "14px", color: "var(--text-muted)", width: "100%", boxSizing: "border-box" };

const bottomNavStyle = { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card-bg)", display: "flex", justifyContent: "space-around", padding: "12px 10px 25px 10px", boxShadow: "0 -5px 25px rgba(0,0,0,0.05)", zIndex: 1500, borderTop: "1px solid var(--glass-border)" };
const bottomLinkStyle = { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" };

const ProfileField = ({ label, value }) => (
  <div style={{ background: "var(--bg-main)", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "bold", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "14px", color: "var(--text-main)", fontWeight: "500", wordBreak: "break-word" }}>{value}</div>
  </div>
);

const statusBadgeStyle = (s) => {
  if (s === "Completed") return { padding: "5px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", background: "#eef8f1", color: "#0b8f3a" };
  if (s === "Pending" || s === "Rejected") return { padding: "5px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", background: "#fff9e6", color: "#f39c12" };
  return { padding: "5px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", background: "#eef2ff", color: "#4f46e5" };
};

export default UserDashboard;