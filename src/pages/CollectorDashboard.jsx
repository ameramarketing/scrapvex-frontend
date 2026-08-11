import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTruck, FaClock, FaCheckCircle, FaPhoneAlt, FaMapMarkerAlt, FaSignOutAlt, FaRupeeSign, FaInfoCircle, FaTimes, FaPlus, FaTrash, FaUserAlt, FaWallet, FaBars, FaRecycle, FaHistory, FaCalculator, FaBell, FaStar, FaToggleOn, FaToggleOff } from "react-icons/fa";
import API from "../services/api";
import Toast from "../components/Toast";
import { performLogout } from "../utils/auth";

function CollectorDashboard() {

// Synthesize Ding-Dong bell sound using Web Audio API (cross-device/offline friendly)
const playBellSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    const playNote = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playNote(880, audioCtx.currentTime, 0.4);
    playNote(659.25, audioCtx.currentTime + 0.15, 0.6);
    setTimeout(() => {
      audioCtx.close().catch(() => {});
    }, 1000);
  } catch (e) {
    console.error("Audio Context play failed:", e);
  }
};

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [pickups, setPickups] = useState([]);
  const [scrapItems, setScrapItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => { setSearchQuery(""); }, [activeTab]);

  // Wallet states
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({ amount: "", upiId: "", name: "" });
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [withdrawalOtpSent, setWithdrawalOtpSent] = useState(false);
  const [withdrawalOtp, setWithdrawalOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  
  // Wallet deposit states
  const [showCollectorDepositModal, setShowCollectorDepositModal] = useState(false);
  const [collectorDepositForm, setCollectorDepositForm] = useState({ amount: "", upiRefNo: "" });
  const [collectorDepositStep, setCollectorDepositStep] = useState(1);
  const [settings, setSettings] = useState({ upiId: "scrapvex@okaxis" });

  useEffect(() => {
    API.get("/settings").then(({ data }) => {
      if (data?.success) setSettings(data.data);
    });
  }, []);

  // Billing states
  const [billItems, setBillItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState("");
  const [paymentMode, setPaymentMode] = useState("wallet");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });

  // Support ticket states
  const [tickets, setTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ subject: "", message: "", category: "General" });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Profile Edit states
  const baseURL = (API.defaults.baseURL || "").replace(/\/api$/, "") || "https://scrapvex-backend.onrender.com";
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", address: "", area: "", oldPassword: "", newPassword: "", confirmPassword: "" });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const profileFileInputRef = React.useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    const interval = setInterval(async () => {
      try {
        const resP = await API.get("/collector/pickups");
        if (resP.data?.success) {
          const newPickupsList = resP.data.pickups || [];
          setPickups(prev => {
            if (prev.length > 0) {
              const hasNewPickup = newPickupsList.some(np => !prev.some(op => op._id === np._id));
              const hasStatusChange = newPickupsList.some(np => {
                const matchingOld = prev.find(op => op._id === np._id);
                return matchingOld && matchingOld.status !== np.status;
              });
              if (hasNewPickup || hasStatusChange) {
                playBellSound();
              }
            }
            return newPickupsList;
          });
        }
      } catch (e) { console.error("Collector polling error:", e); }
    }, 10000);
    return () => clearInterval(interval);
  }, [user?._id]);
  
  const filteredActivePickups = useMemo(() => {
    const list = pickups.filter(p => ["Pending", "Assigned", "Arrived", "In Progress"].includes(p.status));
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p => p._id.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || p.mobile?.includes(q) || p.address?.toLowerCase().includes(q) || p.scrapType?.toLowerCase().includes(q));
  }, [pickups, searchQuery]);

  const filteredHistory = useMemo(() => {
    const list = pickups.filter(p => ["Completed", "Cancelled"].includes(p.status));
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p => p._id.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || p.mobile?.includes(q) || p.address?.toLowerCase().includes(q));
  }, [pickups, searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return walletTransactions;
    const q = searchQuery.toLowerCase();
    return walletTransactions.filter(t => t.description?.toLowerCase().includes(q) || t.amount?.toString().includes(q) || t.type?.toLowerCase().includes(q));
  }, [walletTransactions, searchQuery]);

  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter(t => t.subject?.toLowerCase().includes(q) || t.message?.toLowerCase().includes(q) || t.status?.toLowerCase().includes(q));
  }, [tickets, searchQuery]);
  

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        navigate("/collector-login");
        return;
      }
      const loggedUser = JSON.parse(userStr);
      const role = localStorage.getItem("role");
      if (!loggedUser || role !== "collector") {
        navigate("/collector-login");
      } else {
        setUser(loggedUser);
        fetchData(loggedUser._id);
      }
    } catch (e) {
      localStorage.clear();
      navigate("/collector-login");
    }
  }, []);

  const handleCollectorDepositSubmit = async () => {
    if (!collectorDepositForm.amount || Number(collectorDepositForm.amount) <= 0) {
      return showToast("error", "Please enter a valid deposit amount");
    }
    if (!collectorDepositForm.upiRefNo || collectorDepositForm.upiRefNo.replace(/\D/g, "").length !== 12) {
      return showToast("error", "Please enter a valid 12-digit UPI Reference Number / UTR");
    }
    try {
      setLoading(true);
      const { data } = await API.post("/wallet/deposit", {
        amount: Number(collectorDepositForm.amount),
        upiRefNo: collectorDepositForm.upiRefNo
      });
      if (data.success) {
        showToast("success", "Deposit request submitted! Admin will verify and credit your wallet shortly. 🏦");
        setShowCollectorDepositModal(false);
        setCollectorDepositForm({ amount: "", upiRefNo: "" });
        setCollectorDepositStep(1);
        // Refresh wallet transactions
        const resW = await API.get("/wallet/info");
        setWalletTransactions(resW.data?.transactions || []);
        if (user) {
          const profileData = { ...user, walletBalance: resW.data?.balance || user.walletBalance };
          setUser(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
        }
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to submit deposit request");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (uid) => {
    if (!uid) return;
    try {
      setLoading(true);
      const resProf = await API.get("/auth/profile");
      const city = resProf.data?.area || "";
      
      const [resP, resI, resN, resR, resW] = await Promise.all([
        API.get("/collector/pickups"),
        API.get(`/scrap-items?city=${city}`),
        API.get("/notifications"),
        API.get(`/reviews/collector/${uid}`),
        API.get("/wallet/info")
      ]);
      setPickups(resP.data?.pickups || []);
      setScrapItems(resI.data?.data || []);
      setNotifications(resN.data?.data || []);
      setReviews(resR.data?.data || []);
      setWalletTransactions(resW.data?.transactions || []);
      
      if (resProf.data) {
        const profileData = { ...resProf.data, walletBalance: resW.data?.balance || resProf.data.walletBalance };
        setUser(profileData);
        setProfileForm({ 
          name: profileData.name || "", 
          address: profileData.address || "", 
          area: profileData.area || profileData.assignedCity || "", 
          oldPassword: "", newPassword: "", confirmPassword: "" 
        });
        if (profileData.profilePhoto) {
          setProfilePhotoPreview(`${baseURL}${profileData.profilePhoto}`);
        }
        localStorage.setItem("user", JSON.stringify(profileData));
      }
    } catch (e) {
      showToast("error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletInfo = async () => {
    try {
      const { data } = await API.get("/wallet/info");
      if (data.success) {
        setWalletTransactions(data.transactions || []);
        setUser(prev => {
          const updated = { ...prev, walletBalance: data.balance };
          localStorage.setItem("user", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      console.error("Wallet fetch error", e);
    }
  };

  const handleSendWithdrawalOTP = async () => {
    const { amount, upiId, name } = withdrawalForm;
    if (!amount || !upiId || !name) {
      return showToast("error", "All fields are required");
    }
    if (Number(amount) < 1000) {
      return showToast("error", "Minimum withdrawal amount is ₹1,000!");
    }
    if (Number(amount) > 20000) {
      return showToast("error", "Maximum limit per single withdrawal is ₹20,000!");
    }
    if (Number(amount) > (user?.walletBalance || 0)) {
      return showToast("error", `Insufficient balance! Your balance is ₹${user?.walletBalance || 0}`);
    }
    try {
      const { data } = await API.post("/wallet/withdraw/otp", {
        amount: Number(amount),
        upiId,
        name
      });
      if (data.success) {
        showToast("success", `OTP sent to your WhatsApp!`);
        setWithdrawalOtpSent(true);
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleRequestWithdrawal = async () => {
    const { amount, upiId, name } = withdrawalForm;
    if (!withdrawalOtp || withdrawalOtp.length !== 6) {
      return showToast("error", "Please enter the 6-digit security OTP");
    }
    try {
      const { data } = await API.post("/wallet/withdraw", {
        amount: Number(amount),
        upiId,
        name,
        otp: withdrawalOtp
      });
      if (data.success) {
        showToast("success", "Withdrawal request submitted successfully!");
        setWithdrawalModal(false);
        setWithdrawalOtpSent(false);
        setWithdrawalOtp("");
        setDemoOtp("");
        fetchWalletInfo();
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Withdrawal failed");
    }
  };

  const handleCancelWithdrawal = async (txId) => {
    if (!window.confirm("Are you sure you want to cancel this pending withdrawal request? The funds will be refunded to your wallet immediately.")) {
      return;
    }
    try {
      const { data } = await API.post(`/wallet/withdraw/cancel/${txId}`);
      if (data.success) {
        showToast("success", "Withdrawal request cancelled successfully!");
        fetchWalletInfo();
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to cancel withdrawal");
    }
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

  const toggleStatus = async () => {
    try {
      const { data } = await API.put("/auth/toggle-status");
      if (data.success) {
        const updatedUser = { ...user, isOnline: data.isOnline };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showToast("success", `You are now ${data.isOnline ? "Online" : "Offline"}`);
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Toggle failed");
    }
  };

  const addItemToBill = () => {
    if (!selectedItem || !qty) return;
    const item = scrapItems.find(i => i._id === selectedItem);
    if (!item) return;
    setBillItems([...billItems, {
      _id: Date.now(),
      name: item.name,
      price: item.price,
      unit: item.unit,
      quantity: Number(qty),
      subtotal: item.price * Number(qty)
    }]);
    setQty("");
  };

  const handleGenerateOTP = async () => {
    if (!selectedPickup || billItems.length === 0) return showToast("error", "Add items first");
    setOtpLoading(true);
    try {
      const payload = {
        amount: billItems.reduce((s, i) => s + i.subtotal, 0),
        items: billItems
      };
      const { data } = await API.post(`/pickups/collector/generate-otp/${selectedPickup._id}`, payload);
      if (data.success) {
        setOtpSent(true);
        showToast("success", "OTP sent to customer!");
      }
    } catch (e) {
      showToast("error", "OTP Failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setLoadingId(id);
    try {
      const payload = { status };
      if (status === "Completed") {
        payload.items = billItems;
        payload.amount = billItems.reduce((s, i) => s + i.subtotal, 0);
        payload.paymentMode = paymentMode;
        payload.otp = otp;
        payload.scrapType = billItems.map(i => `${i.name} (${i.quantity}${i.unit})`).join(", ");
      }
      const { data } = await API.put(`/pickups/collector/status/${id}`, payload);
      if (data.success) {
        showToast("success", `Pickup ${status}`);
        setSelectedPickup(null); setBillItems([]); setOtp(""); setOtpSent(false);
        fetchData(user?._id);
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Action failed");
    } finally {
      setLoadingId(null);
    }
  };

  const activePickups = useMemo(() => (pickups || []).filter(p => ["pending", "assigned", "accepted", "rejected"].includes(p.status?.toLowerCase())), [pickups]);
  const history = useMemo(() => (pickups || []).filter(p => p.status?.toLowerCase() === "completed"), [pickups]);
  const earnings = useMemo(() => history.reduce((s, i) => s + (i.amount || 0), 0), [history]);

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
        showToast("success", "Ticket submit ho gayi! Admin jaldi reply karega.");
        setShowTicketModal(false);
        setNewTicketForm({ subject: "", message: "", category: "General" });
        fetchTickets();
      }
    } catch (e) { showToast("error", e.response?.data?.message || "Ticket submit nahi ho saki"); }
    finally { setSubmittingTicket(false); }
  };

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

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) return showToast("error", "Name is required");
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      return showToast("error", "New passwords do not match");
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
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
        setEditProfileMode(false);
        showToast("success", "Profile updated successfully!");
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => { 
    await performLogout();
    navigate("/collector-login"); 
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div style={loaderStyle}><FaRecycle className="spin" style={{fontSize: "45px", color: "var(--primary)"}} /></div>;

  const NavContent = () => (
    <>
      <NavItem active={activeTab === "overview"} icon={<FaRecycle />} text="Overview" onClick={() => {setActiveTab("overview"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "mypickups"} icon={<FaTruck />} text="My Pickups" onClick={() => {setActiveTab("mypickups"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "wallet"} icon={<FaWallet />} text="Wallet" onClick={() => {setActiveTab("wallet"); fetchWalletInfo(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "history"} icon={<FaHistory />} text="History" onClick={() => {setActiveTab("history"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "notifications"} icon={<FaBell />} text={`Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}`} onClick={() => { setActiveTab("notifications"); setIsMobileMenuOpen(false); markAllNotificationsRead(); }} />
      <NavItem active={activeTab === "reviews"} icon={<FaStar />} text="Reviews" onClick={() => {setActiveTab("reviews"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "support"} icon={<FaPhoneAlt />} text="Support" onClick={() => {setActiveTab("support"); fetchTickets(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "profile"} icon={<FaUserAlt />} text="My Profile" onClick={() => {setActiveTab("profile"); setIsMobileMenuOpen(false);}} />
    </>
  );

  return (
    <div style={container}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({...toast, show: false})} />
      
      <style>{`
        .sidebar-item:hover { background: rgba(255,255,255,0.1); transform: translateX(5px); }
        .premium-card { transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }
        .spinner { width: 40px; height: 40px; border: 4px solid var(--primary-light); border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { .desktop-only { display: none !important; } }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>

      {/* SIDEBAR */}
      <div style={sidebar} className="desktop-only">
        <div style={logo}><FaRecycle style={{marginRight:"10px"}}/> Scrapvex</div>
        <nav style={nav}><NavContent /></nav>
          <button style={logoutBtnSide} onClick={logout}><FaSignOutAlt/> Logout</button>
      </div>

      <div style={main}>
        {/* HEADER */}
        <header style={header}>
          <div style={{display:"flex", alignItems:"center", gap:"15px"}}>
             <button style={menuBtn} className="mobile-only" onClick={() => setIsMobileMenuOpen(true)}><FaBars/></button>
             <h2 style={headerTitle}>COLLECTOR PORTAL</h2>
          </div>
          <div style={userInfo}>
             <div style={{textAlign: "right"}} className="desktop-only">
                <div style={{fontWeight:"bold", color: "var(--text-main)"}}>{user?.name}</div>
                <small style={{color: user?.isOnline ? "var(--primary)" : "#666", fontWeight:"bold", display:"flex", alignItems:"center", gap:"4px", justifyContent:"flex-end"}}>
                   <span style={{width:"8px", height:"8px", borderRadius:"50%", background: user?.isOnline ? "var(--primary)" : "#666", display:"inline-block"}}></span>
                   {user?.isOnline ? "Online" : "Offline"}
                </small>
             </div>
             <button onClick={() => { setActiveTab("notifications"); markAllNotificationsRead(); }} style={bellBtn} title="Notifications">
                <FaBell size={20} />
                {unreadCount > 0 && <span style={notificationBadge}>{unreadCount}</span>}
             </button>
             <button onClick={toggleStatus} style={{background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center"}}>
                {user?.isOnline ? <FaToggleOn size={28} color="var(--primary)"/> : <FaToggleOff size={28} color="#666"/>}
             </button>
             <div style={{ ...avatar, cursor: "pointer" }} onClick={() => setActiveTab("profile")}><FaUserAlt/></div>
          </div>
        </header>

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileMenuOpen && (
          <div style={mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}>
             <div style={mobileSidebar} onClick={e => e.stopPropagation()}>
                <div style={{...logo, color:"#fff"}}><FaRecycle style={{marginRight:"10px"}}/> Scrapvex</div>
                <nav style={nav}><NavContent /></nav>
                <button style={logoutBtnSide} onClick={logout}><FaSignOutAlt/> Logout</button>
             </div>
          </div>
        )}

        <div style={content}>
          {activeTab === "overview" && (
            <>
               <div style={statGrid}>
                  <StatCard icon={<FaTruck/>} title="My Tasks" value={activePickups.length} grad="linear-gradient(135deg, #3498db 0%, #2980b9 100%)" />
                  <StatCard icon={<FaCheckCircle/>} title="Jobs Completed" value={history.length} grad="linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)" />
                  <StatCard icon={<FaRupeeSign/>} title="Wallet Balance" value={`₹${user?.walletBalance || 0}`} grad="linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)" />
               </div>

               <div style={mainGrid}>
                  <div style={{...box, flex: 2}} className="premium-card">
                     <h3 style={boxTitle}>Recent Tasks</h3>
                     {filteredActivePickups.slice(0, 3).map(p => (
                       <div key={p._id} style={listRow}>
                          <div>
                             <div style={rowTitle}>{p.scrapType}</div>
                             <small style={muted}>{p.name} • {p.address}</small>
                          </div>
                          <button style={viewBtn} onClick={()=>setSelectedPickup(p)}>View</button>
                       </div>
                     ))}
                     {activePickups.length === 0 && <Empty text="No active tasks." />}
                  </div>
                  <div style={{...box, flex: 1}} className="premium-card">
                     <h3 style={boxTitle}>Live Status</h3>
                     <div style={statusBanner}>
                        {user?.isOnline ? (
                          <>
                             <FaCheckCircle size={30} color="var(--primary)" />
                             <div style={{marginTop:"10px"}}><strong>You are Online</strong></div>
                             <small style={muted}>Ready for new tasks.</small>
                          </>
                        ) : (
                          <>
                             <FaClock size={30} color="#666" />
                             <div style={{marginTop:"10px"}}><strong>You are Offline</strong></div>
                             <small style={muted}>Switch online to receive work.</small>
                          </>
                        )}
                     </div>
                  </div>
               </div>
            </>
          )}

          {activeTab === "mypickups" && (
            <div style={box} className="premium-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "var(--text-main)", fontWeight: "bold" }}>My Pickups</h3>
                <span style={{ fontSize: "13px", color: "#999" }}>{activePickups.length} active tasks</span>
              </div>
              <div style={tableContainer}>
                {filteredActivePickups.map(p => (
                  <div key={p._id} style={{ ...listRow, alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <div style={rowTitle}>{p.scrapType || p.address}</div>
                      <small style={muted}>{p.name} • {p.address}</small>
                      <div style={{ marginTop: "8px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "#666", background: "rgba(0,0,0,0.04)", padding: "4px 8px", borderRadius: "8px" }}>{p.status}</span>
                        {p.collector && <span style={{ fontSize: "11px", color: "#666", background: "rgba(0,0,0,0.04)", padding: "4px 8px", borderRadius: "8px" }}>Assigned to you</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexDirection: "column", alignItems: "flex-end" }}>
                      <button style={viewBtn} onClick={()=>setSelectedPickup(p)}>View</button>
                      {p.status?.toLowerCase() === "pending" && (
                        <button style={{ ...viewBtn, background: "#f39c12" }} onClick={()=>handleAction(p._id, "Accepted")}>Accept</button>
                      )}
                    </div>
                  </div>
                ))}
                {activePickups.length === 0 && <Empty text="No assigned or accepted pickups yet." />}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div style={box} className="premium-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "var(--text-main)", fontWeight: "bold" }}>MY WALLET</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    style={{ ...viewBtn, background: "#0b8f3a", color: "#fff" }} 
                    onClick={() => {
                      setCollectorDepositForm({ amount: "", upiRefNo: "" });
                      setCollectorDepositStep(1);
                      setShowCollectorDepositModal(true);
                    }}
                  >
                    <FaPlus /> Add Funds
                  </button>
                  <button 
                    style={{ ...viewBtn, background: "var(--primary)" }} 
                    onClick={() => {
                      setWithdrawalForm({ amount: "", upiId: "", name: user?.name || "" });
                      setWithdrawalModal(true);
                    }}
                  >
                    <FaRupeeSign /> Withdraw Money
                  </button>
                </div>
              </div>
<div style={{...statGrid, gridTemplateColumns: "1fr"}}>
                 <div style={{ 
                   padding: "30px", 
                   borderRadius: "20px", 
                   background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)", 
                   color: "#fff",
                   boxShadow: "0 10px 20px rgba(142, 68, 173, 0.2)",
                   display: "flex",
                   justifyContent: "space-between",
                   alignItems: "center"
                 }}>
                   <div>
                     <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Total Balance</div>
                     <div style={{ fontSize: "36px", fontWeight: "800", marginTop: "10px" }}>₹{user?.walletBalance || 0}</div>
                   </div>
                   <FaWallet size={48} style={{ opacity: 0.3 }} />
                 </div>
               </div>

               <h4 style={{ marginTop: "30px", marginBottom: "15px", color: "var(--text-main)" }}>Transaction History</h4>
               <div style={tableContainer}>
                 {filteredTransactions.map(tx => (
                   <div key={tx._id} style={listRow}>
                     <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                       <div style={{ 
                         width: "35px", 
                         height: "35px", 
                         borderRadius: "10px", 
                         display: "flex", 
                         justifyContent: "center", 
                         alignItems: "center",
                         background: tx.type === "credit" ? "#eef8f1" : "#fff5f5" 
                       }}>
                         {tx.type === "credit" ? <FaRupeeSign color="#0b8f3a" /> : <FaRupeeSign color="#dc3545" />}
                       </div>
                       <div>
                         <div style={rowTitle}>{tx.description}</div>
                         <small style={muted}>{new Date(tx.createdAt).toLocaleString()}</small>
                       </div>
                     </div>
                     <div style={{ textAlign: "right" }}>
                       <div style={{ 
                         fontWeight: "bold", 
                         color: tx.type === "credit" ? "#0b8f3a" : "#dc3545" 
                       }}>
                         {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                       </div>
                       <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", marginTop: "4px" }}>
                          {tx.type === "debit" && tx.source === "withdrawal" && tx.status === "pending" && (
                            <button 
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
                          <small style={{ 
                            padding: "2px 8px", 
                            borderRadius: "6px", 
                            fontSize: "10px", 
                            fontWeight: "bold", 
                            textTransform: "capitalize",
                            background: tx.status === "completed" ? "#eef8f1" : (tx.status === "pending" ? "#fff9e6" : "#fff5f5"),
                            color: tx.status === "completed" ? "#0b8f3a" : (tx.status === "pending" ? "#f39c12" : "#dc3545") 
                          }}>
                            {tx.status}
                          </small>
                        </div>
                     </div>
                   </div>
                 ))}
                 {walletTransactions.length === 0 && <Empty text="No wallet transactions yet." />}
               </div>
             </div>
           )}

          {activeTab === "profile" && (
            <div style={box} className="premium-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "var(--text-main)", fontWeight: "bold" }}>My Profile</h3>
                {!editProfileMode && (
                  <button style={{ ...viewBtn, background: "var(--bg-main)", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }} onClick={() => setEditProfileMode(true)}>
                    Edit Profile
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
                <div style={{ position: "relative" }}>
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Profile" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} />
                  ) : (
                    <FaUserAlt size={80} color="var(--primary)" />
                  )}
                  {editProfileMode && (
                    <div 
                      style={{ position: "absolute", bottom: "0", right: "0", width: "25px", height: "25px", background: "var(--primary)", color: "#fff", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid var(--card-bg)", cursor: "pointer" }}
                      onClick={() => profileFileInputRef.current.click()}
                    >
                      <FaPlus size={12} />
                    </div>
                  )}
                  <input type="file" ref={profileFileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfilePhotoChange} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "var(--text-main)" }}>{user?.name}</h2>
                  <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", display: "inline-block", marginTop: "5px", textTransform: "capitalize" }}>{user?.role || "collector"}</div>
                </div>
              </div>

              {editProfileMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>Name</label>
                    <input type="text" name="name" value={profileForm.name} onChange={handleProfileFormChange} style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-main)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>Mobile Number</label>
                    <input type="text" value={user?.mobile || ""} disabled style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-muted)", opacity: 0.7 }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>Email</label>
                    <input type="text" value={user?.email || ""} disabled style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-muted)", opacity: 0.7 }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>Address</label>
                    <input type="text" name="address" value={profileForm.address} onChange={handleProfileFormChange} style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-main)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>Area (City)</label>
                    <input type="text" name="area" value={profileForm.area} onChange={handleProfileFormChange} style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-main)" }} />
                  </div>

                  <h4 style={{ margin: "10px 0 0 0", color: "var(--text-main)" }}>Change Password</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>Old Password</label>
                    <input type="password" name="oldPassword" value={profileForm.oldPassword} onChange={handleProfileFormChange} style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-main)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>New Password</label>
                    <input type="password" name="newPassword" value={profileForm.newPassword} onChange={handleProfileFormChange} style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-main)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileFormChange} style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", outline: "none", background: "var(--bg-main)", color: "var(--text-main)" }} />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button style={{ ...addBtn, width: "100%", padding: "12px" }} onClick={handleSaveProfile} disabled={loading}>
                      {loading ? <FaRecycle className="spin" /> : "Save Changes"}
                    </button>
                    <button style={{ ...viewBtn, width: "100%", padding: "12px", background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--glass-border)" }} onClick={() => { setEditProfileMode(false); setProfileForm(prev => ({ ...prev, name: user?.name, address: user?.address, area: user?.area || user?.assignedCity, oldPassword: "", newPassword: "", confirmPassword: "" })); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                    <ProfileField label="Mobile" value={user?.mobile || "-"} />
                    <ProfileField label="Email" value={user?.email || "-"} />
                    <ProfileField label="Address" value={user?.address || "-"} />
                    <ProfileField label="Area" value={user?.area || user?.assignedCity || "-"} />
                    <ProfileField label="Wallet" value={`₹${user?.walletBalance || 0}`} />
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button style={{ ...viewBtn, background: "var(--primary)" }} onClick={() => setActiveTab("overview")}>Back to Dashboard</button>
                    <button style={{ ...logoutBtnBig, width: "auto", background: "rgba(220, 53, 69, 0.12)", color: "#dc3545" }} onClick={logout}>Logout</button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div style={box} className="premium-card">
              <h3 style={{ margin: "0 0 20px 0", color: "var(--text-main)", fontWeight: "bold" }}>Completed Pickups</h3>
              <div style={tableContainer}>
                {filteredHistory.map(p => (
                  <div key={p._id} style={listRow}>
                    <div>
                      <div style={rowTitle}>{p.scrapType || p.address}</div>
                      <small style={muted}>{p.name} • {new Date(p.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: "#0b8f3a" }}>₹{p.amount || 0}</div>
                      <small style={{ color: "#999" }}>{p.status}</small>
                    </div>
                  </div>
                ))}
                {history.length === 0 && <Empty text="No completed pickups yet." />}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div style={box} className="premium-card">
              <h3 style={{ margin: "0 0 20px 0", color: "var(--text-main)", fontWeight: "bold" }}>Alerts</h3>
              <div style={tableContainer}>
                {notifications.map(n => (
                  <div key={n._id} style={{ ...listRow, justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                    <div>
                      <div style={rowTitle}>{n.title || "Notification"}</div>
                      <small style={muted}>{n.message || n.body || "No details available."}</small>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "85px" }}>
                      <span style={{ fontSize: "11px", color: n.isRead ? "#999" : "var(--primary)", fontWeight: "bold" }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && <Empty text="No alerts available." />}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={box} className="premium-card">
              <h3 style={{ margin: "0 0 20px 0", color: "var(--text-main)", fontWeight: "bold" }}>Reviews</h3>
              <div style={tableContainer}>
                {reviews.map(r => (
                  <div key={r._id} style={{ ...listRow, flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" }}>
                      <div>
                        <div style={rowTitle}>{r.title || `Rating ${r.rating || "-"}`}</div>
                        <small style={muted}>{r.comment || r.message || "No comment provided."}</small>
                      </div>
                      <span style={{ fontSize: "12px", color: "#999" }}>{r.rating ? `${r.rating} / 5` : "-"}</span>
                    </div>
                    <small style={{ color: "#999" }}>By {r.user?.name || r.userName || "Customer"} on {new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
                {reviews.length === 0 && <Empty text="No reviews yet." />}
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div style={box} className="premium-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-main)", fontWeight: "bold" }}>Support Tickets</h3>
                <button style={{ ...viewBtn, background: "var(--primary)" }} onClick={() => setShowTicketModal(true)}>
                  + Raise Ticket
                </button>
              </div>

              <div style={tableContainer}>
                {filteredTickets.map(t => (
                  <div key={t._id} style={{ ...listRow, flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <div>
                        <span style={rowTitle}>{t.subject}</span>
                        <br />
                        <small style={muted}>{t.category} • {new Date(t.createdAt).toLocaleDateString()}</small>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", background: t.status === "open" ? "rgba(11, 143, 58, 0.1)" : t.status === "resolved" ? "rgba(66, 133, 244, 0.1)" : "rgba(243, 156, 18, 0.1)", color: t.status === "open" ? "#0b8f3a" : t.status === "resolved" ? "#4285f4" : "#f39c12" }}>
                        {t.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{t.message}</p>
                    {t.replies && t.replies.length > 0 && (
                      <div style={{ background: "var(--bg-main)", borderRadius: "10px", padding: "10px", width: "100%", boxSizing: "border-box", borderLeft: "3px solid var(--primary)", marginTop: "5px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--primary)", marginBottom: "3px" }}>Admin Reply:</div>
                        <div style={{ fontSize: "12px", color: "var(--text-main)" }}>{t.replies[t.replies.length - 1].message}</div>
                      </div>
                    )}
                  </div>
                ))}
                {tickets.length === 0 && <Empty text="No support tickets raised yet." />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL & BILLING MODAL */}
      {selectedPickup && (
        <Modal title="Manage Pickup" onClose={() => {setSelectedPickup(null); setBillItems([]); setOtp(""); setOtpSent(false);}}>
           <div style={modalScroll}>
              <div style={infoGrid}>
                 <InfoItem label="Name" value={selectedPickup.name} />
                 <InfoItem label="Mobile" value={
                   <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
                      {selectedPickup.mobile}
                      <a href={`tel:${selectedPickup.mobile}`} style={{...callBtn, background: "var(--primary)"}}>Call</a>
                   </div>
                 } />
                 <div style={{gridColumn:"span 2"}}>
                    <InfoItem label="Address" value={selectedPickup.address} />
                    <a 
                      href={(() => {
                        if (selectedPickup.lat && selectedPickup.lng) return `https://www.google.com/maps/dir/?api=1&destination=${selectedPickup.lat},${selectedPickup.lng}`;
                        if (selectedPickup.latitude && selectedPickup.longitude) return `https://www.google.com/maps/dir/?api=1&destination=${selectedPickup.latitude},${selectedPickup.longitude}`;
                        const match = selectedPickup.address?.match(/GPS:\s*([0-9.-]+),\s*([0-9.-]+)/i);
                        if (match) return `https://www.google.com/maps/dir/?api=1&destination=${match[1]},${match[2]}`;
                        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPickup.address)}`;
                      })()} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={navLink}
                    >
                       <FaMapMarkerAlt/> Open Direct Live GPS Navigation
                    </a>
                 </div>
              </div>

              {selectedPickup.status === "Accepted" ? (
                <div style={calcBox}>
                   <h4 style={{margin:"0 0 10px 0"}}><FaCalculator/> Bill Calculator</h4>
                   <div style={{display:"flex", gap:"8px", marginBottom:"15px", flexWrap: "nowrap", alignItems:"center"}}>
                      <select style={{...select, minWidth:"120px"}} value={selectedItem} onChange={e=>setSelectedItem(e.target.value)}>
                         <option value="">Select Item</option>
                         {scrapItems.map(i => <option key={i._id} value={i._id}>{i.name} (₹{i.price})</option>)}
                      </select>
                      <input type="number" style={{...qtyInput, minWidth:"70px"}} placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)} />
                      <button style={{...addBtn, minWidth:"45px", height:"45px", display:"flex", justifyContent:"center", alignItems:"center"}} onClick={addItemToBill}>
                         <FaPlus size={18}/>
                      </button>
                   </div>
                   {billItems.length > 0 && (
                      <div style={billList}>
                         {billItems.map(bi => (
                           <div key={bi._id} style={billRow}>
                              <span>{bi.name}</span>
                              <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
                                 <span>{bi.quantity}{bi.unit} = <strong>₹{bi.subtotal}</strong></span>
                                 <button style={trashBtn} onClick={()=>setBillItems(billItems.filter(x=>x._id!==bi._id))}><FaTrash size={12}/></button>
                              </div>
                           </div>
                         ))}
                         <div style={totalRow}>
                            <span>Grand Total:</span> <strong>₹{billItems.reduce((s,i)=>s+i.subtotal,0)}</strong>
                         </div>
                      </div>
                   )}

                   <div style={{marginTop: "15px", borderTop: "1px solid var(--glass-border)", paddingTop: "15px"}}>
                      <label style={{fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "8px"}}>Payment Method:</label>
                      <div style={{display: "flex", gap: "10px"}}>
                         <button onClick={()=>setPaymentMode("wallet")} style={{...modeBtn, background: paymentMode==="wallet"?"var(--primary)":"var(--bg-main)", color: paymentMode==="wallet"?"#fff":"var(--text-main)", border: paymentMode==="wallet"?"none":"1px solid var(--glass-border)"}}>
                            Wallet
                         </button>
                         <button onClick={()=>setPaymentMode("cash")} style={{...modeBtn, background: paymentMode==="cash"?"var(--primary)":"var(--bg-main)", color: paymentMode==="cash"?"#fff":"var(--text-main)", border: paymentMode==="cash"?"none":"1px solid var(--glass-border)"}}>
                            Cash
                         </button>
                      </div>
                   </div>

                   <div style={{marginTop: "20px", background: "var(--primary-light)", padding: "15px", borderRadius: "15px"}}>
                      {!otpSent ? (
                        <button style={otpBtn} onClick={handleGenerateOTP} disabled={otpLoading || billItems.length === 0}>
                           {otpLoading ? <FaRecycle className="spin"/> : "Generate OTP & Send Bill"}
                        </button>
                      ) : (
                        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                           <small style={{color: "var(--primary)"}}>✓ Bill sent. Enter OTP:</small>
                           <input type="text" placeholder="OTP" style={{...otpInput, borderColor: "var(--primary)"}} value={otp} onChange={e=>setOtp(e.target.value.slice(0,4))} />
                           <button style={{...otpBtn, background: "var(--card-bg)", color: "var(--primary)", border: "1px solid var(--primary)"}} onClick={handleGenerateOTP}>Resend OTP</button>
                        </div>
                      )}
                   </div>
                </div>
              ) : null}

              <div style={{display:"flex", gap:"10px", marginTop:"20px"}}>
                 {selectedPickup.status !== "Accepted" ? (
                   <>
                      <button style={acceptBtn} onClick={()=>handleAction(selectedPickup._id, "Accepted")}>Accept Request</button>
                      <button style={rejectBtn} onClick={()=>handleAction(selectedPickup._id, "Rejected")}>Reject</button>
                   </>
                 ) : (
                   <button 
                      style={{...completeBtn, opacity: (!otpSent || otp.length < 4) ? 0.5 : 1}} 
                      disabled={billItems.length === 0 || !otpSent || otp.length < 4} 
                      onClick={()=>handleAction(selectedPickup._id, "Completed")}
                   >
                      {loadingId ? <FaRecycle className="spin"/> : "Finalize & Mark Complete"}
                    </button>
                  )}
               </div>
            </div>
         </Modal>
      )}

      {showTicketModal && (
        <Modal title="Raise Support Ticket" onClose={() => setShowTicketModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Category</label>
              <select style={{ ...select, width: "100%", boxSizing: "border-box" }} value={newTicketForm.category} onChange={e => setNewTicketForm({ ...newTicketForm, category: e.target.value })}>
                <option value="General">General</option>
                <option value="Payment">Payment Issue</option>
                <option value="Pickup">Pickup Problem</option>
                <option value="Technical">Technical Bug</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Subject</label>
              <input style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box" }} placeholder="Short subject..." value={newTicketForm.subject} onChange={e => setNewTicketForm({ ...newTicketForm, subject: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Describe your problem</label>
              <textarea style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box", height: "100px", resize: "vertical" }} placeholder="Explain your issue clearly..." value={newTicketForm.message} onChange={e => setNewTicketForm({ ...newTicketForm, message: e.target.value })} />
            </div>
            <button style={{ ...viewBtn, width: "100%", padding: "15px", justifyContent: "center", display: "flex" }} onClick={handleCreateTicket} disabled={submittingTicket}>
              {submittingTicket ? <FaRecycle className="spin" /> : "Submit Ticket"}
            </button>
          </div>
        </Modal>
      )}

      {withdrawalModal && (
        <Modal title="Request UPI Withdrawal" onClose={() => { setWithdrawalModal(false); setWithdrawalOtpSent(false); setWithdrawalOtp(""); setDemoOtp(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {!withdrawalOtpSent ? (
              <>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
                    placeholder="Minimum ₹100..." 
                    value={withdrawalForm.amount} 
                    onChange={e => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>UPI ID</label>
                  <input 
                    style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
                    placeholder="e.g. username@upi" 
                    value={withdrawalForm.upiId} 
                    onChange={e => setWithdrawalForm({ ...withdrawalForm, upiId: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Account Holder Name</label>
                  <input 
                    style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
                    placeholder="Your full name..." 
                    value={withdrawalForm.name} 
                    onChange={e => setWithdrawalForm({ ...withdrawalForm, name: e.target.value })} 
                  />
                </div>
                
                <div style={{ background: "rgba(142, 68, 173, 0.05)", borderLeft: "3px solid var(--primary)", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  <strong>🔒 Multi-Factor Authentication:</strong> A unique verification code (OTP) will be sent to your registered mobile number to prevent unauthorized withdrawals.
                </div>

                <button 
                  style={{ ...viewBtn, width: "100%", padding: "15px", justifyContent: "center", display: "flex", fontSize: "14px", fontWeight: "bold", background: "var(--primary)" }} 
                  onClick={handleSendWithdrawalOTP}
                >
                  Verify & Send Security OTP
                </button>
              </>
            ) : (
              <>
                <div style={{ background: "var(--bg-main)", padding: "15px", borderRadius: "12px", border: "1px solid var(--glass-border)", fontSize: "13px" }}>
                  <div style={{ marginBottom: "5px", color: "var(--text-muted)" }}>Confirming Payout Details:</div>
                  <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--primary)", marginBottom: "10px" }}>₹{withdrawalForm.amount}</div>
                  <div style={{ color: "var(--text-main)" }}><strong>UPI ID:</strong> {withdrawalForm.upiId}</div>
                  <div style={{ color: "var(--text-main)", marginTop: "3px" }}><strong>Holder:</strong> {withdrawalForm.name}</div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Enter 6-Digit Security OTP</label>
                  <input 
                    type="text"
                    maxLength={6}
                    style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--primary)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "20px", fontWeight: "bold", textAlign: "center", letterSpacing: "8px", outline: "none", boxSizing: "border-box" }} 
                    placeholder="••••••" 
                    value={withdrawalOtp} 
                    onChange={e => setWithdrawalOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} 
                  />
                </div>

                <button 
                  style={{ ...viewBtn, width: "100%", padding: "15px", justifyContent: "center", display: "flex", fontSize: "14px", fontWeight: "bold", background: "var(--primary)" }} 
                  onClick={handleRequestWithdrawal}
                >
                  Confirm & Request Payout
                </button>

                <button 
                  style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "13px", cursor: "pointer", marginTop: "5px" }} 
                  onClick={() => { setWithdrawalOtpSent(false); setWithdrawalOtp(""); }}
                >
                  ← Edit Details / Resend OTP
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* COLLECTOR DEPOSIT MODAL */}
      {showCollectorDepositModal && (
        <Modal title="Add Funds via UPI QR" onClose={() => { setShowCollectorDepositModal(false); setCollectorDepositForm({ amount: "", upiRefNo: "" }); setCollectorDepositStep(1); }}>
          <div style={{ ...modalScroll, maxHeight: "75vh", paddingRight: "5px" }}>
            {collectorDepositStep === 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Enter the amount you want to add to your wallet balance.
                </p>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: "bold" }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    value={collectorDepositForm.amount} 
                    onChange={e => setCollectorDepositForm({ ...collectorDepositForm, amount: e.target.value })} 
                    placeholder="e.g. 500" 
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box", fontSize: "14px" }}
                  />
                </div>
                <button 
                  style={{ background: "var(--primary)", color: "#fff", border: "none", width: "100%", padding: "14px", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", transition: "0.2s" }}
                  onClick={() => {
                    if (!collectorDepositForm.amount || Number(collectorDepositForm.amount) < 1000) {
                      return showToast("error", "Minimum deposit amount is ₹1,000!");
                    }
                    setCollectorDepositStep(2);
                  }}
                >
                  Proceed to Pay ➡️
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                <div style={{ width: "100%", background: "var(--bg-main)", padding: "15px", borderRadius: "15px", textAlign: "center", border: "1px solid var(--glass-border)", boxSizing: "border-box" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Depositing Amount</span>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--primary)", marginTop: "5px" }}>₹{collectorDepositForm.amount}</div>
                </div>

                {/* Dynamic QR Code */}
                <div style={{ background: "#fff", padding: "15px", borderRadius: "20px", border: "1px solid #eee", textAlign: "center" }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId || "8491028539@pthdfc"}&pn=Scrapvex&am=${collectorDepositForm.amount}&tn=WalletDeposit`)}`} 
                    alt="UPI QR Code" 
                    style={{ width: "160px", height: "160px", display: "block", margin: "0 auto" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=${encodeURIComponent(`upi://pay?pa=${settings.upiId || "8491028539@pthdfc"}&pn=Scrapvex&am=${collectorDepositForm.amount}&tn=WalletDeposit`)}`;
                    }}
                  />
                </div>
                <div style={{ marginTop: "-5px", fontWeight: "bold", color: "var(--primary)", fontSize: "14px" }}>UPI ID: {settings.upiId || "8491028539@pthdfc"}</div>

                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Mobile deep link with warning check */}
                  <a 
                    href={`upi://pay?pa=${settings.upiId || "8491028539@pthdfc"}&pn=Scrapvex&am=${collectorDepositForm.amount}&tn=WalletDeposit`} 
                    className="btn-premium" 
                    style={{ width: "100%", textDecoration: "none", textAlign: "center", background: "#0b8f3a", color: "#fff", padding: "12px", borderRadius: "12px", fontWeight: "bold", boxSizing: "border-box", display: "block" }}
                    onClick={(e) => {
                      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                      if (!isMobile) {
                        e.preventDefault();
                        alert("📲 UPI Mobile App deep links only work directly on mobile devices (Android/iOS). On a laptop, please scan the QR Code shown above using your phone's GPay/PhonePe camera scan!");
                      }
                    }}
                  >
                    Pay via UPI Apps 📱
                  </a>
                </div>

                <div style={{ width: "100%", borderTop: "1px dashed var(--glass-border)", paddingTop: "15px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "bold" }}>Enter 12-digit UPI Ref No. / UTR *</label>
                  <input 
                    type="text" 
                    value={collectorDepositForm.upiRefNo} 
                    onChange={e => setCollectorDepositForm({ ...collectorDepositForm, upiRefNo: e.target.value })} 
                    placeholder="Enter 12-digit UTR/Ref number" 
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box", fontSize: "14px", fontFamily: "monospace", letterSpacing: "1px" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button 
                    style={{ flex: 1, padding: "12px", background: "var(--card-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => setCollectorDepositStep(1)}
                  >
                    Back
                  </button>
                  <button 
                    style={{ flex: 2, padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
                    onClick={handleCollectorDepositSubmit}
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div style={bottomNavStyle} className="mobile-only">
        <BottomLink icon={<FaRecycle size={22}/>} text="Home" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <BottomLink icon={<FaTruck size={22}/>} text="Pickups" active={activeTab === "mypickups"} onClick={() => setActiveTab("mypickups")} />
        <BottomLink icon={<FaWallet size={22}/>} text="Wallet" active={activeTab === "wallet"} onClick={() => { setActiveTab("wallet"); fetchWalletInfo(); }} />
        <BottomLink icon={<FaHistory size={22}/>} text="History" active={activeTab === "history"} onClick={() => setActiveTab("history")} />
        <BottomLink icon={<FaBars size={22}/>} text="Menu" active={false} onClick={() => setIsMobileMenuOpen(true)} />
      </div>

    </div>
  );
}

/* HELPER COMPONENTS */
const StatCard = ({ icon, title, value, grad }) => (
  <div style={{ ...statCard, background: grad }} className="premium-card">
    <div style={statIcon}>{icon}</div>
    <div style={{color:"#fff"}}>
       <div style={statVal}>{value}</div>
       <div style={statTitle}>{title}</div>
    </div>
  </div>
);

const NavItem = ({ active, icon, text, onClick }) => (
  <div style={{ ...navItem, background: active ? "rgba(255,255,255,0.18)" : "transparent", color: "#fff", boxShadow: active ? "0 8px 20px rgba(0,0,0,0.12)" : "none" }} onClick={onClick} className="sidebar-item">
    {icon} <span>{text}</span>
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <div style={modalOverlay} onClick={onClose}><div style={modalBox} onClick={e => e.stopPropagation()} className="premium-card">
    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
       <h3 style={{margin:0, color:"var(--text-main)"}}>{title}</h3>
       <button onClick={onClose} style={{background:"none", border:"none", cursor:"pointer", color: "var(--text-main)"}}><FaTimes/></button>
    </div>
    {children}
  </div></div>
);

const BottomLink = ({ icon, text, onClick, active }) => (
  <div style={{ ...bottomLinkStyle, color: active ? "#0b8f3a" : "#666" }} onClick={onClick}>
     {icon} <span style={{fontSize:"10px", marginTop:"2px"}}>{text}</span>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div><small style={{color:"var(--text-muted)", display:"block"}}>{label}</small><strong style={{fontSize:"13px", color: "var(--text-main)"}}>{value}</strong></div>
);

const ProfileField = ({ label, value }) => (
  <div style={{padding:"15px", borderBottom:"1px solid var(--glass-border)", display:"flex", justifyContent:"space-between"}}>
     <span style={{color:"var(--text-muted)"}}>{label}</span><strong style={{color: "var(--text-main)"}}>{value}</strong>
  </div>
);

const Empty = ({ text }) => <div style={{padding:"40px", textAlign:"center", color:"#999", fontSize:"14px"}}>{text}</div>;

/* STYLES */
const container = { display: "flex", height: "100vh", background: "var(--bg-main)" };
const sidebar = { width: "240px", background: "#0b8f3a", color: "#fff", display: "flex", flexDirection: "column", padding: "30px 20px" };
const mobileSidebar = { 
  width: "280px", 
  height: "100%", 
  background: "linear-gradient(180deg, #0b8f3a 0%, #086b2b 100%)", 
  padding: "30px 20px", 
  color: "#fff", 
  overflowY: "auto",
  boxShadow: "10px 0 30px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  position: "absolute"
};
const mobileMenuOverlay = { 
  position: "fixed", 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  background: "rgba(0,0,0,0.4)", 
  backdropFilter: "blur(5px)", 
  zIndex: 3000,
  display: "flex",
  justifyContent: "flex-start"
};
const logo = { fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "40px", display:"flex", alignItems:"center", justifyContent:"center" };
const nav = { flex: 1 };
const navItem = { display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "12px", cursor: "pointer", marginBottom: "8px", transition: "0.3s" };
const logoutBtnSide = { ...navItem, background: "rgba(255,255,255,0.18)", border: "none", marginTop: "auto", color: "#ff0a0a", width: "80%", justifyContent: "center", textAlign: "center", boxShadow: "none" };
const bellBtn = { position: "relative", width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "rgba(245,245,245,0.95)", color: "var(--text-main)", display: "inline-flex", justifyContent: "center", alignItems: "center", cursor: "pointer", marginRight: "8px" };
const notificationBadge = { position: "absolute", top: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "50%", background: "#dc3545", color: "#fff", fontSize: "11px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "700" };
const main = { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" };
const header = { background: "var(--card-bg)", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", position:"sticky", top:0, zIndex:100 };
const headerTitle = { margin: 0, fontSize: "16px", color:"var(--text-main)", letterSpacing:"1px" };
const userInfo = { display:"flex", alignItems:"center", gap:"10px" };
const avatar = { width:"35px", height:"35px", borderRadius:"50%", background:"var(--primary-light)", color:"var(--primary)", display:"flex", justifyContent:"center", alignItems:"center" };
const menuBtn = { background: "none", border: "none", fontSize: "20px", color: "#0b8f3a" };
const content = { padding: "30px" };
const statGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { padding: "20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "15px", color:"#fff" };
const statIcon = { width: "45px", height: "45px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const statVal = { fontSize: "22px", fontWeight: "bold" };
const statTitle = { fontSize: "11px", opacity: 0.8 };
const mainGrid = { display: "flex", gap: "25px", flexWrap: "wrap" };
const box = { background: "var(--card-bg)", padding: "25px", borderRadius: "25px", marginBottom: "25px", width: "100%" };
const boxTitle = { fontSize: "16px", margin: "0 0 20px 0", color: "var(--text-main)", fontWeight:"bold" };
const listRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "1px solid var(--glass-border)" };
const rowTitle = { fontWeight: "bold", fontSize: "14px", color: "var(--text-main)" };
const muted = { color: "#999", fontSize: "12px" };
const viewBtn = { background: "var(--primary)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", cursor:"pointer" };
const statusBanner = { padding:"20px", background:"var(--bg-main)", borderRadius:"20px", textAlign:"center", border:"1px solid var(--glass-border)", color: "var(--text-main)" };
const doneBadge = { color:"#0b8f3a", fontSize:"12px", fontWeight:"bold", display:"flex", alignItems:"center", gap:"5px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" };
const modalBox = { background: "var(--card-bg)", padding: "30px", borderRadius: "30px", width: "100%", maxWidth: "450px" };
const modalScroll = { maxHeight: "80vh", overflowY: "auto" };
const infoGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" };
const callBtn = { background: "var(--primary)", color: "#fff", textDecoration: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold" };
const navLink = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#4285F4", color: "#fff", padding: "15px", borderRadius: "15px", textDecoration: "none", fontWeight: "bold", marginBottom: "20px" };
const calcBox = { background: "var(--bg-main)", padding: "15px", borderRadius: "15px", border: "1px solid var(--glass-border)" };
const select = { flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)" };
const qtyInput = { width: "70px", padding: "10px", borderRadius: "10px", border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)" };
const addBtn = { background: "var(--primary)", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "10px", cursor:"pointer" };
const billList = { marginTop: "15px", padding: "10px", background: "var(--bg-main)", borderRadius: "10px", color: "var(--text-main)" };
const billRow = { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" };
const trashBtn = { background: "none", border: "none", color: "#dc3545", cursor: "pointer" };
const totalRow = { display: "flex", justifyContent: "space-between", marginTop: "10px", borderTop: "2px solid var(--glass-border)", paddingTop: "5px" };
const acceptBtn = { flex: 2, padding: "15px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "15px", fontWeight: "bold", cursor: "pointer" };
const rejectBtn = { flex: 1, padding: "15px", background: "var(--card-bg)", border: "1px solid var(--glass-border)", borderRadius: "15px", color: "var(--text-muted)", fontWeight: "bold", cursor: "pointer" };
const completeBtn = { flex: 1, padding: "15px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "15px", fontWeight: "bold", cursor: "pointer", opacity: 1 };
const otpBtn = { width: "100%", padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" };
const otpInput = { width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid var(--primary)", textAlign: "center", fontSize: "18px", fontWeight: "bold", letterSpacing: "5px", background: "var(--card-bg)", color: "var(--text-main)" };
const logoutBtnBig = { width: "100%", padding: "15px", background: "var(--card-bg)", color: "#dc3545", border: "1px solid rgba(220, 53, 69, 0.2)", borderRadius: "15px", fontWeight: "bold", marginTop: "20px", cursor: "pointer" };
const modeBtn = { flex: 1, padding: "10px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" };
const loaderStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-main)" };
const profileGrid = { marginTop: "10px" };
const tableContainer = { maxHeight: "400px", overflowY: "auto" };
const bottomNavStyle = { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card-bg)", display: "flex", justifyContent: "space-around", padding: "12px 10px 25px 10px", boxShadow: "0 -5px 25px rgba(0,0,0,0.05)", zIndex: 1500, borderTop: "1px solid var(--glass-border)" };
const bottomLinkStyle = { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" };

export default CollectorDashboard;
