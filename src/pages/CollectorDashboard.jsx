import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaRupeeSign,
  FaInfoCircle,
  FaTimes,
  FaPlus,
  FaTrash,
  FaUserAlt,
  FaWallet,
  FaBars,
  FaRecycle,
  FaHistory,
  FaCalculator,
  FaBell,
  FaStar,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
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
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  // Wallet states
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    upiId: "",
    name: "",
  });
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [withdrawalOtpSent, setWithdrawalOtpSent] = useState(false);
  const [withdrawalOtp, setWithdrawalOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  // Wallet deposit states
  const [showCollectorDepositModal, setShowCollectorDepositModal] =
    useState(false);
  const [collectorDepositForm, setCollectorDepositForm] = useState({
    amount: "",
    upiRefNo: "",
  });
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

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const showToast = (type, message) => setToast({ show: true, type, message });

  // Support ticket states
  const [tickets, setTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    message: "",
    category: "General",
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Profile Edit states
  const baseURL =
    (API.defaults.baseURL || "").replace(/\/api$/, "") ||
    "https://scrapvex-backend.onrender.com";
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    address: "",
    area: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const profileFileInputRef = React.useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    const interval = setInterval(async () => {
      try {
        const resP = await API.get("/collector/pickups", { hideLoader: true });
        if (resP.data?.success) {
          const newPickupsList = resP.data.pickups || [];
          setPickups((prev) => {
            if (prev.length > 0) {
              const hasNewPickup = newPickupsList.some(
                (np) => !prev.some((op) => op._id === np._id),
              );
              const hasStatusChange = newPickupsList.some((np) => {
                const matchingOld = prev.find((op) => op._id === np._id);
                return matchingOld && matchingOld.status !== np.status;
              });
              if (hasNewPickup || hasStatusChange) {
                playBellSound();
              }
            }
            return newPickupsList;
          });
        }
      } catch (e) {
        console.error("Collector polling error:", e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const filteredActivePickups = useMemo(() => {
    const list = pickups.filter((p) =>
      ["Pending", "Assigned", "Arrived", "In Progress"].includes(p.status),
    );
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p._id.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.mobile?.includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.scrapType?.toLowerCase().includes(q),
    );
  }, [pickups, searchQuery]);

  const filteredHistory = useMemo(() => {
    const list = pickups.filter((p) =>
      ["Completed", "Cancelled"].includes(p.status),
    );
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p._id.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.mobile?.includes(q) ||
        p.address?.toLowerCase().includes(q),
    );
  }, [pickups, searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return walletTransactions;
    const q = searchQuery.toLowerCase();
    return walletTransactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(q) ||
        t.amount?.toString().includes(q) ||
        t.type?.toLowerCase().includes(q),
    );
  }, [walletTransactions, searchQuery]);

  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter(
      (t) =>
        t.subject?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q) ||
        t.status?.toLowerCase().includes(q),
    );
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
    if (
      !collectorDepositForm.amount ||
      Number(collectorDepositForm.amount) <= 0
    ) {
      return showToast("error", "Please enter a valid deposit amount");
    }
    if (
      !collectorDepositForm.upiRefNo ||
      collectorDepositForm.upiRefNo.replace(/\D/g, "").length !== 12
    ) {
      return showToast(
        "error",
        "Please enter a valid 12-digit UPI Reference Number / UTR",
      );
    }
    try {
      setLoading(true);
      const { data } = await API.post("/wallet/deposit", {
        amount: Number(collectorDepositForm.amount),
        upiRefNo: collectorDepositForm.upiRefNo,
      });
      if (data.success) {
        showToast(
          "success",
          "Deposit request submitted! Admin will verify and credit your wallet shortly. 🏦",
        );
        setShowCollectorDepositModal(false);
        setCollectorDepositForm({ amount: "", upiRefNo: "" });
        setCollectorDepositStep(1);
        // Refresh wallet transactions
        const resW = await API.get("/wallet/info");
        setWalletTransactions(resW.data?.transactions || []);
        if (user) {
          const profileData = {
            ...user,
            walletBalance: resW.data?.balance || user.walletBalance,
          };
          setUser(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
        }
      }
    } catch (e) {
      showToast(
        "error",
        e.response?.data?.message || "Failed to submit deposit request",
      );
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
        API.get("/wallet/info"),
      ]);
      setPickups(resP.data?.pickups || []);
      setScrapItems(resI.data?.data || []);
      setNotifications(resN.data?.data || []);
      setReviews(resR.data?.data || []);
      setWalletTransactions(resW.data?.transactions || []);

      if (resProf.data) {
        const profileData = {
          ...resProf.data,
          walletBalance: resW.data?.balance || resProf.data.walletBalance,
        };
        setUser(profileData);
        setProfileForm({
          name: profileData.name || "",
          address: profileData.address || "",
          area: profileData.area || profileData.assignedCity || "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
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
        setUser((prev) => {
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
      return showToast(
        "error",
        "Maximum limit per single withdrawal is ₹20,000!",
      );
    }
    if (Number(amount) > (user?.walletBalance || 0)) {
      return showToast(
        "error",
        `Insufficient balance! Your balance is ₹${user?.walletBalance || 0}`,
      );
    }
    try {
      const { data } = await API.post("/wallet/withdraw/otp", {
        amount: Number(amount),
        upiId,
        name,
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
        otp: withdrawalOtp,
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
    if (
      !window.confirm(
        "Are you sure you want to cancel this pending withdrawal request? The funds will be refunded to your wallet immediately.",
      )
    ) {
      return;
    }
    try {
      const { data } = await API.post(`/wallet/withdraw/cancel/${txId}`);
      if (data.success) {
        showToast("success", "Withdrawal request cancelled successfully!");
        fetchWalletInfo();
      }
    } catch (e) {
      showToast(
        "error",
        e.response?.data?.message || "Failed to cancel withdrawal",
      );
    }
  };

  const markAllNotificationsRead = async () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    if (unreadCount === 0) return;
    try {
      await API.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        showToast(
          "success",
          `You are now ${data.isOnline ? "Online" : "Offline"}`,
        );
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Toggle failed");
    }
  };

  const addItemToBill = () => {
    if (!selectedItem || !qty) return;
    const item = scrapItems.find((i) => i._id === selectedItem);
    if (!item) return;
    setBillItems([
      ...billItems,
      {
        _id: Date.now(),
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: Number(qty),
        subtotal: item.price * Number(qty),
      },
    ]);
    setQty("");
  };

  const handleGenerateOTP = async () => {
    if (!selectedPickup || billItems.length === 0)
      return showToast("error", "Add items first");
    setOtpLoading(true);
    try {
      const payload = {
        amount: billItems.reduce((s, i) => s + i.subtotal, 0),
        items: billItems,
      };
      const { data } = await API.post(
        `/pickups/collector/generate-otp/${selectedPickup._id}`,
        payload,
      );
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
        payload.scrapType = billItems
          .map((i) => `${i.name} (${i.quantity}${i.unit})`)
          .join(", ");
      }
      const { data } = await API.put(
        `/pickups/collector/status/${id}`,
        payload,
      );
      if (data.success) {
        showToast("success", `Pickup ${status}`);
        setSelectedPickup(null);
        setBillItems([]);
        setOtp("");
        setOtpSent(false);
        fetchData(user?._id);
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Action failed");
    } finally {
      setLoadingId(null);
    }
  };

  const activePickups = useMemo(
    () =>
      (pickups || []).filter((p) =>
        ["pending", "assigned", "accepted", "rejected"].includes(
          p.status?.toLowerCase(),
        ),
      ),
    [pickups],
  );
  const history = useMemo(
    () =>
      (pickups || []).filter((p) => p.status?.toLowerCase() === "completed"),
    [pickups],
  );
  const earnings = useMemo(
    () => history.reduce((s, i) => s + (i.amount || 0), 0),
    [history],
  );

  const fetchTickets = async () => {
    try {
      const { data } = await API.get("/support-tickets");
      if (data.success) setTickets(data.tickets || []);
    } catch (e) {
      console.error("Ticket fetch error", e);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject || !newTicketForm.message)
      return showToast("error", "Subject aur message zaroori hai");
    setSubmittingTicket(true);
    try {
      const { data } = await API.post("/support-tickets", newTicketForm);
      if (data.success) {
        showToast(
          "success",
          "Ticket submit ho gayi! Admin jaldi reply karega.",
        );
        setShowTicketModal(false);
        setNewTicketForm({ subject: "", message: "", category: "General" });
        fetchTickets();
      }
    } catch (e) {
      showToast(
        "error",
        e.response?.data?.message || "Ticket submit nahi ho saki",
      );
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
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
    if (
      profileForm.newPassword &&
      profileForm.newPassword !== profileForm.confirmPassword
    ) {
      return showToast("error", "New passwords do not match");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("address", profileForm.address);
      formData.append("area", profileForm.area);
      if (profileForm.oldPassword)
        formData.append("oldPassword", profileForm.oldPassword);
      if (profileForm.newPassword)
        formData.append("newPassword", profileForm.newPassword);
      if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);

      const { data } = await API.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileForm((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading)
    return (
      <div style={loaderStyle}>
        <FaRecycle
          className="spin"
          style={{ fontSize: "45px", color: "var(--primary)" }}
        />
      </div>
    );

  const NavContent = () => (
    <>
      <NavItem
        active={activeTab === "overview"}
        icon={<FaRecycle />}
        text="Overview"
        onClick={() => {
          setActiveTab("overview");
          setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        active={activeTab === "mypickups"}
        icon={<FaTruck />}
        text="My Pickups"
        onClick={() => {
          setActiveTab("mypickups");
          setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        active={activeTab === "wallet"}
        icon={<FaWallet />}
        text="Wallet"
        onClick={() => {
          setActiveTab("wallet");
          fetchWalletInfo();
          setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        active={activeTab === "history"}
        icon={<FaHistory />}
        text="History"
        onClick={() => {
          setActiveTab("history");
          setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        active={activeTab === "notifications"}
        icon={<FaBell />}
        text={`Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        onClick={() => {
          setActiveTab("notifications");
          setIsMobileMenuOpen(false);
          markAllNotificationsRead();
        }}
      />
      <NavItem
        active={activeTab === "reviews"}
        icon={<FaStar />}
        text="Reviews"
        onClick={() => {
          setActiveTab("reviews");
          setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        active={activeTab === "support"}
        icon={<FaPhoneAlt />}
        text="Support"
        onClick={() => {
          setActiveTab("support");
          fetchTickets();
          setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        active={activeTab === "profile"}
        icon={<FaUserAlt />}
        text="My Profile"
        onClick={() => {
          setActiveTab("profile");
          setIsMobileMenuOpen(false);
        }}
      />
    </>
  );

  return (
    <div className="dashboard-root" style={container}>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

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
        <div style={logo}>
          <FaRecycle style={{ marginRight: "10px" }} /> Scrapvex
        </div>
        <nav style={nav}>
          <NavContent />
        </nav>
        <button style={logoutBtnSide} onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div style={main}>
        {/* HEADER */}
        <header style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              style={menuBtn}
              className="mobile-only"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <FaBars />
            </button>
            <h2 className="native-header-title" style={headerTitle}>COLLECTOR PORTAL</h2>
          </div>
          <div style={userInfo}>
            <div style={{ textAlign: "right" }} className="desktop-only">
              <div style={{ fontWeight: "bold", color: "var(--text-main)" }}>
                {user?.name}
              </div>
              <small
                style={{
                  color: user?.isOnline ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: user?.isOnline ? "var(--primary)" : "var(--text-muted)",
                    display: "inline-block",
                  }}
                ></span>
                {user?.isOnline ? "Online" : "Offline"}
              </small>
            </div>
            <button
              onClick={() => {
                setActiveTab("notifications");
                markAllNotificationsRead();
              }}
              style={bellBtn}
              title="Notifications"
            >
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span style={notificationBadge}>{unreadCount}</span>
              )}
            </button>
            <button
              onClick={toggleStatus}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {user?.isOnline ? (
                <FaToggleOn size={28} color="var(--primary)" />
              ) : (
                <FaToggleOff size={28} color="var(--text-muted)" />
              )}
            </button>
            <div
              style={{ ...avatar, cursor: "pointer" }}
              onClick={() => setActiveTab("profile")}
            >
              <FaUserAlt />
            </div>
          </div>
        </header>

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileMenuOpen && (
          <div
            style={mobileMenuOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div style={mobileSidebar} onClick={(e) => e.stopPropagation()}>
              <div style={{ ...logo, color: "#fff" }}>
                <FaRecycle style={{ marginRight: "10px" }} /> Scrapvex
              </div>
              <nav style={nav}>
                <NavContent />
              </nav>
              <button style={logoutBtnSide} onClick={logout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}

        <div className="native-content" style={content}>
          {activeTab === "overview" && (
            <div className="fade-up">
              <div style={{ padding: "0 0 20px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "900",
                        color: "var(--text-main)",
                        letterSpacing: "-0.03em",
                        margin: 0,
                      }}
                    >
                      Overview
                    </h2>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        margin: "4px 0 0 0",
                      }}
                    >
                      Welcome back, {user?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  className="grid-3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    className="kpi-card premium-card"
                    style={{
                      background: "var(--card-bg)",
                      padding: "20px",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="kpi-icon"
                      style={{
                        background: "rgba(52, 152, 219, 0.1)",
                        color: "#3498db",
                        width: "52px",
                        height: "52px",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      <FaTruck />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          fontWeight: "600",
                          letterSpacing: "0.5px",
                        }}
                      >
                        My Tasks
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "900",
                          color: "var(--text-main)",
                          letterSpacing: "-1px",
                        }}
                      >
                        {activePickups.length}
                      </div>
                    </div>
                  </div>
                  <div
                    className="kpi-card premium-card"
                    style={{
                      background: "var(--card-bg)",
                      padding: "20px",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="kpi-icon"
                      style={{
                        background: "rgba(46, 204, 113, 0.1)",
                        color: "#2ecc71",
                        width: "52px",
                        height: "52px",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      <FaCheckCircle />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          fontWeight: "600",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Jobs Done
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "900",
                          color: "var(--text-main)",
                          letterSpacing: "-1px",
                        }}
                      >
                        {history.length}
                      </div>
                    </div>
                  </div>
                  <div
                    className="kpi-card premium-card"
                    style={{
                      background: "var(--card-bg)",
                      padding: "20px",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="kpi-icon"
                      style={{
                        background: "rgba(155, 89, 182, 0.1)",
                        color: "#9b59b6",
                        width: "52px",
                        height: "52px",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      <FaRupeeSign />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          fontWeight: "600",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Wallet Balance
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "900",
                          color: "var(--text-main)",
                          letterSpacing: "-1px",
                        }}
                      >
                        Γé╣{user?.walletBalance || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
                    gap: "16px",
                  }}
                  className="grid-responsive"
                >
                  <div
                    className="premium-card"
                    style={{
                      background: "var(--card-bg)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                      padding: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "var(--text-main)",
                          margin: 0,
                        }}
                      >
                        Recent Tasks
                      </h3>
                      <button
                        onClick={() => setActiveTab("mypickups")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary)",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        View All
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {filteredActivePickups.slice(0, 3).map((p) => (
                        <div
                          key={p._id}
                          style={{
                            padding: "16px",
                            background: "var(--bg-main)",
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid var(--glass-border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: "700",
                                color: "var(--text-main)",
                                fontSize: "15px",
                              }}
                            >
                              {p.scrapType || "Mixed Scrap"}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "var(--text-muted)",
                                marginTop: "4px",
                              }}
                            >
                              {p.name} ΓÇó {p.address}
                            </div>
                          </div>
                          <button
                            className="btn-secondary"
                            style={{ padding: "8px 16px", fontSize: "12px" }}
                            onClick={() => setSelectedPickup(p)}
                          >
                            View
                          </button>
                        </div>
                      ))}
                      {activePickups.length === 0 && (
                        <div className="empty-state">
                          <div className="empty-state-icon">≡ƒÜÜ</div>
                          <h3 style={{ margin: "10px 0 5px 0" }}>
                            No active tasks
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              color: "var(--text-muted)",
                            }}
                          >
                            You have no ongoing pickups.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="premium-card"
                    style={{
                      background: "var(--card-bg)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "var(--text-main)",
                        margin: "0 0 20px 0",
                      }}
                    >
                      Live Status
                    </h3>
                    <div
                      style={{
                        padding: "30px 20px",
                        background: user?.isOnline
                          ? "rgba(11, 143, 58, 0.05)"
                          : "var(--bg-main)",
                        borderRadius: "var(--radius-lg)",
                        border: `1px solid ${user?.isOnline ? "rgba(11, 143, 58, 0.2)" : "var(--glass-border)"}`,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      {user?.isOnline ? (
                        <FaCheckCircle size={48} color="var(--primary)" />
                      ) : (
                        <FaClock size={48} color="var(--text-muted)" />
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "var(--text-main)",
                          }}
                        >
                          {user?.isOnline
                            ? "You are Online"
                            : "You are Offline"}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--text-muted)",
                            marginTop: "6px",
                          }}
                        >
                          {user?.isOnline
                            ? "Ready to receive new tasks."
                            : "Switch online to receive work."}
                        </div>
                      </div>
                      <button
                        onClick={toggleStatus}
                        className={
                          user?.isOnline ? "btn-secondary" : "btn-premium"
                        }
                        style={{
                          marginTop: "8px",
                          width: "100%",
                          padding: "12px",
                        }}
                      >
                        {user?.isOnline ? "Go Offline" : "Go Online"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mypickups" && (
            <div className="fade-up">
              <div style={{ padding: "0 0 20px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "900",
                        color: "var(--text-main)",
                        letterSpacing: "-0.03em",
                        margin: 0,
                      }}
                    >
                      My Pickups
                    </h2>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        margin: "4px 0 0 0",
                      }}
                    >
                      {activePickups.length} active tasks assigned to you
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {filteredActivePickups.map((p) => (
                  <div
                    key={p._id}
                    className="premium-card"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "20px",
                      boxShadow: "var(--card-shadow)",
                      borderLeft: `5px solid ${p.status?.toLowerCase() === "pending" ? "var(--warning, #f39c12)" : "var(--primary)"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: "800",
                            fontSize: "18px",
                            color: "var(--text-main)",
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--text-muted)",
                            marginTop: "6px",
                          }}
                        >
                          ≡ƒôì {p.address}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            marginTop: "6px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <FaRecycle color="var(--primary)" />{" "}
                          {p.scrapType || "Mixed Scrap"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          alignItems: "flex-end",
                        }}
                      >
                        <span
                          className={`badge-status badge-${p.status?.toLowerCase() === "pending" ? "pending" : p.status?.toLowerCase() === "accepted" ? "active" : "completed"}`}
                        >
                          {p.status}
                        </span>
                        {p.collector && (
                          <span
                            style={{
                              fontSize: "11px",
                              background: "var(--bg-main)",
                              border: "1px solid var(--glass-border)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              color: "var(--text-muted)",
                              fontWeight: "600",
                            }}
                          >
                            Assigned to you
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        gap: "12px",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--glass-border)",
                        paddingTop: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          fontWeight: "600",
                        }}
                      >
                        ≡ƒùô {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "10px 16px" }}
                          onClick={() => setSelectedPickup(p)}
                        >
                          View Details
                        </button>
                        {p.status?.toLowerCase() === "pending" && (
                          <button
                            className="btn-premium"
                            style={{
                              background: "var(--warning, #f39c12)",
                              color: "#fff",
                              border: "none",
                              padding: "10px 16px",
                            }}
                            onClick={() => handleAction(p._id, "Accepted")}
                          >
                            Accept Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {activePickups.length === 0 && (
                  <div
                    className="empty-state premium-card"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "50px 20px",
                    }}
                  >
                    <div className="empty-state-icon">≡ƒô¡</div>
                    <h3>No Assigned Pickups</h3>
                    <p>
                      You don't have any pending or accepted pickups right now.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="fade-up">
              <div style={{ padding: "0 0 20px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "900",
                        color: "var(--text-main)",
                        letterSpacing: "-0.03em",
                        margin: 0,
                      }}
                    >
                      My Wallet
                    </h2>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        margin: "4px 0 0 0",
                      }}
                    >
                      Manage your earnings and funds
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    <button
                      className="btn-secondary"
                      style={{
                        background: "var(--bg-main)",
                        color: "var(--primary)",
                        borderColor: "var(--primary)",
                      }}
                      onClick={() => {
                        setCollectorDepositForm({ amount: "", upiRefNo: "" });
                        setCollectorDepositStep(1);
                        setShowCollectorDepositModal(true);
                      }}
                    >
                      <FaPlus /> Add Funds
                    </button>
                    <button
                      className="btn-premium"
                      onClick={() => {
                        setWithdrawalForm({
                          amount: "",
                          upiId: "",
                          name: user?.name || "",
                        });
                        setWithdrawalModal(true);
                      }}
                    >
                      <FaRupeeSign /> Withdraw Money
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                    borderRadius: "var(--radius-xl)",
                    padding: "35px 30px",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 15px 30px rgba(11, 143, 58, 0.3)",
                  }}
                >
                  <FaWallet
                    size={160}
                    style={{
                      position: "absolute",
                      right: "-30px",
                      bottom: "-30px",
                      opacity: 0.1,
                      transform: "rotate(-15deg)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "14px",
                      opacity: 0.9,
                      marginBottom: "10px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Available Balance
                  </div>
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: "900",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Γé╣{user?.walletBalance || 0}
                  </div>
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "var(--text-main)",
                      marginBottom: "16px",
                    }}
                  >
                    Transaction History
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {filteredTransactions.map((tx) => (
                      <div
                        key={tx._id}
                        className="premium-card"
                        style={{
                          background: "var(--card-bg)",
                          padding: "20px",
                          borderRadius: "var(--radius-xl)",
                          border: "1px solid var(--card-border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "14px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              background:
                                tx.type === "credit"
                                  ? "rgba(46, 204, 113, 0.1)"
                                  : "rgba(231, 76, 60, 0.1)",
                              color:
                                tx.type === "credit" ? "#2ecc71" : "#e74c3c",
                              fontSize: "20px",
                            }}
                          >
                            {tx.type === "credit" ? (
                              <FaRupeeSign />
                            ) : (
                              <FaRupeeSign />
                            )}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: "700",
                                color: "var(--text-main)",
                                fontSize: "15px",
                              }}
                            >
                              {tx.description}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "var(--text-muted)",
                                marginTop: "4px",
                              }}
                            >
                              {new Date(tx.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            alignItems: "flex-end",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "800",
                              fontSize: "18px",
                              color:
                                tx.type === "credit" ? "#2ecc71" : "#e74c3c",
                            }}
                          >
                            {tx.type === "credit" ? "+" : "-"}Γé╣{tx.amount}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            {tx.type === "debit" &&
                              tx.source === "withdrawal" &&
                              tx.status === "pending" && (
                                <button
                                  style={{
                                    background: "rgba(231, 76, 60, 0.1)",
                                    color: "#e74c3c",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleCancelWithdrawal(tx._id)}
                                >
                                  Cancel & Refund
                                </button>
                              )}
                            <span
                              className={`badge-status badge-${tx.status?.toLowerCase() === "pending" ? "pending" : tx.status?.toLowerCase() === "completed" ? "completed" : "cancelled"}`}
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {walletTransactions.length === 0 && (
                      <div
                        className="empty-state premium-card"
                        style={{
                          background: "var(--card-bg)",
                          border: "1px solid var(--card-border)",
                          borderRadius: "var(--radius-xl)",
                          padding: "50px 20px",
                        }}
                      >
                        <div className="empty-state-icon">≡ƒÆ│</div>
                        <h3>No Transactions</h3>
                        <p>Your wallet transaction history will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="fade-up">
              <div style={{ padding: "0 0 20px 0" }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "900",
                    color: "var(--text-main)",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  Completed Jobs
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    margin: "4px 0 0 0",
                  }}
                >
                  Review your past successful pickups
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {filteredHistory.map((p) => (
                  <div
                    key={p._id}
                    className="premium-card"
                    style={{
                      background: "var(--card-bg)",
                      padding: "20px",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          background: "var(--bg-main)",
                          border: "1px solid var(--glass-border)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                          }}
                        >
                          {new Date(p.createdAt).toLocaleString("default", {
                            month: "short",
                          })}
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "900",
                            color: "var(--text-main)",
                          }}
                        >
                          {new Date(p.createdAt).getDate()}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: "800",
                            color: "var(--text-main)",
                            fontSize: "16px",
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {p.scrapType || p.address}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: "900",
                          fontSize: "18px",
                          color: "var(--success, #2ecc71)",
                        }}
                      >
                        Γé╣{p.amount || 0}
                      </div>
                      <div style={{ marginTop: "6px" }}>
                        <span className="badge-status badge-completed">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div
                    className="empty-state premium-card"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "50px 20px",
                    }}
                  >
                    <div className="empty-state-icon">≡ƒôï</div>
                    <h3>No Completed Jobs</h3>
                    <p>You haven't completed any pickups yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="fade-up">
              <div style={{ padding: "0 0 20px 0" }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "900",
                    color: "var(--text-main)",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  Alerts
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    margin: "4px 0 0 0",
                  }}
                >
                  Stay updated with important notifications
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className="premium-card"
                    style={{
                      background: n.isRead
                        ? "var(--card-bg)"
                        : "var(--primary-light)",
                      padding: "20px",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid",
                      borderColor: n.isRead
                        ? "var(--card-border)"
                        : "var(--primary)",
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {!n.isRead && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          background: "var(--primary)",
                        }}
                      ></div>
                    )}
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "var(--bg-main)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "var(--primary)",
                        flexShrink: 0,
                      }}
                    >
                      <FaBell size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "800",
                            color: "var(--text-main)",
                            fontSize: "15px",
                          }}
                        >
                          {n.title || "Notification"}
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            fontWeight: "600",
                          }}
                        >
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "var(--text-muted)",
                          lineHeight: "1.5",
                        }}
                      >
                        {n.message || n.body || "No details available."}
                      </p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div
                    className="empty-state premium-card"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "50px 20px",
                    }}
                  >
                    <div className="empty-state-icon">≡ƒöö</div>
                    <h3>All Caught Up!</h3>
                    <p>No new alerts available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="fade-up">
              <div style={{ padding: "0 0 20px 0" }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "900",
                    color: "var(--text-main)",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  Reviews
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    margin: "4px 0 0 0",
                  }}
                >
                  Customer feedback and ratings
                </p>
              </div>

              <div
                className="premium-card"
                style={{
                  background:
                    "linear-gradient(135deg, #f39c12 0%, #d35400 100%)",
                  borderRadius: "var(--radius-xl)",
                  padding: "30px",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                      opacity: 0.9,
                    }}
                  >
                    Average Rating
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "42px",
                        fontWeight: "900",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {reviews.length > 0
                        ? (
                            reviews.reduce((s, r) => s + (r.rating || 0), 0) /
                            reviews.length
                          ).toFixed(1)
                        : "0.0"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        color: "#fff",
                        fontSize: "20px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                  </div>
                </div>
                <FaStar size={80} style={{ opacity: 0.2 }} />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {reviews.map((r) => (
                  <div
                    key={r._id}
                    className="premium-card"
                    style={{
                      background: "var(--card-bg)",
                      padding: "20px",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            color: "#f39c12",
                            gap: "2px",
                            marginBottom: "6px",
                          }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={
                                i < (r.rating || 0)
                                  ? "#f39c12"
                                  : "var(--glass-border)"
                              }
                            />
                          ))}
                        </div>
                        <div
                          style={{
                            fontWeight: "800",
                            color: "var(--text-main)",
                            fontSize: "15px",
                          }}
                        >
                          {r.title || `Rating ${r.rating || "-"}`}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          fontWeight: "600",
                        }}
                      >
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        lineHeight: "1.5",
                      }}
                    >
                      "{r.comment || r.message || "No comment provided."}"
                    </p>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-main)",
                        fontWeight: "700",
                      }}
                    >
                      - {r.user?.name || r.userName || "Customer"}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div
                    className="empty-state premium-card"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "50px 20px",
                    }}
                  >
                    <div className="empty-state-icon">Γ¡É</div>
                    <h3>No Reviews Yet</h3>
                    <p>Complete pickups to receive customer feedback.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="fade-up">
              <div
                style={{
                  padding: "0 0 20px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "900",
                      color: "var(--text-main)",
                      letterSpacing: "-0.03em",
                      margin: 0,
                    }}
                  >
                    Support
                  </h2>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Help and support tickets
                  </p>
                </div>
                <button
                  className="btn-premium"
                  onClick={() => setShowTicketModal(true)}
                >
                  <FaPlus /> Raise Ticket
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {filteredTickets.map((t) => (
                  <div
                    key={t._id}
                    className="premium-card"
                    style={{
                      background: "var(--card-bg)",
                      padding: "20px",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              background: "var(--bg-main)",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "1px solid var(--glass-border)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {t.category}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: "800",
                            color: "var(--text-main)",
                            fontSize: "16px",
                          }}
                        >
                          {t.subject}
                        </div>
                      </div>
                      <span
                        className={`badge-status badge-${t.status?.toLowerCase() === "open" ? "active" : t.status?.toLowerCase() === "resolved" ? "completed" : "pending"}`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        lineHeight: "1.5",
                      }}
                    >
                      {t.message}
                    </p>
                    {t.replies && t.replies.length > 0 && (
                      <div
                        style={{
                          background: "var(--bg-main)",
                          borderRadius: "var(--radius-lg)",
                          padding: "16px",
                          borderLeft: "4px solid var(--primary)",
                          marginTop: "16px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            color: "var(--primary)",
                            marginBottom: "6px",
                            textTransform: "uppercase",
                          }}
                        >
                          Admin Reply
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            lineHeight: "1.5",
                          }}
                        >
                          {t.replies[t.replies.length - 1].message}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div
                    className="empty-state premium-card"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "50px 20px",
                    }}
                  >
                    <div className="empty-state-icon">≡ƒÄº</div>
                    <h3>No Support Tickets</h3>
                    <p>You haven't raised any support requests yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="fade-up">
              <div
                style={{
                  padding: "0 0 20px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "900",
                    color: "var(--text-main)",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  My Profile
                </h2>
                {!editProfileMode && (
                  <button
                    className="btn-secondary"
                    onClick={() => setEditProfileMode(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div
                className="premium-card"
                style={{
                  background: "var(--card-bg)",
                  padding: "30px",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--card-border)",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "24px",
                    marginBottom: editProfileMode ? "30px" : "0",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile"
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid var(--primary)",
                          padding: "3px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "50%",
                          background: "var(--primary-light)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "3px solid var(--primary)",
                          padding: "3px",
                        }}
                      >
                        <FaUserAlt size={40} color="var(--primary)" />
                      </div>
                    )}
                    {editProfileMode && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0",
                          right: "0",
                          width: "32px",
                          height: "32px",
                          background: "var(--primary)",
                          color: "#fff",
                          borderRadius: "50%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "3px solid var(--card-bg)",
                          cursor: "pointer",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        }}
                        onClick={() => profileFileInputRef.current.click()}
                      >
                        <FaPlus size={14} />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={profileFileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                    />
                  </div>
                  <div>
                    <h2
                      style={{
                        margin: "0 0 6px 0",
                        color: "var(--text-main)",
                        fontSize: "24px",
                        fontWeight: "900",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {user?.name}
                    </h2>
                    <div
                      style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "800",
                        display: "inline-block",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {user?.role || "collector"}
                    </div>
                  </div>
                </div>

                {editProfileMode ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileFormChange}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-main)",
                            color: "var(--text-main)",
                            fontSize: "15px",
                            transition: "0.2s",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "var(--primary)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "var(--glass-border)")
                          }
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          value={user?.mobile || ""}
                          disabled
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-subtle)",
                            color: "var(--text-muted)",
                            fontSize: "15px",
                            opacity: 0.8,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          Email
                        </label>
                        <input
                          type="text"
                          value={user?.email || ""}
                          disabled
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-subtle)",
                            color: "var(--text-muted)",
                            fontSize: "15px",
                            opacity: 0.8,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={profileForm.address}
                          onChange={handleProfileFormChange}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-main)",
                            color: "var(--text-main)",
                            fontSize: "15px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          Area (City)
                        </label>
                        <input
                          type="text"
                          name="area"
                          value={profileForm.area}
                          onChange={handleProfileFormChange}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-main)",
                            color: "var(--text-main)",
                            fontSize: "15px",
                          }}
                        />
                      </div>
                    </div>

                    <h4
                      style={{
                        margin: "10px 0 0 0",
                        color: "var(--text-main)",
                        fontSize: "16px",
                        borderBottom: "1px solid var(--glass-border)",
                        paddingBottom: "10px",
                      }}
                    >
                      Change Password
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          Old Password
                        </label>
                        <input
                          type="password"
                          name="oldPassword"
                          value={profileForm.oldPassword}
                          onChange={handleProfileFormChange}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-main)",
                            color: "var(--text-main)",
                            fontSize: "15px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={profileForm.newPassword}
                          onChange={handleProfileFormChange}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-main)",
                            color: "var(--text-main)",
                            fontSize: "15px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                          }}
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={profileForm.confirmPassword}
                          onChange={handleProfileFormChange}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--glass-border)",
                            outline: "none",
                            background: "var(--bg-main)",
                            color: "var(--text-main)",
                            fontSize: "15px",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "20px",
                      }}
                    >
                      <button
                        className="btn-premium"
                        style={{ flex: 1, padding: "16px", fontSize: "15px" }}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? (
                          <FaRecycle className="spin" />
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ flex: 1, padding: "16px", fontSize: "15px" }}
                        onClick={() => {
                          setEditProfileMode(false);
                          setProfileForm((prev) => ({
                            ...prev,
                            name: user?.name,
                            address: user?.address,
                            area: user?.area || user?.assignedCity,
                            oldPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          }));
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: "30px",
                      borderTop: "1px solid var(--glass-border)",
                      paddingTop: "30px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        marginBottom: "30px",
                      }}
                      className="grid-responsive"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Mobile
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "var(--text-main)",
                          }}
                        >
                          {user?.mobile || "-"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Email
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "var(--text-main)",
                          }}
                        >
                          {user?.email || "-"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Address
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "var(--text-main)",
                          }}
                        >
                          {user?.address || "-"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Area
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "var(--text-main)",
                          }}
                        >
                          {user?.area || user?.assignedCity || "-"}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        flexWrap: "wrap",
                        borderTop: "1px solid var(--glass-border)",
                        paddingTop: "24px",
                      }}
                    >
                      <button
                        className="btn-secondary"
                        onClick={() => setActiveTab("overview")}
                      >
                        Back to Dashboard
                      </button>
                      <button className="btn-danger" onClick={logout}>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL & BILLING MODAL */}
      {selectedPickup && (
        <Modal
          title="Manage Pickup"
          onClose={() => {
            setSelectedPickup(null);
            setBillItems([]);
            setOtp("");
            setOtpSent(false);
          }}
        >
          <div style={modalScroll}>
            <div style={infoGrid}>
              <InfoItem label="Name" value={selectedPickup.name} />
              <InfoItem
                label="Mobile"
                value={
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {selectedPickup.mobile}
                    <a
                      href={`tel:${selectedPickup.mobile}`}
                      style={{ ...callBtn, background: "var(--primary)" , color: "#fff"}}
                    >
                      Call
                    </a>
                  </div>
                }
              />
              <div style={{ gridColumn: "span 2" }}>
                <InfoItem label="Address" value={selectedPickup.address} />
                <a
                  href={(() => {
                    if (selectedPickup.lat && selectedPickup.lng)
                      return `https://www.google.com/maps/dir/?api=1&destination=${selectedPickup.lat},${selectedPickup.lng}`;
                    if (selectedPickup.latitude && selectedPickup.longitude)
                      return `https://www.google.com/maps/dir/?api=1&destination=${selectedPickup.latitude},${selectedPickup.longitude}`;
                    const match = selectedPickup.address?.match(
                      /GPS:\s*([0-9.-]+),\s*([0-9.-]+)/i,
                    );
                    if (match)
                      return `https://www.google.com/maps/dir/?api=1&destination=${match[1]},${match[2]}`;
                    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPickup.address)}`;
                  })()}
                  target="_blank"
                  rel="noreferrer"
                  style={navLink}
                >
                  <FaMapMarkerAlt /> Open Direct Live GPS Navigation
                </a>
              </div>
            </div>

            {selectedPickup.status === "Accepted" ? (
              <div style={calcBox}>
                <h4 style={{ margin: "0 0 10px 0" }}>
                  <FaCalculator /> Bill Calculator
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "15px",
                    flexWrap: "nowrap",
                    alignItems: "center",
                  }}
                >
                  <select
                    style={{ ...select, minWidth: "120px" }}
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    <option value="">Select Item</option>
                    {scrapItems.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.name} (₹{i.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    style={{ ...qtyInput, minWidth: "70px" }}
                    placeholder="Qty"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                  <button
                    style={{
                      ...addBtn,
                      minWidth: "45px",
                      height: "45px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onClick={addItemToBill}
                  >
                    <FaPlus size={18} />
                  </button>
                </div>
                {billItems.length > 0 && (
                  <div style={billList}>
                    {billItems.map((bi) => (
                      <div key={bi._id} style={billRow}>
                        <span>{bi.name}</span>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <span>
                            {bi.quantity}
                            {bi.unit} = <strong>₹{bi.subtotal}</strong>
                          </span>
                          <button
                            style={trashBtn}
                            onClick={() =>
                              setBillItems(
                                billItems.filter((x) => x._id !== bi._id),
                              )
                            }
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={totalRow}>
                      <span>Grand Total:</span>{" "}
                      <strong>
                        ₹{billItems.reduce((s, i) => s + i.subtotal, 0)}
                      </strong>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "15px",
                    borderTop: "1px solid var(--glass-border)",
                    paddingTop: "15px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Payment Method:
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setPaymentMode("wallet")}
                      style={{
                        ...modeBtn,
                        background:
                          paymentMode === "wallet"
                            ? "var(--primary)"
                            : "var(--bg-main)",
                        color:
                          paymentMode === "wallet"
                            ? "#fff"
                            : "var(--text-main)",
                        border:
                          paymentMode === "wallet"
                            ? "none"
                            : "1px solid var(--glass-border)",
                      }}
                    >
                      Wallet
                    </button>
                    <button
                      onClick={() => setPaymentMode("cash")}
                      style={{
                        ...modeBtn,
                        background:
                          paymentMode === "cash"
                            ? "var(--primary)"
                            : "var(--bg-main)",
                        color:
                          paymentMode === "cash" ? "#fff" : "var(--text-main)",
                        border:
                          paymentMode === "cash"
                            ? "none"
                            : "1px solid var(--glass-border)",
                      }}
                    >
                      Cash
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    background: "var(--primary-light)",
                    padding: "15px",
                    borderRadius: "15px",
                  }}
                >
                  {!otpSent ? (
                    <button
                      style={otpBtn}
                      onClick={handleGenerateOTP}
                      disabled={otpLoading || billItems.length === 0}
                    >
                      {otpLoading ? (
                        <FaRecycle className="spin" />
                      ) : (
                        "Generate OTP & Send Bill"
                      )}
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <small style={{ color: "var(--primary)" }}>
                        ✓ Bill sent. Enter OTP:
                      </small>
                      <input
                        type="text"
                        placeholder="OTP"
                        style={{ ...otpInput, borderColor: "var(--primary)" }}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.slice(0, 4))}
                      />
                      <button
                        style={{
                          ...otpBtn,
                          background: "var(--card-bg)",
                          color: "var(--primary)",
                          border: "1px solid var(--primary)",
                        }}
                        onClick={handleGenerateOTP}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {selectedPickup.status !== "Accepted" ? (
                <>
                  <button
                    style={acceptBtn}
                    onClick={() => handleAction(selectedPickup._id, "Accepted")}
                  >
                    Accept Request
                  </button>
                  <button
                    style={rejectBtn}
                    onClick={() => handleAction(selectedPickup._id, "Rejected")}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  style={{
                    ...completeBtn,
                    opacity: !otpSent || otp.length < 4 ? 0.5 : 1,
                  }}
                  disabled={
                    billItems.length === 0 || !otpSent || otp.length < 4
                  }
                  onClick={() => handleAction(selectedPickup._id, "Completed")}
                >
                  {loadingId ? (
                    <FaRecycle className="spin" />
                  ) : (
                    "Finalize & Mark Complete"
                  )}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showTicketModal && (
        <Modal
          title="Raise Support Ticket"
          onClose={() => setShowTicketModal(false)}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Category
              </label>
              <select
                style={{ ...select, width: "100%", boxSizing: "border-box" }}
                value={newTicketForm.category}
                onChange={(e) =>
                  setNewTicketForm({
                    ...newTicketForm,
                    category: e.target.value,
                  })
                }
              >
                <option value="General">General</option>
                <option value="Payment">Payment Issue</option>
                <option value="Pickup">Pickup Problem</option>
                <option value="Technical">Technical Bug</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Subject
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "var(--bg-main)",
                  color: "var(--text-main)",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder="Short subject..."
                value={newTicketForm.subject}
                onChange={(e) =>
                  setNewTicketForm({
                    ...newTicketForm,
                    subject: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Describe your problem
              </label>
              <textarea
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "var(--bg-main)",
                  color: "var(--text-main)",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  height: "100px",
                  resize: "vertical",
                }}
                placeholder="Explain your issue clearly..."
                value={newTicketForm.message}
                onChange={(e) =>
                  setNewTicketForm({
                    ...newTicketForm,
                    message: e.target.value,
                  })
                }
              />
            </div>
            <button
              style={{
                ...viewBtn,
                width: "100%",
                padding: "15px",
                justifyContent: "center",
                display: "flex",
              }}
              onClick={handleCreateTicket}
              disabled={submittingTicket}
            >
              {submittingTicket ? (
                <FaRecycle className="spin" />
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </Modal>
      )}

      {withdrawalModal && (
        <Modal
          title="Request UPI Withdrawal"
          onClose={() => {
            setWithdrawalModal(false);
            setWithdrawalOtpSent(false);
            setWithdrawalOtp("");
            setDemoOtp("");
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {!withdrawalOtpSent ? (
              <>
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "12px",
                      border: "1px solid var(--glass-border)",
                      background: "var(--bg-main)",
                      color: "var(--text-main)",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    placeholder="Minimum ₹100..."
                    value={withdrawalForm.amount}
                    onChange={(e) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    UPI ID
                  </label>
                  <input
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "12px",
                      border: "1px solid var(--glass-border)",
                      background: "var(--bg-main)",
                      color: "var(--text-main)",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. username@upi"
                    value={withdrawalForm.upiId}
                    onChange={(e) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        upiId: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Account Holder Name
                  </label>
                  <input
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "12px",
                      border: "1px solid var(--glass-border)",
                      background: "var(--bg-main)",
                      color: "var(--text-main)",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    placeholder="Your full name..."
                    value={withdrawalForm.name}
                    onChange={(e) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    background: "rgba(142, 68, 173, 0.05)",
                    borderLeft: "3px solid var(--primary)",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>🔒 Multi-Factor Authentication:</strong> A unique
                  verification code (OTP) will be sent to your registered mobile
                  number to prevent unauthorized withdrawals.
                </div>

                <button
                  style={{
                    ...viewBtn,
                    width: "100%",
                    padding: "15px",
                    justifyContent: "center",
                    display: "flex",
                    fontSize: "14px",
                    fontWeight: "bold",
                    background: "var(--primary)",
                  }}
                  onClick={handleSendWithdrawalOTP}
                >
                  Verify & Send Security OTP
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    background: "var(--bg-main)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid var(--glass-border)",
                    fontSize: "13px",
                  }}
                >
                  <div
                    style={{ marginBottom: "5px", color: "var(--text-muted)" }}
                  >
                    Confirming Payout Details:
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: "var(--primary)",
                      marginBottom: "10px",
                    }}
                  >
                    ₹{withdrawalForm.amount}
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    <strong>UPI ID:</strong> {withdrawalForm.upiId}
                  </div>
                  <div style={{ color: "var(--text-main)", marginTop: "3px" }}>
                    <strong>Holder:</strong> {withdrawalForm.name}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Enter 6-Digit Security OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "12px",
                      border: "1px solid var(--primary)",
                      background: "var(--bg-main)",
                      color: "var(--text-main)",
                      fontSize: "20px",
                      fontWeight: "bold",
                      textAlign: "center",
                      letterSpacing: "8px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    placeholder="••••••"
                    value={withdrawalOtp}
                    onChange={(e) =>
                      setWithdrawalOtp(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                  />
                </div>

                <button
                  style={{
                    ...viewBtn,
                    width: "100%",
                    padding: "15px",
                    justifyContent: "center",
                    display: "flex",
                    fontSize: "14px",
                    fontWeight: "bold",
                    background: "var(--primary)",
                  }}
                  onClick={handleRequestWithdrawal}
                >
                  Confirm & Request Payout
                </button>

                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "5px",
                  }}
                  onClick={() => {
                    setWithdrawalOtpSent(false);
                    setWithdrawalOtp("");
                  }}
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
        <Modal
          title="Add Funds via UPI QR"
          onClose={() => {
            setShowCollectorDepositModal(false);
            setCollectorDepositForm({ amount: "", upiRefNo: "" });
            setCollectorDepositStep(1);
          }}
        >
          <div
            style={{ ...modalScroll, maxHeight: "75vh", paddingRight: "5px" }}
          >
            {collectorDepositStep === 1 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    lineHeight: "1.5",
                  }}
                >
                  Enter the amount you want to add to your wallet balance.
                </p>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={collectorDepositForm.amount}
                    onChange={(e) =>
                      setCollectorDepositForm({
                        ...collectorDepositForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="e.g. 500"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--glass-border)",
                      background: "var(--card-bg)",
                      color: "var(--text-main)",
                      boxSizing: "border-box",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <button
                  style={{
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  onClick={() => {
                    if (
                      !collectorDepositForm.amount ||
                      Number(collectorDepositForm.amount) < 1000
                    ) {
                      return showToast(
                        "error",
                        "Minimum deposit amount is ₹1,000!",
                      );
                    }
                    setCollectorDepositStep(2);
                  }}
                >
                  Proceed to Pay ➡️
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    background: "var(--bg-main)",
                    padding: "15px",
                    borderRadius: "15px",
                    textAlign: "center",
                    border: "1px solid var(--glass-border)",
                    boxSizing: "border-box",
                  }}
                >
                  <span
                    style={{ fontSize: "13px", color: "var(--text-muted)" }}
                  >
                    Depositing Amount
                  </span>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "var(--primary)",
                      marginTop: "5px",
                    }}
                  >
                    ₹{collectorDepositForm.amount}
                  </div>
                </div>

                {/* Dynamic QR Code */}
                <div
                  style={{
                    background: "#fff",
                    padding: "15px",
                    borderRadius: "20px",
                    border: "1px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId || "8491028539@pthdfc"}&pn=Scrapvex&am=${collectorDepositForm.amount}&tn=WalletDeposit`)}`}
                    alt="UPI QR Code"
                    style={{
                      width: "160px",
                      height: "160px",
                      display: "block",
                      margin: "0 auto",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=${encodeURIComponent(`upi://pay?pa=${settings.upiId || "8491028539@pthdfc"}&pn=Scrapvex&am=${collectorDepositForm.amount}&tn=WalletDeposit`)}`;
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: "-5px",
                    fontWeight: "bold",
                    color: "var(--primary)",
                    fontSize: "14px",
                  }}
                >
                  UPI ID: {settings.upiId || "8491028539@pthdfc"}
                </div>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {/* Mobile deep link with warning check */}
                  <a
                    href={`upi://pay?pa=${settings.upiId || "8491028539@pthdfc"}&pn=Scrapvex&am=${collectorDepositForm.amount}&tn=WalletDeposit`}
                    className="btn-premium"
                    style={{
                      width: "100%",
                      textDecoration: "none",
                      textAlign: "center",
                      background: "#0b8f3a",
                      color: "#fff",
                      padding: "12px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      boxSizing: "border-box",
                      display: "block",
                    }}
                    onClick={(e) => {
                      const isMobile = /Android|iPhone|iPad|iPod/i.test(
                        navigator.userAgent,
                      );
                      if (!isMobile) {
                        e.preventDefault();
                        alert(
                          "📲 UPI Mobile App deep links only work directly on mobile devices (Android/iOS). On a laptop, please scan the QR Code shown above using your phone's GPay/PhonePe camera scan!",
                        );
                      }
                    }}
                  >
                    Pay via UPI Apps 📱
                  </a>
                </div>

                <div
                  style={{
                    width: "100%",
                    borderTop: "1px dashed var(--glass-border)",
                    paddingTop: "15px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Enter 12-digit UPI Ref No. / UTR *
                  </label>
                  <input
                    type="text"
                    value={collectorDepositForm.upiRefNo}
                    onChange={(e) =>
                      setCollectorDepositForm({
                        ...collectorDepositForm,
                        upiRefNo: e.target.value,
                      })
                    }
                    placeholder="Enter 12-digit UTR/Ref number"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--glass-border)",
                      background: "var(--card-bg)",
                      color: "var(--text-main)",
                      boxSizing: "border-box",
                      fontSize: "14px",
                      fontFamily: "monospace",
                      letterSpacing: "1px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "var(--card-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-muted)",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                    onClick={() => setCollectorDepositStep(1)}
                  >
                    Back
                  </button>
                  <button
                    style={{
                      flex: 2,
                      padding: "12px",
                      background: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
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
        <BottomLink
          icon={<FaRecycle size={22} />}
          text="Home"
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <BottomLink
          icon={<FaTruck size={22} />}
          text="Pickups"
          active={activeTab === "mypickups"}
          onClick={() => setActiveTab("mypickups")}
        />
        <BottomLink
          icon={<FaWallet size={22} />}
          text="Wallet"
          active={activeTab === "wallet"}
          onClick={() => {
            setActiveTab("wallet");
            fetchWalletInfo();
          }}
        />
        <BottomLink
          icon={<FaHistory size={22} />}
          text="History"
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        />
        <BottomLink
          icon={<FaBars size={22} />}
          text="Menu"
          active={false}
          onClick={() => setIsMobileMenuOpen(true)}
        />
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */
const StatCard = ({ icon, title, value, grad }) => (
  <div style={{ ...statCard, background: grad }} className="premium-card">
    <div className="native-stat-icon" style={statIcon}>{icon}</div>
    <div style={{ color: "#fff" }}>
      <div className="native-stat-val" style={statVal}>{value}</div>
      <div style={statTitle}>{title}</div>
    </div>
  </div>
);

const NavItem = ({ active, icon, text, onClick }) => (
  <div
    style={{
      ...navItem,
      background: active ? "rgba(255,255,255,0.18)" : "transparent",
      color: "#fff",
      boxShadow: active ? "0 8px 20px rgba(0,0,0,0.12)" : "none",
    }}
    onClick={onClick}
    className="sidebar-item"
  >
    {icon} <span>{text}</span>
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <div style={modalOverlay} onClick={onClose}>
    <div
      style={modalBox}
      onClick={(e) => e.stopPropagation()}
      className="premium-card"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: 0, color: "var(--text-main)" }}>{title}</h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-main)",
          }}
        >
          <FaTimes />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const BottomLink = ({ icon, text, onClick, active }) => (
  <div
    style={{ ...bottomLinkStyle, color: active ? "#0b8f3a" : "var(--text-muted)" }}
    onClick={onClick}
  >
    {icon} <span style={{ fontSize: "10px", marginTop: "2px" }}>{text}</span>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <small style={{ color: "var(--text-muted)", display: "block" }}>
      {label}
    </small>
    <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>
      {value}
    </strong>
  </div>
);

