import { useNavigate, Link, useSearchParams } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import {
  FaUsers, FaTruck, FaClock, FaCheckCircle, FaRupeeSign,
  FaSignOutAlt, FaArrowLeft, FaTrash, FaPlus, FaKey, FaBell, FaInfoCircle,
  FaAd, FaTag, FaTools, FaStar, FaUserPlus, FaBars, FaTimes, FaCog,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaRecycle, FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaChartLine,
  FaFileInvoice, FaBuilding, FaIdCard, FaCar, FaUserCheck, FaMap, FaTicketAlt, FaPercent, FaShareAlt, FaRss, FaClipboardList, FaMoneyCheckAlt,
  FaMoon, FaSun, FaEdit, FaUser, FaShieldAlt, FaHome, FaBoxes, FaSearch, FaDownload, FaFileExcel, FaFilePdf, FaPhoneAlt
} from "react-icons/fa";
import API from "../services/api";
import Toast from "../components/Toast";
import { performLogout } from "../utils/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTheme } from "../context/ThemeContext";

function FranchiseDashboard() {

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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };
  const [stats, setStats] = useState({ totalUsers: 0, totalPickups: 0, pending: 0, completed: 0, revenue: 0 });
  const [pickups, setPickups] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [ads, setAds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({
    minAmount: 300, contactEmail: "", contactPhone: "", officeAddress: "", facebookUrl: "", instagramUrl: "", upiId: "scrapvex@okaxis"
  });
  const [walletStats, setWalletStats] = useState({ totalAvailable: 0, totalPending: 0, userCount: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isDarkMode: darkMode, toggleDarkMode } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => { setSearchQuery(""); }, [activeTab]);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showEditRateModal, setShowEditRateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showFranchiseDepositModal, setShowFranchiseDepositModal] = useState(false);
  const [showFranchiseQR, setShowFranchiseQR] = useState(false);
  const [franchiseDepositStep, setFranchiseDepositStep] = useState(1);
  const [franchiseDepositForm, setFranchiseDepositForm] = useState({ amount: "", upiRefNo: "" });
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [walletForm, setWalletForm] = useState({ userId: "", amount: "", type: "credit", description: "" });

  const [accountingStats, setAccountingStats] = useState({ totalPurchaseAmount: 0, todayPurchaseAmount: 0, totalSaleAmount: 0, todaySaleAmount: 0, overallProfit: 0, todayProfit: 0, stockValue: 0 });
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
  const emptyDraft = (id) => ({ id: id || Date.now(), supplierId: "", supplierName: "", supplierContact: "", notes: "", items: [], paymentStatus: "Paid", paymentMethod: "Cash", pickupId: null });
  const [purchaseDrafts, setPurchaseDrafts] = useState([emptyDraft(1)]);
  const [activeDraftId, setActiveDraftId] = useState(1);
  // Purchase Bill Modal
  const [showPurchaseBillModal, setShowPurchaseBillModal] = useState(false);
  const [selectedPurchaseBill, setSelectedPurchaseBill] = useState(null);
  const [supplierPurchaseHistory, setSupplierPurchaseHistory] = useState([]);
  const [supplierTotalAmount, setSupplierTotalAmount] = useState(0);

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
  const [withdrawals, setWithdrawals] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [franchiseProfile, setFranchiseProfile] = useState(null);
  const [distSettings, setDistSettings] = useState({});

  // Reports State
  const [reportType, setReportType] = useState("purchases"); // default to purchases
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

  // NEW ERP MODALS
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ subject: "", message: "", category: "General" });

  const [selectedPickup, setSelectedPickup] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [resetData, setResetData] = useState({ userId: "", newPassword: "", name: "" });

  // Form States
  const [newAd, setNewAd] = useState({ title: "", link: "" });
  const [adFile, setAdFile] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", price: "", unit: "kg", category: "Other" });
  const [newUser, setNewUser] = useState({ name: "", mobile: "", email: "", password: "" });
  const [newCollector, setNewCollector] = useState({ name: "", mobile: "", email: "", password: "", area: "" });

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
      } catch (e) { console.error("Franchise polling error:", e); }
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

  const filteredCollectors = useMemo(() => {
    if (!searchQuery) return collectors;
    const q = searchQuery.toLowerCase();
    return collectors.filter(c => c.name?.toLowerCase().includes(q) || c.mobile?.includes(q) || c.area?.toLowerCase().includes(q));
  }, [collectors, searchQuery]);

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
  

  useEffect(() => {
    fetchAdminData();
    fetchSettings();
    fetchNotifications();
    // Animation trigger
    document.body.style.overflowX = "hidden";
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const assignedCity = user?.assignedCity || user?.city || "Rajouri";
      
      const results = await Promise.allSettled([
        API.get("/admin/dashboard"),
        API.get("/admin/pickups"),
        API.get("/admin/collectors"),
        API.get("/scrap-items"),
        API.get(`/admin/get-city-rates?city=${encodeURIComponent(assignedCity)}`)
      ]);

      const [resStats, resPickups, resCollectors, resItems, resCityRates] = results;

      if (resStats.status === "fulfilled" && resStats.value.data?.success) {
        setStats(resStats.value.data.stats || {});
      }
      if (resPickups.status === "fulfilled" && resPickups.value.data?.success) {
        setPickups(resPickups.value.data.pickups || []);
      }
      if (resCollectors.status === "fulfilled" && resCollectors.value.data?.success) {
        setCollectors(resCollectors.value.data.collectors || []);
      }

      // Merge global items with city-specific rates
      let globalItems = [];
      let cityRates = [];
      if (resItems.status === "fulfilled" && resItems.value.data?.success) {
        globalItems = resItems.value.data.data || [];
      }
      if (resCityRates.status === "fulfilled" && resCityRates.value.data?.rates) {
        cityRates = resCityRates.value.data.rates || [];
      }

      const merged = globalItems.map(gi => {
        const cityRate = cityRates.find(cr => cr.scrapItem?._id === gi._id || cr.scrapItem === gi._id);
        return cityRate ? { ...gi, price: cityRate.price } : gi;
      });
      setItems(merged);

      fetchSettings().catch(() => {});
      fetchReviews().catch(() => {});
      fetchWalletStats().catch(() => {});
      fetchAccountingData().catch(() => {});
    } catch (error) {
      console.error("fetchAdminData error:", error);
    } finally {
      setLoading(false);
    }
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

  const fetchCollectors = async () => {
    try {
      const { data } = await API.get("/admin/collectors");
      if (data.success) setCollectors(data.collectors);
    } catch (e) { console.error(e); }
  };

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

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/withdrawals");
      if (data.success) setWithdrawals(data.withdrawals);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDistSettings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/district-settings");
      if (data.success) setDistSettings(data.settings);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddSaleItem = () => {
    if (!saleItemInput.scrapItem || !saleItemInput.quantity || !saleItemInput.rate) return showToast("error", "Fill all item fields");
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
    if (!newSale.buyerName || newSale.items.length === 0) return showToast("error", "Add buyer and items");

    const totalTaxableAmount = newSale.items.reduce((acc, item) => acc + item.amount, 0);
    const totalCGST = newSale.items.reduce((acc, item) => acc + item.cgstAmount, 0);
    const totalSGST = newSale.items.reduce((acc, item) => acc + item.sgstAmount, 0);
    const totalAmount = totalTaxableAmount + totalCGST + totalSGST;

    try {
      const { data } = await API.post("/billing/sales", { ...newSale, totalTaxableAmount, totalCGST, totalSGST, totalAmount });
      if (data.success) {
        showToast("success", "Sale Recorded!");
        setShowSaleModal(false);
        setNewSale(initialSaleState);
        fetchAccountingData();
      }
    } catch (e) { showToast("error", "Failed to record sale"); }
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

  const handleConvertPickupToPurchase = (pickup) => {
    const newId = Date.now();
    const draftData = {
      id: newId,
      supplierId: pickup.collector?._id || pickup.collector,
      supplierName: pickup.collectorName || "Collector",
      supplierContact: pickup.collectorMobile || "",
      notes: `Auto-converted from Pickup #${pickup._id.toString().slice(-6)}`,
      items: (pickup.items || []).map(it => ({
        scrapItem: it.scrapItemId || it._id,
        name: it.name,
        quantity: it.quantity,
        rate: it.rate,
        amount: (it.quantity * it.rate)
      })),
      paymentStatus: "Paid",
      paymentMethod: "Cash Wallet",
      pickupId: pickup._id
    };
    // Check if there's already a pickup draft open
    const existing = purchaseDrafts.find(d => d.pickupId === pickup._id);
    if (existing) {
      setActiveDraftId(existing.id);
    } else {
      setPurchaseDrafts(prev => [...prev, draftData]);
      setActiveDraftId(newId);
    }
    setShowPurchaseModal(true);
  };

  const handleCreatePurchase = async () => {
    const draft = getActiveDraft();
    if (!draft.supplierName || draft.items.length === 0) return showToast("error", "Supplier aur kam se kam ek item add karein");
    const totalAmount = draft.items.reduce((acc, item) => acc + item.amount, 0);

    // Wallet Balance Check for App Payments
    if (draft.paymentMethod === "Cash Wallet") {
       const collector = collectors.find(c => c._id === draft.supplierId);
       const settlement = (collector && collector.walletBalance < 0) ? Math.min(Math.abs(collector.walletBalance), totalAmount) : 0;
       if (walletStats.totalAvailable + settlement < totalAmount) {
          return showToast("error", `Insufficient Wallet! Required: ₹${totalAmount}, Available: ₹${walletStats.totalAvailable}`);
       }
    }

    try {
      const { data } = await API.post("/billing/purchases", { ...draft, totalAmount });
      if (data.success) {
        showToast("success", `✅ ${draft.supplierName} ka purchase complete!`);
        // Save for print bill
        setLastCreatedPurchase(data.purchase);
        // Remove completed draft
        removeDraft(activeDraftId);
        // If no more drafts, close modal
        const remaining = purchaseDrafts.filter(d => d.id !== activeDraftId);
        if (remaining.length === 0) setShowPurchaseModal(false);
        // Show print bill
        setShowPurchasePrintModal(true);
        fetchAccountingData();
        fetchWalletStats();
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Purchase record karne mein error");
    }
  };

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

  const handleFranchiseDepositSubmit = async (e) => {
    e.preventDefault();
    if (!franchiseDepositForm.amount || Number(franchiseDepositForm.amount) < 1000) return showToast("error", "Minimum deposit amount is ₹1,000!");
    if (!franchiseDepositForm.upiRefNo || franchiseDepositForm.upiRefNo.replace(/\D/g, "").length !== 12) {
      return showToast("error", "Kripya valid 12-digit UPI Ref No/UTR enter karein");
    }
    setSubmittingDeposit(true);
    try {
      const { data } = await API.post("/wallet/deposit", franchiseDepositForm);
      if (data.success) {
        showToast("success", "Deposit request submit ho gayi! Admin verify karke credit kar dega. ✅");
        setFranchiseDepositForm({ amount: "", upiRefNo: "" });
        setShowFranchiseQR(false);
        setShowFranchiseDepositModal(false);
        fetchWalletStats();
        fetchAllTransactions();
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Deposit request failed");
    } finally {
      setSubmittingDeposit(false);
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

        // Refresh local data
        if (typeof fetchFranchiseInfo === 'function') fetchFranchiseInfo();
        fetchCollectors();
        fetchWalletStats();
        if (activeTab === "wallet") fetchAllTransactions();
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
      const { data } = await API.put("/settings", settings);
      if (data.success) showToast("success", "Platform Settings Updated!");
    } catch (e) { showToast("error", "Failed to save settings"); }
  };

  const handleCreateUser = async () => {
    try {
      const { data } = await API.post("/admin/users", newUser);
      if (data.success) {
        showToast("success", "User created");
        setShowUserModal(false);
        fetchAdminData();
      }
    } catch (e) { showToast("error", e.response?.data?.message || "Failed"); }
  };

  const handleCreateCollector = async () => {
    try {
      const { data } = await API.post("/admin/collectors", newCollector);
      if (data.success) {
        showToast("success", "Collector created");
        setShowCollectorModal(false);
        fetchCollectors();
      }
    } catch (e) { showToast("error", e.response?.data?.message || "Failed"); }
  };

  const handleCreateAd = async () => {
    if (!newAd.title || !adFile) return showToast("error", "Select title & image");
    try {
      const formData = new FormData();
      formData.append("title", newAd.title);
      formData.append("link", newAd.link || "#");
      formData.append("image", adFile);
      const { data } = await API.post("/ads", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (data.success) {
        showToast("success", "Banner Added!");
        setShowAdModal(false); fetchAds();
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
      const user = JSON.parse(localStorage.getItem("user"));
      const { data } = await API.post("/admin/update-city-rate", {
        scrapItemId: editingRate._id,
        city: user.assignedCity,
        price: editingRate.price
      });
      if (data.success) {
        showToast("success", "Rate Updated for " + user.assignedCity);
        setShowEditRateModal(false);
        fetchAdminData();
      }
    } catch (e) { showToast("error", "Failed to update city rate"); }
  };

  const handleAssignPickup = async (collectorId) => {
    try {
      const { data } = await API.post("/admin/assign-pickup", { pickupId: selectedPickup._id, collectorId });
      if (data.success) { showToast("success", "Assigned!"); setShowAssignModal(false); fetchAdminData(); }
    } catch (e) { showToast("error", "Failed"); }
  };

  const handleDeleteItem = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      let ep = type === "rate" ? `/admin/scrap-items/${id}` : type === "ad" ? `/ads/${id}` : `/admin/${type}s/${id}`;
      const { data } = await API.delete(ep);
      if (data?.success) {
        showToast("success", "Item deleted successfully!");
        fetchAdminData();
      } else {
        showToast("error", data?.message || "Failed to delete item");
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to delete item");
    }
  };


  const handleCreateTicket = async () => {
    if (!newTicketForm.subject || !newTicketForm.message) return showToast("error", "Subject aur message zaroori hai");
    try {
      const { data } = await API.post("/support-tickets", newTicketForm);
      if (data.success) {
        showToast("success", "Ticket submit ho gayi!");
        setShowTicketModal(false);
        setNewTicketForm({ subject: "", message: "", category: "General" });
        fetchTickets();
      }
    } catch (e) { showToast("error", e.response?.data?.message || "Failed to raise ticket"); }
  };

  const logout = async () => { 
    await performLogout();
    navigate("/franchise-login"); 
  };

  if (loading) return <div style={loaderStyle}><FaRecycle className="spin" style={{fontSize: "45px", color: "var(--primary)"}} /></div>;

  const NavContent = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <NavItem active={activeTab === "overview"} icon={<FaInfoCircle />} text="Overview" onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "pickups"} icon={<FaTruck />} text="Pickups" onClick={() => { setActiveTab("pickups"); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "accounting"} icon={<FaChartLine />} text="Accounting" onClick={() => { setActiveTab("accounting"); fetchAccountingData(); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "inventory"} icon={<FaClipboardList />} text="Inventory" onClick={() => { setActiveTab("inventory"); fetchAccountingData(); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "reports"} icon={<FaChartLine />} text="📊 Reports" onClick={() => { setActiveTab("reports"); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "rates"} icon={<FaTag />} text="Scrap Rates" onClick={() => { setActiveTab("rates"); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "collectors"} icon={<FaTools />} text="Collectors" onClick={() => { setActiveTab("collectors"); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "wallet"} icon={<FaWallet />} text="Wallet" onClick={() => { setActiveTab("wallet"); fetchWalletStats(); fetchAllTransactions(); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "support"} icon={<FaTicketAlt />} text="Support" onClick={() => { setActiveTab("support"); fetchTickets(); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "reviews"} icon={<FaStar />} text="Reviews" onClick={() => { setActiveTab("reviews"); setIsMobileMenuOpen(false); }} />
      <NavItem active={activeTab === "dist-settings"} icon={<FaCog />} text="City Settings" onClick={() => { setActiveTab("dist-settings"); fetchDistSettings(); setIsMobileMenuOpen(false); }} />
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
        <div style={logo}><FaRecycle style={{ marginRight: "10px", fontSize: "28px" }} /> Scrapvex</div>
        <nav style={nav}><NavContent /></nav>
      </div>

      {/* MOBILE DRAWER */}
      <div 
        style={{
          ...mobileMenuOverlay,
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease"
        }} 
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          style={{
            ...mobileSidebar,
            transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }} 
          onClick={e => e.stopPropagation()}
        >
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", paddingBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.15)"}}>
             <div style={{...logo, marginBottom: 0, fontSize: "22px", justifyContent: "flex-start"}}><FaRecycle style={{ marginRight: "10px" }} /> Scrapvex</div>
             <button style={{background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "5px"}} onClick={() => setIsMobileMenuOpen(false)}>
                <FaTimes size={20} />
             </button>
          </div>
          <NavContent />
        </div>
      </div>

      {/* MAIN */}
      <div style={main} className="franchise-main-content">
        {/* HEADER (SAME AS COLLECTOR DASHBOARD) */}
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
          {/* Left Branding: ScrapVex FRANCHISE */}
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
                  FRANCHISE
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls: [City Pill] -> [Bell] -> [Moon] */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* City Badge / Online Pill */}
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
              {JSON.parse(localStorage.getItem("user") || "{}").assignedCity || "Rajouri"}
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
              onClick={async () => { await performLogout(); window.location.href = "/franchise-login"; }}
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
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--card-border, #d1d5db)",
                  outline: "none",
                  fontSize: "14px",
                  background: "var(--card-bg, #ffffff)",
                  color: "var(--text-main, #0f172a)",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                  transition: "border-color 0.2s ease"
                }}
              />
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

          {/* FRANCHISE ACCOUNT TAB */}
          {activeTab === "account" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "12px 14px 40px 14px" }}>
              {/* Franchise Profile Header Card */}
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
                  <FaBuilding />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 2px 0", fontSize: "16px", fontWeight: "900", color: "var(--text-main, #0f172a)" }}>
                    {JSON.parse(localStorage.getItem("user") || "{}").name || "Franchise Partner"}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted, #64748b)" }}>
                    {JSON.parse(localStorage.getItem("user") || "{}").mobile || ""} • {JSON.parse(localStorage.getItem("user") || "{}").assignedCity || "Rajouri"}
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#0b8f3a", background: "#f0fdf4", padding: "2px 8px", borderRadius: "10px", display: "inline-block", marginTop: "4px" }}>
                    Verified ScrapVex Franchise
                  </span>
                </div>
              </div>

              {/* MANAGEMENT SECTION */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>
                  OPERATIONS MANAGEMENT
                </span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => setActiveTab("collectors")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...iconSquareStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaUsers /></div>
                      <span style={rowTextStyle}>Manage Collectors ({collectors.length})</span>
                    </div>
                  </div>
                  <div style={accountRowStyle} onClick={() => setActiveTab("rates")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...iconSquareStyle, background: "#fef3c7", color: "#d97706" }}><FaTag /></div>
                      <span style={rowTextStyle}>City Scrap Rates</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FINANCE SECTION */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>
                  FINANCE & PAYOUTS
                </span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("wallet"); fetchWalletStats(); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...iconSquareStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaWallet /></div>
                      <span style={rowTextStyle}>Franchise Wallet & UPI Deposit</span>
                    </div>
                  </div>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("accounting"); fetchAccountingData(); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...iconSquareStyle, background: "#f5f3ff", color: "#7c3aed" }}><FaFileInvoice /></div>
                      <span style={rowTextStyle}>Accounting & Profit Statements</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* APP & HELP SECTION */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted, #64748b)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>
                  APP & SUPPORT
                </span>
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "14px", border: "1px solid var(--card-border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={accountRowStyle} onClick={() => { setActiveTab("tickets"); fetchTickets(); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...iconSquareStyle, background: "#eff6ff", color: "#2563eb" }}><FaTicketAlt /></div>
                      <span style={rowTextStyle}>Raise Support Ticket</span>
                    </div>
                  </div>
                  <div style={accountRowStyle} onClick={() => navigate("/privacy")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...iconSquareStyle, background: "#f0fdf4", color: "#0b8f3a" }}><FaShieldAlt /></div>
                      <span style={rowTextStyle}>Privacy Policy</span>
                    </div>
                  </div>
                  <div style={accountRowStyle} onClick={toggleDarkMode}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...iconSquareStyle, background: "var(--bg-main, #f8fafc)", color: "var(--text-muted, #64748b)" }}>
                        {darkMode ? <FaSun color="#f59e0b" /> : <FaMoon />}
                      </div>
                      <span style={rowTextStyle}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOGOUT BUTTON */}
              <button
                onClick={logout}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  border: "none",
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "8px"
                }}
              >
                <FaSignOutAlt /> Log Out Franchise Account
              </button>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ padding: "20px 24px 0 24px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", letterSpacing: "-0.03em", margin: 0 }}>Franchise Operations</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Daily overview of your scrap operations</p>
              </div>

              {/* Row 1 KPI Cards */}
              <div className="grid-4" style={{ padding: "0 24px" }}>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}><FaTruck /></div>
                  <div><div className="kpi-label">Local Pickups</div><div className="kpi-value">{stats.totalPickups}</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}><FaClock /></div>
                  <div><div className="kpi-label">Pending Pickups</div><div className="kpi-value">{stats.pending || 0}</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}><FaCheckCircle /></div>
                  <div><div className="kpi-label">Completed Pickups</div><div className="kpi-value">{stats.completed || 0}</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}><FaChartLine /></div>
                  <div><div className="kpi-label">Sales Amount</div><div className="kpi-value">₹{accountingStats.totalSaleAmount}</div></div>
                </div>
              </div>

              {/* Row 2 KPI Cards */}
              <div className="grid-4" style={{ padding: "0 24px" }}>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}><FaClipboardList /></div>
                  <div><div className="kpi-label">Inventory Value</div><div className="kpi-value">₹{accountingStats.stockValue?.toFixed(2) || 0}</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}><FaWallet /></div>
                  <div><div className="kpi-label">Wallet Balance</div><div className="kpi-value">₹{walletStats.totalAvailable}</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}><FaUsers /></div>
                  <div><div className="kpi-label">Active Collectors</div><div className="kpi-value">{collectors.length}</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}><FaRupeeSign /></div>
                  <div><div className="kpi-label">Net Profit</div><div className="kpi-value">₹{accountingStats.overallProfit}</div></div>
                </div>
              </div>

              <div className="grid-2 responsive-flex" style={{ padding: "0 24px" }}>
                {/* Recent Pickups */}
                <div className="card-premium" style={{ flex: 2 }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px" }}>Recent Pickup Requests</h3>
                  {filteredPickups.slice(0, 5).map(p => (
                    <div key={p._id} style={{
                      background: "var(--bg-subtle)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-lg)",
                      padding: "16px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>{p.name} <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "normal" }}>({p.scrapType})</span></div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>📍 {p.address}</div>
                      </div>
                      <span className={`badge-status badge-${p.status.toLowerCase()}`}>{p.status}</span>
                    </div>
                  ))}
                  {pickups.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">🚚</div>
                      <h3>No Recent Pickups</h3>
                      <p>Pickup requests will appear here.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="card-premium" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px" }}>Quick Actions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }} onClick={() => { setActiveTab("accounting"); setShowPurchaseModal(true); }}><FaPlus /> Record Purchase</button>
                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }} onClick={() => { setActiveTab("accounting"); setShowSaleModal(true); }}><FaFileInvoice /> New Invoice</button>
                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }} onClick={() => setShowCollectorModal(true)}><FaUserPlus /> Manage Collectors</button>
                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }} onClick={() => setActiveTab("reports")}><FaChartLine /> View Reports</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pickups" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px 20px" }}>
              <div style={{ padding: "0" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Pickup History</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 16px 0" }}>Manage all your franchise pickups</p>
              </div>
              <div className="grid-3">
                {filteredPickups.map(p => (
                  <div key={p._id} style={{
                    background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-xl)", padding: "16px 18px",
                    boxShadow: "var(--card-shadow)", borderLeft: `4px solid ${p.status === 'Completed' ? 'var(--success)' : p.status === 'Pending' ? 'var(--warning)' : 'var(--primary)'}`,
                    display: "flex", flexDirection: "column", justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "15px", color: "var(--text-main)" }}>{p.name}</div>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>📞 {p.mobile}</div>
                        </div>
                        <span className={`badge-status badge-${p.status.toLowerCase()}`}>{p.status}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px", background: "var(--bg-subtle)", padding: "8px", borderRadius: "8px" }}>
                        📍 {p.address}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginTop: "12px" }}>
                        Scrap Type: {p.scrapType}
                      </div>
                    </div>
                    
                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                      {["Pending", "Rejected"].includes(p.status) && (
                        <button className="btn-premium" style={{ height: "32px", fontSize: "12px", padding: "0 12px" }} onClick={() => { setSelectedPickup(p); setShowAssignModal(true); }}>
                          Assign Collector
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {filteredPickups.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🚚</div>
                  <h3>No Pickups Found</h3>
                  <p>There are currently no pickup requests available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", marginBottom: "20px" }}>Global Platform Settings</h2>
              <div className="card-premium" style={{ padding: "24px" }}>
                <div className="grid-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><FaRupeeSign /> Min Order Value</label>
                      <Input type="number" value={settings.minAmount} onChange={v => setSettings({ ...settings, minAmount: v })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><FaEnvelope /> Business Email</label>
                      <Input value={settings.contactEmail} onChange={v => setSettings({ ...settings, contactEmail: v })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><FaPhone /> Business Phone</label>
                      <Input value={settings.contactPhone} onChange={v => setSettings({ ...settings, contactPhone: v })} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><FaMapMarkerAlt /> Office Address</label>
                      <Input value={settings.officeAddress} onChange={v => setSettings({ ...settings, officeAddress: v })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><FaFacebook /> Facebook URL</label>
                      <Input value={settings.facebookUrl} onChange={v => setSettings({ ...settings, facebookUrl: v })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><FaInstagram /> Instagram URL</label>
                      <Input value={settings.instagramUrl} onChange={v => setSettings({ ...settings, instagramUrl: v })} />
                    </div>
                  </div>
                </div>
                <button className="btn-premium" style={{ width: "100%", marginTop: "24px", padding: "16px", fontSize: "16px" }} onClick={handleUpdateSettings}>Save All Configurations</button>
              </div>
            </div>
          )}

          {/* OTHER TABS (Users, Collectors, Rates, Ads, Reviews) with same premium-card style... */}
          {activeTab === "rates" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Scrap Rates</h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Manage item pricing and categories</p>
                </div>
                <button className="btn-premium" style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "10px" }} onClick={() => setShowItemModal(true)}><FaPlus /> Add Rate</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {filteredItems.map(it => (
                  <div 
                    key={it._id} 
                    style={{ 
                      background: "var(--card-bg, #ffffff)", 
                      border: "1.5px solid var(--card-border, rgba(15,23,42,0.08))", 
                      borderRadius: "16px", 
                      padding: "14px 16px", 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      boxShadow: "var(--card-shadow, 0 4px 12px rgba(0,0,0,0.03))",
                      boxSizing: "border-box",
                      width: "100%",
                      minWidth: 0
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
                      <div style={{ fontWeight: "800", fontSize: "14px", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                      <div style={{ fontSize: "11px", color: "#0b8f3a", fontWeight: "700", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{it.category || "General"}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <div style={{ fontWeight: "900", fontSize: "16px", color: "var(--text-main)" }}>
                        ₹{it.price}<span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>/{it.unit}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button 
                          type="button"
                          style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "7px 9px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} 
                          onClick={() => { setEditingRate(it); setShowEditRateModal(true); }}
                          title="Edit Rate"
                        >
                          <FaTools size={13} />
                        </button>
                        <button 
                          type="button"
                          style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1.5px solid #ef4444", padding: "7px 9px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} 
                          onClick={() => handleDeleteItem(it._id, "rate")}
                          title="Delete Item"
                        >
                          <FaTrash size={13} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "collectors" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Collectors</h2>
                <button className="btn-premium" onClick={() => setShowCollectorModal(true)}><FaPlus /> Add Collector</button>
              </div>
              <div className="grid-2">
                {filteredCollectors.map(u => (
                  <div key={u._id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--card-shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "16px", color: "var(--text-main)" }}>{u.name}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>📞 {u.mobile} {u.area && `• 📍 ${u.area}`}</div>
                        {u.walletBalance !== undefined && <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--primary)", marginTop: "6px" }}>Wallet: ₹{u.walletBalance}</div>}
                      </div>
                      <span className="badge-status badge-active">Active</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button className="btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "12px" }} onClick={() => { setWalletForm({ userId: u._id, amount: "", type: "credit", description: "Franchise Transfer" }); setShowWalletModal(true); }}>Transfer</button>
                      <button className="btn-secondary" style={{ padding: "8px" }} onClick={() => { setResetData({ userId: u._id, name: u.name, newPassword: "" }); setShowResetModal(true); }}><FaKey /></button>
                      <button className="btn-danger" style={{ padding: "8px" }} onClick={() => handleDeleteItem(u._id, "collector")}><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ads" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Managed Banners</h2>
                <button className="btn-premium" onClick={() => setShowAdModal(true)}><FaPlus /> Add Banner</button>
              </div>
              <div className="grid-3">
                {ads.map(ad => (
                  <div key={ad._id} style={{ border: "1px solid var(--card-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--card-bg)", boxShadow: "var(--card-shadow)" }}>
                    <img src={ad.imageUrl} style={{ width: "100%", height: "140px", objectFit: "cover" }} alt="" />
                    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-main)" }}>{ad.title}</span>
                      <button className="btn-danger" style={{ padding: "8px", height: "auto" }} onClick={() => handleDeleteItem(ad._id, "ad")}><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", marginBottom: "20px" }}>Platform Reviews</h2>
              <div className="grid-2">
                {reviews.map(r => (
                  <div key={r._id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "var(--card-shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <div style={{ color: "#f39c12", marginBottom: "4px" }}>{[...Array(r.rating)].map((_, i) => <FaStar key={i} size={14} />)}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-main)" }}>
                          <strong>{r.user?.name}</strong> <span style={{ color: "var(--text-muted)" }}>reviewed</span> <strong>{r.collector?.name || "Unknown"}</strong>
                        </div>
                      </div>
                      <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--text-main)", fontStyle: "italic", background: "var(--bg-subtle)", padding: "12px", borderRadius: "8px" }}>"{r.comment}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Wallet & Transactions</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-premium" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", border: "none" }} onClick={() => setShowFranchiseDepositModal(true)}><FaPlus /> Add Funds</button>
                  <button className="btn-secondary" onClick={() => setShowWalletModal(true)}><FaPlus /> Manual Adjust</button>
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: "24px" }}>
                <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)", borderRadius: "var(--radius-xl)", padding: "28px 24px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 10px 25px rgba(11, 143, 58, 0.3)" }}>
                  <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "8px", fontWeight: "600" }}>Available Balance</div>
                  <div style={{ fontSize: "36px", fontWeight: "900", letterSpacing: "-0.03em" }}>₹{walletStats.totalAvailable}</div>
                </div>
                <div className="kpi-card" style={{ border: "1px solid var(--warning-border)", background: "var(--warning-light)" }}>
                  <div>
                    <div className="kpi-label" style={{ color: "var(--warning)" }}>Pending Balance</div>
                    <div className="kpi-value" style={{ color: "var(--warning)" }}>₹{walletStats.totalPending}</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-label">Total Users</div>
                    <div className="kpi-value">{walletStats.userCount}</div>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px" }}>Recent Transactions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {filteredTransactions.map(tx => (
                    <div key={tx._id} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--card-border)" }}>
                      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", background: tx.status === "paid_in_cash" ? "var(--warning-light)" : (tx.type === "credit" ? "var(--success-light)" : "var(--danger-light)") }}>
                          {tx.status === "paid_in_cash" ? <FaRupeeSign color="var(--warning)" /> : (tx.type === "credit" ? <FaArrowUp color="var(--success)" /> : <FaArrowDown color="var(--danger)" />)}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>{tx.description}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{tx.user?.name} ({tx.user?.mobile}) • {new Date(tx.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: tx.status === "paid_in_cash" ? "var(--text-muted)" : (tx.type === "credit" ? "var(--success)" : "var(--danger)") }}>
                          {tx.status === "paid_in_cash" ? "" : " "}{tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                        </div>
                        <span className={`badge-status badge-${tx.status === "completed" ? "completed" : tx.status === "paid_in_cash" ? "pending" : "cancelled"}`} style={{ marginTop: "4px", display: "inline-block" }}>
                          {(tx.status || "").replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && <div className="empty-state"><h3>No Transactions</h3><p>Your transaction history is empty.</p></div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "accounting" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Accounting & Billing</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Manage your purchases and sales</p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="btn-secondary" style={{ padding: "8px 12px", fontSize: "12px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={() => setShowPurchaseModal(true)}>
                    <FaPlus style={{ fontSize: "11px" }} /> Record Purchase
                  </button>
                  <button className="btn-premium" style={{ padding: "8px 12px", fontSize: "12px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={() => setShowSaleModal(true)}>
                    <FaPlus style={{ fontSize: "11px" }} /> Create Sale Invoice
                  </button>
                </div>
              </div>

              <div className="grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div className="kpi-card" style={{ border: accountingStats.overallProfit >= 0 ? "1px solid var(--success-border)" : "1px solid var(--danger-border)", background: accountingStats.overallProfit >= 0 ? "var(--success-light)" : "var(--danger-light)" }}>
                  <div>
                    <div className="kpi-label" style={{ color: accountingStats.overallProfit >= 0 ? "var(--success)" : "var(--danger)" }}>NET PROFIT/LOSS</div>
                    <div className="kpi-value" style={{ color: accountingStats.overallProfit >= 0 ? "var(--success)" : "var(--danger)" }}>{accountingStats.overallProfit >= 0 ? "+" : "-"}₹{Math.abs(accountingStats.overallProfit).toFixed(2)}</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div><div className="kpi-label">STOCK VALUE</div><div className="kpi-value">₹{accountingStats.stockValue?.toFixed(2) || 0}</div></div>
                </div>
                <div className="kpi-card">
                  <div><div className="kpi-label">TOTAL PURCHASES</div><div className="kpi-value">₹{accountingStats.totalPurchaseAmount?.toFixed(2)}</div></div>
                </div>
                <div className="kpi-card">
                  <div><div className="kpi-label">TOTAL SALES</div><div className="kpi-value">₹{accountingStats.totalSaleAmount?.toFixed(2)}</div></div>
                </div>
                <div className="kpi-card">
                  <div><div className="kpi-label">TODAY'S PROFIT</div><div className="kpi-value">₹{(accountingStats.todayProfit || 0).toFixed(2) || 0}</div></div>
                </div>
              </div>

              <div className="grid-2 responsive-flex" style={{ marginTop: "16px" }}>
                <div className="card-premium">
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px" }}>Recent Purchases</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredPurchases.map(p => (
                      <div key={p._id} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", justifyContent: "space-between", border: "1px solid var(--card-border)", cursor: "pointer" }} onClick={() => openPurchaseBillModal(p)}>
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{p.supplierName} <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "normal" }}>({p.supplierContact})</span></div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Items: {p.items.length} • {new Date(p.createdAt).toLocaleDateString()}</div>
                          <div style={{ marginTop: "8px" }}><span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary)" }}>📄 View Bill</span></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                          <span className={`badge-status badge-${p.paymentStatus === "Paid" ? 'completed' : 'pending'}`}>{p.paymentStatus}</span>
                          <div style={{ fontWeight: "800", color: "var(--danger)" }}>-₹{p.totalAmount}</div>
                        </div>
                      </div>
                    ))}
                    {purchases.length === 0 && <div className="empty-state"><h3>No Purchases</h3><p>Your recent purchases will appear here.</p></div>}
                  </div>
                </div>

                <div className="card-premium">
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px" }}>Recent Sales</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredSales.map(sale => (
                      <div key={sale._id} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", justifyContent: "space-between", border: "1px solid var(--card-border)" }}>
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{sale.buyerName} <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "normal" }}>({sale.buyerContact})</span></div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>INV: {sale.invoiceNumber || "N/A"} • {new Date(sale.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                          <span className="badge-status badge-completed">Paid</span>
                          <div style={{ fontWeight: "800", color: "var(--success)" }}>+₹{sale.totalAmount}</div>
                          <button className="btn-secondary" style={{ fontSize: "11px", padding: "4px 8px", height: "auto" }} onClick={() => { setSelectedInvoice(sale); setShowInvoiceModal(true); }}>View Invoice</button>
                        </div>
                      </div>
                    ))}
                    {sales.length === 0 && <div className="empty-state"><h3>No Sales</h3><p>Your recent sales will appear here.</p></div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Live Inventory</h2>
                <div style={{ background: "var(--card-bg)", border: "1px solid var(--info-border)", padding: "12px 20px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--card-shadow)" }}>
                  <div style={{ fontSize: "24px" }}>💰</div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--info)", textTransform: "uppercase" }}>Stock Value</div>
                    <div style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-main)" }}>₹{accountingStats.stockValue?.toFixed(2) || 0}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid-3">
                {inventory.map(inv => (
                  <div key={inv._id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-xl)", padding: "16px", display: "flex", gap: "16px", alignItems: "center", boxShadow: "var(--card-shadow)" }}>
                    <img src={inv.scrapItem?.image || "https://via.placeholder.com/60"} style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }} alt="" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "800", fontSize: "15px", color: "var(--text-main)" }}>{inv.scrapItem?.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{inv.scrapItem?.category}</div>
                      <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                        Bought: {inv.totalBoughtQuantity} • Sold: {inv.totalSoldQuantity}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "20px", fontWeight: "900", color: inv.quantityAvailable > 0 ? "var(--primary)" : "var(--danger)" }}>
                        {inv.quantityAvailable} <span style={{ fontSize: "12px" }}>{inv.scrapItem?.unit}</span>
                      </div>
                      <span className={`badge-status badge-${inv.quantityAvailable > 0 ? 'active' : 'cancelled'}`} style={{ marginTop: "4px", display: "inline-block" }}>In Stock</span>
                    </div>
                  </div>
                ))}
              </div>
              {inventory.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h3>Empty Inventory</h3>
                  <p>You currently have no items in stock.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", flexWrap:"wrap", gap:"12px"}}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>📊 Reports & Analytics</h2>
                <button className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={downloadCSV}>
                  <FaDownload /> Download CSV
                </button>
              </div>

              {/* Report Type Tabs */}
              <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"24px"}}>
                {[
                  {key:"purchases", label:"🧾 Purchases & Inventory"},
                  {key:"summary", label:"📈 Summary"},
                  {key:"collectors", label:"👷 Collectors"},
                  {key:"suppliers", label:"🏪 Suppliers"},
                  {key:"buyers", label:"🛒 Buyers"}
                ].map(t => (
                  <button key={t.key}
                    style={{
                      padding: "10px 18px", borderRadius: "100px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "13px",
                      background: reportType===t.key ? "var(--primary)" : "var(--bg-subtle)",
                      color: reportType===t.key ? "#fff" : "var(--text-main)",
                      transition: "all 0.2s"
                    }}
                    onClick={() => { setReportType(t.key); setReportData([]); setReportInventory([]); }}
                  >{t.label}</button>
                ))}
              </div>

              {/* Filters Row */}
              <div className="card-premium" style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"12px", marginBottom:"20px", padding:"20px"}}>
                <div>
                  <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>📅 From Date</label>
                  <input className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportFrom} onChange={e => setReportFrom(e.target.value)} />
                </div>
                <div>
                  <label style={{fontSize:"11px", fontWeight:"bold", color: "var(--text-muted)", display:"block", marginBottom:"4px"}}>📅 To Date</label>
                  <input className="native-input" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportTo} onChange={e => setReportTo(e.target.value)} />
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

              {/* Results */}
              {reportLoading && <div style={{textAlign:"center", padding:"30px", color:"#0b8f3a", fontWeight:"bold"}}>⏳ Loading report...</div>}

              {!reportLoading && reportData.length === 0 && (
                <div style={{textAlign:"center", padding:"40px", color:"#999"}}>
                  📋 Filters select karein aur \"Load Report\" dabayein
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
                                  <button onClick={() => openPurchaseBillModal(p)} style={{ border: "none", background: "#f0fdf4", color: "#0369a1", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "10px" }}>📄 View</button>
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
                              {s.records?.map((rec, k) => (
                                <tr key={k} style={{borderBottom:"1px solid #eee"}}>
                                  <td style={{padding:"6px", fontWeight:"bold"}}>{rec.billNo}</td>
                                  <td style={{padding:"6px"}}>{rec.date}</td>
                                  <td style={{padding:"6px", textAlign:"center"}}>{rec.items?.length || 0}</td>
                                  <td style={{padding:"6px", textAlign:"right", color:"#dc3545"}}>₹{rec.totalAmount}</td>
                                  <td style={{padding:"6px", textAlign:"center"}}><span style={{fontSize:"10px", padding:"2px 6px", borderRadius:"6px", background: rec.paymentStatus==="Paid"?"#eef8f1":"#fff9e6", color: rec.paymentStatus==="Paid"?"#0b8f3a":"#f39c12"}}>{rec.paymentStatus}</span></td>
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
                        <div key={i} style={{border:"1px solid #fed7aa", borderRadius:"15px", padding:"15px", marginBottom:"15px", background:"#fffaf5"}}>
                          <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                            <div>
                              <div style={{fontWeight:"bold", fontSize:"15px"}}>🛒 {b.buyerName}</div>
                              <div style={{fontSize:"12px", color: "var(--text-muted)"}}>📞 {b.buyerContact} {b.buyerGSTIN && `• GSTIN: ${b.buyerGSTIN}`}</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:"18px", fontWeight:"bold", color:"#0b8f3a"}}>₹{b.totalAmount}</div>
                              <div style={{fontSize:"12px", color: "var(--text-muted)"}}>{b.totalSales} sales</div>
                            </div>
                          </div>
                          <table style={{width:"100%", borderCollapse:"collapse", fontSize:"12px"}}>
                            <thead><tr style={{background:"#ffedd5"}}>
                              <th style={{padding:"6px", textAlign:"left"}}>Invoice No</th>
                              <th style={{padding:"6px", textAlign:"left"}}>Date</th>
                              <th style={{padding:"6px", textAlign:"center"}}>Items</th>
                              <th style={{padding:"6px", textAlign:"right"}}>Amount</th>
                              <th style={{padding:"6px", textAlign:"center"}}>Status</th>
                            </tr></thead>
                            <tbody>
                              {b.records?.map((rec, k) => (
                                <tr key={k} style={{borderBottom:"1px solid #eee"}}>
                                  <td style={{padding:"6px", fontWeight:"bold"}}>{rec.invoiceNo}</td>
                                  <td style={{padding:"6px"}}>{rec.date}</td>
                                  <td style={{padding:"6px", textAlign:"center"}}>{rec.items?.length || 0}</td>
                                  <td style={{padding:"6px", textAlign:"right", color:"#0b8f3a"}}>₹{rec.totalAmount}</td>
                                  <td style={{padding:"6px", textAlign:"center"}}><span style={{fontSize:"10px", padding:"2px 6px", borderRadius:"6px", background: rec.paymentStatus==="Paid"?"#eef8f1":"#fff9e6", color: rec.paymentStatus==="Paid"?"#0b8f3a":"#f39c12"}}>{rec.paymentStatus}</span></td>
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

          {activeTab === "support" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>Support Tickets</h2>
                <button className="btn-premium" onClick={() => setShowTicketModal(true)}><FaPlus /> Raise Ticket</button>
              </div>
              <div className="grid-2">
                {filteredTickets.map(t => (
                  <div key={t._id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "var(--card-shadow)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "15px", color: "var(--text-main)" }}>{t.subject}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Category: {t.category}</div>
                      </div>
                      <span className={`badge-status badge-${t.status.toLowerCase()}`}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-main)", background: "var(--bg-subtle)", padding: "12px", borderRadius: "8px" }}>{t.message}</div>
                    <div style={{ textAlign: "right", fontSize: "11px", color: "var(--text-muted)" }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
              {tickets.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🎫</div>
                  <h3>No Support Tickets</h3>
                  <p>You haven't raised any support tickets yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "dist-settings" && (
            <div className="fade-up" style={{ padding: "16px 20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-main)", marginBottom: "20px" }}>District Configurations</h2>
              <div className="card-premium" style={{ padding: "24px" }}>
                <div className="grid-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>Service Radius (km)</label>
                      <Input type="number" value={distSettings.serviceRadius} onChange={v => setDistSettings({ ...distSettings, serviceRadius: v })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>Working Hours</label>
                      <Input value={distSettings.workingHours} onChange={v => setDistSettings({ ...distSettings, workingHours: v })} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>Off Day</label>
                      <Input value={distSettings.offDay} onChange={v => setDistSettings({ ...distSettings, offDay: v })} />
                    </div>
                  </div>
                </div>
                <button className="btn-premium" style={{ width: "100%", marginTop: "24px", padding: "16px", fontSize: "16px" }} onClick={async () => {
                  try {
                    const { data } = await API.post("/district-settings", distSettings);
                    if (data.success) showToast("success", "District Settings Updated!");
                  } catch (e) { showToast("error", "Failed to save settings"); }
                }}>Save District Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS (Enhanced styling) */}
      {showItemModal && (
        <Modal title="Add New Rate" onClose={() => setShowItemModal(false)}>
          <Input placeholder="Item Name" value={newItem.name} onChange={v => setNewItem({ ...newItem, name: v })} />
          <Input placeholder="Price (₹)" type="number" value={newItem.price} onChange={v => setNewItem({ ...newItem, price: v })} />
          <select className="native-input" style={inputStyle} value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
            <option value="kg">kg</option><option value="Pcs">Pcs</option><option value="Unit">Unit</option>
          </select>
          <select className="native-input" style={inputStyle} value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
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
        <Modal title="Upload Ad Banner" onClose={() => setShowAdModal(false)}>
          <Input placeholder="Title" value={newAd.title} onChange={v => setNewAd({ ...newAd, title: v })} />
          <Input placeholder="Target Link (optional)" value={newAd.link} onChange={v => setNewAd({ ...newAd, link: v })} />
          <div style={{ padding: "15px", border: "2px dashed #eee", borderRadius: "12px", textAlign: "center", marginBottom: "15px" }}>
            <input type="file" onChange={e => setAdFile(e.target.files[0])} />
          </div>
          <button className="native-btn" style={saveBtnBig} onClick={handleCreateAd}>Publish Banner</button>
        </Modal>
      )}

      {showResetModal && (
        <Modal title={`Reset: ${resetData.name}`} onClose={() => setShowResetModal(false)}>
          <Input placeholder="New Secure Password" value={resetData.newPassword} onChange={v => setResetData({ ...resetData, newPassword: v })} />
          <button className="native-btn" style={saveBtnBig} onClick={handleResetPassword}>Update Credentials</button>
        </Modal>
      )}

      {showAssignModal && (
        <Modal title="Assign Collector" onClose={() => setShowAssignModal(false)}>
          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {collectors.map(c => (
              <div key={c._id} style={collectorPickRow} onClick={() => handleAssignPickup(c._id)}>
                <span><strong>{c.name}</strong> <br /><small>{c.area}</small></span> <button style={addBtn}>Select</button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showEditRateModal && editingRate && (
        <Modal title={`Edit ${editingRate.name}`} onClose={() => setShowEditRateModal(false)}>
          <label style={labelStyle}>Update Market Price (₹)</label>
          <Input type="number" value={editingRate.price} onChange={v => setEditingRate({ ...editingRate, price: v })} />
          <button className="native-btn" style={saveBtnBig} onClick={handleUpdateRate}>Save Changes</button>
        </Modal>
      )}

      {showTicketModal && (
        <Modal title="Raise Support Ticket" onClose={() => { setShowTicketModal(false); }}>
          <label style={labelStyle}>Category</label>
          <select className="native-input" style={inputStyle} value={newTicketForm?.category || "General"} onChange={e => setNewTicketForm({ ...newTicketForm, category: e.target.value })}>
            <option value="General">General</option>
            <option value="Payment">Payment Issue</option>
            <option value="Pickup">Pickup Problem</option>
            <option value="Collector">Collector Issue</option>
            <option value="Technical">Technical Bug</option>
          </select>
          <label style={labelStyle}>Subject</label>
          <Input placeholder="Short subject..." value={newTicketForm?.subject || ""} onChange={v => setNewTicketForm({ ...newTicketForm, subject: v })} />
          <label style={labelStyle}>Message / Details</label>
          <textarea
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", marginBottom: "15px", boxSizing: "border-box", fontSize: "14px", height: "100px", resize: "vertical", outline: "none" }}
            placeholder="Describe your issue in detail..."
            value={newTicketForm?.message || ""}
            onChange={e => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
          />
          <button className="native-btn" style={saveBtnBig} onClick={handleCreateTicket}>Submit Ticket to Admin</button>
        </Modal>
      )}

      {showUserModal && (
        <Modal title="Quick User Add" onClose={() => setShowUserModal(false)}>
          <Input placeholder="Full Name" value={newUser.name} onChange={v => setNewUser({ ...newUser, name: v })} />
          <Input placeholder="Mobile No" value={newUser.mobile} onChange={v => setNewUser({ ...newUser, mobile: v })} />
          <Input placeholder="Initial Password" value={newUser.password} onChange={v => setNewUser({ ...newUser, password: v })} />
          <button className="native-btn" style={saveBtnBig} onClick={handleCreateUser}>Register User</button>
        </Modal>
      )}

      {showCollectorModal && (
        <Modal title="New Collector Hire" onClose={() => setShowCollectorModal(false)}>
          <Input placeholder="Full Name" value={newCollector.name} onChange={v => setNewCollector({ ...newCollector, name: v })} />
          <Input placeholder="Mobile No" value={newCollector.mobile} onChange={v => setNewCollector({ ...newCollector, mobile: v })} />
          <Input placeholder="Service Area" value={newCollector.area} onChange={v => setNewCollector({ ...newCollector, area: v })} />
          <Input placeholder="Initial Password" value={newCollector.password} onChange={v => setNewCollector({ ...newCollector, password: v })} />
          <button className="native-btn" style={saveBtnBig} onClick={handleCreateCollector}>Register Collector</button>
        </Modal>
      )}

      {showFranchiseDepositModal && (
        <Modal 
          title={franchiseDepositStep === 1 ? "Add Funds to Wallet (Step 1 of 2)" : "Scan UPI QR Code & Enter UTR (Step 2 of 2)"} 
          onClose={() => { setShowFranchiseDepositModal(false); setFranchiseDepositStep(1); setFranchiseDepositForm({ amount: "", upiRefNo: "" }); }}
        >
          {franchiseDepositStep === 1 ? (
            /* STEP 1: AMOUNT ENTRY */
            <div style={{display:"flex", flexDirection:"column", gap:"18px"}}>
              <div style={{background: "var(--bg-subtle, #eefbf3)", padding: "14px", borderRadius: "12px", border: "1.5px solid var(--card-border, #bbf7d0)", textAlign: "center"}}>
                <div style={{fontWeight: "bold", fontSize: "15px", color: "var(--text-main, #0b8f3a)"}}>💵 Deposit Funds to Wallet</div>
                <div style={{fontSize: "12px", marginTop: "4px", color: "var(--text-muted, #047857)"}}>Minimum Deposit Amount is <strong style={{color: "#0b8f3a"}}>₹1,000</strong></div>
              </div>

              <div>
                <label style={{fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px", display: "block"}}>Enter Amount to Deposit (₹) *</label>
                <div style={{display:"flex", alignItems:"center", gap:"10px", background:"var(--bg-main)", padding:"14px", borderRadius:"12px", border:"2px solid #0b8f3a"}}>
                  <span style={{color:"var(--primary)", fontWeight:"bold", fontSize: "20px"}}>₹</span>
                  <input 
                    type="number" 
                    placeholder="Enter amount (Min ₹1,000)" 
                    required 
                    min={1000}
                    value={franchiseDepositForm.amount} 
                    onChange={e => setFranchiseDepositForm({...franchiseDepositForm, amount: e.target.value})} 
                    style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)", fontSize: "18px", fontWeight: "bold"}} 
                  />
                </div>
              </div>

              {/* Quick Amount Pills */}
              <div style={{display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center"}}>
                {[1000, 2000, 5000, 10000].map(amt => (
                  <button 
                    key={amt} 
                    type="button" 
                    onClick={() => setFranchiseDepositForm({...franchiseDepositForm, amount: amt.toString()})}
                    style={{
                      background: Number(franchiseDepositForm.amount) === amt ? "#0b8f3a" : "var(--bg-main)",
                      color: Number(franchiseDepositForm.amount) === amt ? "#fff" : "var(--text-main)",
                      border: "1px solid var(--glass-border)",
                      padding: "8px 14px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    + ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button 
                type="button"
                className="btn-premium"
                style={{width: "100%", background: "linear-gradient(135deg, #0b8f3a 0%, #086d2c 100%)", color: "#fff", padding: "14px", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"}}
                onClick={() => {
                  if (!franchiseDepositForm.amount || Number(franchiseDepositForm.amount) < 1000) {
                    return showToast("error", "Minimum deposit amount is ₹1,000!");
                  }
                  setFranchiseDepositStep(2);
                }}
              >
                Proceed to Payment QR ➡️
              </button>
            </div>
          ) : (
            /* STEP 2: QR CODE & UTR SUBMISSION */
            <form onSubmit={handleFranchiseDepositSubmit} style={{display:"flex", flexDirection:"column", gap:"15px", alignItems: "center"}}>
              
              {/* Back / Change Amount bar */}
              <div style={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-main)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--glass-border)"}}>
                <span style={{fontSize: "13px", fontWeight: "bold", color: "var(--text-main)"}}>
                  Deposit Amount: <strong style={{color: "var(--primary)", fontSize: "15px"}}>₹{Number(franchiseDepositForm.amount).toLocaleString()}</strong>
                </span>
                <button 
                  type="button" 
                  onClick={() => setFranchiseDepositStep(1)}
                  style={{background: "none", border: "none", color: "var(--primary)", fontWeight: "bold", cursor: "pointer", fontSize: "12px"}}
                >
                  ✏️ Change
                </button>
              </div>

              {/* QR Code & UPI ID Box */}
              <div style={{textAlign: "center", width: "100%", background: "var(--bg-main)", padding: "16px", borderRadius: "16px", border: "1px solid var(--glass-border)"}}>
                 <div style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "bold"}}>SCAN QR WITH ANY UPI APP (GPAY / PHONEPE / PAYTM)</div>
                 
                 <div style={{background: "var(--card-bg, #ffffff)", padding: "12px", borderRadius: "16px", display: "inline-block", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", border: "2px solid #0b8f3a"}}>
                    <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${settings?.upiId || "8491028539@pthdfc"}&pn=ScrapVex&am=${franchiseDepositForm.amount}&tn=WalletDeposit`)}`} 
                       alt="Official UPI QR Code" 
                       style={{width: "180px", height: "180px", display: "block", margin: "0 auto"}}
                       onError={(e) => {
                         e.target.onerror = null;
                         e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(`upi://pay?pa=${settings?.upiId || "8491028539@pthdfc"}&pn=ScrapVex&am=${franchiseDepositForm.amount}&tn=WalletDeposit`)}`;
                       }}
                    />
                 </div>

                 <div style={{marginTop: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", background: "var(--primary-light)", padding: "8px 14px", borderRadius: "10px"}}>
                   <strong style={{color: "var(--primary)", fontSize: "14px"}}>UPI ID: {settings?.upiId || "8491028539@pthdfc"}</strong>
                   <button 
                     type="button" 
                     onClick={() => {
                       navigator.clipboard.writeText(settings?.upiId || "8491028539@pthdfc");
                       showToast("success", "UPI ID Copied to Clipboard!");
                     }}
                     style={{background: "var(--primary)", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer"}}
                   >
                     📋 Copy
                   </button>
                 </div>
              </div>

              {/* Deep Link for Mobile App */}
              <a 
                 href={`upi://pay?pa=${settings?.upiId || "8491028539@pthdfc"}&pn=ScrapVex&am=${franchiseDepositForm.amount}&tn=WalletDeposit`} 
                 className="btn-premium" 
                 style={{width:"100%", textDecoration: "none", textAlign: "center", background: "linear-gradient(135deg, #0b8f3a 0%, #086d2c 100%)", color: "#fff", padding: "12px", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"}}
              >
                 📲 Pay via UPI App (PhonePe/GPay/Paytm)
              </a>

              {/* 12-Digit UTR Input */}
              <div style={{width: "100%"}}>
                 <label style={{fontSize: "12px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "4px", display: "block"}}>12-Digit UTR / UPI Ref No *</label>
                 <div style={{display:"flex", alignItems:"center", gap:"10px", background:"var(--bg-main)", padding:"12px 14px", borderRadius:"12px", border:"1px solid var(--glass-border)"}}>
                    <span style={{color:"var(--primary)", fontWeight:"bold"}}>🔗</span>
                    <input 
                      type="text" 
                      maxLength={12} 
                      placeholder="Enter 12-digit UTR from payment receipt" 
                      required 
                      value={franchiseDepositForm.upiRefNo} 
                      onChange={e => setFranchiseDepositForm({...franchiseDepositForm, upiRefNo: e.target.value.replace(/\D/g, "")})} 
                      style={{border:"none", background:"transparent", outline:"none", width:"100%", color:"var(--text-main)", fontSize: "14px", fontWeight: "bold"}} 
                    />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={submittingDeposit} 
                className="btn-premium" 
                style={{width:"100%", background: "linear-gradient(135deg, #0b8f3a 0%, #086d2c 100%)", color: "#fff", padding: "14px", borderRadius: "12px", fontWeight: "bold", fontSize: "15px", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"}}
              >
                {submittingDeposit ? "Submitting Request..." : "Submit Deposit Request 🏦"}
              </button>

            </form>
          )}
        </Modal>
      )}

      {showWalletModal && (
        <Modal title="Manual Wallet Adjustment" onClose={() => setShowWalletModal(false)}>
          <select className="native-input" style={inputStyle} value={walletForm.userId} onChange={e => setWalletForm({ ...walletForm, userId: e.target.value })}>
            <option value="">Choose Collector</option>
            {collectors.map(u => <option key={u._id} value={u._id}>{u.name} ({u.mobile})</option>)}
          </select>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Amount (₹)</label>
              <Input type="number" value={walletForm.amount} onChange={v => setWalletForm({ ...walletForm, amount: v })} />
            </div>
            <div>
              <label style={labelStyle}>Action</label>
              <select className="native-input" style={inputStyle} value={walletForm.type} onChange={e => setWalletForm({ ...walletForm, type: e.target.value })}>
                <option value="credit">Credit (+)</option>
                <option value="debit">Debit (-)</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Description (Reason)</label>
          <Input placeholder="e.g. Refund for pickup #123" value={walletForm.description} onChange={v => setWalletForm({ ...walletForm, description: v })} />

          <button className="native-btn" style={saveBtnBig} onClick={handleUpdateWallet}>Apply Adjustment</button>
        </Modal>
      )}

      {showSaleModal && (
        <Modal title="Create GST E-Invoice" onClose={() => setShowSaleModal(false)}>
          <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
            <h4 style={{ marginTop: 0 }}>Buyer (Bill To)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <Input placeholder="Buyer Name" value={newSale.buyerName} onChange={v => setNewSale({ ...newSale, buyerName: v })} />
              <Input placeholder="Address" value={newSale.buyerAddress} onChange={v => setNewSale({ ...newSale, buyerAddress: v })} />
              <Input placeholder="GSTIN/UIN" value={newSale.buyerGSTIN} onChange={v => setNewSale({ ...newSale, buyerGSTIN: v })} />
              <Input placeholder="PAN/IT No" value={newSale.buyerPAN} onChange={v => setNewSale({ ...newSale, buyerPAN: v })} />
            </div>

            <h4>Consignee (Ship To) - Leave blank if same</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <Input placeholder="Consignee Name" value={newSale.consigneeName} onChange={v => setNewSale({ ...newSale, consigneeName: v })} />
              <Input placeholder="Address" value={newSale.consigneeAddress} onChange={v => setNewSale({ ...newSale, consigneeAddress: v })} />
              <Input placeholder="GSTIN/UIN" value={newSale.consigneeGSTIN} onChange={v => setNewSale({ ...newSale, consigneeGSTIN: v })} />
            </div>

            <h4>Dispatch & Transport Details</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <Input placeholder="e-Way Bill No" value={newSale.eWayBillNo} onChange={v => setNewSale({ ...newSale, eWayBillNo: v })} />
              <Input placeholder="Motor Vehicle No" value={newSale.motorVehicleNo} onChange={v => setNewSale({ ...newSale, motorVehicleNo: v })} />
              <Input placeholder="Destination" value={newSale.destination} onChange={v => setNewSale({ ...newSale, destination: v })} />
              <Input placeholder="IRN (Optional)" value={newSale.irn} onChange={v => setNewSale({ ...newSale, irn: v })} />
            </div>

            <div style={{ border: "1px solid #eee", padding: "15px", borderRadius: "12px", marginBottom: "15px", background: "#f8f9fa" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Add Items to Sale</h4>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                <select style={{ ...inputStyle, marginBottom: 0 }} value={saleItemInput.scrapItem} onChange={e => setSaleItemInput({ ...saleItemInput, scrapItem: e.target.value })}>
                  <option value="">Select Item</option>
                  {inventory.filter(i => i.quantityAvailable > 0).map(i => (
                    <option key={i.scrapItem?._id} value={i.scrapItem?._id}>{i.scrapItem?.name} (Avail: {i.quantityAvailable})</option>
                  ))}
                </select>
                <Input type="text" placeholder="HSN/SAC" value={saleItemInput.hsnCode} onChange={v => setSaleItemInput({ ...saleItemInput, hsnCode: v })} />
                <Input type="number" placeholder="Qty" value={saleItemInput.quantity} onChange={v => setSaleItemInput({ ...saleItemInput, quantity: v })} />
                <Input type="number" placeholder="Rate/Unit" value={saleItemInput.rate} onChange={v => setSaleItemInput({ ...saleItemInput, rate: v })} />
                <Input type="number" placeholder="CGST %" value={saleItemInput.cgstRate} onChange={v => setSaleItemInput({ ...saleItemInput, cgstRate: v })} />
                <Input type="number" placeholder="SGST %" value={saleItemInput.sgstRate} onChange={v => setSaleItemInput({ ...saleItemInput, sgstRate: v })} />
              </div>
              <button style={{ ...assignBtn, width: "100%", marginTop: "10px" }} onClick={handleAddSaleItem}>Add Item</button>
            </div>

            {newSale.items.length > 0 && (
              <div style={{ maxHeight: "120px", overflowY: "auto", marginBottom: "15px" }}>
                {newSale.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <span>{it.name} (HSN: {it.hsnCode}) - {it.quantity} x ₹{it.rate}</span>
                    <strong>₹{it.amount}</strong>
                  </div>
                ))}
                <div style={{ textAlign: "right", marginTop: "10px", fontWeight: "bold" }}>Taxable: ₹{newSale.items.reduce((a, b) => a + b.amount, 0)}</div>
              </div>
            )}

            <button className="native-btn" style={saveBtnBig} onClick={handleCreateSale}>Generate E-Invoice</button>
          </div>
        </Modal>
      )}

      {showPurchaseModal && (
        <Modal title="📦 Record Purchase" onClose={() => setShowPurchaseModal(false)}>
          <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "4px" }}>

            {/* DRAFT TABS */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center", borderBottom: "2px solid #e5e7eb", paddingBottom: "10px" }}>
              {purchaseDrafts.map((draft, idx) => (
                <div key={draft.id} style={{ display: "flex", alignItems: "center", borderRadius: "10px", overflow: "hidden", border: activeDraftId === draft.id ? "2px solid #0b8f3a" : "2px solid #e5e7eb", background: activeDraftId === draft.id ? "#f0fdf4" : "#f9fafb" }}>
                  <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "bold", color: activeDraftId === draft.id ? "#0b8f3a" : "var(--text-muted)", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => switchDraft(draft.id)}>
                    {draft.supplierName ? `📦 ${draft.supplierName.slice(0, 12)}` : `Draft ${idx + 1}`}
                    {draft.items.length > 0 && <span style={{ marginLeft: "4px", background: "#0b8f3a", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" }}>{draft.items.length}</span>}
                  </span>
                  {purchaseDrafts.length > 1 && (
                    <span style={{ padding: "6px 8px", cursor: "pointer", color: "#dc3545", fontSize: "13px", fontWeight: "bold" }}
                      onClick={(e) => { e.stopPropagation(); if (window.confirm(`"${draft.supplierName || `Draft ${idx + 1}`}" delete karein?`)) removeDraft(draft.id); }}>✕</span>
                  )}
                </div>
              ))}
              <button style={{ padding: "6px 12px", borderRadius: "10px", border: "2px dashed #0b8f3a", background: "transparent", color: "#0b8f3a", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }} onClick={addNewDraft}>
                + New Supplier
              </button>
            </div>

            {/* ACTIVE DRAFT FORM */}
            {(() => {
              const draft = getActiveDraft();
              if (!draft) return null;
              return (
                <>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Select Collector (Supplier)</label>
                      <select className="native-input" style={inputStyle} value={draft.supplierId}
                        onChange={e => {
                          const collector = collectors.find(c => c._id === e.target.value);
                          updateActiveDraft({ supplierId: e.target.value, supplierName: collector?.name || "", supplierContact: collector?.mobile || "" });
                        }}>
                        <option value="">Choose Collector</option>
                        {collectors.map(c => <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Contact</label>
                      <input className="native-input" style={inputStyle} disabled value={draft.supplierContact} readOnly />
                    </div>
                  </div>

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
                          <button onClick={() => handleRemovePurchaseItem(idx)} style={{ border: "none", background: "none", color: "#dc3545", cursor: "pointer", padding: "4px", fontSize: "14px" }}>🗑</button>
                        </div>
                      ))}
                      <div style={{ padding: "10px 12px", background: "#f0fdf4", borderTop: "2px solid #d1fae5", fontWeight: "bold", fontSize: "13px", textAlign: "right", color: "#0b8f3a" }}>
                        Total: ₹{draft.items.reduce((a, b) => a + (b.amount || 0), 0).toFixed(2)}
                      </div>
                    </div>
                  )}

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
                        <option value="Cash Wallet">Cash Wallet (App)</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const col = collectors.find(c => c._id === draft.supplierId);
                    const totalAmt = draft.items.reduce((a, b) => a + (b.amount || 0), 0);
                    const debt = col && col.walletBalance < 0 ? Math.abs(col.walletBalance) : 0;
                    const settle = Math.min(debt, totalAmt);
                    if (settle > 0) return (
                      <div style={{ background: "#eef8f1", border: "1px solid #c3e6cb", borderRadius: "12px", padding: "12px", marginTop: "10px", fontSize: "12px" }}>
                        <div style={{ fontWeight: "bold", color: "#0b8f3a", marginBottom: "4px" }}>⚡ Auto-Settlement</div>
                        <div>🔴 Collector Debt: <strong>₹{debt.toFixed(2)}</strong></div>
                        <div>✅ Auto-Settled: <strong style={{ color: "#0b8f3a" }}>₹{settle.toFixed(2)}</strong></div>
                        {(totalAmt - settle) > 0 && <div>💰 Fresh Payment: <strong style={{ color: "#e67e22" }}>₹{(totalAmt - settle).toFixed(2)}</strong></div>}
                        {(totalAmt - settle) === 0 && <div style={{ color: "#0b8f3a" }}>✅ No extra payment needed!</div>}
                      </div>
                    );
                    return null;
                  })()}
                </>
              );
            })()}

          </div>

          <button style={{ ...saveBtnBig, marginTop: "15px", background: "linear-gradient(135deg,#0b8f3a,#16a34a)" , color: "#fff"}} onClick={handleCreatePurchase}>
            ✅ Complete — {getActiveDraft()?.supplierName || "This Draft"}
          </button>
        </Modal>
      )}

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

      {showInvoiceModal && selectedInvoice && (
        <Modal title="GST Tax Invoice Preview" onClose={() => setShowInvoiceModal(false)} wide>
          <div className="no-print" style={{display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "15px", borderRadius: "15px", marginBottom: "20px"}}>
             <div style={{fontSize: "13px", color: "var(--text-muted)"}}>Professional A4 Portrait Layout Ready</div>
             <button className="native-btn" style={{...saveBtnBig, marginTop: 0, width: "auto", background: "#4f46e5", padding: "10px 25px"}} onClick={() => window.print()}>
                <FaFileInvoice style={{marginRight: "10px"}}/> Print A4 Invoice
             </button>
          </div>

          <div id="invoice-print-area" style={{padding: "40px", background: "var(--card-bg, #ffffff)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif", fontSize: "12px", border: "1px solid #eee", minHeight: "800px"}}>
             <style>{`
               @media print {
                 @page { size: A4; margin: 15mm; }
                 body * { visibility: hidden; }
                 #invoice-print-area, #invoice-print-area * { visibility: visible; }
                 #invoice-print-area { position: fixed; left: 0; top: 0; width: 100%; height: 100%; border: none; padding: 15mm; background: #fff; }
                 .no-print { display: none !important; }
               }
               #invoice-print-area table { width: 100%; border-collapse: collapse; margin-top: 20px; }
               #invoice-print-area th, #invoice-print-area td { border: 1px solid #000; padding: 8px; text-align: left; }
             `}</style>

             <div style={{display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "20px", marginBottom: "20px"}}>
                <div>
                   <h1 style={{margin: 0, fontSize: "28px", fontWeight: "900"}}>TAX INVOICE</h1>
                   <div style={{marginTop: "5px"}}>Invoice #: <strong>{selectedInvoice.invoiceNumber}</strong></div>
                   <div>Date: <strong>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</strong></div>
                </div>
                <div style={{textAlign: "right"}}>
                   <h2 style={{margin: 0, fontSize: "18px"}}>JAI DATTI TRADING CO</h2>
                   <p style={{margin: "5px 0", color: "var(--text-muted)"}}>DILLI, SAINIK COLONY JAMMU<br/>GSTIN: 01AMSPG9859M1ZA<br/>Ph: 9070000032</p>
                </div>
             </div>

             <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "30px"}}>
                <div>
                   <strong style={{fontSize: "10px", color: "#888", textTransform: "uppercase"}}>Bill To:</strong>
                   <h3 style={{margin: "5px 0 0 0"}}>{selectedInvoice.buyerName}</h3>
                   <p style={{margin: "5px 0", color: "var(--text-muted)"}}>{selectedInvoice.buyerAddress}<br/>GSTIN: {selectedInvoice.buyerGSTIN || "Unregistered"}</p>
                </div>
                <div>
                   <strong style={{fontSize: "10px", color: "#888", textTransform: "uppercase"}}>Shipped To:</strong>
                   <h3 style={{margin: "5px 0 0 0"}}>{selectedInvoice.consigneeName || selectedInvoice.buyerName}</h3>
                   <p style={{margin: "5px 0", color: "var(--text-muted)"}}>{selectedInvoice.consigneeAddress || selectedInvoice.buyerAddress}</p>
                </div>
             </div>

             <table>
                <thead style={{background: "#f8f9fa"}}>
                   <tr>
                      <th>Description</th>
                      <th style={{textAlign: "center"}}>HSN</th>
                      <th style={{textAlign: "center"}}>Qty (KG)</th>
                      <th style={{textAlign: "right"}}>Rate</th>
                      <th style={{textAlign: "right"}}>Total</th>
                   </tr>
                </thead>
                <tbody>
                   {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                         <td>{it.name}</td>
                         <td style={{textAlign: "center"}}>{it.hsnCode || "7204"}</td>
                         <td style={{textAlign: "center"}}>{it.quantity}</td>
                         <td style={{textAlign: "right"}}>₹{it.rate}</td>
                         <td style={{textAlign: "right"}}>₹{it.amount}</td>
                      </tr>
                   ))}
                </tbody>
                <tfoot>
                   <tr>
                      <td colSpan="4" style={{textAlign: "right", fontWeight: "bold"}}>Taxable Value</td>
                      <td style={{textAlign: "right"}}>₹{selectedInvoice.totalTaxableAmount || selectedInvoice.totalAmount}</td>
                   </tr>
                   <tr>
                      <td colSpan="4" style={{textAlign: "right"}}>CGST (2.5%) + SGST (2.5%)</td>
                      <td style={{textAlign: "right"}}>₹{(selectedInvoice.totalCGST + selectedInvoice.totalSGST).toFixed(2)}</td>
                   </tr>
                   <tr style={{background: "#f8f9fa", fontSize: "16px"}}>
                      <td colSpan="4" style={{textAlign: "right", fontWeight: "900"}}>GRAND TOTAL</td>
                      <td style={{textAlign: "right", fontWeight: "900"}}>₹{selectedInvoice.totalAmount}</td>
                   </tr>
                </tfoot>
             </table>

             <div style={{marginTop: "40px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px"}}>
                <div>
                   <p style={{fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px"}}>Amount in words:</p>
                   <strong style={{textTransform: "capitalize"}}>{numberToWords(Math.round(selectedInvoice.totalAmount))} Only</strong>
                </div>
                <div style={{textAlign: "right", marginTop: "40px"}}>
                   <div style={{height: "60px"}}></div>
                   <div style={{borderTop: "1px solid #000", display: "inline-block", padding: "10px 40px"}}>
                      <strong>Authorized Signatory</strong>
                   </div>
                </div>
             </div>
             
             <div style={{textAlign: "center", fontSize: "10px", color: "#999", marginTop: "50px"}}>
                This is a computer generated invoice and does not require a physical signature.
             </div>
          </div>
        </Modal>
      )}

      {showPurchaseBillModal && selectedPurchaseBill && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(9, 13, 22, 0.75)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" }} onClick={() => setShowPurchaseBillModal(false)}>
          <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "var(--radius-xl)", padding: "24px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", border: "1.5px solid var(--card-border, rgba(255,255,255,0.15))" }} onClick={e => e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px"}}>
              <h3 style={{margin:0, color:"var(--primary)", fontSize: "18px", fontWeight: "800"}}>📄 Purchase Bill Details</h3>
              <button onClick={() => setShowPurchaseBillModal(false)} style={{background:"none", border:"none", fontSize:"20px", cursor:"pointer", color:"var(--text-muted)"}}>✕</button>
            </div>

            {/* Current Bill */}
            <div style={{background:"var(--input-bg, #f8fafc)", border:"1.5px solid var(--card-border, rgba(255,255,255,0.1))", borderRadius:"16px", padding:"16px", marginBottom:"16px"}}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}>
                <div>
                  <div style={{fontWeight:"800", fontSize:"16px", color: "var(--text-main)"}}>{selectedPurchaseBill.supplierName}</div>
                  <div style={{fontSize:"12px", color: "var(--text-muted)", marginTop: "2px"}}>📞 {selectedPurchaseBill.supplierContact || "N/A"}</div>
                  <div style={{fontSize:"11px", color:"var(--text-muted)", marginTop: "2px"}}>📅 {new Date(selectedPurchaseBill.createdAt).toLocaleString()}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"22px", fontWeight:"900", color:"#ef4444"}}>₹{selectedPurchaseBill.totalAmount}</div>
                  <span className={`badge-status badge-${selectedPurchaseBill.paymentStatus === "Paid" ? "completed" : "pending"}`} style={{ marginTop: "4px", display: "inline-block" }}>
                    {selectedPurchaseBill.paymentStatus}
                  </span>
                </div>
              </div>
              {/* Items */}
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:"12px", marginTop:"12px"}}>
                <thead>
                  <tr style={{background:"#0b8f3a", color: "#ffffff"}}>
                    <th style={{padding:"8px 10px", textAlign:"left", borderRadius: "6px 0 0 6px"}}>Item</th>
                    <th style={{padding:"8px 10px", textAlign:"center"}}>Qty (kg)</th>
                    <th style={{padding:"8px 10px", textAlign:"center"}}>Rate</th>
                    <th style={{padding:"8px 10px", textAlign:"right", borderRadius: "0 6px 6px 0"}}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPurchaseBill.items.map((item, idx) => (
                    <tr key={idx} style={{borderBottom:"1px solid var(--card-border, rgba(255,255,255,0.1))"}}>
                      <td style={{padding:"8px 10px", color: "var(--text-main)", fontWeight: "600"}}>{item.name}</td>
                      <td style={{padding:"8px 10px", textAlign:"center", color: "var(--text-main)"}}>{item.quantity}</td>
                      <td style={{padding:"8px 10px", textAlign:"center", color: "var(--text-main)"}}>₹{item.rate}</td>
                      <td style={{padding:"8px 10px", textAlign:"right", fontWeight:"800", color: "#0b8f3a"}}>₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedPurchaseBill.notes && <div style={{marginTop:"10px", fontSize:"12px", color: "var(--text-muted)"}}>📌 {selectedPurchaseBill.notes}</div>}
            </div>

            {/* All Purchases from same Supplier */}
            <div style={{marginBottom:"16px"}}>
              <div style={{fontWeight:"800", fontSize:"13px", color:"var(--text-main)", marginBottom:"10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <span>📦 {selectedPurchaseBill.supplierName} Se Sab Purchases ({supplierPurchaseHistory.length} records)</span>
                <span style={{color:"#ef4444", fontWeight:"900"}}>Total: ₹{supplierTotalAmount}</span>
              </div>
              <div style={{maxHeight:"200px", overflowY:"auto", display: "flex", flexDirection: "column", gap: "6px"}}>
                {supplierPurchaseHistory.map((p) => (
                  <div key={p._id} style={{display:"flex", justifyContent:"space-between", padding:"10px 12px", background: "var(--input-bg, #f8fafc)", border: "1px solid var(--card-border, rgba(255,255,255,0.1))", borderRadius:"10px", fontSize:"12px"}}>
                    <div>
                      <div style={{fontWeight:"700", color: "var(--text-main)"}}>#{p._id.slice(-6).toUpperCase()} • {p.items.length} item(s)</div>
                      <div style={{fontSize:"11px", color:"var(--text-muted)", marginTop: "2px"}}>{new Date(p.createdAt).toLocaleDateString()} | {p.paymentMethod || "Cash"}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:"900", color:"var(--text-main)"}}>₹{p.totalAmount}</div>
                      <span className={`badge-status badge-${p.paymentStatus === "Paid" ? "completed" : "pending"}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                        {p.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex", gap:"10px", marginTop:"16px"}}>
              <button className="btn-secondary" style={{ padding: "10px", borderRadius: "10px", fontWeight: "800", flex:1, margin:0, background: "#f59e0b", color: "#ffffff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }} onClick={() => { setShowPurchaseBillModal(false); openEditPurchase(selectedPurchaseBill); }}>✏️ Edit Bill</button>
              <button className="btn-premium" style={{ padding: "10px", borderRadius: "10px", fontWeight: "800", flex:1, margin:0, background:"#0b8f3a", color: "#ffffff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }} onClick={() => { setShowPurchaseBillModal(false); setLastCreatedPurchase(selectedPurchaseBill); setShowPurchasePrintModal(true); }}>🖨️ Print / WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      

    </div>
  );
}

/* HELPER UI COMPONENTS */
const StatCard = ({ icon, title, value, grad }) => (
  <div style={{ ...statCard, background: grad, border: "none" }} className="premium-card">
    <div style={{ ...statIcon, background: "rgba(255,255,255,0.2)", color: "#fff" }}>{icon}</div>
    <div style={{ color: "#fff" }}>
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</div>
      <div style={{ fontSize: "11px", opacity: 0.8 }}>{title}</div>
    </div>
  </div>
);

const NavItem = ({ active, icon, text, onClick }) => (
  <div style={{ ...navItem, background: active ? "var(--card-bg)" : "transparent", color: active ? "var(--primary)" : "#fff", boxShadow: active ? "0 4px 12px rgba(0,0,0,0.1)" : "none" }} onClick={onClick} className="sidebar-item">
    {icon} <span style={{ fontWeight: active ? "bold" : "normal" }}>{text}</span>
  </div>
);

const BottomLink = ({ icon, text, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flex: "1 1 0px",
      width: 0,
      minWidth: 0,
      height: "100%",
      padding: "2px 0",
      outline: "none",
      color: active ? "#0b8f3a" : "#64748b"
    }}
  >
    <div style={{ fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", height: "18px" }}>
      {icon}
    </div>
    <span style={{
      fontSize: "9px",
      fontWeight: active ? "800" : "600",
      marginTop: "2px",
      lineHeight: "1.1",
      letterSpacing: "-0.2px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "100%",
      textAlign: "center"
    }}>
      {text}
    </span>
  </button>
);

const Modal = ({ title, children, onClose, wide }) => (
  <div style={modalOverlay} onClick={onClose}>
    <div style={{ ...modalBox, maxWidth: wide ? "900px" : "450px" }} onClick={e => e.stopPropagation()} className="premium-card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "var(--text-main)" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}><FaTimes size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

const QuickAction = ({ icon, text, onClick }) => (
  <button className="native-btn premium-card">
    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#eef8f1", display: "flex", justifyContent: "center", alignItems: "center" }}>{icon}</div>
    <span>{text}</span>
  </button>
);

const Input = ({ placeholder, value, onChange, type = "text" }) => (
  <input className="native-input" style={inputStyle} type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} />
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
const headerTitle = { margin: 0, fontSize: "16px", letterSpacing: "1px", color: "var(--text-main)" };
const menuBtn = { background: "none", border: "none", fontSize: "20px", color: "#0b8f3a" };
const bellBtn = { background: "var(--bg-main)", border: "none", width: "40px", height: "40px", borderRadius: "10px", fontSize: "18px", color: "var(--text-muted)", position: "relative", cursor: "pointer" };
const badge = { position: "absolute", top: "-5px", right: "-5px", background: "#dc3545", color: "#fff", fontSize: "9px", padding: "2px 5px", borderRadius: "50%" };
const logoutHeaderBtn = { background: "#fff5f5", border: "none", width: "40px", height: "40px", borderRadius: "10px", fontSize: "18px", color: "#dc3545", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", transition: "0.3s" };

const content = { padding: "30px", paddingBottom: "100px" };
const statGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { padding: "20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" };
const statIcon = { width: "45px", height: "45px", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };
const statVal = { fontSize: "22px", fontWeight: "bold" };

const mainGrid = { display: "flex", gap: "25px", flexWrap: "wrap" };
const box = { background: "var(--card-bg)", padding: "25px", borderRadius: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", marginBottom: "25px", width: "100%", overflowX: "auto" };
const boxTitle = { fontSize: "16px", margin: "0 0 20px 0", color: "var(--text-main)", fontWeight: "bold" };
const listRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "1px solid var(--glass-border)" };
const rowTitle = { fontWeight: "bold", fontSize: "14px", color: "var(--text-main)" };
const muted = { color: "#999", fontSize: "12px" };

const btnStack = { display: "flex", flexDirection: "column", gap: "12px" };
const actionBtn = { border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-main)", padding: "15px", borderRadius: "15px", textAlign: "left", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", gap: "15px", alignItems: "center" };
const addBtn = { background: "#0b8f3a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" };
const assignBtn = { background: "#0b8f3a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", cursor: "pointer", marginTop: "10px" };
const smBtn = { border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--primary)", padding: "8px", borderRadius: "10px", cursor: "pointer" };
const smDelBtn = { background: "#fff5f5", color: "#dc3545", padding: "8px", border: "none", borderRadius: "10px", cursor: "pointer" };
const saveBtnBig = { background: "#0b8f3a", color: "#fff", border: "none", width: "100%", padding: "15px", borderRadius: "15px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", marginTop: "15px", boxShadow: "0 10px 20px rgba(11, 143, 58, 0.2)" };

const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" };
const modalBox = { background: "var(--card-bg)", padding: "25px 25px 35px 25px", borderRadius: "30px", width: "100%", maxWidth: "450px", maxHeight: "90vh", overflowY: "auto" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "var(--bg-main)", color: "var(--text-main)", marginBottom: "15px", boxSizing: "border-box", outline: "none", fontSize: "14px", transition: "0.3s" };

const adGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" };
const adCard = { border: "1px solid var(--glass-border)", borderRadius: "20px", overflow: "hidden", background: "var(--card-bg)" };
const adImg = { width: "100%", height: "120px", objectFit: "cover" };

const notifPanel = { position: "absolute", top: "50px", right: 0, width: "260px", background: "var(--card-bg)", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", borderRadius: "20px", padding: "20px", zIndex: 1000, border: "1px solid var(--glass-border)" };
const notifRow = { padding: "10px 0", borderBottom: "1px solid #f8f9fc", fontSize: "12px", color: "var(--text-muted)" };

const loaderStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-main)" };
const mobileSidebar = { 
  width: "280px", 
  height: "100%", 
  background: "linear-gradient(180deg, #0b8f3a 0%, #086b2b 100%)", 
  padding: "30px 20px", 
  color: "#fff", 
  overflowY: "auto",
  boxShadow: "10px 0 30px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column"
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

const numberToWords = (num) => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Lakh", "Crore"];

  const convertChunk = (n) => {
    let s = "";
    if (n >= 100) {
      s += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      s += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      s += ones[n] + " ";
    }
    return s.trim();
  };

  let words = "";
  let scaleIndex = 0;

  // Handle zero/null/undefined
  if (!num) return "Zero";
  
  let integerPart = Math.floor(num);
  
  if (integerPart >= 10000000) { // Crore
    words += convertChunk(Math.floor(integerPart / 10000000)) + " Crore ";
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) { // Lakh
    words += convertChunk(Math.floor(integerPart / 100000)) + " Lakh ";
    integerPart %= 100000;
  }
  if (integerPart >= 1000) { // Thousand
    words += convertChunk(Math.floor(integerPart / 1000)) + " Thousand ";
    integerPart %= 1000;
  }
  words += convertChunk(integerPart);

  return words.trim();
};


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

export default FranchiseDashboard;
