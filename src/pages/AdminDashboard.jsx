import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaUsers, FaTruck, FaClock, FaCheckCircle, FaRupeeSign,
  FaSignOutAlt, FaArrowLeft, FaTrash, FaPlus, FaKey, FaBell, FaInfoCircle,
  FaAd, FaTag, FaTools, FaStar, FaUserPlus, FaBars, FaTimes, FaCog,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaRecycle, FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaChartLine,
  FaFileInvoice, FaBuilding, FaIdCard, FaCar, FaUserCheck, FaMap, FaTicketAlt, FaPercent, FaShareAlt, FaRss, FaClipboardList, FaMoneyCheckAlt, FaBoxOpen, FaWhatsapp, FaMoon, FaSun, FaShieldAlt, FaBoxes
} from "react-icons/fa";
import API from "../services/api";
import Toast from "../components/Toast";
import { performLogout } from "../utils/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTheme } from "../context/ThemeContext";

function WhatsAppGatewayPanel() {
  const [waData, setWaData] = useState({ isReady: false, status: 'initializing', qrCodeUrl: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWaData = async (reinit = false) => {
    try {
      setLoading(true);
      const url = reinit ? "/auth/whatsapp-qr?reinit=true" : "/auth/whatsapp-qr";
      const { data } = await API.get(url, { hideLoader: true });
      if (data.success) {
        setWaData({ isReady: data.isReady, status: data.status, qrCodeUrl: data.qrCodeUrl });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaData();
    const interval = setInterval(() => {
      if (!waData.isReady) fetchWaData();
    }, 4000);
    return () => clearInterval(interval);
  }, [waData.isReady]);

  return (
    <div style={{ background: "#0f172a", borderRadius: "24px", border: "1px solid var(--glass-border)", padding: "32px", boxShadow: "0 15px 35px rgba(0,0,0,0.15)", minHeight: "560px", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <h1 style={{ fontSize: "22px", color: "#10b981", marginBottom: "8px" }}>⚡ ScrapVex WhatsApp Engine</h1>
      <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "24px" }}>Scan the QR Code to enable automatic WhatsApp OTPs & Digital Receipts</p>
      
      <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: "999px", fontWeight: "bold", fontSize: "13px", marginBottom: "16px", background: waData.isReady ? '#065f46' : '#854d0e', color: waData.isReady ? '#34d399' : '#fde047' }}>
        {waData.isReady ? '🟢 CONNECTED & READY' : '⏳ ' + (waData.status || '').toUpperCase()}
      </div>

      {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

      {waData.isReady ? (
        <div style={{ padding: "20px", background: "#052e16", borderRadius: "16px", color: "#4ade80", fontWeight: "bold", margin: "20px 0" }}>
          🎉 WhatsApp Gateway is 100% Active & Connected! Real WhatsApp OTPs will be sent automatically.
        </div>
      ) : (
        <>
          {waData.qrCodeUrl ? (
            <img src={waData.qrCodeUrl} alt="WhatsApp QR Code" style={{ width: "260px", height: "260px", borderRadius: "16px", border: "4px solid #10b981", margin: "0 auto 20px", display: "block" }} />
          ) : (
            <div style={{ margin: "20px auto" }}>
              {loading ? <div className="spinner" style={{ margin: "0 auto" }}></div> : <p>Waiting for engine...</p>}
            </div>
          )}
          <div style={{ textAlign: "left", background: "#1e293b", borderRadius: "12px", padding: "14px", fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6" }}>
            <b>How to connect:</b><br/>
            1. Open WhatsApp &gt; Linked Devices<br/>
            2. Tap "Link a Device"<br/>
            3. Scan the QR Code above
          </div>
        </>
      )}
      <button onClick={() => fetchWaData(true)} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold", marginTop: "24px", cursor: "pointer" }}>
        🔄 Restart Gateway
      </button>
    </div>
  );
}

function AdminDashboard() {

  const getBackendURL = () => {
    const base = API.defaults.baseURL || "";
    return base.replace(/\/api$/, "");
  };

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
    
    // Close context after playback completes (0.15 + 0.6 = 0.75s)
    setTimeout(() => {
      audioCtx.close().catch(() => {});
    }, 1000);
  } catch (e) {
    console.error("Audio Context play failed:", e);
  }
};

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
      if (urlTab === "accounting") fetchAccountingData();
      if (urlTab === "wallet") fetchAllTransactions();
      if (urlTab === "withdrawals") fetchWithdrawals();
      if (urlTab === "buyers") fetchBuyers();
      if (urlTab === "suppliers") fetchSuppliers();
      if (urlTab === "support") fetchTickets();
      if (urlTab === "contacts") fetchContactMessages();
      if (urlTab === "broadcasts") fetchBroadcasts();
      if (urlTab === "audit") fetchAuditLogs();
    }
  }, [searchParams]);
  const [stats, setStats] = useState({ totalUsers: 0, totalPickups: 0, pending: 0, completed: 0, revenue: 0 });
  const [pickups, setPickups] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [items, setItems] = useState([]);
  const [ads, setAds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({ 
    minAmount: 300, contactEmail: "", contactPhone: "", officeAddress: "", facebookUrl: "", instagramUrl: "", linkedinUrl: "", appDownloadLink: "", upiId: "scrapvex@okaxis" 
  });
  const [walletStats, setWalletStats] = useState({ totalAvailable: 0, totalPending: 0, userCount: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => { setSearchQuery(""); }, [activeTab]);
  
  const [buyers, setBuyers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newBuyer, setNewBuyer] = useState({ name: "", contact: "", email: "", address: "", gstin: "", pan: "" });
  const [newSupplier, setNewSupplier] = useState({ name: "", contact: "", address: "", gstin: "", category: "Individual" });

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showEditRateModal, setShowEditRateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [brandLogoFile, setBrandLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [appIconFile, setAppIconFile] = useState(null);
  const [heroBannerFile, setHeroBannerFile] = useState(null);
  const [mobileHeroBannerFile, setMobileHeroBannerFile] = useState(null);
  const [mobileAdFile, setMobileAdFile] = useState(null);
  const [walletForm, setWalletForm] = useState({ userId: "", amount: "", type: "credit", description: "" });
  
  const [accountingStats, setAccountingStats] = useState({ totalPurchaseAmount: 0, todayPurchaseAmount: 0, totalSaleAmount: 0, todaySaleAmount: 0, overallProfit: 0, todayProfit: 0, totalCommission: 0, todayCommission: 0, stockValue: 0 });
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  // Print bill after purchase complete
  const [showPurchasePrintModal, setShowPurchasePrintModal] = useState(false);
  const [lastCreatedPurchase, setLastCreatedPurchase] = useState(null);
  // Multi-supplier draft tabs
  const emptyDraft = (id) => ({ id: id || Date.now(), supplierId: "", supplierName: "", supplierContact: "", notes: "", items: [], paymentStatus: "Paid", paymentMethod: "Cash" });
  const [purchaseDrafts, setPurchaseDrafts] = useState([emptyDraft(1)]);
  const [activeDraftId, setActiveDraftId] = useState(1);
  // Purchase Bill Modal & Edit
  const [showPurchaseBillModal, setShowPurchaseBillModal] = useState(false);
  const [selectedPurchaseBill, setSelectedPurchaseBill] = useState(null);
  const [supplierPurchaseHistory, setSupplierPurchaseHistory] = useState([]);
  const [supplierTotalAmount, setSupplierTotalAmount] = useState(0);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editPurchaseData, setEditPurchaseData] = useState(null);
  const [showEditPurchaseModal, setShowEditPurchaseModal] = useState(false);
  // Reports State
  const [reportType, setReportType] = useState("summary"); // summary | collectors | suppliers | buyers | purchases
  const [reportFrom, setReportFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [reportGroupBy, setReportGroupBy] = useState("daily");
  const [reportData, setReportData] = useState([]);
  const [reportInventory, setReportInventory] = useState([]);
  const [reportGrandTotal, setReportGrandTotal] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportCollectorId, setReportCollectorId] = useState("");
  const [reportSupplierName, setReportSupplierName] = useState("");
  const [reportBuyerName, setReportBuyerName] = useState("");
  
  const initialSaleState = { 
    irn: "", ackNo: "", ackDate: "",
    buyerName: "", buyerContact: "", buyerAddress: "", buyerGSTIN: "", buyerPAN: "", buyerState: "Jammu & Kashmir", buyerStateCode: "01",
    consigneeName: "", consigneeAddress: "", consigneeGSTIN: "", consigneePAN: "", consigneeState: "Jammu & Kashmir", consigneeStateCode: "01",
    eWayBillNo: "", dispatchDocNo: "", dispatchedThrough: "", motorVehicleNo: "", deliveryNote: "", deliveryNoteDate: "", referenceNo: "", buyersOrderNo: "", destination: "", termsOfDelivery: "",
    notes: "", items: [], paymentStatus: "Paid", paymentMethod: "Cash"
  };
  const [newSale, setNewSale] = useState(initialSaleState);

  const [saleItemInput, setSaleItemInput] = useState({ scrapItem: "", name: "", hsnCode: "47071000", quantity: "", rate: "", cgstRate: "2.5", sgstRate: "2.5" });
  const [purchaseItemInput, setPurchaseItemInput] = useState({ scrapItem: "", name: "", quantity: "", rate: "" });
  
  // NEW ERP MODULES STATES
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [selectedPickup, setSelectedPickup] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const { isDarkMode: darkMode, toggleDarkMode } = useTheme();
  const [resetData, setResetData] = useState({ userId: "", newPassword: "", name: "" });
  
  // Form States
  const [newAd, setNewAd] = useState({ title: "", link: "" });
  const [adFile, setAdFile] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", price: "", unit: "kg", category: "Other" });
  const [newUser, setNewUser] = useState({ name: "", mobile: "", email: "", password: "" });
  const [newCollector, setNewCollector] = useState({ name: "", mobile: "", email: "", password: "", area: "" });
  const [newFranchise, setNewFranchise] = useState({ name: "", mobile: "", email: "", password: "", assignedCity: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const resP = await API.get("/admin/pickups", { hideLoader: true });
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
      } catch (e) { console.error("Admin polling error:", e); }
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const filteredPickups = useMemo(() => {
    if (!searchQuery) return pickups;
    const q = searchQuery.toLowerCase();
    return pickups.filter(p => p._id.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || p.mobile?.includes(q) || p.address?.toLowerCase().includes(q) || p.scrapType?.toLowerCase().includes(q));
  }, [pickups, searchQuery]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(it => it.name?.toLowerCase().includes(q) || it.category?.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const filteredFranchises = useMemo(() => {
    if (!searchQuery) return franchises;
    const q = searchQuery.toLowerCase();
    return franchises.filter(f => f.name?.toLowerCase().includes(q) || f.mobile?.includes(q) || f.assignedCity?.toLowerCase().includes(q));
  }, [franchises, searchQuery]);

  const filteredCollectors = useMemo(() => {
    if (!searchQuery) return collectors;
    const q = searchQuery.toLowerCase();
    return collectors.filter(c => c.name?.toLowerCase().includes(q) || c.mobile?.includes(q) || c.area?.toLowerCase().includes(q));
  }, [collectors, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers;
    const q = searchQuery.toLowerCase();
    return allUsers.filter(u => u.name?.toLowerCase().includes(q) || u.mobile?.includes(q) || u.email?.toLowerCase().includes(q));
  }, [allUsers, searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => t.description?.toLowerCase().includes(q) || t.amount?.toString().includes(q) || t.type?.toLowerCase().includes(q));
  }, [transactions, searchQuery]);

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    const q = searchQuery.toLowerCase();
    return inventory.filter(inv => inv.scrapItem?.name?.toLowerCase().includes(q) || inv.scrapItem?.category?.toLowerCase().includes(q));
  }, [inventory, searchQuery]);

  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases;
    const q = searchQuery.toLowerCase();
    return purchases.filter(p => p.supplierName?.toLowerCase().includes(q) || p.supplierContact?.includes(q) || p._id.toLowerCase().includes(q));
  }, [purchases, searchQuery]);

  const filteredSales = useMemo(() => {
    if (!searchQuery) return sales;
    const q = searchQuery.toLowerCase();
    return sales.filter(s => s.buyerName?.toLowerCase().includes(q) || s.buyerContact?.includes(q) || s.invoiceNumber?.toLowerCase().includes(q));
  }, [sales, searchQuery]);

  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter(t => t.subject?.toLowerCase().includes(q) || t.message?.toLowerCase().includes(q) || t.status?.toLowerCase().includes(q));
  }, [tickets, searchQuery]);

  const filteredWithdrawals = useMemo(() => {
    if (!searchQuery) return withdrawals;
    const q = searchQuery.toLowerCase();
    return withdrawals.filter(w => w.user?.name?.toLowerCase().includes(q) || w.amount?.toString().includes(q) || w.status?.toLowerCase().includes(q));
  }, [withdrawals, searchQuery]);
  

  useEffect(() => {
    fetchAdminData();
    // Animation trigger
    document.body.style.overflowX = "hidden";
  }, []);

  const fetchAdminData = async () => {
    const safeGet = async (url, fallback) => {
      try {
        const res = await API.get(url);
        return res.data.success ? res.data : fallback;
      } catch (e) {
        console.error(`Failed to fetch ${url}:`, e.message);
        return fallback;
      }
    };

    try {
      setLoading(true);
      const [dataStats, dataPickups, dataCollectors, dataItems, dataUsers, dataFranchises] = await Promise.all([
        safeGet("/admin/dashboard", { stats: stats }),
        safeGet("/admin/pickups", { pickups: [] }),
        safeGet("/admin/collectors", { collectors: [] }),
        safeGet("/scrap-items", { data: [] }),
        safeGet("/admin/users", { users: [] }),
        safeGet("/admin/franchises", { franchises: [] })
      ]);

      if (dataStats.stats) setStats(dataStats.stats);
      if (dataPickups.pickups) setPickups(dataPickups.pickups);
      if (dataCollectors.collectors) setCollectors(dataCollectors.collectors);
      if (dataItems.data) setItems(dataItems.data);
      if (dataUsers.users) setAllUsers(dataUsers.users);
      if (dataFranchises.franchises) setFranchises(dataFranchises.franchises);
      
      fetchAds();
      fetchSettings();
      fetchNotifications();
      fetchReviews();
      fetchWalletStats();
      fetchAccountingData(); // Fetch accounting stats for overview
      fetchBuyers();
      fetchSuppliers();
    } catch (error) {
      showToast("error", "Failed to load some data. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyers = async () => {
    try {
      const { data } = await API.get("/buyers");
      if (data.success) setBuyers(data.buyers);
    } catch (e) { console.error(e); }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await API.get("/suppliers");
      if (data.success) setSuppliers(data.suppliers);
    } catch (e) { console.error(e); }
  };

  const fetchAds = async () => {
    try {
      const { data } = await API.get("/ads");
      if (data.success) setAds(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await API.get("/settings");
      if (data.success) setSettings(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      if (data.success) setNotifications(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get("/reviews");
      if (data.success) setReviews(data.data);
    } catch (e) { console.error(e); }
  };

  const markAllNotificationsRead = async () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return;
    try {
      await API.put("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };
  
  const fetchWalletStats = async () => {
    try {
      const { data } = await API.get("/admin/wallet-stats");
      if (data.success) {
        setWalletStats(data.stats);
        setTransactions(data.recentTransactions || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/transactions");
      if (data.success) setTransactions(data.transactions);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAccountingData = async () => {
    try {
      setLoading(true);
      const [statsRes, invRes, salesRes, purchRes] = await Promise.all([
        API.get("/billing/stats"),
        API.get("/billing/inventory"),
        API.get("/billing/sales"),
        API.get("/billing/purchases")
      ]);
      if (statsRes.data.success) setAccountingStats(statsRes.data.stats);
      if (invRes.data.success) setInventory(invRes.data.inventory);
      if (salesRes.data.success) setSales(salesRes.data.sales);
      if (purchRes.data.success) setPurchases(purchRes.data.purchases);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/support-tickets");
      if (data.success) setTickets(data.tickets);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReplyTicket = async (ticketId) => {
    if (!replyText.trim()) return showToast("error", "Reply cannot be empty!");
    try {
      setLoading(true);
      const { data } = await API.post(`/support-tickets/${ticketId}/reply`, { message: replyText });
      if (data.success) {
        showToast("success", "Reply sent successfully!");
        setReplyText("");
        setSelectedTicket(data.ticket);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      setLoading(true);
      const { data } = await API.put(`/support-tickets/${ticketId}/status`, { status });
      if (data.success) {
        showToast("success", `Ticket status updated to ${status}!`);
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to update ticket status");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/withdrawals");
      if (data.success) setWithdrawals(data.withdrawals);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/broadcasts");
      if (data.success) setBroadcasts(data.broadcasts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/audit-logs");
      if (data.success) setAuditLogs(data.logs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/contacts");
      if (data.success) setContacts(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpdateContactStatus = async (id, status) => {
    try {
      setLoading(true);
      const { data } = await API.put(`/contacts/${id}`, { status });
      if (data.success) {
        showToast("success", `Inquiry status updated to ${status}!`);
        fetchContactMessages();
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSaleItem = () => {
    if(!saleItemInput.scrapItem || !saleItemInput.quantity || !saleItemInput.rate) return showToast("error", "Fill all item fields");
    const itemInfo = items.find(i => i._id === saleItemInput.scrapItem);
    
    const qty = parseFloat(saleItemInput.quantity);
    const rate = parseFloat(saleItemInput.rate);
    const cgstR = parseFloat(saleItemInput.cgstRate) || 0;
    const sgstR = parseFloat(saleItemInput.sgstRate) || 0;
    
    const taxableAmount = qty * rate;
    const cgstAmount = (taxableAmount * cgstR) / 100;
    const sgstAmount = (taxableAmount * sgstR) / 100;
    const amount = taxableAmount + cgstAmount + sgstAmount;

    setNewSale({
      ...newSale, 
      items: [...newSale.items, { 
        scrapItem: saleItemInput.scrapItem, 
        name: itemInfo?.name || "", 
        hsnCode: saleItemInput.hsnCode,
        quantity: qty, 
        rate: rate, 
        cgstRate: cgstR,
        sgstRate: sgstR,
        cgstAmount,
        sgstAmount,
        amount: taxableAmount // Store base amount for items array as per format
      }]
    });
    setSaleItemInput({ scrapItem: "", name: "", hsnCode: "47071000", quantity: "", rate: "", cgstRate: "2.5", sgstRate: "2.5" });
  };

  const handleCreateSale = async () => {
    if(!newSale.buyerName || newSale.items.length === 0) return showToast("error", "Add buyer and items");
    
    const totalTaxableAmount = newSale.items.reduce((acc, item) => acc + item.amount, 0);
    const totalCGST = newSale.items.reduce((acc, item) => acc + item.cgstAmount, 0);
    const totalSGST = newSale.items.reduce((acc, item) => acc + item.sgstAmount, 0);
    const totalAmount = totalTaxableAmount + totalCGST + totalSGST;

    try {
      const { data } = await API.post("/billing/sales", { ...newSale, totalTaxableAmount, totalCGST, totalSGST, totalAmount });
      if(data.success) {
        showToast("success", "Sale Recorded!");
        setShowSaleModal(false);
        setNewSale(initialSaleState);
        fetchAccountingData();
      }
    } catch(e) { showToast("error", "Failed to record sale"); }
  };

  // ─── Multi-Draft Helpers ───
  const getActiveDraft = () => purchaseDrafts.find(d => d.id === activeDraftId) || purchaseDrafts[0];
  const updateActiveDraft = (patch) => {
    setPurchaseDrafts(prev => prev.map(d => d.id === activeDraftId ? { ...d, ...patch } : d));
  };
  const addNewDraft = () => {
    const newId = Date.now();
    setPurchaseDrafts(prev => [...prev, emptyDraft(newId)]);
    setActiveDraftId(newId);
    setPurchaseItemInput({ scrapItem: "", name: "", quantity: "", rate: "" });
  };
  const removeDraft = (id) => {
    if (purchaseDrafts.length === 1) { setPurchaseDrafts([emptyDraft(Date.now())]); return; }
    const remaining = purchaseDrafts.filter(d => d.id !== id);
    setPurchaseDrafts(remaining);
    if (activeDraftId === id) setActiveDraftId(remaining[remaining.length - 1].id);
  };
  const switchDraft = (id) => {
    setActiveDraftId(id);
    setPurchaseItemInput({ scrapItem: "", name: "", quantity: "", rate: "" });
  };

  const handleAddPurchaseItem = () => {
    if (!purchaseItemInput.scrapItem || !purchaseItemInput.quantity || !purchaseItemInput.rate) return showToast("error", "Fill all item fields");
    const itemInfo = items.find(i => i._id === purchaseItemInput.scrapItem);
    const amount = parseFloat(purchaseItemInput.quantity) * parseFloat(purchaseItemInput.rate);
    const draft = getActiveDraft();
    updateActiveDraft({ items: [...draft.items, { scrapItem: purchaseItemInput.scrapItem, name: itemInfo?.name || "", quantity: parseFloat(purchaseItemInput.quantity), rate: parseFloat(purchaseItemInput.rate), amount }] });
    setPurchaseItemInput({ scrapItem: "", name: "", quantity: "", rate: "" });
  };

  const handleRemovePurchaseItem = (index) => {
    const draft = getActiveDraft();
    updateActiveDraft({ items: draft.items.filter((_, i) => i !== index) });
  };

  const handleEditPurchaseItem = (index, field, value) => {
    const draft = getActiveDraft();
    const updated = draft.items.map((it, i) => {
      if (i !== index) return it;
      const newIt = { ...it, [field]: parseFloat(value) || 0 };
      newIt.amount = newIt.quantity * newIt.rate;
      return newIt;
    });
    updateActiveDraft({ items: updated });
  };

  const handleCreatePurchase = async () => {
    const draft = getActiveDraft();
    if (!draft.supplierName || draft.items.length === 0) return showToast("error", "Supplier aur items add karein");
    const totalAmount = draft.items.reduce((acc, item) => acc + item.amount, 0);
    try {
      const { data } = await API.post("/billing/purchases", { ...draft, totalAmount });
      if (data.success) {
        showToast("success", `✅ ${draft.supplierName} ka purchase complete!`);
        // Save for print bill (contains database _id)
        setLastCreatedPurchase(data.purchase);
        // Remove completed draft
        removeDraft(activeDraftId);
        const remaining = purchaseDrafts.filter(d => d.id !== activeDraftId);
        if (remaining.length === 0) setShowPurchaseModal(false);
        // Show print bill
        setShowPurchasePrintModal(true);
        fetchAccountingData();
        fetchWalletStats();
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to record purchase");
    }
  };

  // Open Purchase Bill Modal
  const openPurchaseBillModal = async (purchase) => {
    setSelectedPurchaseBill(purchase);
    setShowPurchaseBillModal(true);
    try {
      const { data } = await API.get(`/billing/purchases/by-supplier?supplierName=${encodeURIComponent(purchase.supplierName)}`);
      if (data.success) {
        setSupplierPurchaseHistory(data.purchases);
        setSupplierTotalAmount(data.totalAmount);
      }
    } catch(e) { setSupplierPurchaseHistory([purchase]); setSupplierTotalAmount(purchase.totalAmount); }
  };

  // Open Edit Purchase Modal
  const openEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setEditPurchaseData({
      supplierName: purchase.supplierName,
      supplierContact: purchase.supplierContact || "",
      paymentStatus: purchase.paymentStatus,
      paymentMethod: purchase.paymentMethod,
      notes: purchase.notes || "",
      items: purchase.items.map(i => ({ ...i }))
    });
    setShowEditPurchaseModal(true);
  };

  // Save Edit Purchase (with WhatsApp PDF Bill)
  const handleSaveEditPurchase = async () => {
    if (!editingPurchase || !editPurchaseData) return;
    try {
      const totalAmount = editPurchaseData.items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
      const { data } = await API.put(`/billing/purchases/${editingPurchase._id}`, { ...editPurchaseData, totalAmount });
      if (data.success) {
        showToast("success", "Purchase updated! WhatsApp bill bheji ja rahi hai... ✅");
        // Send WhatsApp Bill
        try {
          await API.post(`/billing/purchases/${editingPurchase._id}/send-bill`);
          showToast("success", "📲 WhatsApp bill sent!");
        } catch(we) {
          showToast("error", "Bill updated but WhatsApp send failed: " + (we.response?.data?.message || we.message));
        }
        setShowEditPurchaseModal(false);
        setEditingPurchase(null);
        setEditPurchaseData(null);
        fetchAccountingData();
      }
    } catch(e) { showToast("error", e.response?.data?.message || "Failed to update purchase"); }
  };

  // ═══════════════ REPORTS ═══════════════
  const fetchReport = async () => {
    setReportLoading(true);
    setReportData([]);
    setReportInventory([]);
    try {
      let url = "";
      let params = `?from=${reportFrom}&to=${reportTo}`;
      if (reportType === "summary") {
        url = `/reports/summary${params}&groupBy=${reportGroupBy}`;
      } else if (reportType === "collectors") {
        url = `/reports/collectors${params}${reportCollectorId ? `&collectorId=${reportCollectorId}` : ""}`;
      } else if (reportType === "suppliers") {
        url = `/reports/suppliers${params}${reportSupplierName ? `&supplierName=${encodeURIComponent(reportSupplierName)}` : ""}`;
      } else if (reportType === "buyers") {
        url = `/reports/buyers${params}${reportBuyerName ? `&buyerName=${encodeURIComponent(reportBuyerName)}` : ""}`;
      } else if (reportType === "purchases") {
        url = `/reports/purchases${params}`;
      }
      const { data } = await API.get(url);
      if (data.success) {
        if (reportType === "purchases") {
          setReportData(data.purchasesList || []);
          setReportInventory(data.itemsInventoryBreakdown || []);
          setReportGrandTotal(data.totalAmount || 0);
        } else {
          setReportData(data.data || []);
          setReportGrandTotal(data.grandTotal || 0);
        }
      }
    } catch(e) { showToast("error", "Report load failed: " + (e.response?.data?.message || e.message)); }
    finally { setReportLoading(false); }
  };

  const downloadCSV = () => {
    if (reportData.length === 0) return showToast("error", "Pehle report load karein");
    let csv = "";
    if (reportType === "summary") {
      csv = "Period,Purchases,Purchase Amount,Sales,Sale Amount,Pickups,Pickup Amount,Profit\n";
      reportData.forEach(r => {
        csv += `${r.period},${r.purchases},${r.purchaseAmount},${r.sales},${r.saleAmount},${r.pickups},${r.pickupAmount},${r.profit}\n`;
      });
    } else if (reportType === "collectors") {
      csv = "Collector Name,Mobile,Total Pickups,Total Earnings,Total Scrap Value\n";
      reportData.forEach(r => {
        csv += `${r.collectorName},${r.collectorMobile},${r.totalPickups},${r.totalEarnings},${r.totalScrapValue}\n`;
      });
    } else if (reportType === "suppliers") {
      csv = "Supplier Name,Contact,Total Purchases,Total Amount,Total Items\n";
      reportData.forEach(r => {
        csv += `${r.supplierName},${r.supplierContact},${r.totalPurchases},${r.totalAmount},${r.totalItems}\n`;
      });
    } else if (reportType === "buyers") {
      csv = "Buyer Name,Contact,Total Sales,Total Amount\n";
      reportData.forEach(r => {
        csv += `${r.buyerName},${r.buyerContact},${r.totalSales},${r.totalAmount}\n`;
      });
    } else if (reportType === "purchases") {
      csv = "Bill No,Date,Supplier Name,Contact,Total Amount,Payment Status,Payment Method,Items Count\n";
      reportData.forEach(r => {
        csv += `${r.billNo},${r.date},${r.supplierName},${r.supplierContact},${r.totalAmount},${r.paymentStatus},${r.paymentMethod},${r.itemsCount}\n`;
      });
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scrapvex_${reportType}_report_${reportFrom}_${reportTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "CSV Downloaded! ✅");
  };

  const handleApproveDeposit = async (id) => {

    if (!window.confirm("Are you sure you want to approve this deposit request?")) return;
    try {
      setLoading(true);
      const { data } = await API.post(`/admin/deposit/${id}/approve`);
      if (data.success) {
        showToast("success", "Deposit Approved & Balance Credited! ✅");
        fetchWalletStats();
        fetchAllTransactions();
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to approve deposit");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDeposit = async (id) => {
    const reason = prompt("Enter Rejection Reason (Notes):");
    if (reason === null) return; // cancelled
    try {
      setLoading(true);
      const { data } = await API.post(`/admin/deposit/${id}/reject`, { reason });
      if (data.success) {
        showToast("success", "Deposit Rejected & Marked Failed! ❌");
        fetchWalletStats();
        fetchAllTransactions();
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to reject deposit");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWallet = async () => {
    if (!walletForm.userId || !walletForm.amount) return showToast("error", "Fill all fields");
    try {
      setLoading(true);
      const { data } = await API.post("/admin/update-wallet", walletForm);
      if (data.success) {
        showToast("success", "Wallet Updated Successfully!");
        setShowWalletModal(false);
        setWalletForm({ userId: "", amount: "", type: "credit", description: "" });
        
        // Refresh all relevant data
        fetchAdminData(); 
        fetchWalletStats();
        if(activeTab === "wallet") fetchAllTransactions();
      } else {
        showToast("error", data.message || "Failed to update wallet");
      }
    } catch (e) { 
      showToast("error", e.response?.data?.message || "Failed to update wallet"); 
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const formData = new FormData();
      Object.keys(settings).forEach(key => {
        if (!['brandLogo', 'favicon', 'appIcon', 'heroBanner', 'mobileHeroBanner'].includes(key)) {
          formData.append(key, settings[key] !== undefined && settings[key] !== null ? settings[key] : '');
        }
      });
      if (brandLogoFile) formData.append('brandLogo', brandLogoFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      if (appIconFile) formData.append('appIcon', appIconFile);
      if (heroBannerFile) formData.append('heroBanner', heroBannerFile);
      if (mobileHeroBannerFile) formData.append('mobileHeroBanner', mobileHeroBannerFile);

      const { data } = await API.put("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (data.success) {
        showToast("success", "Platform, Festival Logo & Favicon Settings Updated!");
        if (data.data) setSettings(data.data);
      }
    } catch (e) { showToast("error", "Failed to save settings"); }
  };

  const handleCleanTestData = async () => {
    if (!window.confirm("Are you sure you want to clean all dummy test pickups, test customers, and test transactions? Franchise and Admin accounts will be preserved!")) return;
    try {
      const { data } = await API.post("/admin/clean-test-data");
      if (data.success) {
        showToast("success", "Dummy test data cleaned! Ready for real commercial pickups.");
        fetchAdminData();
      }
    } catch (e) { showToast("error", "Failed to clean test data"); }
  };

  // ... (Other handlers like handleCreateAd, handleResetPassword etc same as before)
  const handleCreateAd = async () => {
    if (!newAd.title || !adFile) return showToast("error", "Select title & desktop image");
    try {
      const formData = new FormData();
      formData.append("title", newAd.title);
      formData.append("link", newAd.link || "#");
      formData.append("image", adFile);
      if (mobileAdFile) {
        formData.append("mobileImage", mobileAdFile);
      }
      const { data } = await API.post("/ads", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (data.success) {
        showToast("success", "Desktop & Mobile Banner Published!");
        setShowAdModal(false); setAdFile(null); setMobileAdFile(null); fetchAds();
      }
    } catch (e) { showToast("error", "Upload failed"); }
  };

  const handleResetPassword = async () => {
    try {
      const { data } = await API.post("/admin/reset-password", resetData);
      if (data.success) { showToast("success", "Password updated"); setShowResetModal(false); }
    } catch (e) { showToast("error", "Failed"); }
  };

  const handleCreateItem = async () => {
    try {
      const { data } = await API.post("/admin/scrap-items", newItem);
      if (data.success) { showToast("success", "Item Added"); setShowItemModal(false); fetchAdminData(); }
    } catch (e) { showToast("error", "Failed"); }
  };

  const handleUpdateRate = async () => {
    try {
      const { data } = await API.put(`/admin/scrap-items/${editingRate._id}`, { price: editingRate.price });
      if (data.success) { showToast("success", "Rate Updated"); setShowEditRateModal(false); fetchAdminData(); }
    } catch (e) { showToast("error", "Failed"); }
  };

  const handleCreateUser = async () => {
    try {
      const { data } = await API.post("/admin/users", newUser);
      if (data.success) { showToast("success", "User created"); setShowUserModal(false); fetchAdminData(); }
    } catch (e) { showToast("error", e.response?.data?.message || "Failed"); }
  };

  const handleCreateCollector = async () => {
    try {
      const { data } = await API.post("/admin/collectors", newCollector);
      if (data.success) { showToast("success", "Collector created"); setShowCollectorModal(false); fetchAdminData(); }
    } catch (e) { showToast("error", e.response?.data?.message || "Failed"); }
  };

  const handleCreateFranchise = async () => {
    try {
      const { data } = await API.post("/admin/franchises", newFranchise);
      if (data.success) { showToast("success", "Franchise created"); setShowFranchiseModal(false); fetchAdminData(); }
    } catch (e) { showToast("error", e.response?.data?.message || "Failed"); }
  };

  const handleAssignPickup = async (collectorId) => {
    try {
      const { data } = await API.post("/admin/assign-pickup", { pickupId: selectedPickup._id, collectorId });
      if (data.success) { showToast("success", "Assigned!"); setShowAssignModal(false); fetchAdminData(); }
    } catch (e) { showToast("error", "Failed"); }
  };

  const handleDeleteItem = async (id, type) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      let ep = type === "rate" ? `/admin/scrap-items/${id}` : type === "ad" ? `/ads/${id}` : `/admin/${type}s/${id}`;
      await API.delete(ep);
      showToast("success", "Deleted"); fetchAdminData();
    } catch (e) { showToast("error", "Failed"); }
  };

  const numberToWords = (num) => {
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
    return str.trim() === 'Only' ? '' : str.trim();
  };

  const handleCreateBuyer = async () => {
    if(!newBuyer.name || !newBuyer.contact) return showToast("error", "Name and Contact are required");
    try {
      const { data } = newBuyer._id 
        ? await API.put(`/buyers/${newBuyer._id}`, newBuyer)
        : await API.post("/buyers", newBuyer);
        
      if(data.success) {
        showToast("success", newBuyer._id ? "Buyer Updated" : "Buyer Added");
        setShowBuyerModal(false);
        setNewBuyer({ name: "", contact: "", email: "", address: "", gstin: "", pan: "" });
        fetchBuyers();
      }
    } catch(e) { showToast("error", "Failed to save buyer"); }
  };

  const handleCreateSupplier = async () => {
    if(!newSupplier.name || !newSupplier.contact) return showToast("error", "Name and Contact are required");
    try {
      const { data } = newSupplier._id
        ? await API.put(`/suppliers/${newSupplier._id}`, newSupplier)
        : await API.post("/suppliers", newSupplier);

      if(data.success) {
        showToast("success", newSupplier._id ? "Supplier Updated" : "Supplier Added");
        setShowSupplierModal(false);
        setNewSupplier({ name: "", contact: "", address: "", gstin: "", category: "Individual" });
        fetchSuppliers();
      }
    } catch(e) { showToast("error", "Failed to save supplier"); }
  };

  const logout = async () => { 
    await performLogout();
    navigate("/admin-login"); 
  };

  if (loading) return <div style={loaderStyle}><FaRecycle className="spin" style={{fontSize: "45px", color: "var(--primary)"}} /></div>;

  const NavGroup = ({ title, children }) => (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "11px", fontWeight: "bold", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "1px", padding: "0 12px 8px 12px" }}>{title}</div>
      {children}
    </div>
  );

  const NavContent = () => (
    <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <NavGroup title="OPERATIONS">
        <NavItem active={activeTab === "overview"} icon={<FaInfoCircle />} text="Overview" onClick={() => {setActiveTab("overview"); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "pickups"} icon={<FaTruck />} text="Pickups" onClick={() => {setActiveTab("pickups"); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "users"} icon={<FaUsers />} text="Users" onClick={() => {setActiveTab("users"); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "collectors"} icon={<FaTools />} text="Collectors" onClick={() => {setActiveTab("collectors"); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "franchises"} icon={<FaMapMarkerAlt />} text="Franchises" onClick={() => {setActiveTab("franchises"); setIsMobileMenuOpen(false);}} />
      </NavGroup>

      <NavGroup title="FINANCE">
        <NavItem active={activeTab === "accounting"} icon={<FaChartLine />} text="Accounting" onClick={() => {setActiveTab("accounting"); fetchAccountingData(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "wallet"} icon={<FaWallet />} text="Wallet" onClick={() => {setActiveTab("wallet"); fetchAllTransactions(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "withdrawals"} icon={<FaMoneyCheckAlt />} text="Withdrawals" onClick={() => {setActiveTab("withdrawals"); fetchWithdrawals(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "buyers"} icon={<FaBuilding />} text="Buyers" onClick={() => {setActiveTab("buyers"); fetchBuyers(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "suppliers"} icon={<FaTruck />} text="Sellers" onClick={() => {setActiveTab("suppliers"); fetchSuppliers(); setIsMobileMenuOpen(false);}} />
      </NavGroup>

      <NavGroup title="CATALOG">
        <NavItem active={activeTab === "rates"} icon={<FaTag />} text="Rates" onClick={() => {setActiveTab("rates"); setIsMobileMenuOpen(false);}} />
      </NavGroup>

      <NavGroup title="COMMUNICATION">
        <NavItem active={activeTab === "support"} icon={<FaTicketAlt />} text="Support" onClick={() => {setActiveTab("support"); fetchTickets(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "contacts"} icon={<FaEnvelope />} text="Contacts" onClick={() => {setActiveTab("contacts"); fetchContactMessages(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "broadcasts"} icon={<FaRss />} text="Broadcasts" onClick={() => {setActiveTab("broadcasts"); fetchBroadcasts(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "whatsapp"} icon={<FaWhatsapp style={{ color: "#25D366" }} />} text="WhatsApp" onClick={() => {setActiveTab("whatsapp"); setIsMobileMenuOpen(false);}} />
      </NavGroup>

      <NavGroup title="SYSTEM">
        <NavItem active={activeTab === "audit"} icon={<FaClipboardList />} text="Audit" onClick={() => {setActiveTab("audit"); fetchAuditLogs(); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "ads"} icon={<FaAd />} text="Banners" onClick={() => {setActiveTab("ads"); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "reviews"} icon={<FaStar />} text="Reviews" onClick={() => {setActiveTab("reviews"); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "settings"} icon={<FaCog />} text="Settings" onClick={() => {setActiveTab("settings"); setIsMobileMenuOpen(false);}} />
        <NavItem active={activeTab === "reports"} icon={<FaChartLine />} text="Reports" onClick={() => {setActiveTab("reports"); setIsMobileMenuOpen(false);}} />
      </NavGroup>
    </div>
  );

  return (
    <div className="dashboard-root" style={container}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .sidebar-item:hover { background: rgba(255,255,255,0.1); transform: translateX(5px); }
        .premium-card { transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }
        .spinner { width: 40px; height: 40px; border: 4px solid #eef8f1; border-top: 4px solid #0b8f3a; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { 
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          .grid-3, .grid-2 { grid-template-columns: 1fr !important; gap: 10px !important; }
          .kpi-card-container, .kpi-grid, .stat-grid-container { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .kpi-card { padding: 12px !important; flex-direction: row !important; align-items: center !important; gap: 10px !important; border-radius: 14px !important; }
          .kpi-card > div:first-child { width: 36px !important; height: 36px !important; min-width: 36px !important; font-size: 16px !important; border-radius: 10px !important; flex-shrink: 0 !important; }
          .kpi-card div:last-child div:first-child { font-size: 10px !important; }
          .kpi-card div:last-child div:last-child { font-size: 18px !important; }
          .responsive-flex { flex-direction: column !important; gap: 12px !important; }
          .responsive-flex > div { width: 100% !important; flex: unset !important; }
          .mobile-pad-bottom { padding-bottom: 110px !important; }
          .dashboard-root { height: auto !important; min-height: 100vh !important; }
          .dashboard-main { overflow-y: visible !important; height: auto !important; overflow-x: hidden !important; }
          .native-content { padding: 10px 10px 90px 10px !important; max-width: 100vw !important; box-sizing: border-box !important; overflow-x: hidden !important; }
          table { display: block !important; overflow-x: auto !important; width: 100% !important; }
          .card-premium, .card-bg { padding: 14px !important; border-radius: 16px !important; }
          .scroll-chips { display: flex !important; overflow-x: auto !important; white-space: nowrap !important; gap: 8px !important; padding-bottom: 6px !important; -webkit-overflow-scrolling: touch !important; }
          .scroll-chips::-webkit-scrollbar { display: none; }
        }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>

      {/* SIDEBAR */}
      <div style={sidebar} className="desktop-only">
        <div style={logo}><FaRecycle style={{marginRight:"10px", fontSize:"28px"}}/> Scrapvex</div>
        <nav style={nav}><NavContent /></nav>
      </div>

      {isMobileMenuOpen && (
        <div style={mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}>
          <div style={mobileSidebar} onClick={e => e.stopPropagation()}>
             <div style={logo}><FaRecycle style={{marginRight:"10px"}}/> Scrapvex</div>
             <NavContent />
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={main}>
        <header style={{
          background: "var(--card-bg, #ffffff)",
          padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px 10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--card-border, #e2e8f0)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          width: "100%",
          boxSizing: "border-box"
        }}>
          {/* Left Branding: ScrapVex ADMIN */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => setActiveTab("overview")}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(11,143,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b8f3a", fontSize: "17px" }}>
                <FaRecycle />
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
                <span style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-main, #0f172a)", letterSpacing: "-0.4px" }}>
                  ScrapVex
                </span>
                <span style={{ fontSize: "9px", fontWeight: "800", color: "#0b8f3a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls: [Status Pill] -> [Bell] -> [Moon] */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#0b8f3a",
              padding: "4px 8px",
              borderRadius: "8px",
              fontSize: "10px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0b8f3a" }} />
              Superadmin
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => { setShowNotifPanel(!showNotifPanel); if (!showNotifPanel) markAllNotificationsRead(); }}
              style={{
                background: "var(--bg-subtle, #f8fafc)",
                border: "1.5px solid var(--card-border, #cbd5e1)",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                flexShrink: 0
              }}
              title="Notifications"
            >
              <FaBell style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px", color: "var(--text-main, #334155)" }} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "#dc2626",
                  border: "1.5px solid #ffffff"
                }} />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              style={{
                background: "var(--bg-subtle, #f8fafc)",
                border: "1.5px solid var(--card-border, #cbd5e1)",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0
              }}
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <FaSun style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px", color: "#f59e0b" }} />
              ) : (
                <FaMoon style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px", color: "var(--text-main, #334155)" }} />
              )}
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={async () => { await performLogout(); window.location.href = "/admin-login"; }}
              style={{
                background: "var(--bg-subtle, #f8fafc)",
                border: "1.5px solid var(--card-border, #cbd5e1)",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0
              }}
              title="Logout"
            >
              <FaSignOutAlt style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px", color: "#ef4444" }} />
            </button>
          </div>

          {showNotifPanel && (
            <div style={notifPanel}>
              <h4 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>Alerts</h4>
              {notifications.slice(0, 5).map(n => (
                <div key={n._id} style={notifRow}><strong>{n.title}</strong><br />{n.message}</div>
              ))}
              {notifications.length === 0 && <p style={muted}>No new alerts</p>}
            </div>
          )}
        </header>

        <div className="native-content mobile-pad-bottom">
          {activeTab !== "overview" && activeTab !== "reports" && activeTab !== "support-chat" && (
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <input
                type="text"
                placeholder={`Search in ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                  fontSize: "14px",
                  background: "var(--card-bg, #ffffff)",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                  transition: "border-color 0.2s ease"
                }}
              />
              <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: "14px" }}>🔍</span>
              {searchQuery && (
                <span 
                  onClick={() => setSearchQuery("")} 
                  style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#999", fontWeight: "bold", fontSize: "14px" }}
                >✕</span>
              )}
            </div>
          )}

          
          
          {/* TOP BACK BUTTON FOR ALL SUB-TABS */}
          {activeTab !== "overview" && activeTab !== "account" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", padding: "0 4px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                style={{
                  background: "var(--card-bg, #ffffff)",
                  border: "1.5px solid var(--card-border, #cbd5e1)",
                  color: "var(--text-main, #0f172a)",
                  padding: "8px 14px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                }}
              >
                <FaArrowLeft /> Back to Menu
              </button>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#0b8f3a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "8px", textTransform: "capitalize" }}>
                {activeTab === "ads" ? "Banners" : activeTab === "dist-settings" ? "City Settings" : activeTab}
              </span>
            </div>
          )}

          {/* ADMIN ACCOUNT TAB - UNIFIED LAUNCHER FOR ALL 20 TABS */}
          {activeTab === "account" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "12px 14px 40px 14px" }}>
              {/* Profile Card */}
              <div style={{
                background: "var(--card-bg, #ffffff)",
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid var(--card-border, #e2e8f0)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  color: "#0b8f3a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: "900",
                  flexShrink: 0
                }}>
                  <FaShieldAlt />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 2px 0", fontSize: "16px", fontWeight: "900", color: "var(--text-main, #0f172a)" }}>
                    Superadmin Console
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted, #64748b)" }}>
                    ScrapVex Master Operations
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#0b8f3a", background: "#f0fdf4", padding: "2px 8px", borderRadius: "10px", display: "inline-block", marginTop: "4px" }}>
                    🟢 System Administrator
                  </span>
                </div>
              </div>

              {/* OPERATIONS */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>OPERATIONS</span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => setActiveTab("overview")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaInfoCircle /></div><span style={rowTextStyle}>Overview Dashboard</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("pickups")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#eff6ff", color: "#2563eb" }}><FaTruck /></div><span style={rowTextStyle}>Pickups ({pickups.length})</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("users")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fdf2f8", color: "#db2777" }}><FaUsers /></div><span style={rowTextStyle}>App Users ({allUsers.length})</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("collectors")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaTools /></div><span style={rowTextStyle}>Collectors ({collectors.length})</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("franchises")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fff7ed", color: "#ea580c" }}><FaMapMarkerAlt /></div><span style={rowTextStyle}>Franchises ({franchises.length})</span></div></div>
                </div>
              </div>

              {/* FINANCE */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>FINANCE</span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("accounting"); fetchAccountingData(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#f5f3ff", color: "#7c3aed" }}><FaChartLine /></div><span style={rowTextStyle}>Accounting Statements</span></div></div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("wallet"); fetchAllTransactions(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaWallet /></div><span style={rowTextStyle}>Platform Wallet Ledger</span></div></div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("inventory"); fetchAccountingData(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#e0e7ff", color: "#4338ca" }}><FaBoxes /></div><span style={rowTextStyle}>Stock & Inventory Valuation</span></div></div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("withdrawals"); fetchWithdrawals(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fef3c7", color: "#d97706" }}><FaMoneyCheckAlt /></div><span style={rowTextStyle}>Withdrawals & Payouts</span></div></div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("buyers"); fetchBuyers(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#eff6ff", color: "#2563eb" }}><FaBuilding /></div><span style={rowTextStyle}>Buyers Management</span></div></div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("suppliers"); fetchSuppliers(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fdf2f8", color: "#db2777" }}><FaTruck /></div><span style={rowTextStyle}>Sellers & Suppliers</span></div></div>
                </div>
              </div>

              {/* CATALOG */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>CATALOG</span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => setActiveTab("rates")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fef3c7", color: "#d97706" }}><FaTag /></div><span style={rowTextStyle}>Platform Scrap Rates</span></div></div>
                </div>
              </div>

              {/* COMMUNICATION */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>COMMUNICATION</span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("support"); fetchTickets(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#eff6ff", color: "#2563eb" }}><FaTicketAlt /></div><span style={rowTextStyle}>Support Tickets</span></div></div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("contacts"); fetchContactMessages(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#f5f3ff", color: "#7c3aed" }}><FaEnvelope /></div><span style={rowTextStyle}>Contact Submissions</span></div></div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("broadcasts"); fetchBroadcasts(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fdf2f8", color: "#db2777" }}><FaRss /></div><span style={rowTextStyle}>Push Broadcasts</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("whatsapp")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#f0fdf4", color: "#25D366" }}><FaWhatsapp /></div><span style={rowTextStyle}>WhatsApp Engine Gateway</span></div></div>
                </div>
              </div>

              {/* SYSTEM */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>SYSTEM</span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("audit"); fetchAuditLogs(); }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#eff6ff", color: "#2563eb" }}><FaClipboardList /></div><span style={rowTextStyle}>Audit Logs</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("ads")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fff7ed", color: "#ea580c" }}><FaAd /></div><span style={rowTextStyle}>Promotional Banners</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("reviews")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#fef3c7", color: "#d97706" }}><FaStar /></div><span style={rowTextStyle}>Customer Reviews</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("settings")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "var(--bg-main, #f8fafc)", color: "var(--text-muted, #64748b)" }}><FaCog /></div><span style={rowTextStyle}>Platform Settings</span></div></div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("reports")}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ ...iconSquareStyle, background: "#f5f3ff", color: "#7c3aed" }}><FaChartLine /></div><span style={rowTextStyle}>Reports & Export Statements</span></div></div>
                </div>
              </div>

              {/* LOGOUT */}
              <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid #fee2e2", overflow: "hidden", marginTop: "8px" }}>
                <div style={{ ...accountRowStyle, color: "#dc2626" }} onClick={logout}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ ...iconSquareStyle, background: "#fee2e2", color: "#dc2626" }}><FaSignOutAlt /></div>
                    <span style={{ ...rowTextStyle, color: "#dc2626", fontWeight: "800" }}>Sign Out</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="kpi-card-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(11, 143, 58, 0.1)", color: "var(--primary)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaUsers /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Total Users</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>{stats.totalUsers}</div></div>
                  </div>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(44, 62, 80, 0.1)", color: "#2c3e50", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaTruck /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Total Pickups</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>{stats.totalPickups}</div></div>
                  </div>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(243, 156, 18, 0.1)", color: "#f39c12", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaChartLine /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>App Value</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>₹{accountingStats.totalCompletedPickupAmount?.toFixed(0) || 0}</div></div>
                  </div>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(230, 126, 34, 0.1)", color: "#e67e22", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaChartLine /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Sys Sale Vol</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>₹{accountingStats.totalNetworkSale?.toFixed(0) || 0}</div></div>
                  </div>
                </div>
  
                <div className="kpi-card-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(22, 160, 133, 0.1)", color: "#16a085", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaPercent /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Commission</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>₹{accountingStats.totalCommission?.toFixed(2) || 0}</div></div>
                  </div>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(11, 143, 58, 0.1)", color: "var(--primary)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaRupeeSign /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Net Profit</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>₹{((accountingStats.overallProfit || 0) + (accountingStats.totalCommission || 0)).toFixed(2)}</div></div>
                  </div>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(155, 89, 182, 0.1)", color: "#9b59b6", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaWallet /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>User Wallet</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>₹{walletStats.customerWalletBalance || 0}</div></div>
                  </div>
                  <div className="kpi-card" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}><FaBuilding /></div>
                    <div><div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Partner Wallets</div><div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)" }}>₹{walletStats.partnerWalletBalance || 0}</div></div>
                  </div>
                </div>
  
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                   <div className="card-premium" style={{ flex: 2, minWidth: "300px", background: "var(--card-bg)", borderRadius: "var(--radius-xl)", padding: "24px", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
                      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-main)" }}>Recent Activity</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                         <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", margin: "0" }}>LATEST PICKUPS</h4>
                         {filteredPickups.slice(0, 3).map(p => (
                           <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
                             <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>{p.scrapType} <span style={{ color:"var(--text-muted)", fontWeight: "normal", fontSize: "13px" }}>• {p.name}</span></span>
                             <span className={`badge-status badge-${p.status.toLowerCase()}`}>{p.status}</span>
                           </div>
                         ))}
                         
                         <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", margin: "16px 0 0 0" }}>LATEST WALLET ACTIONS</h4>
                         {transactions.slice(0, 3).map(tx => (
                           <div key={tx._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
                             <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>{tx.description} <small style={{ color:"var(--text-muted)", fontWeight: "normal", fontSize: "13px" }}>• {tx.user?.name}</small></span>
                             <span style={{ fontWeight:"bold", color: tx.type==="credit" ? "var(--success)" : "var(--danger)", fontSize:"14px" }}>
                               {tx.type==="credit"?"+":"-"}₹{tx.amount}
                             </span>
                           </div>
                         ))}
                      </div>
                      {pickups.length === 0 && transactions.length === 0 && <p className="empty-state">No activity recorded yet.</p>}
                   </div>
                   
                   <div className="card-premium" style={{ flex: 1, minWidth: "250px", background: "var(--card-bg)", borderRadius: "var(--radius-xl)", padding: "24px", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
                      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-main)" }}>Quick Access</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                         <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-start", padding: "12px 16px", width: "100%", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold" }} onClick={()=>setShowUserModal(true)}><FaUserPlus style={{color:"var(--primary)"}}/> Register User</button>
                         <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-start", padding: "12px 16px", width: "100%", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold" }} onClick={()=>setShowCollectorModal(true)}><FaPlus style={{color:"var(--primary)"}}/> Hire Collector</button>
                         <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-start", padding: "12px 16px", width: "100%", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold" }} onClick={()=>{setActiveTab("accounting"); fetchAccountingData();}}><FaChartLine style={{color:"var(--primary)"}}/> Open Accounting</button>
                         <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-start", padding: "12px 16px", width: "100%", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold" }} onClick={()=>setShowWalletModal(true)}><FaWallet style={{color:"var(--primary)"}}/> Wallet Adjust</button>
                         <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-start", padding: "12px 16px", width: "100%", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold" }} onClick={()=>setActiveTab("rates")}><FaTag style={{color:"var(--primary)"}}/> Update Rates</button>
                      </div>
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "pickups" && (
             <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "var(--text-main)" }}>Pickup History</h3>
                <div className="desktop-only">
                  <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--text-muted)", fontSize: "13px" }}>
                        <th style={{ padding: "12px 8px" }}>Type & Customer</th>
                        <th style={{ padding: "12px 8px" }}>Location</th>
                        <th style={{ padding: "12px 8px" }}>Status</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPickups.map(p => (
                        <tr key={p._id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                          <td style={{ padding: "12px 8px" }}>
                            <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>{p.scrapType}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{p.name} • {p.mobile}</div>
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: "13px", color: "var(--text-main)" }}>{p.address}</td>
                          <td style={{ padding: "12px 8px" }}>
                            <span className={`badge-status badge-${p.status.toLowerCase()}`}>{p.status}</span>
                          </td>
                          <td style={{ padding: "12px 8px", textAlign: "right" }}>
                            {["Pending", "Rejected"].includes(p.status) && (
                              <button className="btn-premium" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={()=>{setSelectedPickup(p); setShowAssignModal(true);}}>
                                Assign Now
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPickups.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No pickups found.</div>}
                </div>
                <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                   {filteredPickups.map(p => (
                     <div key={p._id} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", padding: "16px", border: "1px solid var(--glass-border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                           <div>
                              <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "15px" }}>{p.scrapType}</div>
                              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{p.name} • {p.mobile}</div>
                           </div>
                           <span className={`badge-status badge-${p.status.toLowerCase()}`}>{p.status}</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "12px" }}>📍 {p.address}</div>
                        {["Pending", "Rejected"].includes(p.status) && (
                          <button className="btn-premium" style={{ width: "100%", padding: "10px" }} onClick={()=>{setSelectedPickup(p); setShowAssignModal(true);}}>
                            Assign Collector
                          </button>
                        )}
                     </div>
                   ))}
                   {filteredPickups.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No pickups found.</div>}
                </div>
             </div>
          )}

          {activeTab === "settings" && (
             <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Global Platform & Dynamic Brand Settings</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                   <div style={{ background: "var(--bg-subtle)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                      <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", fontSize: "14px" }}>🎨 Brand, Festival Logo & Icons</h4>
                      
                      <label style={labelStyle}> Upload Brand / Festival Logo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setBrandLogoFile(e.target.files[0])}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      {settings.brandLogo && (
                        <div style={{ margin: "5px 0 15px 0" }}>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Active Website Logo:</small>
                          <img src={settings.brandLogo.startsWith("http") ? settings.brandLogo : `${getBackendURL()}${settings.brandLogo}`} alt="Brand Logo" style={{ height: "45px", objectFit: "contain", borderRadius: "8px", background: "#f8f9fa", padding: "4px", border: "1px solid #ddd" }} />
                        </div>
                      )}

                      <label style={labelStyle}> Upload Favicon (Browser Tab Icon)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setFaviconFile(e.target.files[0])}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      {settings.favicon && (
                        <div style={{ margin: "5px 0 15px 0" }}>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Active Favicon Icon:</small>
                          <img src={settings.favicon.startsWith("http") ? settings.favicon : `${getBackendURL()}${settings.favicon}`} alt="Favicon" style={{ height: "32px", width: "32px", objectFit: "contain", borderRadius: "6px", background: "#f8f9fa", padding: "4px", border: "1px solid #ddd" }} />
                        </div>
                      )}

                      <label style={labelStyle}> Upload Mobile App Icon</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setAppIconFile(e.target.files[0])}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      {settings.appIcon && (
                        <div style={{ margin: "5px 0 15px 0" }}>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Active App Icon:</small>
                          <img src={settings.appIcon.startsWith("http") ? settings.appIcon : `${getBackendURL()}${settings.appIcon}`} alt="App Icon" style={{ height: "45px", width: "45px", objectFit: "contain", borderRadius: "10px", background: "#f8f9fa", padding: "4px", border: "1px solid #ddd" }} />
                        </div>
                      )}

                      <label style={labelStyle}> Upload Festival Hero Banner (Desktop - 16:9)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setHeroBannerFile(e.target.files[0])}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      {settings.heroBanner && (
                        <div style={{ margin: "5px 0 15px 0" }}>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Active Desktop Banner:</small>
                          <img src={settings.heroBanner.startsWith("http") ? settings.heroBanner : `${getBackendURL()}${settings.heroBanner}`} alt="Hero Banner" style={{ height: "60px", maxWidth: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }} />
                        </div>
                      )}

                      <label style={labelStyle}> Upload Mobile Festival Hero Banner (Mobile App - 4:3 / 1:1)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setMobileHeroBannerFile(e.target.files[0])}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      {settings.mobileHeroBanner && (
                        <div style={{ margin: "5px 0 15px 0" }}>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Active Mobile Banner:</small>
                          <img src={settings.mobileHeroBanner.startsWith("http") ? settings.mobileHeroBanner : `${getBackendURL()}${settings.mobileHeroBanner}`} alt="Mobile Hero Banner" style={{ height: "60px", maxWidth: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }} />
                        </div>
                      )}

                      <label style={labelStyle}> Brand Tagline</label>
                      <Input value={settings.brandTagline || ""} onChange={v => setSettings({...settings, brandTagline: v})} placeholder="e.g. Jammu & Kashmir Ka Pehla Digital Kabadiwala" />

                      <h4 style={{ margin: "15px 0 15px 0", color: "var(--primary)", fontSize: "14px" }}>🚨 App Maintenance Control</h4>
                      <label style={labelStyle}> Maintenance Mode Status</label>
                      <select 
                        style={{ ...inputStyle, cursor: "pointer", fontWeight: "bold", background: settings.isMaintenanceMode ? "#fff5f5" : "#eef8f1", color: settings.isMaintenanceMode ? "#dc3545" : "#0b8f3a" }} 
                        value={settings.isMaintenanceMode ? "true" : "false"} 
                        onChange={e => setSettings({...settings, isMaintenanceMode: e.target.value === "true"})}
                      >
                        <option value="false">🟢 LIVE (App & Website Working Normal)</option>
                        <option value="true">🔴 MAINTENANCE MODE ON (Block App & Show Banner)</option>
                      </select>

                      <label style={labelStyle}> Maintenance Banner Message</label>
                      <Input value={settings.maintenanceMessage || ""} onChange={v => setSettings({...settings, maintenanceMessage: v})} placeholder="Message displayed to users when maintenance is ON" />

                      <h4 style={{ margin: "15px 0 15px 0", color: "var(--primary)", fontSize: "14px" }}>📢 Top Live Alert Announcement</h4>
                      <label style={labelStyle}> Live Ticker Message (Shown on Top Header)</label>
                      <Input value={settings.announcementText || ""} onChange={v => setSettings({...settings, announcementText: v})} placeholder="e.g. ⚡ Special Rate Boost Today: Copper rates up by 5% in Jammu!" />

                      <label style={labelStyle}><FaRupeeSign/> Min Order Value (₹)</label>
                      <Input type="number" value={settings.minAmount} onChange={v => setSettings({...settings, minAmount: v})} />
                      
                      <label style={labelStyle}><FaPercent/> Pickup Commission (%)</label>
                      <Input type="number" value={settings.pickupCommissionPercentage} onChange={v => setSettings({...settings, pickupCommissionPercentage: v})} />
                   </div>

                   <div style={{ background: "var(--bg-subtle)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                      <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", fontSize: "14px" }}>🎁 Rewards & Operational Charges</h4>
                      
                      <label style={labelStyle}><FaRupeeSign/> Referral Cash Bonus (₹)</label>
                      <Input type="number" value={settings.referralBonusAmount || 50} onChange={v => setSettings({...settings, referralBonusAmount: v})} placeholder="Cash awarded on successful referral" />

                      <label style={labelStyle}><FaRupeeSign/> Optional Service / Handling Fee (₹)</label>
                      <Input type="number" value={settings.serviceCharge || 0} onChange={v => setSettings({...settings, serviceCharge: v})} placeholder="Set 0 for Free Pickup" />

                      <h4 style={{ margin: "15px 0 15px 0", color: "var(--primary)", fontSize: "14px" }}>📞 Contact & Social Links</h4>

                      <label style={labelStyle}><FaEnvelope/> Business Email</label>
                      <Input value={settings.contactEmail} onChange={v => setSettings({...settings, contactEmail: v})} />
                      
                      <label style={labelStyle}><FaPhone/> Business Phone</label>
                      <Input value={settings.contactPhone} onChange={v => setSettings({...settings, contactPhone: v})} />
                      
                      <label style={labelStyle}><FaRupeeSign/> Platform UPI ID for Deposits</label>
                      <Input value={settings.upiId || ""} onChange={v => setSettings({...settings, upiId: v})} />

                      <label style={labelStyle}><FaMapMarkerAlt/> Office Address</label>
                      <Input value={settings.officeAddress} onChange={v => setSettings({...settings, officeAddress: v})} />

                      <label style={labelStyle}><FaFacebook/> Facebook URL</label>
                      <Input value={settings.facebookUrl} onChange={v => setSettings({...settings, facebookUrl: v})} />

                      <label style={labelStyle}><FaInstagram/> Instagram URL</label>
                      <Input value={settings.instagramUrl} onChange={v => setSettings({...settings, instagramUrl: v})} />
                   </div>
                 </div>
                 <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                   <button style={{ ...saveBtnBig, flex: 2 }} onClick={handleUpdateSettings}>Save All Configurations</button>
                   <button style={{ ...saveBtnBig, flex: 1, background: "#dc2626" }} onClick={handleCleanTestData}>🧹 Clean Test Data (Keep Franchise)</button>
                 </div>
              </div>
          )}

          {/* OTHER TABS (Users, Collectors, Rates, Ads, Reviews) with same premium-card style... */}
          {activeTab === "rates" && (
             <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)" }}>Scrap Rates</h3> 
                  <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={()=>setShowItemModal(true)}><FaPlus/> Add Rate</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                  {filteredItems.map(it => (
                    <div key={it._id} style={{ background: "var(--card-bg, #ffffff)", border: "1.5px solid var(--card-border, #cbd5e1)", borderRadius: "14px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", width: "100%", boxSizing: "border-box" }}>
                       <div style={{ flex: "1 1 0", minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
                          <span style={{ display: "inline-block", background: "#f0fdf4", color: "#0b8f3a", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "6px", textTransform: "uppercase" }}>{it.category}</span>
                       </div>
                       <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                          <strong style={{ color: "#0b8f3a", fontSize: "15px", fontWeight: "900" }}>₹{it.price}<small style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "normal" }}>/{it.unit}</small></strong>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="btn-secondary" style={{ padding: "6px 8px", border: "1.5px solid var(--card-border, #cbd5e1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={()=>{setEditingRate(it); setShowEditRateModal(true);}}><FaTools size={12}/></button>
                            <button className="btn-danger" style={{ padding: "6px 8px", border: "1px solid #fca5a5", borderRadius: "8px", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={()=>handleDeleteItem(it._id, "rate")}><FaTrash size={12}/></button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
                {filteredItems.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No rates found.</div>}
             </div>
          )}
          
          {(activeTab === "users" || activeTab === "collectors" || activeTab === "franchises") && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>{activeTab}</h3> 
                <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={() => activeTab === "users" ? setShowUserModal(true) : activeTab === "franchises" ? setShowFranchiseModal(true) : setShowCollectorModal(true)}><FaPlus/> Add New</button>
              </div>
              <div className="desktop-only">
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--text-muted)", fontSize: "13px" }}>
                      <th style={{ padding: "12px 8px" }}>Name & Mobile</th>
                      <th style={{ padding: "12px 8px" }}>Role Details</th>
                      <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === "users" ? filteredUsers : activeTab === "franchises" ? filteredFranchises : filteredCollectors).map(u => (
                      <tr key={u._id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>{u.name}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{u.mobile}</div>
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: "13px", color: "var(--text-muted)" }}>
                          {u.area && <span style={{ display: "inline-block", background: "rgba(44, 62, 80, 0.1)", color: "#2c3e50", padding: "4px 8px", borderRadius: "6px", marginRight: "6px" }}>Area: {u.area}</span>}
                          {u.assignedCity && <span style={{ display: "inline-block", background: "rgba(11, 143, 58, 0.1)", color: "var(--primary)", padding: "4px 8px", borderRadius: "6px", marginRight: "6px" }}>City: {u.assignedCity}</span>}
                          {u.walletBalance !== undefined && <span style={{ display: "inline-block", background: "rgba(243, 156, 18, 0.1)", color: "#f39c12", padding: "4px 8px", borderRadius: "6px" }}>Wallet: ₹{u.walletBalance}</span>}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid var(--glass-border)", borderRadius: "6px" }} onClick={() => { setWalletForm({ userId: u._id, amount: "", type: "credit", description: "Admin Transfer" }); setShowWalletModal(true); }}>Transfer</button>
                            <button className="btn-secondary" style={{ padding: "6px 10px", border: "1px solid var(--glass-border)", borderRadius: "6px" }} onClick={() => { setResetData({ userId: u._id, name: u.name, newPassword: "" }); setShowResetModal(true); }}><FaKey/></button>
                            <button className="btn-danger" style={{ padding: "6px 10px", border: "1px solid #fca5a5", borderRadius: "6px", background: "#fee2e2", color: "#ef4444" }} onClick={() => handleDeleteItem(u._id, activeTab === "users" ? "user" : activeTab === "franchises" ? "franchise" : "collector")}><FaTrash/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(activeTab === "users" ? filteredUsers : activeTab === "franchises" ? filteredFranchises : filteredCollectors).map(u => (
                  <div key={u._id} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", padding: "16px", border: "1px solid var(--glass-border)" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                           <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "15px" }}>{u.name}</div>
                           <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{u.mobile}</div>
                        </div>
                        {u.walletBalance !== undefined && <div style={{ fontSize: "14px", fontWeight: "bold", color: "#f39c12" }}>₹{u.walletBalance}</div>}
                     </div>
                     <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                        {u.area && `Area: ${u.area} `} {u.assignedCity && `City: ${u.assignedCity}`}
                     </div>
                     <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn-secondary" style={{ flex: 1, padding: "8px", border: "1px solid var(--glass-border)", borderRadius: "6px" }} onClick={() => { setWalletForm({ userId: u._id, amount: "", type: "credit", description: "Admin Transfer" }); setShowWalletModal(true); }}>Transfer</button>
                       <button className="btn-secondary" style={{ padding: "8px", border: "1px solid var(--glass-border)", borderRadius: "6px" }} onClick={() => { setResetData({ userId: u._id, name: u.name, newPassword: "" }); setShowResetModal(true); }}><FaKey/></button>
                       <button className="btn-danger" style={{ padding: "8px", border: "1px solid #fca5a5", borderRadius: "6px", background: "#fee2e2", color: "#ef4444" }} onClick={() => handleDeleteItem(u._id, activeTab === "users" ? "user" : activeTab === "franchises" ? "franchise" : "collector")}><FaTrash/></button>
                     </div>
                  </div>
                ))}
              </div>
              {(activeTab === "users" ? filteredUsers : activeTab === "franchises" ? filteredFranchises : filteredCollectors).length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No records found.</div>}
            </div>
          )}

          {activeTab === "ads" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Managed Banners</h3> 
                <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={() => setShowAdModal(true)}><FaPlus/> Add Banner</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                {ads.map(ad => (
                  <div key={ad._id} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)", overflow: "hidden", display: "flex", flexDirection: "column" }} className="premium-card">
                    <img src={ad.imageUrl} style={{ width: "100%", height: "120px", objectFit: "cover" }} alt="" />
                    <div style={{padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                       <span style={{fontSize: "13px", fontWeight: "700", color: "var(--text-main)"}}>{ad.title}</span>
                       <button className="btn-danger" style={{ padding: "6px", border: "1px solid #fca5a5", borderRadius: "6px", background: "#fee2e2", color: "#ef4444" }} onClick={() => handleDeleteItem(ad._id, "ad")}><FaTrash size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
              {ads.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No banners configured.</div>}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Platform Reviews</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reviews.map(r => (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                     <div>
                        <div style={{color: "#f39c12", marginBottom:"6px"}}>{[...Array(Number(r.rating) || 0)].map((_, i) => <FaStar key={i} size={14}/>)}</div>
                        <div style={{fontSize:"14px", marginBottom: "6px", color: "var(--text-main)"}}>
                          <strong>{r.user?.name}</strong> <span style={{color:"var(--text-muted)", fontSize:"12px"}}>reviewed</span> <strong>{r.collector?.name || "Unknown"}</strong>
                        </div>
                        <span style={{fontSize:"13px", color:"var(--text-muted)", fontStyle: "italic"}}>"{r.comment}"</span>
                     </div>
                     <div style={{textAlign: "right"}}>
                        <small style={{ color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                     </div>
                  </div>
                ))}
                {reviews.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No reviews yet.</div>}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Wallet & Transactions</h3>
                <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={()=>setShowWalletModal(true)}><FaPlus/> Manual Adjust</button>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                 <div style={{ background: "rgba(11, 143, 58, 0.05)", border: "1px solid rgba(11, 143, 58, 0.2)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                    <small style={{ color: "var(--primary)", fontWeight: "700", textTransform: "uppercase" }}>Available Liability</small>
                    <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--primary)", marginTop: "8px" }}>₹{walletStats.totalAvailable}</div>
                 </div>
                 <div style={{ background: "rgba(243, 156, 18, 0.05)", border: "1px solid rgba(243, 156, 18, 0.2)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                    <small style={{ color: "#f39c12", fontWeight: "700", textTransform: "uppercase" }}>Pending Liability</small>
                    <div style={{ fontSize: "24px", fontWeight: "900", color: "#f39c12", marginTop: "8px" }}>₹{walletStats.totalPending}</div>
                 </div>
                 <div style={{ background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.2)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                    <small style={{ color: "#4f46e5", fontWeight: "700", textTransform: "uppercase" }}>Total Users</small>
                    <div style={{ fontSize: "24px", fontWeight: "900", color: "#4f46e5", marginTop: "8px" }}>{walletStats.userCount}</div>
                 </div>
              </div>

              {transactions.filter(tx => tx.source === "deposit" && tx.status === "pending").length > 0 && (
                <div style={{ marginBottom: "24px", border: "1px solid rgba(243, 156, 18, 0.3)", background: "rgba(243, 156, 18, 0.05)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                  <h4 style={{ margin: "0 0 16px 0", color: "#b9770e", fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                    ⚠️ PENDING UPI DEPOSIT REQUESTS ({transactions.filter(tx => tx.source === "deposit" && tx.status === "pending").length})
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {transactions.filter(tx => tx.source === "deposit" && tx.status === "pending").map(dep => (
                      <div key={dep._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }} className="premium-card">
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)" }}>{dep.user?.name || "Unknown User"} ({dep.user?.mobile || "N/A"})</div>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                            <strong>UTR/UPI Ref No:</strong> <span style={{ fontFamily: "monospace", background: "var(--bg-subtle)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--glass-border)", color: "var(--text-main)" }}>{dep.depositDetails?.upiRefNo || "N/A"}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Requested: {new Date(dep.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <span style={{ fontSize: "20px", fontWeight: "900", color: "var(--primary)", marginRight: "8px" }}>₹{dep.amount}</span>
                          <button className="btn-secondary" style={{ background: "rgba(11, 143, 58, 0.1)", color: "var(--primary)", border: "1px solid rgba(11, 143, 58, 0.2)", padding: "8px 16px" }} onClick={() => handleApproveDeposit(dep._id)}>Approve ✅</button>
                          <button className="btn-secondary" style={{ background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "1px solid rgba(220, 53, 69, 0.2)", padding: "8px 16px" }} onClick={() => handleRejectDeposit(dep._id)}>Reject ❌</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredTransactions.map(tx => (
                  <div key={tx._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                    <div style={{display:"flex", gap:"16px", alignItems:"center"}}>
                       <div style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", background: tx.status==="paid_in_cash" ? "rgba(243, 156, 18, 0.1)" : (tx.type==="credit"?"rgba(11, 143, 58, 0.1)":"rgba(220, 53, 69, 0.1)")}}>
                          {tx.status==="paid_in_cash" ? <FaRupeeSign color="#f39c12"/> : (tx.type==="credit" ? <FaArrowUp color="var(--primary)"/> : <FaArrowDown color="#dc3545"/>)}
                       </div>
                       <div>
                          <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "15px" }}>{tx.description}</div>
                          <small style={{ color: "var(--text-muted)", fontSize: "12px" }}>{tx.user?.name} ({tx.user?.mobile}) • {new Date(tx.createdAt).toLocaleString()}</small>
                       </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                       <div style={{fontWeight:"900", fontSize: "16px", color: tx.status==="paid_in_cash" ? "var(--text-muted)" : (tx.type==="credit"?"var(--primary)":"#dc3545")}}>
                          {tx.status==="paid_in_cash"?"":" "}{tx.type==="credit"?"+":"-"}₹{tx.amount}
                       </div>
                       <span className={`badge-status badge-${tx.status==="paid_in_cash"?"pending": tx.status==="completed"?"completed":"cancelled"}`}>
                          {tx.status.replace(/_/g, " ")}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          
          {/* ═══════════════ INVENTORY TAB (STANDALONE NATIVE MOBILE APP VIEW) ═══════════════ */}
          {activeTab === "inventory" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "900", color: "var(--text-main)" }}>Live Scrap Inventory</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>Current material stock & valuation</p>
                </div>
                <button className="btn-premium" style={{ height: "36px", padding: "0 12px", fontSize: "12px" }} onClick={() => { setActiveTab("accounting"); setShowPurchaseModal(true); }}>
                  + Add Stock
                </button>
              </div>

              {/* Total Valuation Card */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#0b8f3a", textTransform: "uppercase" }}>Total Stock Valuation</div>
                  <div style={{ fontSize: "24px", fontWeight: "900", color: "#0b8f3a", marginTop: "4px" }}>₹{accountingStats.stockValue?.toFixed(2) || "0.00"}</div>
                </div>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#0b8f3a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                  <FaBoxes />
                </div>
              </div>

              {/* Inventory Item Cards */}
              <div className="grid-2">
                {filteredInventory.map(inv => (
                  <div key={inv._id} style={{ background: "var(--card-bg, #ffffff)", border: "1px solid var(--card-border, #e2e8f0)", borderRadius: "16px", padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "15px", color: "var(--text-main)" }}>{inv.name}</div>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: "#0b8f3a", background: "#f0fdf4", padding: "2px 8px", borderRadius: "8px", textTransform: "uppercase", display: "inline-block", marginTop: "4px" }}>{inv.category || "Scrap"}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "900", fontSize: "16px", color: "#0b8f3a" }}>{inv.quantity} <small style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "normal" }}>{inv.unit || "kg"}</small></div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>₹{inv.avgPrice || inv.price || 0}/{inv.unit || "kg"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--card-border, #f1f5f9)", fontSize: "12px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Total Value:</span>
                      <strong style={{ color: "var(--text-main)" }}>₹{((inv.quantity || 0) * (inv.avgPrice || inv.price || 0)).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
              {filteredInventory.length === 0 && <div className="empty-state">No stock items in inventory.</div>}
            </div>
          )}

          {activeTab === "accounting" && (
            <div className="card-premium fade-up no-print" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)" }}>Vyapar Billing & Accounting</h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", width: "100%" }}>
                  <button className="btn-secondary" style={{ flex: "1 1 130px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 12px", background: "var(--bg-subtle)", border: "1.5px solid var(--card-border, #cbd5e1)", color: "var(--text-main)", borderRadius: "12px", fontWeight: "800", fontSize: "13px" }} onClick={()=>setShowPurchaseModal(true)}><FaPlus/> Record Purchase</button>
                  <button className="btn-premium" style={{ flex: "1 1 130px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 12px", borderRadius: "12px", fontWeight: "800", fontSize: "13px" }} onClick={()=>setShowSaleModal(true)}><FaPlus/> Create Sale Invoice</button>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                <div style={{ background: accountingStats.overallProfit >= 0 ? "rgba(11, 143, 58, 0.05)" : "rgba(220, 53, 69, 0.05)", border: accountingStats.overallProfit >= 0 ? "1px solid rgba(11, 143, 58, 0.2)" : "1px solid rgba(220, 53, 69, 0.2)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                    <small style={{color: accountingStats.overallProfit >= 0 ? "var(--primary)" : "#dc3545", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px"}}>📈 Admin Net Profit</small>
                    <div style={{fontSize:"24px", fontWeight:"900", color: accountingStats.overallProfit >= 0 ? "var(--primary)" : "#dc3545", marginTop: "8px"}}>
                      {accountingStats.overallProfit >= 0 ? "+" : "-"}₹{Math.abs(accountingStats.overallProfit || 0).toFixed(2)}
                    </div>
                    <small style={{color:"var(--text-muted)", fontSize:"11px", marginTop: "4px", display: "block"}}>Total Sales - Total Purchases</small>
                </div>
                <div style={{ background: "rgba(44, 62, 80, 0.05)", border: "1px solid rgba(44, 62, 80, 0.1)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                    <small style={{color: "#2c3e50", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px"}}>💰 Admin Stock Value</small>
                    <div style={{fontSize:"24px", fontWeight:"900", color:"#2c3e50", marginTop: "8px"}}>₹{accountingStats.stockValue?.toFixed(2) || 0}</div>
                    <small style={{color:"var(--text-muted)", fontSize:"11px", marginTop: "4px", display: "block"}}>Investment in your stock</small>
                </div>
                <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                    <small style={{color: "var(--text-main)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px"}}>🛒 Admin Purchases</small>
                    <div style={{fontSize:"24px", fontWeight:"900", color:"var(--text-main)", marginTop: "8px"}}>₹{accountingStats.totalPurchaseAmount?.toFixed(2)}</div>
                    <small style={{color:"var(--text-muted)", fontSize:"11px", marginTop: "4px", display: "block"}}>Your direct material buys</small>
                </div>
                <div style={{ background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.1)", padding: "20px", borderRadius: "var(--radius-lg)" }}>
                    <small style={{color: "#4f46e5", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px"}}>💵 Admin Sales</small>
                    <div style={{fontSize:"24px", fontWeight:"900", color:"#4f46e5", marginTop: "8px"}}>₹{accountingStats.totalSaleAmount?.toFixed(2)}</div>
                    <small style={{color:"var(--text-muted)", fontSize:"11px", marginTop: "4px", display: "block"}}>Your direct revenue</small>
                </div>
              </div>

              <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-main)" }}>Live Inventory</h4>
              <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", marginBottom: "32px", padding: "16px", background: "var(--bg-subtle)" }}>
                 {filteredInventory.map(inv => (
                   <div key={inv._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid var(--glass-border)" }}>
                      <div style={{display:"flex", gap:"16px", alignItems:"center"}}>
                         <img src={inv.scrapItem?.image || "https://via.placeholder.com/48"} style={{width:"48px", height:"48px", borderRadius:"12px", objectFit:"cover"}} alt=""/>
                         <div>
                            <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)", marginBottom: "4px" }}>{inv.scrapItem?.name} <span style={{ color: "var(--text-muted)", fontWeight: "normal", fontSize: "13px" }}>({inv.scrapItem?.category})</span></div>
                            <small style={{ color: "var(--text-muted)" }}>Bought: {inv.totalBoughtQuantity} {inv.scrapItem?.unit} | Sold: {inv.totalSoldQuantity} {inv.scrapItem?.unit}</small>
                         </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                         <div style={{fontSize: "18px", fontWeight: "900", color: inv.quantityAvailable > 0 ? "var(--primary)" : "#dc3545"}}>
                           {inv.quantityAvailable} <span style={{ fontSize: "14px", fontWeight: "normal" }}>{inv.scrapItem?.unit}</span>
                         </div>
                         <small style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>Available in Stock</small>
                      </div>
                   </div>
                 ))}
                 {inventory.length === 0 && <p className="empty-state" style={{ textAlign: "center", color: "var(--text-muted)" }}>No inventory data yet.</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                <div style={{ border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "20px", background: "var(--bg-main)" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-main)" }}>Recent Purchases (Kharida)</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                     {filteredPurchases.map(p => (
                       <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px", background: "var(--card-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)", cursor: "pointer", transition: "0.2s" }} onClick={() => openPurchaseBillModal(p)}>
                          <div>
                             <div style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{p.supplierName}</div>
                             <small style={{ color: "var(--text-muted)" }}>{p.supplierContact} • {new Date(p.createdAt).toLocaleDateString()} • Items: {p.items.length}</small>
                          </div>
                          <div style={{textAlign:"right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px"}}>
                             <div style={{fontWeight:"900", color:"#dc3545", fontSize: "16px"}}>-₹{p.totalAmount}</div>
                             <span className={`badge-status badge-${p.paymentStatus.toLowerCase()}`}>{p.paymentStatus}</span>
                             <div style={{display: "flex", gap: "6px"}}>
                               <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={(e) => { e.stopPropagation(); openPurchaseBillModal(p); }}>📄 Bill</button>
                               <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={(e) => { e.stopPropagation(); openEditPurchase(p); }}>✏️ Edit</button>
                             </div>
                          </div>
                       </div>
                     ))}
                     {purchases.length === 0 && <p className="empty-state" style={{ textAlign: "center", color: "var(--text-muted)" }}>No manual purchases yet.</p>}
                  </div>
                </div>
                
                <div style={{ border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "20px", background: "var(--bg-main)" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-main)" }}>Sales & Invoices</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                     {filteredSales.map(sale => (
                       <div key={sale._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px", background: "var(--card-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
                          <div>
                             <div style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{sale.buyerName}</div>
                             <small style={{ color: "var(--text-muted)" }}>{sale.buyerContact} • {new Date(sale.createdAt).toLocaleDateString()} • {sale.invoiceNumber || "INV"}</small>
                          </div>
                          <div style={{textAlign:"right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px"}}>
                             <div style={{fontWeight:"900", color:"var(--primary)", fontSize: "16px"}}>+₹{sale.totalAmount}</div>
                             <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: "11px" }} onClick={() => { setSelectedInvoice(sale); setShowInvoiceModal(true); }}>View Invoice</button>
                          </div>
                       </div>
                     ))}
                     {sales.length === 0 && <p className="empty-state" style={{ textAlign: "center", color: "var(--text-muted)" }}>No sales recorded yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === "withdrawals" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Payout Requests</h3>
              <div className="desktop-only">
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--text-muted)", fontSize: "13px" }}>
                      <th style={{ padding: "12px 8px" }}>User Details</th>
                      <th style={{ padding: "12px 8px" }}>Bank / UPI</th>
                      <th style={{ padding: "12px 8px" }}>Status / Amount</th>
                      <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawals.map(w => (
                      <tr key={w._id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>{w.user?.name}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{w.user?.mobile} • {new Date(w.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: "13px" }}>
                          {w.bankDetails ? (
                            <div>
                              <strong>UPI:</strong> {w.bankDetails.upiId} <br/>
                              <strong>Name:</strong> {w.bankDetails.accountName}
                            </div>
                          ) : <span style={{ color: "var(--text-muted)" }}>N/A</span>}
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ fontWeight: "900", color: "var(--primary)", fontSize: "16px" }}>₹{w.amount}</div>
                          <span className={`badge-status badge-${w.status.toLowerCase()}`}>{w.status}</span>
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right" }}>
                          {w.status === "Pending" && (
                            <div style={{display: "flex", gap: "8px", justifyContent: "flex-end"}}>
                              <button className="btn-secondary" style={{ background: "rgba(11, 143, 58, 0.1)", color: "var(--primary)", border: "1px solid rgba(11, 143, 58, 0.2)", padding: "6px 12px" }} onClick={() => {
                                const tid = prompt("Enter Bank Payment Reference / UTR:");
                                if (tid) API.put(`/withdrawals/${w._id}`, { status: "Completed", transactionId: tid }).then(() => {
                                  showToast("success", "Withdrawal Approved & Processed! ✅");
                                  fetchWithdrawals();
                                });
                              }}>Approve ✅</button>
                              <button className="btn-secondary" style={{ background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "1px solid rgba(220, 53, 69, 0.2)", padding: "6px 12px" }} onClick={() => {
                                const reason = prompt("Enter Rejection Reason (this will be sent on WhatsApp):");
                                if (reason) API.put(`/withdrawals/${w._id}`, { status: "Rejected", adminNote: reason }).then(() => {
                                  showToast("success", "Withdrawal Rejected & Refunded! ❌");
                                  fetchWithdrawals();
                                });
                              }}>Reject ❌</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredWithdrawals.map(w => (
                  <div key={w._id} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", padding: "16px", border: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "15px" }}>₹{w.amount}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{w.user?.name} ({w.user?.mobile})</div>
                      </div>
                      <span className={`badge-status badge-${w.status.toLowerCase()}`}>{w.status}</span>
                    </div>
                    {w.bankDetails && (
                      <div style={{ background: "rgba(44, 62, 80, 0.05)", padding: "8px 12px", borderRadius: "var(--radius-md)", margin: "8px 0", fontSize: "12px", border: "1px solid rgba(44, 62, 80, 0.1)" }}>
                        <strong>UPI:</strong> {w.bankDetails.upiId} <br/>
                        <strong>Name:</strong> {w.bankDetails.accountName}
                      </div>
                    )}
                    <small style={{ color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>{new Date(w.createdAt).toLocaleString()}</small>
                    {w.status === "Pending" && (
                      <div style={{display: "flex", gap: "8px"}}>
                        <button className="btn-secondary" style={{ flex: 1, background: "rgba(11, 143, 58, 0.1)", color: "var(--primary)", border: "1px solid rgba(11, 143, 58, 0.2)", padding: "8px" }} onClick={() => {
                          const tid = prompt("Enter Bank Payment Reference / UTR:");
                          if (tid) API.put(`/withdrawals/${w._id}`, { status: "Completed", transactionId: tid }).then(() => {
                            showToast("success", "Withdrawal Approved! ✅");
                            fetchWithdrawals();
                          });
                        }}>Approve</button>
                        <button className="btn-secondary" style={{ flex: 1, background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "1px solid rgba(220, 53, 69, 0.2)", padding: "8px" }} onClick={() => {
                          const reason = prompt("Enter Rejection Reason:");
                          if (reason) API.put(`/withdrawals/${w._id}`, { status: "Rejected", adminNote: reason }).then(() => {
                            showToast("success", "Withdrawal Rejected! ❌");
                            fetchWithdrawals();
                          });
                        }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredWithdrawals.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No payout requests.</div>}
            </div>
          )}


          {activeTab === "support" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              {!selectedTicket ? (
                <>
                  <h3 style={{ margin: "0 0 20px 0", color: "var(--text-main)", fontSize: "18px", fontWeight: "bold", textTransform: "uppercase" }}>Global Support Tickets</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredTickets.map(t => (
                      <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)", padding: "16px" }}>
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "15px", marginBottom: "4px" }}>{t.subject}</div>
                          <small style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                            By: <strong>{t.user?.name}</strong> ({t.user?.mobile}) • Cat: <strong>{t.category}</strong> • {new Date(t.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", background: t.status === "open" ? "rgba(11, 143, 58, 0.1)" : t.status === "resolved" ? "rgba(66, 133, 244, 0.1)" : "rgba(243, 156, 18, 0.1)", color: t.status === "open" ? "#0b8f3a" : t.status === "resolved" ? "#4285f4" : "#f39c12" }}>
                            {t.status}
                          </span>
                          <button className="btn-secondary" style={{ padding: "6px 12px", border: "1px solid var(--glass-border)", borderRadius: "6px" }} onClick={() => setSelectedTicket(t)}>View & Reply</button>
                        </div>
                      </div>
                    ))}
                    {tickets.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No support tickets found.</div>}
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "15px" }}>
                    <button style={{ ...smBtn, background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--glass-border)" }} onClick={() => setSelectedTicket(null)}>
                      ← Back to List
                    </button>
                    <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "16px" }}>Ticket Detail</h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "25px" }}>
                    {/* Left Pane: Ticket Information */}
                    <div style={{ background: "var(--bg-main)", borderRadius: "15px", padding: "20px", border: "1px solid var(--glass-border)" }}>
                      <h4 style={{ margin: "0 0 15px 0", color: "var(--text-main)", fontSize: "14px" }}>Ticket Info</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Subject</small>
                          <strong style={{ color: "var(--text-main)" }}>{selectedTicket.subject}</strong>
                        </div>
                        <div>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Category</small>
                          <strong style={{ color: "var(--text-main)" }}>{selectedTicket.category}</strong>
                        </div>
                        <div>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Raised By</small>
                          <strong style={{ color: "var(--text-main)" }}>{selectedTicket.user?.name} ({selectedTicket.user?.mobile})</strong>
                        </div>
                        <div>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Created On</small>
                          <strong style={{ color: "var(--text-main)" }}>{new Date(selectedTicket.createdAt).toLocaleString()}</strong>
                        </div>
                        <div>
                          <small style={{ color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Status</small>
                          <select 
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)", outline: "none" }}
                            value={selectedTicket.status} 
                            onChange={e => handleUpdateTicketStatus(selectedTicket._id, e.target.value)}
                          >
                            <option value="open">Open</option>
                            <option value="in progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "12px", marginTop: "5px" }}>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Description</small>
                          <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "var(--text-main)", lineHeight: "1.4" }}>{selectedTicket.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Pane: Conversation & Reply */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      <div style={{ background: "var(--bg-main)", borderRadius: "15px", padding: "20px", border: "1px solid var(--glass-border)", height: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <h4 style={{ margin: "0 0 5px 0", color: "var(--text-main)", fontSize: "13px" }}>Conversation</h4>
                        
                        {/* Initial Message from User */}
                        <div style={{ alignSelf: "flex-start", background: "var(--card-bg)", padding: "10px 15px", borderRadius: "15px 15px 15px 0px", maxWidth: "80%", border: "1px solid var(--glass-border)" }}>
                          <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--primary)", marginBottom: "3px" }}>{selectedTicket.user?.name}</div>
                          <div style={{ fontSize: "13px", color: "var(--text-main)" }}>{selectedTicket.message}</div>
                          <small style={{ fontSize: "9px", color: "var(--text-muted)", float: "right", marginTop: "3px" }}>{new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>

                        {/* Replies */}
                        {selectedTicket.replies?.map((rep, idx) => (
                          <div key={idx} style={{ alignSelf: rep.sender?._id === selectedTicket.user?._id ? "flex-start" : "flex-end", background: rep.sender?._id === selectedTicket.user?._id ? "var(--card-bg)" : "var(--primary-light)", padding: "10px 15px", borderRadius: rep.sender?._id === selectedTicket.user?._id ? "15px 15px 15px 0px" : "15px 15px 0px 15px", maxWidth: "80%", border: rep.sender?._id === selectedTicket.user?._id ? "1px solid var(--glass-border)" : "none" }}>
                            <div style={{ fontSize: "11px", fontWeight: "bold", color: rep.sender?._id === selectedTicket.user?._id ? "var(--primary)" : "#0b8f3a", marginBottom: "3px" }}>{rep.sender?.name || "Admin"}</div>
                            <div style={{ fontSize: "13px", color: rep.sender?._id === selectedTicket.user?._id ? "var(--text-main)" : "#0c5826" }}>{rep.message}</div>
                            <small style={{ fontSize: "9px", color: rep.sender?._id === selectedTicket.user?._id ? "var(--text-muted)" : "rgba(11, 143, 58, 0.6)", float: "right", marginTop: "3px" }}>{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <input 
                          type="text" 
                          placeholder="Type reply to user..." 
                          style={{ flex: 1, padding: "12px 15px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", fontSize: "14px", outline: "none" }}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleReplyTicket(selectedTicket._id); }}
                        />
                        <button style={{ ...addBtn, padding: "0 25px" }} onClick={() => handleReplyTicket(selectedTicket._id)}>
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "broadcasts" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Push Broadcasts</h3> 
                <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={() => {
                  const title = prompt("Broadcast Title:");
                  const message = prompt("Message Content:");
                  const target = prompt("Target (Users/Collectors/Franchises):");
                  if(title && message) API.post("/broadcasts", { title, message, target }).then(()=>fetchBroadcasts());
                }}><FaPlus/> New Broadcast</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {broadcasts.map(b => (
                  <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "15px", marginBottom: "4px" }}>{b.title}</div>
                      <small style={{ color: "var(--text-muted)" }}>Target: <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{b.target}</span> • {new Date(b.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
                {broadcasts.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No broadcasts sent yet.</div>}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>System Audit Logs</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {auditLogs.map(l => (
                  <div key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px", marginBottom: "4px" }}>{l.action}</div>
                      <small style={{ color: "var(--text-muted)", fontSize: "12px" }}><span style={{ color: "var(--primary)", fontWeight: "bold" }}>{l.module}</span> • By: {l.performedBy?.name} • {new Date(l.createdAt).toLocaleString()}</small>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", background: "rgba(44, 62, 80, 0.05)", padding: "4px 8px", borderRadius: "6px" }}>{l.ipAddress}</div>
                  </div>
                ))}
                {auditLogs.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No logs recorded.</div>}
              </div>
            </div>
          )}

          {activeTab === "buyers" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                 <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Managed Buyers</h3> 
                 <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={()=>{setNewBuyer({ name: "", contact: "", email: "", address: "", gstin: "", pan: "" }); setShowBuyerModal(true);}}><FaPlus/> Add Buyer</button>
               </div>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {buyers.map(b => (
                    <div key={b._id} style={{ background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{b.name}</div>
                          <small style={{ color: "var(--text-muted)" }}>{b.contact} • {b.gstin || "No GST"}</small>
                       </div>
                       <div style={{display:"flex", gap:"8px"}}>
                          <button className="btn-secondary" style={{ padding: "6px", border: "1px solid var(--glass-border)", borderRadius: "6px" }} onClick={()=>{setNewBuyer(b); setShowBuyerModal(true);}}><FaTools size={12}/></button>
                          <button className="btn-danger" style={{ padding: "6px", border: "1px solid #fca5a5", borderRadius: "6px", background: "#fee2e2", color: "#ef4444" }} onClick={()=>handleDeleteItem(b._id, "buyer")}><FaTrash size={12}/></button>
                       </div>
                    </div>
                  ))}
               </div>
               {buyers.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No buyers registered.</div>}
            </div>
          )}

          {activeTab === "suppliers" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                 <h3 style={{ margin: "0", fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase" }}>Managed Sellers (Suppliers)</h3> 
                 <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={()=>{setNewSupplier({ name: "", contact: "", address: "", gstin: "", category: "Individual" }); setShowSupplierModal(true);}}><FaPlus/> Add Seller</button>
               </div>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {suppliers.map(s => (
                    <div key={s._id} style={{ background: "var(--bg-subtle)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{s.name}</div>
                          <span style={{ display: "inline-block", background: "rgba(44, 62, 80, 0.1)", color: "#2c3e50", fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "6px", marginBottom: "4px", textTransform: "uppercase" }}>{s.category}</span>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>{s.contact}</small>
                       </div>
                       <div style={{display:"flex", gap:"8px"}}>
                          <button className="btn-secondary" style={{ padding: "6px", border: "1px solid var(--glass-border)", borderRadius: "6px" }} onClick={()=>{setNewSupplier(s); setShowSupplierModal(true);}}><FaTools size={12}/></button>
                          <button className="btn-danger" style={{ padding: "6px", border: "1px solid #fca5a5", borderRadius: "6px", background: "#fee2e2", color: "#ef4444" }} onClick={()=>handleDeleteItem(s._id, "supplier")}><FaTrash size={12}/></button>
                       </div>
                    </div>
                  ))}
               </div>
               {suppliers.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No sellers registered.</div>}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <h3 style={{ margin: "0 0 20px 0", color: "var(--text-main)", fontSize: "18px", fontWeight: "bold", textTransform: "uppercase" }}>Guest Inquiries (Contact Us Messages)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {contacts.map(c => (
                  <div key={c._id} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px", background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-main)", marginBottom: "4px" }}>{c.subject}</div>
                        <small style={{ color: "var(--text-muted)" }}>
                          From: <strong>{c.name}</strong> • Email: <a href={`mailto:${c.email}`} style={{ color: "var(--primary)" }}>{c.email}</a> • Phone: <a href={`tel:${c.phone}`} style={{ color: "var(--primary)" }}>{c.phone}</a>
                        </small>
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateContactStatus(c._id, e.target.value)}
                          style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)", fontSize: "12px", outline: "none" }}
                        >
                          <option value="Pending">Pending ⏳</option>
                          <option value="In Progress">In Progress ⚙️</option>
                          <option value="Resolved">Resolved ✅</option>
                        </select>
                        <span style={{ fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", background: c.status === "Pending" ? "rgba(243, 156, 18, 0.1)" : c.status === "Resolved" ? "rgba(11, 143, 58, 0.1)" : "rgba(66, 133, 244, 0.1)", color: c.status === "Pending" ? "#f39c12" : c.status === "Resolved" ? "#0b8f3a" : "#4285f4" }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ background: "var(--bg-main)", padding: "15px", borderRadius: "10px", border: "1px solid var(--glass-border)", fontSize: "13px", color: "var(--text-main)", lineHeight: "1.5" }}>
                      {c.message}
                    </div>
                    
                    <small style={{ color: "var(--text-muted)", fontSize: "11px", textAlign: "right" }}>
                      Submitted on: {new Date(c.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))}
                {contacts.length === 0 && <div className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>No inquiries found.</div>}
              </div>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div>
              <WhatsAppGatewayPanel />
            </div>
          )}

          {/* ═══════════════ REPORTS TAB ═══════════════ */}
          {activeTab === "reports" && (
            <div className="card-premium fade-up" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", flexWrap:"wrap", gap:"10px"}}>
                <h3 style={{margin:0, fontSize: "18px", color: "var(--text-main)", textTransform: "uppercase"}}>📊 Reports & Analytics</h3>
            <button style={{...addBtn, background:"#16a34a", display:"flex", alignItems:"center", gap:"6px"}} onClick={downloadCSV}>
              ⬇️ Download CSV
            </button>
          </div>

          {/* Report Type Tabs (Native Horizontal Touch Scroll Chips) */}
          <div className="scroll-chips" style={{display:"flex", gap:"8px", flexWrap:"nowrap", overflowX:"auto", marginBottom:"20px", paddingBottom: "4px", WebkitOverflowScrolling: "touch"}}>
            {[
              {key:"summary", label:"📈 Summary"},
              {key:"purchases", label:"🧾 Purchases & Inventory"},
              {key:"collectors", label:"👷 Collectors"},
              {key:"suppliers", label:"🏪 Suppliers"},
              {key:"buyers", label:"🛒 Buyers"}
            ].map(t => (
              <button key={t.key}
                style={{padding:"8px 14px", borderRadius:"12px", border: reportType===t.key ? "1.5px solid #0b8f3a" : "1.5px solid var(--card-border, #cbd5e1)", cursor:"pointer", fontWeight:"800", fontSize:"12px", flexShrink: 0,
                  background: reportType===t.key ? "#0b8f3a" : "var(--bg-subtle, #f8fafc)",
                  color: reportType===t.key ? "#fff" : "var(--text-main, #0f172a)"}}
                onClick={() => { setReportType(t.key); setReportData([]); }}
              >{t.label}</button>
            ))}
          </div>

          {/* Filters Row */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px", marginBottom:"15px", background:"#f8fffe", padding:"15px", borderRadius:"15px", border:"1px solid #bbf7d0"}}>
            <div>
              <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>📅 From Date</label>
              <input type="date" className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px", height: "40px"}} value={reportFrom} onChange={e => setReportFrom(e.target.value)} />
            </div>
            <div>
              <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>📅 To Date</label>
              <input type="date" className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px", height: "40px"}} value={reportTo} onChange={e => setReportTo(e.target.value)} />
            </div>
            {reportType === "summary" && (
              <div>
                <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>📊 Group By</label>
                <select className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportGroupBy} onChange={e => setReportGroupBy(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
            {reportType === "collectors" && (
              <div>
                <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>👷 Collector</label>
                <select className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportCollectorId} onChange={e => setReportCollectorId(e.target.value)}>
                  <option value="">All Collectors</option>
                  {collectors.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {reportType === "suppliers" && (
              <div>
                <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>🏪 Supplier Name</label>
                <input className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportSupplierName} onChange={e => setReportSupplierName(e.target.value)} />
              </div>
            )}
            {reportType === "buyers" && (
              <div>
                <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>🛒 Buyer Name</label>
                <input className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportBuyerName} onChange={e => setReportBuyerName(e.target.value)} />
              </div>
            )}
            <div style={{display:"flex", alignItems:"flex-end"}}>
              <button className="native-btn" style={{...saveBtnBig, marginTop:0, padding:"12px"}} onClick={fetchReport} disabled={reportLoading}>
                {reportLoading ? "Loading..." : "🔍 Load Report"}
              </button>
            </div>
          </div>

          {/* Shortcut Buttons */}
          <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"15px"}}>
            {[
              {label:"Aaj", days:0},
              {label:"7 Din", days:7},
              {label:"Ye Mahina", days:null, thisMonth:true},
              {label:"30 Din", days:30},
              {label:"3 Mahine", days:90},
              {label:"Ye Saal", days:null, thisYear:true}
            ].map(btn => (
              <button key={btn.label} style={{padding:"5px 12px", borderRadius:"12px", border:"1px solid #0b8f3a", background:"#f0fdf4", color:"#0b8f3a", fontSize:"11px", fontWeight:"bold", cursor:"pointer"}}
                onClick={() => {
                  const today = new Date();
                  let from = new Date();
                  if (btn.thisMonth) from = new Date(today.getFullYear(), today.getMonth(), 1);
                  else if (btn.thisYear) from = new Date(today.getFullYear(), 0, 1);
                  else from.setDate(today.getDate() - (btn.days || 0));
                  setReportFrom(from.toISOString().split("T")[0]);
                  setReportTo(today.toISOString().split("T")[0]);
                }}
              >{btn.label}</button>
            ))}
          </div>

          {/* Results Table */}
          {reportLoading && <div style={{textAlign:"center", padding:"30px", color:"#0b8f3a", fontWeight:"bold"}}>⏳ Loading report...</div>}

          {!reportLoading && reportData.length === 0 && (
            <div style={{textAlign:"center", padding:"40px", color:"#999"}}>
              📋 Filters select karein aur "Load Report" dabayein
            </div>
          )}

          {!reportLoading && reportData.length > 0 && (
            <div style={{overflowX:"auto"}}>

              {/* PURCHASES & INVENTORY REPORT */}
              {reportType === "purchases" && (
                <div>
                  {/* Summary cards */}
                  <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px", background: "linear-gradient(135deg, #0b8f3a, #16a34a)", color: "#fff", padding: "20px", borderRadius: "15px", textAlign: "center", boxShadow: "0 10px 20px rgba(11,143,58,0.15)" }}>
                      <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "bold" }}>Total Purchase Value</div>
                      <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "5px" }}>₹{(reportGrandTotal || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: "200px", background: "linear-gradient(135deg, #333, #555)", color: "#fff", padding: "20px", borderRadius: "15px", textAlign: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "bold" }}>Total Purchase Transactions</div>
                      <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "5px" }}>{reportData.length} Bills</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    {/* Item Wise Inventory Breakdown */}
                    <div style={{ flex: 1, minWidth: "300px", background: "var(--bg-main, #f8fafc)", padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 12px 0", color: "var(--text-main, #0f172a)", display: "flex", alignItems: "center", gap: "6px" }}>📦 Received Inventory (Item Wise)</h4>
                      {reportInventory.length === 0 ? (
                        <div style={{ fontStyle: "italic", color: "#94a3b8", textAlign: "center", padding: "20px" }}>No items purchased in this period</div>
                      ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #cbd5e1", textAlign: "left", color: "#475569" }}>
                              <th style={{ padding: "8px 4px" }}>Item Name</th>
                              <th style={{ padding: "8px 4px", textAlign: "center" }}>Total Qty</th>
                              <th style={{ padding: "8px 4px", textAlign: "right" }}>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportInventory.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td style={{ padding: "8px 4px", fontWeight: "600", color: "var(--text-main, #0f172a)" }}>{item.name}</td>
                                <td style={{ padding: "8px 4px", textAlign: "center", fontWeight: "bold", color: "#0b8f3a" }}>{item.quantity} {item.unit}</td>
                                <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: "600" }}>₹{(item.amount || 0).toFixed(0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Bills List */}
                    <div style={{ flex: 1, minWidth: "300px", background: "var(--bg-main, #f8fafc)", padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 12px 0", color: "var(--text-main, #0f172a)", display: "flex", alignItems: "center", gap: "6px" }}>🧾 Purchase Bills List</h4>
                      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {reportData.map((p, idx) => (
                          <div key={idx} style={{ padding: "10px", background: "var(--card-bg, #ffffff)", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                            <div>
                              <div style={{ fontWeight: "bold", color: "var(--text-main, #0f172a)" }}>{p.supplierName}</div>
                              <div style={{ color: "var(--text-muted, #64748b)", marginTop: "2px" }}>Bill No: #{p.billNo} | {p.date}</div>
                              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>{p.itemsCount} items • {p.paymentMethod}</div>
                            </div>
                            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                              <div style={{ fontWeight: "bold", color: "#dc3545", fontSize: "14px" }}>₹{(p.totalAmount || 0).toFixed(0)}</div>
                              <button onClick={() => openPurchaseBillModal(p)} style={{ border: "none", background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "10px" }}>📄 View</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUMMARY TABLE */}
              {reportType === "summary" && (
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:"13px"}}>
                  <thead>
                    <tr style={{background:"#0b8f3a", color: "#fff"}}>
                      <th style={{padding:"10px 8px", textAlign:"left"}}>Period</th>
                      <th style={{padding:"10px 8px", textAlign:"center"}}>Pickups</th>
                      <th style={{padding:"10px 8px", textAlign:"right"}}>Pickup Amt</th>
                      <th style={{padding:"10px 8px", textAlign:"center"}}>Purchases</th>
                      <th style={{padding:"10px 8px", textAlign:"right"}}>Purchase Amt</th>
                      <th style={{padding:"10px 8px", textAlign:"center"}}>Sales</th>
                      <th style={{padding:"10px 8px", textAlign:"right"}}>Sale Amt</th>
                      <th style={{padding:"10px 8px", textAlign:"right"}}>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((r, i) => (
                      <tr key={i} style={{background: i%2===0?"#f8fffe":"#fff", borderBottom:"1px solid #eee"}}>
                        <td style={{padding:"10px 8px", fontWeight:"bold"}}>{r.period}</td>
                        <td style={{padding:"10px 8px", textAlign:"center"}}>{r.pickups}</td>
                        <td style={{padding:"10px 8px", textAlign:"right"}}>₹{r.pickupAmount}</td>
                        <td style={{padding:"10px 8px", textAlign:"center"}}>{r.purchases}</td>
                        <td style={{padding:"10px 8px", textAlign:"right", color:"#dc3545"}}>₹{r.purchaseAmount}</td>
                        <td style={{padding:"10px 8px", textAlign:"center"}}>{r.sales}</td>
                        <td style={{padding:"10px 8px", textAlign:"right", color:"#0b8f3a"}}>₹{r.saleAmount}</td>
                        <td style={{padding:"10px 8px", textAlign:"right", fontWeight:"bold", color: r.profit>=0?"#0b8f3a":"#dc3545"}}>₹{r.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* COLLECTORS TABLE */}
              {reportType === "collectors" && reportData.map((col, i) => (
                <div key={i} style={{border:"1px solid #bbf7d0", borderRadius:"15px", padding:"15px", marginBottom:"15px", background:"#f8fffe"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px"}}>
                    <div>
                      <div style={{fontWeight:"bold", fontSize:"15px"}}>👷 {col.collectorName}</div>
                      <div style={{fontSize:"12px", color: "var(--text-muted)"}}>📞 {col.collectorMobile}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"20px", fontWeight:"bold", color:"#0b8f3a"}}>{col.totalPickups} Pickups</div>
                      <div style={{fontSize:"13px", color:"#dc3545"}}>Earned: ₹{col.totalEarnings}</div>
                      <div style={{fontSize:"12px", color: "var(--text-muted)"}}>Scrap: ₹{col.totalScrapValue}</div>
                    </div>
                  </div>
                  {col.dailyBreakdown?.length > 0 && (
                    <table style={{width:"100%", borderCollapse:"collapse", fontSize:"12px"}}>
                      <thead><tr style={{background:"#e8f5e9"}}>
                        <th style={{padding:"6px", textAlign:"left"}}>Date</th>
                        <th style={{padding:"6px", textAlign:"center"}}>Pickups</th>
                        <th style={{padding:"6px", textAlign:"right"}}>Earning</th>
                        <th style={{padding:"6px", textAlign:"right"}}>Scrap Value</th>
                      </tr></thead>
                      <tbody>
                        {col.dailyBreakdown.map((d, j) => (
                          <tr key={j} style={{borderBottom:"1px solid #eee"}}>
                            <td style={{padding:"6px"}}>{d.date}</td>
                            <td style={{padding:"6px", textAlign:"center"}}>{d.pickups}</td>
                            <td style={{padding:"6px", textAlign:"right", color:"#0b8f3a"}}>₹{Math.round(d.earning)}</td>
                            <td style={{padding:"6px", textAlign:"right"}}>₹{Math.round(d.scrapValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}

              {/* SUPPLIERS TABLE */}
              {reportType === "suppliers" && (
                <>
                  <div style={{textAlign:"right", fontWeight:"bold", color:"#dc3545", marginBottom:"10px", fontSize:"15px"}}>
                    Grand Total: ₹{reportGrandTotal}
                  </div>
                  {reportData.map((s, i) => (
                    <div key={i} style={{border:"1px solid #fecdd3", borderRadius:"15px", padding:"15px", marginBottom:"15px", background:"#fff5f5"}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                        <div>
                          <div style={{fontWeight:"bold", fontSize:"15px"}}>🏪 {s.supplierName}</div>
                          <div style={{fontSize:"12px", color: "var(--text-muted)"}}>📞 {s.supplierContact}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"18px", fontWeight:"bold", color:"#dc3545"}}>₹{s.totalAmount}</div>
                          <div style={{fontSize:"12px", color: "var(--text-muted)"}}>{s.totalPurchases} purchases | {s.totalItems} items</div>
                        </div>
                      </div>
                      <table style={{width:"100%", borderCollapse:"collapse", fontSize:"12px"}}>
                        <thead><tr style={{background:"#fee2e2"}}>
                          <th style={{padding:"6px", textAlign:"left"}}>Bill No</th>
                          <th style={{padding:"6px", textAlign:"left"}}>Date</th>
                          <th style={{padding:"6px", textAlign:"center"}}>Items</th>
                          <th style={{padding:"6px", textAlign:"right"}}>Amount</th>
                          <th style={{padding:"6px", textAlign:"center"}}>Status</th>
                        </tr></thead>
                        <tbody>
                          {s.records.map((r, j) => (
                            <tr key={j} style={{borderBottom:"1px solid #eee"}}>
                              <td style={{padding:"6px", fontWeight:"bold"}}>#{r.billNo}</td>
                              <td style={{padding:"6px"}}>{r.date}</td>
                              <td style={{padding:"6px", textAlign:"center"}}>{r.items?.length}</td>
                              <td style={{padding:"6px", textAlign:"right", fontWeight:"bold"}}>₹{r.totalAmount}</td>
                              <td style={{padding:"6px", textAlign:"center"}}>
                                <span style={{color: r.paymentStatus==="Paid"?"#0b8f3a":"#f39c12", fontWeight:"bold", fontSize:"11px"}}>{r.paymentStatus}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}

              {/* BUYERS TABLE */}
              {reportType === "buyers" && (
                <>
                  <div style={{textAlign:"right", fontWeight:"bold", color:"#0b8f3a", marginBottom:"10px", fontSize:"15px"}}>
                    Grand Total: ₹{reportGrandTotal}
                  </div>
                  {reportData.map((b, i) => (
                    <div key={i} style={{border:"1px solid #bbf7d0", borderRadius:"15px", padding:"15px", marginBottom:"15px", background:"#f0fdf4"}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                        <div>
                          <div style={{fontWeight:"bold", fontSize:"15px"}}>🛒 {b.buyerName}</div>
                          <div style={{fontSize:"12px", color: "var(--text-muted)"}}>📞 {b.buyerContact} {b.buyerGSTIN && `| GSTIN: ${b.buyerGSTIN}`}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"18px", fontWeight:"bold", color:"#0b8f3a"}}>₹{b.totalAmount}</div>
                          <div style={{fontSize:"12px", color: "var(--text-muted)"}}>{b.totalSales} invoices</div>
                        </div>
                      </div>
                      <table style={{width:"100%", borderCollapse:"collapse", fontSize:"12px"}}>
                        <thead><tr style={{background:"#dcfce7"}}>
                          <th style={{padding:"6px", textAlign:"left"}}>Invoice</th>
                          <th style={{padding:"6px", textAlign:"left"}}>Date</th>
                          <th style={{padding:"6px", textAlign:"center"}}>Items</th>
                          <th style={{padding:"6px", textAlign:"right"}}>Amount</th>
                          <th style={{padding:"6px", textAlign:"center"}}>Status</th>
                        </tr></thead>
                        <tbody>
                          {b.records.map((r, j) => (
                            <tr key={j} style={{borderBottom:"1px solid #eee"}}>
                              <td style={{padding:"6px", fontWeight:"bold"}}>{r.invoiceNo}</td>
                              <td style={{padding:"6px"}}>{r.date}</td>
                              <td style={{padding:"6px", textAlign:"center"}}>{r.items?.length}</td>
                              <td style={{padding:"6px", textAlign:"right", fontWeight:"bold", color:"#0b8f3a"}}>₹{r.totalAmount}</td>
                              <td style={{padding:"6px", textAlign:"center"}}>
                                <span style={{color: r.paymentStatus==="Paid"?"#0b8f3a":"#f39c12", fontWeight:"bold", fontSize:"11px"}}>{r.paymentStatus}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}

            </div>
          )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS (Enhanced styling) */}

      {showItemModal && (
        <Modal title="Add New Rate" onClose={() => setShowItemModal(false)}>
          <Input placeholder="Item Name" value={newItem.name} onChange={v => setNewItem({...newItem, name: v})} />
          <Input placeholder="Price (₹)" type="number" value={newItem.price} onChange={v => setNewItem({...newItem, price: v})} />
          <select className="native-input" style={inputStyle} value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
             <option value="kg">kg</option><option value="Pcs">Pcs</option><option value="Unit">Unit</option>
          </select>
          <select className="native-input" style={inputStyle} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
             <option value="Paper">📄 Paper</option>
             <option value="Plastic">🧴 Plastic</option>
             <option value="Metal">🔩 Metal</option>
             <option value="Large Appliances">❄️ Large Appliances</option>
             <option value="Small Appliances">🔌 Small Appliances</option>
             <option value="IT-EWaste">💻 IT / E-Waste</option>
             <option value="Battery">🔋 Battery</option>
             <option value="Vehicles">🚗 Vehicles</option>
             <option value="Other">📦 Other</option>
          </select>
          <button className="native-btn" style={saveBtnBig} onClick={handleCreateItem}>Add To System</button>
        </Modal>
      )}

      {showAdModal && (
        <Modal title="Upload Ad Banner (Desktop & Mobile)" onClose={() => setShowAdModal(false)}>
           <Input placeholder="Title" value={newAd.title} onChange={v => setNewAd({...newAd, title: v})} />
           <Input placeholder="Target Link (optional)" value={newAd.link} onChange={v => setNewAd({...newAd, link: v})} />
           
           <label style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main, #0f172a)", display: "block", marginBottom: "5px" }}>🖥️ Desktop Banner Image (16:9 Landscape):</label>
           <div style={{padding:"12px", border:"2px dashed #cbd5e1", borderRadius:"12px", textAlign:"center", marginBottom:"15px", background: "var(--bg-main, #f8fafc)"}}>
              <input type="file" onChange={e => setAdFile(e.target.files[0])} />
           </div>

           <label style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main, #0f172a)", display: "block", marginBottom: "5px" }}>📱 Mobile App Banner Image (Square / 4:3 Portrait):</label>
           <div style={{padding:"12px", border:"2px dashed #cbd5e1", borderRadius:"12px", textAlign:"center", marginBottom:"15px", background: "var(--bg-main, #f8fafc)"}}>
              <input type="file" onChange={e => setMobileAdFile(e.target.files[0])} />
           </div>

           <button className="native-btn" style={saveBtnBig} onClick={handleCreateAd}>Publish Banner</button>
        </Modal>
      )}

      {showResetModal && (
        <Modal title={`Reset: ${resetData.name}`} onClose={() => setShowResetModal(false)}>
           <Input placeholder="New Secure Password" value={resetData.newPassword} onChange={v => setResetData({...resetData, newPassword: v})} />
           <button className="native-btn" style={saveBtnBig} onClick={handleResetPassword}>Update Credentials</button>
        </Modal>
      )}

      {showAssignModal && (
        <Modal title="Assign Collector" onClose={() => setShowAssignModal(false)}>
          <div style={{maxHeight: "350px", overflowY: "auto"}}>
            {collectors.map(c => (
              <div key={c._id} style={collectorPickRow} onClick={() => handleAssignPickup(c._id)}>
                <span><strong>{c.name}</strong> <br/><small>{c.area}</small></span> <button style={addBtn}>Select</button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showEditRateModal && editingRate && (
        <Modal title={`Edit ${editingRate.name}`} onClose={() => setShowEditRateModal(false)}>
           <label style={labelStyle}>Update Market Price (₹)</label>
           <Input type="number" value={editingRate.price} onChange={v => setEditingRate({...editingRate, price: v})} />
           <button className="native-btn" style={saveBtnBig} onClick={handleUpdateRate}>Save Changes</button>
        </Modal>
      )}

      {showUserModal && (
        <Modal title="Quick User Add" onClose={() => setShowUserModal(false)}>
           <Input placeholder="Full Name" value={newUser.name} onChange={v => setNewUser({...newUser, name: v})} />
           <Input placeholder="Mobile No" value={newUser.mobile} onChange={v => setNewUser({...newUser, mobile: v})} />
           <Input placeholder="Initial Password" value={newUser.password} onChange={v => setNewUser({...newUser, password: v})} />
           <button className="native-btn" style={saveBtnBig} onClick={handleCreateUser}>Register User</button>
        </Modal>
      )}

      {showCollectorModal && (
        <Modal title="New Collector Hire" onClose={() => setShowCollectorModal(false)}>
           <Input placeholder="Full Name" value={newCollector.name} onChange={v => setNewCollector({...newCollector, name: v})} />
           <Input placeholder="Mobile No" value={newCollector.mobile} onChange={v => setNewCollector({...newCollector, mobile: v})} />
           <Input placeholder="Service Area" value={newCollector.area} onChange={v => setNewCollector({...newCollector, area: v})} />
           <Input placeholder="Initial Password" value={newCollector.password} onChange={v => setNewCollector({...newCollector, password: v})} />
           <button className="native-btn" style={saveBtnBig} onClick={handleCreateCollector}>Register Collector</button>
        </Modal>
      )}

      {showFranchiseModal && (
        <Modal title="New Franchise" onClose={() => setShowFranchiseModal(false)}>
           <Input placeholder="Franchise Name / Manager" value={newFranchise.name} onChange={v => setNewFranchise({...newFranchise, name: v})} />
           <Input placeholder="Mobile No" value={newFranchise.mobile} onChange={v => setNewFranchise({...newFranchise, mobile: v})} />
           <Input placeholder="Email (For Login)" value={newFranchise.email} onChange={v => setNewFranchise({...newFranchise, email: v})} />
           <Input placeholder="Assigned District/City" value={newFranchise.assignedCity} onChange={v => setNewFranchise({...newFranchise, assignedCity: v})} />
           <Input placeholder="Initial Password" value={newFranchise.password} onChange={v => setNewFranchise({...newFranchise, password: v})} />
           <button className="native-btn" style={saveBtnBig} onClick={handleCreateFranchise}>Register Franchise</button>
        </Modal>
      )}

      {showWalletModal && (
        <Modal title="Manual Wallet Adjustment" onClose={() => setShowWalletModal(false)}>
           <label style={labelStyle}>Select User</label>
           <select className="native-input" style={inputStyle} value={walletForm.userId} onChange={e=>setWalletForm({...walletForm, userId: e.target.value})}>
              <option value="">Choose User/Franchise/Collector</option>
              {[...allUsers, ...franchises, ...collectors].map(u => <option key={u._id} value={u._id}>{u.name} ({u.role.toUpperCase()} - {u.mobile})</option>)}
           </select>
           
           <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px"}}>
              <div>
                <label style={labelStyle}>Amount (₹)</label>
                <Input type="number" value={walletForm.amount} onChange={v=>setWalletForm({...walletForm, amount: v})} />
              </div>
              <div>
                <label style={labelStyle}>Action</label>
                <select className="native-input" style={inputStyle} value={walletForm.type} onChange={e=>setWalletForm({...walletForm, type: e.target.value})}>
                   <option value="credit">Credit (+)</option>
                   <option value="debit">Debit (-)</option>
                </select>
              </div>
           </div>
           
           <label style={labelStyle}>Description (Reason)</label>
           <Input placeholder="e.g. Refund for pickup #123" value={walletForm.description} onChange={v=>setWalletForm({...walletForm, description: v})} />
           
           <button className="native-btn" style={saveBtnBig} onClick={handleUpdateWallet}>Apply Adjustment</button>
        </Modal>
      )}

      {showSaleModal && (
        <Modal title="Create GST E-Invoice" onClose={() => setShowSaleModal(false)}>
          <div style={{maxHeight: "70vh", overflowY: "auto", paddingRight: "10px"}}>
           <h4 style={{marginTop:0}}>Select Saved Buyer</h4>
           <select className="native-input" style={{...inputStyle, marginBottom: "20px"}} onChange={(e) => {
             const b = buyers.find(bx => bx._id === e.target.value);
             if(b) setNewSale({...newSale, buyerId: b._id, buyerName: b.name, buyerContact: b.contact, buyerAddress: b.address || "", buyerGSTIN: b.gstin || "", buyerPAN: b.pan || ""});
           }}>
             <option value="">-- Choose Buyer --</option>
             {buyers.map(b => <option key={b._id} value={b._id}>{b.name} ({b.contact})</option>)}
           </select>

           <h4 style={{marginTop:0}}>Buyer Details (Manual Edit)</h4>
           <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px"}}>
             <Input placeholder="Buyer Name" value={newSale.buyerName} onChange={v => setNewSale({...newSale, buyerName: v})} />
             <Input placeholder="Address" value={newSale.buyerAddress} onChange={v => setNewSale({...newSale, buyerAddress: v})} />
             <Input placeholder="GSTIN/UIN" value={newSale.buyerGSTIN} onChange={v => setNewSale({...newSale, buyerGSTIN: v})} />
             <Input placeholder="PAN/IT No" value={newSale.buyerPAN} onChange={v => setNewSale({...newSale, buyerPAN: v})} />
           </div>

           <h4>Consignee (Ship To) - Leave blank if same</h4>
           <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px"}}>
             <Input placeholder="Consignee Name" value={newSale.consigneeName} onChange={v => setNewSale({...newSale, consigneeName: v})} />
             <Input placeholder="Address" value={newSale.consigneeAddress} onChange={v => setNewSale({...newSale, consigneeAddress: v})} />
             <Input placeholder="GSTIN/UIN" value={newSale.consigneeGSTIN} onChange={v => setNewSale({...newSale, consigneeGSTIN: v})} />
           </div>

           <h4>Dispatch & Transport Details</h4>
           <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px"}}>
             <Input placeholder="e-Way Bill No" value={newSale.eWayBillNo} onChange={v => setNewSale({...newSale, eWayBillNo: v})} />
             <Input placeholder="Motor Vehicle No" value={newSale.motorVehicleNo} onChange={v => setNewSale({...newSale, motorVehicleNo: v})} />
             <Input placeholder="Destination" value={newSale.destination} onChange={v => setNewSale({...newSale, destination: v})} />
             <Input placeholder="IRN (Optional)" value={newSale.irn} onChange={v => setNewSale({...newSale, irn: v})} />
           </div>
           
           <div style={{border: "1px solid #eee", padding: "15px", borderRadius: "12px", marginBottom: "15px", background: "#f8f9fa"}}>
             <h4 style={{margin: "0 0 10px 0", fontSize: "14px"}}>Add Items to Sale</h4>
             <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"10px"}}>
               <select className="native-input" style={{...inputStyle, marginBottom: 0}} 
                  value={saleItemInput.scrapItem} 
                  onChange={e => {
                    const selectedId = e.target.value;
                    const itemObj = items.find(i => i._id === selectedId);
                    setSaleItemInput({
                      ...saleItemInput, 
                      scrapItem: selectedId,
                      rate: itemObj?.price || saleItemInput.rate,
                      hsnCode: itemObj?.hsnCode || "47071000"
                    });
                  }}
                >
                  <option value="">-- Select Scrap Item --</option>
                  {items.map(i => (
                    <option key={i._id} value={i._id}>{i.name} ({i.category}) - ₹{i.price}/kg</option>
                  ))}
                </select>
               <Input type="text" placeholder="HSN/SAC" value={saleItemInput.hsnCode} onChange={v => setSaleItemInput({...saleItemInput, hsnCode: v})} />
               <Input type="number" placeholder="Qty" value={saleItemInput.quantity} onChange={v => setSaleItemInput({...saleItemInput, quantity: v})} />
               <Input type="number" placeholder="Rate/Unit" value={saleItemInput.rate} onChange={v => setSaleItemInput({...saleItemInput, rate: v})} />
               <Input type="number" placeholder="CGST %" value={saleItemInput.cgstRate} onChange={v => setSaleItemInput({...saleItemInput, cgstRate: v})} />
               <Input type="number" placeholder="SGST %" value={saleItemInput.sgstRate} onChange={v => setSaleItemInput({...saleItemInput, sgstRate: v})} />
             </div>
             <button className="native-btn" style={{...assignBtn, width: "100%", marginTop: "10px"}} onClick={handleAddSaleItem}>Add Item</button>
           </div>

           {newSale.items.length > 0 && (
             <div style={{maxHeight: "120px", overflowY: "auto", marginBottom: "15px"}}>
               {newSale.items.map((it, idx) => (
                 <div key={idx} style={{display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #eee", fontSize:"12px"}}>
                    <span>{it.name} (HSN: {it.hsnCode}) - {it.quantity} x ₹{it.rate}</span>
                    <strong>₹{it.amount}</strong>
                 </div>
               ))}
               <div style={{textAlign: "right", marginTop: "10px", fontWeight: "bold"}}>Taxable: ₹{newSale.items.reduce((a, b)=>a+b.amount, 0)}</div>
             </div>
           )}

           <button className="native-btn" style={saveBtnBig} onClick={handleCreateSale}>Generate E-Invoice</button>
          </div>
        </Modal>
      )}

      {showPurchaseModal && (
        <Modal title="📦 Record Material Purchase" onClose={() => setShowPurchaseModal(false)}>
          <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "4px" }}>

            {/* ── DRAFT TABS ── */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center", borderBottom: "2px solid #e5e7eb", paddingBottom: "10px" }}>
              {purchaseDrafts.map((draft, idx) => (
                <div key={draft.id} style={{ display: "flex", alignItems: "center", borderRadius: "10px", overflow: "hidden", border: activeDraftId === draft.id ? "2px solid #0b8f3a" : "2px solid #e5e7eb", background: activeDraftId === draft.id ? "#f0fdf4" : "#f9fafb", cursor: "pointer" }}>
                  <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "bold", color: activeDraftId === draft.id ? "#0b8f3a" : "var(--text-muted)", whiteSpace: "nowrap" }} onClick={() => switchDraft(draft.id)}>
                    {draft.supplierName ? `📦 ${draft.supplierName.slice(0, 12)}` : `Draft ${idx + 1}`}
                    {draft.items.length > 0 && <span style={{ marginLeft: "4px", background: "#0b8f3a", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" }}>{draft.items.length}</span>}
                  </span>
                  {purchaseDrafts.length > 1 && (
                    <span style={{ padding: "6px 8px", cursor: "pointer", color: "#dc3545", fontSize: "13px", fontWeight: "bold" }}
                      onClick={(e) => { e.stopPropagation(); if (window.confirm(`"${draft.supplierName || `Draft ${idx + 1}`}" ka draft delete karein?`)) removeDraft(draft.id); }}>✕</span>
                  )}
                </div>
              ))}
              <button style={{ padding: "6px 12px", borderRadius: "10px", border: "2px dashed #0b8f3a", background: "transparent", color: "#0b8f3a", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }} onClick={addNewDraft}>
                + New Supplier
              </button>
            </div>

            {/* ── ACTIVE DRAFT FORM ── */}
            {(() => {
              const draft = getActiveDraft();
              if (!draft) return null;
              return (
                <>
                  <h4 style={{marginTop:0, marginBottom:"5px", fontSize:"13px", color: "var(--text-muted)"}}>Select Saved Seller</h4>
                  <select className="native-input" style={{...inputStyle, marginBottom: "15px"}} value={draft.supplierId || ""} onChange={(e) => {
                    const s = suppliers.find(sx => sx._id === e.target.value);
                    if(s) updateActiveDraft({ supplierId: s._id, supplierName: s.name, supplierContact: s.contact });
                  }}>
                    <option value="">-- Choose Seller --</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.contact})</option>)}
                  </select>

                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <Input placeholder="Supplier Name" value={draft.supplierName} onChange={v => updateActiveDraft({ supplierName: v })} />
                    <Input placeholder="Contact" value={draft.supplierContact} onChange={v => updateActiveDraft({ supplierContact: v })} />
                  </div>

                  {/* Add Item Row */}
                  <div style={{ border: "1px solid #d1fae5", padding: "12px", borderRadius: "12px", marginBottom: "12px", background: "#f0fdf4" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#0b8f3a" }}>➕ Item Add Karein</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "8px" }}>
                      <select style={{ ...inputStyle, marginBottom: 0 }} value={purchaseItemInput.scrapItem} onChange={e => setPurchaseItemInput({ ...purchaseItemInput, scrapItem: e.target.value })}>
                        <option value="">Select Item</option>
                        {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                      </select>
                      <input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="Qty" value={purchaseItemInput.quantity} onChange={e => setPurchaseItemInput({ ...purchaseItemInput, quantity: e.target.value })} />
                      <input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="Rate/kg" value={purchaseItemInput.rate} onChange={e => setPurchaseItemInput({ ...purchaseItemInput, rate: e.target.value })} />
                    </div>
                    <button style={{ ...assignBtn, width: "100%", marginTop: "8px" }} onClick={handleAddPurchaseItem}>Add Item</button>
                  </div>

                  {/* Items List with Inline Edit */}
                  {draft.items.length > 0 && (
                    <div style={{ marginBottom: "12px", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
                      <div style={{ background: "#f8f9fa", padding: "8px 12px", fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "6px" }}>
                        <span>Item</span><span>Qty</span><span>Rate</span><span style={{ color: "#0b8f3a" }}>Amount</span><span></span>
                      </div>
                      {draft.items.map((it, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "6px", padding: "8px 12px", borderTop: "1px solid #f0f0f0", alignItems: "center", fontSize: "12px" }}>
                          <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{it.name}</span>
                          <input type="number" value={it.quantity} onChange={e => handleEditPurchaseItem(idx, "quantity", e.target.value)}
                            style={{ padding: "4px 6px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px", width: "100%" }} />
                          <input type="number" value={it.rate} onChange={e => handleEditPurchaseItem(idx, "rate", e.target.value)}
                            style={{ padding: "4px 6px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px", width: "100%" }} />
                          <strong style={{ color: "#0b8f3a" }}>₹{(it.amount || 0).toFixed(0)}</strong>
                          <button onClick={() => handleRemovePurchaseItem(idx)} style={{ border: "none", background: "none", color: "#dc3545", cursor: "pointer", fontSize: "14px" }}>🗑</button>
                        </div>
                      ))}
                      <div style={{ padding: "10px 12px", background: "#f0fdf4", borderTop: "2px solid #d1fae5", fontWeight: "bold", fontSize: "13px", textAlign: "right", color: "#0b8f3a" }}>
                        Total: ₹{draft.items.reduce((a, b) => a + (b.amount || 0), 0).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Payment Options */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Payment Status</label>
                      <select className="native-input" style={inputStyle} value={draft.paymentStatus} onChange={e => updateActiveDraft({ paymentStatus: e.target.value })}>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Method</label>
                      <select className="native-input" style={inputStyle} value={draft.paymentMethod} onChange={e => updateActiveDraft({ paymentMethod: e.target.value })}>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>

          <button style={{ ...saveBtnBig, marginTop: "15px", background: "linear-gradient(135deg,#0b8f3a,#16a34a)" , color: "#fff"}} onClick={handleCreatePurchase}>
            ✅ Complete — ${getActiveDraft()?.supplierName || "This Draft"}
          </button>
        </Modal>
      )}
      
      {/* ── PRINT BILL MODAL (after purchase complete) ── */}
            {showPurchasePrintModal && lastCreatedPurchase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "20px", maxWidth: "420px", width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div className="no-print" style={{ background: "linear-gradient(135deg,#0b8f3a,#16a34a)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" , color: "#fff"}}>
              <span style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>🧾 Purchase Bill</span>
              <button onClick={() => setShowPurchasePrintModal(false)} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: "bold" }}>✕</button>
            </div>
            
            <div id="purchase-bill-print" style={{ padding: "20px", fontFamily: "monospace", fontSize: "12px", color: "var(--text-main)", background: "var(--card-bg, #ffffff)" }}>
              <style>{`@media print { body * { visibility: hidden; } #purchase-bill-print, #purchase-bill-print * { visibility: visible; } #purchase-bill-print { position: fixed; left: 0; top: 0; width: 80mm; padding: 5mm; } .no-print { display: none !important; } }`}</style>
              <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>⚡ SCRAPVEX</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Purchase Receipt</div>
              </div>
              <div style={{ marginBottom: "8px", lineHeight: 1.8 }}>
                <div><strong>Supplier:</strong> {lastCreatedPurchase.supplierName}</div>
                {lastCreatedPurchase.supplierContact && <div><strong>Contact:</strong> {lastCreatedPurchase.supplierContact}</div>}
                <div><strong>Date:</strong> {new Date(lastCreatedPurchase.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                <div><strong>Payment:</strong> {lastCreatedPurchase.paymentStatus} ({lastCreatedPurchase.paymentMethod})</div>
              </div>
              <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", paddingTop: "6px", paddingBottom: "6px", marginBottom: "8px" }}>
                {lastCreatedPurchase.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>{it.name}<br /><span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{it.quantity} × ₹{it.rate}</span></span>
                    <strong>₹{(it.amount || 0).toFixed(0)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px", paddingTop: "6px" }}>
                <span>TOTAL</span><span>₹{(lastCreatedPurchase.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ textAlign: "center", marginTop: "10px", fontSize: "10px", color: "#888", borderTop: "1px dashed #000", paddingTop: "6px" }}>Thank you! — ScrapVex.in</div>
            </div>

            {/* Action buttons below receipt - responsive & fits mobile */}
            <div className="no-print" style={{ display: "flex", gap: "10px", padding: "16px 20px", background: "#f8f9fa", borderTop: "1px solid #eee", flexWrap: "wrap" }}>
              <button onClick={async () => {
                try {
                  const phone = lastCreatedPurchase.supplierContact;
                  if (!phone) return showToast("error", "Phone number nahi mila");
                  showToast("info", "WhatsApp sending...");
                  await API.post(`/billing/purchases/${lastCreatedPurchase._id}/send-bill`);
                  showToast("success", "WhatsApp bill sent!");
                } catch (e) {
                  showToast("error", "WhatsApp send failed");
                }
              }} style={{ flex: 1, minWidth: "100px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#25D366", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>💬 WhatsApp</button>
              <button onClick={async () => {
                const element = document.getElementById("purchase-bill-print");
                if (!element) return;
                try {
                  showToast("info", "Generating PDF...");
                  const canvas = await html2canvas(element, { scale: 2 });
                  const imgData = canvas.toDataURL("image/png");
                  const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: [80, (canvas.height * 80) / canvas.width]
                  });
                  pdf.addImage(imgData, "PNG", 0, 0, 80, (canvas.height * 80) / canvas.width);
                  pdf.save(`ScrapVex_PurchaseBill_${lastCreatedPurchase._id || Date.now()}.pdf`);
                  showToast("success", "PDF Downloaded!");
                } catch (e) {
                  showToast("error", "Failed to generate PDF");
                }
              }} style={{ flex: 1, minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 14px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>📥 PDF Download</button>
              <button onClick={() => window.print()} style={{ flex: 1, minWidth: "80px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "var(--text-main)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}
      {showPurchaseBillModal && selectedPurchaseBill && (
        <div style={modalOverlay} onClick={() => setShowPurchaseBillModal(false)}>
          <div style={{...modalBox, maxWidth: "520px"}} onClick={e => e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px"}}>
              <h3 style={{margin:0, color:"var(--primary)"}}>📄 Purchase Bill Details</h3>
              <button onClick={() => setShowPurchaseBillModal(false)} style={{background:"none", border:"none", fontSize:"20px", cursor:"pointer", color:"#999"}}>✕</button>
            </div>

            {/* Current Bill */}
            <div style={{background:"#f8fffe", border:"1px solid #bbf7d0", borderRadius:"15px", padding:"15px", marginBottom:"15px"}}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                <div>
                  <div style={{fontWeight:"bold", fontSize:"16px"}}>{selectedPurchaseBill.supplierName}</div>
                  <div style={{fontSize:"12px", color: "var(--text-muted)"}}>📞 {selectedPurchaseBill.supplierContact || "N/A"}</div>
                  <div style={{fontSize:"11px", color:"#999"}}>{new Date(selectedPurchaseBill.createdAt).toLocaleString()}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"22px", fontWeight:"bold", color:"#dc3545"}}>₹{selectedPurchaseBill.totalAmount}</div>
                  <span style={{background: selectedPurchaseBill.paymentStatus==="Paid"?"#eef8f1":"#fff9e6", color: selectedPurchaseBill.paymentStatus==="Paid"?"#0b8f3a":"#f39c12", padding:"3px 10px", borderRadius:"8px", fontSize:"11px", fontWeight:"bold"}}>{selectedPurchaseBill.paymentStatus}</span>
                </div>
              </div>
              {/* Items */}
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:"12px", marginTop:"10px"}}>
                <thead>
                  <tr style={{background:"#0b8f3a", color: "#fff"}}>
                    <th style={{padding:"6px 8px", textAlign:"left"}}>Item</th>
                    <th style={{padding:"6px 8px", textAlign:"center"}}>Qty (kg)</th>
                    <th style={{padding:"6px 8px", textAlign:"center"}}>Rate</th>
                    <th style={{padding:"6px 8px", textAlign:"right"}}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPurchaseBill.items.map((item, idx) => (
                    <tr key={idx} style={{borderBottom:"1px solid #eee"}}>
                      <td style={{padding:"6px 8px"}}>{item.name}</td>
                      <td style={{padding:"6px 8px", textAlign:"center"}}>{item.quantity}</td>
                      <td style={{padding:"6px 8px", textAlign:"center"}}>₹{item.rate}</td>
                      <td style={{padding:"6px 8px", textAlign:"right", fontWeight:"bold"}}>₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedPurchaseBill.notes && <div style={{marginTop:"8px", fontSize:"11px", color: "var(--text-muted)"}}>📝 {selectedPurchaseBill.notes}</div>}
            </div>

            {/* All Purchases from same Supplier */}
            <div style={{marginBottom:"10px"}}>
              <div style={{fontWeight:"bold", fontSize:"13px", color:"var(--text-main)", marginBottom:"10px"}}>
                📦 {selectedPurchaseBill.supplierName} Se Sab Purchases ({supplierPurchaseHistory.length} records)
                <span style={{float:"right", color:"#dc3545", fontWeight:"bold"}}>Total: ₹{supplierTotalAmount}</span>
              </div>
              <div style={{maxHeight:"200px", overflowY:"auto"}}>
                {supplierPurchaseHistory.map((p, idx) => (
                  <div key={p._id} style={{display:"flex", justifyContent:"space-between", padding:"8px 10px", background: idx%2===0?"#f8fffe":"#fff", borderRadius:"8px", marginBottom:"4px", fontSize:"12px"}}>
                    <div>
                      <div style={{fontWeight:"bold"}}>#{p._id.slice(-6).toUpperCase()} — {p.items.length} item(s)</div>
                      <div style={{color:"#999"}}>{new Date(p.createdAt).toLocaleDateString()} | {p.paymentMethod}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:"bold", color:"#dc3545"}}>₹{p.totalAmount}</div>
                      <span style={{color: p.paymentStatus==="Paid"?"#0b8f3a":"#f39c12", fontSize:"10px"}}>{p.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex", gap:"10px", marginTop:"15px"}}>
              <button className="native-btn" style={{...saveBtnBig, flex:1, margin:0, background:"#ff9800"}} onClick={() => { setShowPurchaseBillModal(false); openEditPurchase(selectedPurchaseBill); }}>✏️ Edit Bill</button>
              <button className="native-btn" style={{...saveBtnBig, flex:1, margin:0, background:"#0b8f3a", color: "#fff"}} onClick={() => { setShowPurchaseBillModal(false); setLastCreatedPurchase(selectedPurchaseBill); setShowPurchasePrintModal(true); }}>🖨️ Print / WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ EDIT PURCHASE MODAL ═══════════════ */}
      {showEditPurchaseModal && editPurchaseData && (
        <div style={modalOverlay} onClick={() => setShowEditPurchaseModal(false)}>
          <div style={{...modalBox, maxWidth:"480px"}} onClick={e => e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px"}}>
              <h3 style={{margin:0, color:"#ff9800"}}>✏️ Edit Purchase</h3>
              <button onClick={() => setShowEditPurchaseModal(false)} style={{background:"none", border:"none", fontSize:"20px", cursor:"pointer", color:"#999"}}>✕</button>
            </div>
            <label style={{fontSize:"12px", fontWeight:"bold", color: "var(--text-muted)"}}>Supplier Name</label>
            <input className="native-input" style={inputStyle} value={editPurchaseData.supplierName} onChange={e => setEditPurchaseData({...editPurchaseData, supplierName: e.target.value})} />
            <label style={{fontSize:"12px", fontWeight:"bold", color: "var(--text-muted)"}}>Supplier Contact</label>
            <input className="native-input" style={inputStyle} value={editPurchaseData.supplierContact} onChange={e => setEditPurchaseData({...editPurchaseData, supplierContact: e.target.value})} />
            <label style={{fontSize:"12px", fontWeight:"bold", color: "var(--text-muted)"}}>Payment Status</label>
            <select className="native-input" style={inputStyle} value={editPurchaseData.paymentStatus} onChange={e => setEditPurchaseData({...editPurchaseData, paymentStatus: e.target.value})}>
              <option>Paid</option><option>Pending</option><option>Partial</option>
            </select>
            <label style={{fontSize:"12px", fontWeight:"bold", color: "var(--text-muted)"}}>Payment Method</label>
            <select className="native-input" style={inputStyle} value={editPurchaseData.paymentMethod} onChange={e => setEditPurchaseData({...editPurchaseData, paymentMethod: e.target.value})}>
              <option>Cash</option><option>UPI</option><option>Cash Wallet</option>
            </select>
            <label style={{fontSize:"12px", fontWeight:"bold", color: "var(--text-muted)"}}>Notes</label>
            <input className="native-input" style={inputStyle} value={editPurchaseData.notes} onChange={e => setEditPurchaseData({...editPurchaseData, notes: e.target.value})} />

            <label style={{fontSize:"12px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"8px"}}>Items (Qty aur Rate edit karein):</label>
            {editPurchaseData.items.map((item, idx) => (
              <div key={idx} style={{display:"flex", gap:"8px", marginBottom:"8px", alignItems:"center"}}>
                <span style={{flex:1, fontSize:"12px", fontWeight:"bold"}}>{item.name}</span>
                <input className="native-input" style={{...inputStyle, marginBottom:0, width:"70px"}}
                  onChange={e => {
                    const updated = [...editPurchaseData.items];
                    updated[idx] = {...updated[idx], quantity: e.target.value, amount: parseFloat(e.target.value || 0) * parseFloat(updated[idx].rate || 0)};
                    setEditPurchaseData({...editPurchaseData, items: updated});
                  }} />
                <input className="native-input" style={{...inputStyle, marginBottom:0, width:"70px"}}
                  onChange={e => {
                    const updated = [...editPurchaseData.items];
                    updated[idx] = {...updated[idx], rate: e.target.value, amount: parseFloat(updated[idx].quantity || 0) * parseFloat(e.target.value || 0)};
                    setEditPurchaseData({...editPurchaseData, items: updated});
                  }} />
                <span style={{fontSize:"12px", color:"#0b8f3a", fontWeight:"bold", minWidth:"60px"}}>₹{item.amount?.toFixed(0)}</span>
              </div>
            ))}
            <div style={{textAlign:"right", fontWeight:"bold", marginBottom:"15px", color:"#dc3545"}}>
              Total: ₹{editPurchaseData.items.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0).toFixed(0)}
            </div>
            <button className="native-btn" style={saveBtnBig} onClick={handleSaveEditPurchase}>💾 Save Changes</button>
          </div>
        </div>
      )}

      {showInvoiceModal && selectedInvoice && (

        <Modal title="Invoice Preview" onClose={() => setShowInvoiceModal(false)}>
          <div id="invoice-print-area" style={{padding: "20px", border: "1px solid #000", background: "var(--card-bg, #ffffff)", marginBottom: "15px", fontFamily: "Arial, sans-serif", fontSize: "11px", color: "var(--text-main)"}}>
            
            <style>{`
              #invoice-print-area table { width: 100%; border-collapse: collapse; }
              #invoice-print-area th, #invoice-print-area td { border: 1px solid #000; padding: 4px; vertical-align: top; }
              #invoice-print-area strong { font-weight: bold; }
              @media print {
                body * { visibility: hidden; }
                #invoice-print-area, #invoice-print-area * { visibility: visible; }
                #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; padding: 0; }
              }
            `}</style>

            <div style={{textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "5px", marginBottom: "5px"}}>
              <strong style={{fontSize: "14px"}}>Tax Invoice</strong>
            </div>

            {selectedInvoice.irn && (
              <div style={{borderBottom: "1px solid #000", paddingBottom: "5px", marginBottom: "5px"}}>
                <div><strong>IRN : </strong>{selectedInvoice.irn}</div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                  <span><strong>Ack No. : </strong>{selectedInvoice.ackNo}</span>
                  <span><strong>Ack Date : </strong>{selectedInvoice.ackDate || new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div style={{display: "flex", borderBottom: "1px solid #000", paddingBottom: "5px", marginBottom: "5px"}}>
              <div style={{flex: 1, borderRight: "1px solid #000", paddingRight: "5px"}}>
                <strong style={{fontSize: "14px"}}>JAI DATTI TRADING CO 2025-26</strong><br/>
                DILLI,SAINIK COLONY JAMMU<br/>
                9070000032, 9419701495<br/>
                Deals in : All Types of Scrap Items<br/>
                <strong>GSTIN/UIN:</strong> 01AMSPG9859M1ZA<br/>
                <strong>State Name:</strong> Jammu & Kashmir, Code : 01<br/>
                <strong>E-Mail:</strong> jaidatti001@gmail.com
              </div>
              <div style={{flex: 1, paddingLeft: "5px", display: "flex", flexDirection: "column"}}>
                <div style={{display: "flex", borderBottom: "1px solid #000", flex: 1}}>
                  <div style={{flex: 1, borderRight: "1px solid #000", paddingRight: "5px"}}>
                    <strong>Invoice No.</strong><br/>{selectedInvoice.invoiceNumber || `INV-${selectedInvoice._id.slice(-6).toUpperCase()}`}
                  </div>
                  <div style={{flex: 1, paddingLeft: "5px"}}>
                    <strong>e-Way Bill No.</strong><br/>{selectedInvoice.eWayBillNo || "-"}
                  </div>
                </div>
                <div style={{display: "flex", borderBottom: "1px solid #000", flex: 1}}>
                  <div style={{flex: 1, borderRight: "1px solid #000", paddingRight: "5px"}}>
                    <strong>Delivery Note</strong><br/>{selectedInvoice.deliveryNote || "-"}
                  </div>
                  <div style={{flex: 1, paddingLeft: "5px"}}>
                    <strong>Mode/Terms of Payment</strong><br/>{selectedInvoice.paymentStatus} ({selectedInvoice.paymentMethod})
                  </div>
                </div>
                <div style={{display: "flex", borderBottom: "1px solid #000", flex: 1}}>
                  <div style={{flex: 1, borderRight: "1px solid #000", paddingRight: "5px"}}>
                    <strong>Supplier's Ref.</strong><br/>{selectedInvoice.referenceNo || "-"}
                  </div>
                  <div style={{flex: 1, paddingLeft: "5px"}}>
                    <strong>Other Reference(s)</strong><br/>-
                  </div>
                </div>
                <div style={{display: "flex", flex: 1}}>
                  <div style={{flex: 1, borderRight: "1px solid #000", paddingRight: "5px"}}>
                    <strong>Dispatched through</strong><br/>{selectedInvoice.dispatchedThrough || "-"}
                  </div>
                  <div style={{flex: 1, paddingLeft: "5px"}}>
                    <strong>Motor Vehicle No.</strong><br/>{selectedInvoice.motorVehicleNo || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{display: "flex", borderBottom: "1px solid #000", paddingBottom: "5px", marginBottom: "5px"}}>
              <div style={{flex: 1, borderRight: "1px solid #000", paddingRight: "5px"}}>
                <strong>Consignee (Ship to)</strong><br/>
                <strong>{selectedInvoice.consigneeName || selectedInvoice.buyerName}</strong><br/>
                {selectedInvoice.consigneeAddress || selectedInvoice.buyerAddress}<br/>
                <strong>GSTIN/UIN :</strong> {selectedInvoice.consigneeGSTIN || selectedInvoice.buyerGSTIN}<br/>
                <strong>PAN/IT No :</strong> {selectedInvoice.consigneePAN || selectedInvoice.buyerPAN}<br/>
                <strong>State Name :</strong> {selectedInvoice.consigneeState || selectedInvoice.buyerState}, Code : {selectedInvoice.consigneeStateCode || selectedInvoice.buyerStateCode}
              </div>
              <div style={{flex: 1, paddingLeft: "5px"}}>
                <strong>Buyer (Bill to)</strong><br/>
                <strong>{selectedInvoice.buyerName}</strong><br/>
                {selectedInvoice.buyerAddress}<br/>
                <strong>GSTIN/UIN :</strong> {selectedInvoice.buyerGSTIN}<br/>
                <strong>PAN/IT No :</strong> {selectedInvoice.buyerPAN}<br/>
                <strong>State Name :</strong> {selectedInvoice.buyerState}, Code : {selectedInvoice.buyerStateCode}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{width:"5%"}}>Sl</th>
                  <th style={{width:"40%", textAlign:"left"}}>Description of Goods</th>
                  <th style={{width:"15%"}}>HSN/SAC</th>
                  <th style={{width:"10%"}}>Quantity</th>
                  <th style={{width:"15%"}}>Rate per</th>
                  <th style={{width:"15%"}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{textAlign:"center", borderBottom:"none"}}>{idx + 1}</td>
                    <td style={{borderBottom:"none"}}>
                      <strong>{it.name}</strong><br/>
                      <span style={{float:"right", fontStyle:"italic"}}>SGST<br/>CGST</span>
                    </td>
                    <td style={{textAlign:"center", borderBottom:"none"}}>{it.hsnCode || "-"}</td>
                    <td style={{textAlign:"right", borderBottom:"none"}}><strong>{it.quantity} KG</strong></td>
                    <td style={{textAlign:"right", borderBottom:"none"}}>{it.rate.toFixed(2)} KG</td>
                    <td style={{textAlign:"right", borderBottom:"none"}}>
                      <strong>{it.amount.toFixed(2)}</strong><br/>
                      <span style={{fontStyle:"italic"}}>{it.sgstAmount?.toFixed(2)}<br/>{it.cgstAmount?.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{borderTop:"none"}}></td>
                  <td style={{textAlign:"right", borderTop:"none"}}><strong>Total</strong></td>
                  <td style={{borderTop:"none"}}></td>
                  <td style={{textAlign:"right", borderTop:"none"}}><strong>{selectedInvoice.items.reduce((a,b)=>a+b.quantity, 0)} KG</strong></td>
                  <td style={{borderTop:"none"}}></td>
                  <td style={{textAlign:"right", borderTop:"none"}}><strong>Rs. {selectedInvoice.totalAmount?.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div style={{borderBottom: "1px solid #000", padding: "5px 0", marginBottom: "5px"}}>
              <strong>Amount Chargeable (in words) E. & O.E</strong><br/>
              <em>Indian Rupees {numberToWords(Math.round(selectedInvoice.totalAmount))} Only</em>
            </div>

            <table>
              <thead>
                <tr>
                  <th rowSpan="2">HSN/SAC</th>
                  <th rowSpan="2">Taxable Value</th>
                  <th colSpan="2">CGST</th>
                  <th colSpan="2">SGST/UTGST</th>
                  <th rowSpan="2">Total Tax Amount</th>
                </tr>
                <tr>
                  <th>Rate</th><th>Amount</th>
                  <th>Rate</th><th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{textAlign:"center"}}>{it.hsnCode}</td>
                    <td style={{textAlign:"right"}}>{it.amount.toFixed(2)}</td>
                    <td style={{textAlign:"right"}}>{it.cgstRate}%</td>
                    <td style={{textAlign:"right"}}>{it.cgstAmount?.toFixed(2)}</td>
                    <td style={{textAlign:"right"}}>{it.sgstRate}%</td>
                    <td style={{textAlign:"right"}}>{it.sgstAmount?.toFixed(2)}</td>
                    <td style={{textAlign:"right"}}>{(it.cgstAmount + it.sgstAmount).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{textAlign:"right"}}><strong>Total:</strong></td>
                  <td style={{textAlign:"right"}}><strong>{selectedInvoice.totalTaxableAmount?.toFixed(2)}</strong></td>
                  <td></td>
                  <td style={{textAlign:"right"}}><strong>{selectedInvoice.totalCGST?.toFixed(2)}</strong></td>
                  <td></td>
                  <td style={{textAlign:"right"}}><strong>{selectedInvoice.totalSGST?.toFixed(2)}</strong></td>
                  <td style={{textAlign:"right"}}><strong>{(selectedInvoice.totalCGST + selectedInvoice.totalSGST).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div style={{borderBottom: "1px solid #000", padding: "5px 0", marginBottom: "5px"}}>
              <strong>Tax Amount (in words) :</strong> Indian Rupees {numberToWords(Math.round(selectedInvoice.totalCGST + selectedInvoice.totalSGST))} Only<br/>
              <strong>Company’s PAN :</strong> AMSPG9859M
            </div>

            <div style={{display: "flex"}}>
              <div style={{flex: 1, borderRight: "1px solid #000", paddingRight: "5px"}}>
                <strong>Declaration</strong><br/>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
              <div style={{flex: 1, paddingLeft: "5px", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                <div>
                  <strong>Company’s Bank Details</strong><br/>
                  Bank Name : <strong>Kotak Mahindra Bank Ltd.-CD-1495</strong><br/>
                  A/c No. : <strong>9419701495</strong><br/>
                  Branch & IFS Code : <strong>JHELUM RESORTS , JAMMU & KKBK0000161</strong>
                </div>
                <div style={{textAlign: "right", marginTop: "20px"}}>
                  <strong>for JAI DATTI TRADING CO 2025-26</strong><br/><br/><br/>
                  Authorised Signatory
                </div>
              </div>
            </div>
            
            <div style={{textAlign: "center", marginTop: "10px", fontSize: "10px", color: "var(--text-muted)"}}>
              This is a Computer Generated Invoice
            </div>
          </div>
          
          <button className="native-btn" style={{...saveBtnBig, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}} onClick={() => window.print()}>
            <FaChartLine /> Print GST Invoice
          </button>
        </Modal>
      )}

      {showBuyerModal && (
        <Modal title="Manage Buyer" onClose={() => setShowBuyerModal(false)}>
           <Input placeholder="Buyer Name" value={newBuyer.name} onChange={v => setNewBuyer({...newBuyer, name: v})} />
           <Input placeholder="Contact Number" value={newBuyer.contact} onChange={v => setNewBuyer({...newBuyer, contact: v})} />
           <Input placeholder="Email Address" value={newBuyer.email} onChange={v => setNewBuyer({...newBuyer, email: v})} />
           <Input placeholder="Full Address" value={newBuyer.address} onChange={v => setNewBuyer({...newBuyer, address: v})} />
           <Input placeholder="GSTIN" value={newBuyer.gstin} onChange={v => setNewBuyer({...newBuyer, gstin: v})} />
           <Input placeholder="PAN Number" value={newBuyer.pan} onChange={v => setNewBuyer({...newBuyer, pan: v})} />
           <button className="native-btn" style={saveBtnBig} onClick={handleCreateBuyer}>Save Buyer Record</button>
        </Modal>
      )}

      {showSupplierModal && (
        <Modal title="Manage Seller (Supplier)" onClose={() => setShowSupplierModal(false)}>
           <Input placeholder="Supplier Name" value={newSupplier.name} onChange={v => setNewSupplier({...newSupplier, name: v})} />
           <Input placeholder="Contact Number" value={newSupplier.contact} onChange={v => setNewSupplier({...newSupplier, contact: v})} />
           <Input placeholder="Full Address" value={newSupplier.address} onChange={v => setNewSupplier({...newSupplier, address: v})} />
           <Input placeholder="GSTIN" value={newSupplier.gstin} onChange={v => setNewSupplier({...newSupplier, gstin: v})} />
           <select className="native-input" style={inputStyle} value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}>
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
           </select>
           <button className="native-btn" style={saveBtnBig} onClick={handleCreateSupplier}>Save Seller Record</button>
        </Modal>
      )}

      {/* MOBILE BOTTOM NAV */}
      

    </div>
  );
}

/* HELPER UI COMPONENTS */
const StatCard = ({ icon, title, value, grad }) => (
  <div style={{ ...statCard, background: grad, border: "none" }} className="premium-card">
    <div style={{ ...statIcon, background: "rgba(255,255,255,0.2)", color: "#fff" }}>{icon}</div>
    <div style={{color:"#fff"}}>
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</div>
      <div style={{ fontSize: "11px", opacity: 0.8 }}>{title}</div>
    </div>
  </div>
);

const NavItem = ({ active, icon, text, onClick }) => (
  <div style={{ ...navItem, background: active ? "var(--card-bg)" : "transparent", color: active ? "var(--primary)" : "#fff", boxShadow: active ? "0 4px 12px rgba(0,0,0,0.1)" : "none" }} onClick={onClick} className="sidebar-item">
    {icon} <span style={{fontWeight: active ? "bold" : "normal"}}>{text}</span>
  </div>
);

const BottomLink = ({ icon, text, onClick, active }) => (
  <div style={{ ...bottomLinkStyle, color: active ? "#0b8f3a" : "var(--text-muted)" }} onClick={onClick}>
     {icon} <span style={{fontSize:"10px", marginTop:"2px"}}>{text}</span>
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <div style={modalOverlay} onClick={onClose}>
    <div style={modalBox} onClick={e => e.stopPropagation()} className="premium-card">
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
         <h3 style={{ margin: 0, color:"var(--text-main)" }}>{title}</h3>
         <button onClick={onClose} style={{background: "none", border: "none", cursor: "pointer", color:"#ccc"}}><FaTimes size={18}/></button>
      </div>
      {children}
    </div>
  </div>
);

const QuickAction = ({ icon, text, onClick }) => (
  <button className="native-btn premium-card">
    <div style={{width:"30px", height:"30px", borderRadius:"8px", background:"#eef8f1", display:"flex", justifyContent:"center", alignItems:"center"}}>{icon}</div>
    <span>{text}</span>
  </button>
);

const Input = ({ placeholder, value, onChange, type = "text" }) => (
  <input className="native-input" style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
);

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  return <span className={`badge-status badge-${s}`}>{status}</span>;
};

/* STYLES */
const container = { display: "flex", height: "100vh", background: "var(--bg-main)", overflow: "hidden" };
const sidebar = { width: "260px", background: "#0b8f3a", color: "#fff", display: "flex", flexDirection: "column", padding: "30px 10px", flexShrink: 0, overflowY: "auto", height: "100vh" };
const logo = { fontSize: "26px", fontWeight: "bold", textAlign: "center", marginBottom: "40px", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "center" };
const nav = { flex: 1 };
const navItem = { display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "12px", cursor: "pointer", marginBottom: "8px", transition: "0.3s" };
const logoutBtnSide = { ...navItem, background: "rgba(255,255,255,0.05)", border: "none", marginTop: "auto" };

const main = { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" };
const header = { background: "var(--card-bg)", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", position: "sticky", top: 0, zIndex: 500 };
const headerTitle = { margin: 0, fontSize: "16px", letterSpacing: "1px", color:"var(--text-main)" };
const menuBtn = { background: "none", border: "none", fontSize: "20px", color: "#0b8f3a" };
const bellBtn = { background: "var(--bg-main)", border: "none", width:"40px", height:"40px", borderRadius:"10px", fontSize: "18px", color: "var(--text-muted)", position: "relative", cursor:"pointer" };
const badge = { position: "absolute", top: "-5px", right: "-5px", background: "#dc3545", color: "#fff", fontSize: "9px", padding: "2px 5px", borderRadius: "50%" };
const logoutHeaderBtn = { background: "#fff5f5", border: "none", width:"40px", height:"40px", borderRadius:"10px", fontSize: "18px", color: "#dc3545", cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center", transition:"0.3s" };

const content = { padding: "30px" };
const statGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { padding: "20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" };
const statIcon = { width: "45px", height: "45px", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const statVal = { fontSize: "22px", fontWeight: "bold" };

const mainGrid = { display: "flex", gap: "25px", flexWrap: "wrap" };
const box = { background: "var(--card-bg)", padding: "25px", borderRadius: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", marginBottom: "25px", width: "100%", overflowX: "auto" };
const boxTitle = { fontSize: "16px", margin: "0 0 20px 0", color: "var(--text-main)", fontWeight:"bold" };
const listRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "1px solid var(--glass-border)" };
const rowTitle = { fontWeight: "bold", fontSize: "14px", color: "var(--text-main)" };
const muted = { color: "#999", fontSize: "12px" };

const btnStack = { display: "flex", flexDirection: "column", gap: "12px" };
const actionBtn = { border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)", padding: "15px", borderRadius: "15px", textAlign: "left", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", gap: "15px", alignItems: "center" };
const addBtn = { background: "#0b8f3a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight:"bold", cursor: "pointer" };
const assignBtn = { background: "#0b8f3a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", cursor: "pointer", marginTop: "10px" };
const smBtn = { border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--primary)", padding: "8px", borderRadius: "10px", cursor: "pointer" };
const smDelBtn = { background: "#fff5f5", color: "#dc3545", padding: "8px", border: "none", borderRadius: "10px", cursor: "pointer" };
const saveBtnBig = { background: "#0b8f3a", color: "#fff", border: "none", width: "100%", padding: "15px", borderRadius: "15px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", marginTop: "15px", boxShadow: "0 10px 20px rgba(11, 143, 58, 0.2)" };

const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" };
const modalBox = { background: "var(--card-bg)", padding: "25px 25px 35px 25px", borderRadius: "30px", width: "100%", maxWidth: "450px", maxHeight: "90vh", overflowY: "auto" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", marginBottom: "15px", boxSizing: "border-box", outline: "none", fontSize: "14px", transition:"0.3s" };

const adGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" };
const adCard = { border: "1px solid var(--glass-border)", borderRadius: "20px", overflow: "hidden", background: "var(--card-bg)" };
const adImg = { width: "100%", height: "120px", objectFit: "cover" };

const notifPanel = { position: "absolute", top: "50px", right: 0, width: "260px", background: "var(--card-bg)", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", borderRadius: "20px", padding: "20px", zIndex: 1000, border: "1px solid var(--glass-border)" };
const notifRow = { padding: "10px 0", borderBottom: "1px solid #f8f9fc", fontSize: "12px", color: "var(--text-muted)" };

const loaderStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-main)" };
const mobileSidebar = { width: "260px", height: "100%", background: "#0b8f3a", padding: "30px 20px", color: "#fff", overflowY: "auto" };
const mobileMenuOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 3000 };

const titleBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };
const labelStyle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px" };
const settingsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px", marginTop: "20px" };
const settingsSection = { display: "flex", flexDirection: "column" };
const tableContainer = { maxHeight: "500px", overflowY: "auto" };
const collectorPickRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", border: "1px solid #f0f0f0", borderRadius: "15px", marginBottom: "12px", transition: "0.3s", cursor: "pointer" };
const miniStat = { padding: "15px", borderRadius: "15px", flex: 1 };
const txIcon = { width: "35px", height: "35px", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center" };
const statusBadge = { padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold", textTransform: "capitalize" };

const bottomNavStyle = { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card-bg)", display: "flex", justifyContent: "space-around", padding: "12px 10px 25px 10px", boxShadow: "0 -5px 25px rgba(0,0,0,0.05)", zIndex: 1500, borderTop: "1px solid var(--glass-border)" };
const bottomLinkStyle = { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" };

export default AdminDashboard;

const accountRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderBottom: "1px solid var(--card-border, #f1f5f9)",
  cursor: "pointer"
};

const iconSquareStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  flexShrink: 0
};

const rowTextStyle = {
  fontSize: "13px",
  fontWeight: "800",
  color: "var(--text-main, #0f172a)"
};