const ProfileField = ({ label, value }) => (
  <div
    style={{
      padding: "15px",
      borderBottom: "1px solid var(--glass-border)",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <span style={{ color: "var(--text-muted)" }}>{label}</span>
    <strong style={{ color: "var(--text-main)" }}>{value}</strong>
  </div>
);

const Empty = ({ text }) => (
  <div
    style={{
      padding: "40px",
      textAlign: "center",
      color: "#999",
      fontSize: "14px",
    }}
  >
    {text}
  </div>
);

/* STYLES */
const container = {
  display: "flex",
  height: "100vh",
  background: "var(--bg-main)",
};
const sidebar = {
  width: "240px",
  background: "#0b8f3a",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: "30px 20px",
};
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
  position: "absolute",
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
  justifyContent: "flex-start",
};
const logo = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const nav = { flex: 1 };
const navItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  marginBottom: "8px",
  transition: "0.3s",
};
const logoutBtnSide = {
  ...navItem,
  background: "rgba(255,255,255,0.18)",
  border: "none",
  marginTop: "auto",
  color: "#ff0a0a",
  width: "80%",
  justifyContent: "center",
  textAlign: "center",
  boxShadow: "none",
};
const bellBtn = {
  position: "relative",
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  border: "none",
  background: "rgba(245,245,245,0.95)",
  color: "var(--text-main)",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  marginRight: "8px",
};
const notificationBadge = {
  position: "absolute",
  top: "-4px",
  right: "-4px",
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  background: "#dc3545",
  color: "#fff",
  fontSize: "11px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "700",
};
const main = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
};
const header = {
  background: "var(--card-bg)",
  padding: "15px 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid var(--glass-border)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};
const headerTitle = {
  margin: 0,
  fontSize: "16px",
  color: "var(--text-main)",
  letterSpacing: "1px",
};
const userInfo = { display: "flex", alignItems: "center", gap: "10px" };
const avatar = {
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  background: "var(--primary-light)",
  color: "var(--primary)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const menuBtn = {
  background: "none",
  border: "none",
  fontSize: "20px",
  color: "#0b8f3a",
};
const content = { padding: "30px" };
const statGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};
const statCard = {
  padding: "20px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  color: "#fff",
};
const statIcon = {
  width: "45px",
  height: "45px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "20px",
};
const statVal = { fontSize: "22px", fontWeight: "bold" };
const statTitle = { fontSize: "11px", opacity: 0.8 };
const mainGrid = { display: "flex", gap: "25px", flexWrap: "wrap" };
const box = {
  background: "var(--card-bg)",
  padding: "25px",
  borderRadius: "25px",
  marginBottom: "25px",
  width: "100%",
};
const boxTitle = {
  fontSize: "16px",
  margin: "0 0 20px 0",
  color: "var(--text-main)",
  fontWeight: "bold",
};
const listRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 0",
  borderBottom: "1px solid var(--glass-border)",
};
const rowTitle = {
  fontWeight: "bold",
  fontSize: "14px",
  color: "var(--text-main)",
};
const muted = { color: "#999", fontSize: "12px" };
const viewBtn = {
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "10px",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  cursor: "pointer",
};
const statusBanner = {
  padding: "20px",
  background: "var(--bg-main)",
  borderRadius: "20px",
  textAlign: "center",
  border: "1px solid var(--glass-border)",
  color: "var(--text-main)",
};
const doneBadge = {
  color: "#0b8f3a",
  fontSize: "12px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  padding: "20px",
};
const modalBox = {
  background: "var(--card-bg)",
  padding: "30px",
  borderRadius: "30px",
  width: "100%",
  maxWidth: "450px",
};
const modalScroll = { maxHeight: "80vh", overflowY: "auto" };
const infoGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  marginBottom: "20px",
};
const callBtn = {
  background: "var(--primary)",
  color: "#fff",
  textDecoration: "none",
  padding: "4px 10px",
  borderRadius: "6px",
  fontSize: "10px",
  fontWeight: "bold",
};
const navLink = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  background: "#4285F4",
  color: "#fff",
  padding: "15px",
  borderRadius: "15px",
  textDecoration: "none",
  fontWeight: "bold",
  marginBottom: "20px",
};
const calcBox = {
  background: "var(--bg-main)",
  padding: "15px",
  borderRadius: "15px",
  border: "1px solid var(--glass-border)",
};
const select = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid var(--glass-border)",
  background: "var(--card-bg)",
  color: "var(--text-main)",
};
const qtyInput = {
  width: "70px",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid var(--glass-border)",
  background: "var(--card-bg)",
  color: "var(--text-main)",
};
const addBtn = {
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "10px",
  cursor: "pointer",
};
const billList = {
  marginTop: "15px",
  padding: "10px",
  background: "var(--bg-main)",
  borderRadius: "10px",
  color: "var(--text-main)",
};
const billRow = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "12px",
  marginBottom: "8px",
  borderBottom: "1px solid var(--glass-border)",
  paddingBottom: "5px",
};
const trashBtn = {
  background: "none",
  border: "none",
  color: "#dc3545",
  cursor: "pointer",
};
const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
  borderTop: "2px solid var(--glass-border)",
  paddingTop: "5px",
};
const acceptBtn = {
  flex: 2,
  padding: "15px",
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};
const rejectBtn = {
  flex: 1,
  padding: "15px",
  background: "var(--card-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: "15px",
  color: "var(--text-muted)",
  fontWeight: "bold",
  cursor: "pointer",
};
const completeBtn = {
  flex: 1,
  padding: "15px",
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: "15px",
  fontWeight: "bold",
  cursor: "pointer",
  opacity: 1,
};
const otpBtn = {
  width: "100%",
  padding: "12px",
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "12px",
};
const otpInput = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "2px solid var(--primary)",
  textAlign: "center",
  fontSize: "18px",
  fontWeight: "bold",
  letterSpacing: "5px",
  background: "var(--card-bg)",
  color: "var(--text-main)",
};
const logoutBtnBig = {
  width: "100%",
  padding: "15px",
  background: "var(--card-bg)",
  color: "#dc3545",
  border: "1px solid rgba(220, 53, 69, 0.2)",
  borderRadius: "15px",
  fontWeight: "bold",
  marginTop: "20px",
  cursor: "pointer",
};
const modeBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  fontSize: "12px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.2s",
};
const loaderStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "var(--bg-main)",
};
const profileGrid = { marginTop: "10px" };
const tableContainer = { maxHeight: "400px", overflowY: "auto" };
const bottomNavStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "var(--card-bg)",
  display: "flex",
  justifyContent: "space-around",
  padding: "12px 10px 25px 10px",
  boxShadow: "0 -5px 25px rgba(0,0,0,0.05)",
  zIndex: 1500,
  borderTop: "1px solid var(--glass-border)",
};
const bottomLinkStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
};

export default CollectorDashboard;
