import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaTruck, FaClock, FaCheckCircle, FaRupeeSign,
  FaSignOutAlt, FaTrash, FaPlus, FaKey, FaBell, FaInfoCircle,
  FaAd, FaTag, FaTools, FaStar, FaUserPlus, FaBars, FaTimes, FaCog,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaRecycle, FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaChartLine,
  FaFileInvoice, FaBuilding, FaIdCard, FaCar, FaUserCheck, FaMap, FaTicketAlt, FaPercent, FaShareAlt, FaRss, FaClipboardList, FaMoneyCheckAlt
} from "react-icons/fa";
import API from "../services/api";
import Toast from "../components/Toast";
import { eraseCookie } from "../utils/cookies";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  } catch (e) {
    console.error("Audio Context play failed:", e);
  }
};

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
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
        const resP = await API.get("/admin/pickups");
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
      const user = JSON.parse(localStorage.getItem("user"));
      const [resStats, resPickups, resCollectors, resItems, resCityRates] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/pickups"),
        API.get("/admin/collectors"),
        API.get("/scrap-items"),
        API.get(`/admin/get-city-rates?city=${user.assignedCity}`)
      ]);

      if (resStats.data.success) setStats(resStats.data.stats);
      if (resPickups.data.success) setPickups(resPickups.data.pickups);
      if (resCollectors.data.success) setCollectors(resCollectors.data.collectors);

      // Merge global items with city-specific rates
      if (resItems.data.success) {
        const globalItems = resItems.data.data;
        const cityRates = resCityRates.data.rates || [];
        const merged = globalItems.map(gi => {
          const cityRate = cityRates.find(cr => cr.scrapItem?._id === gi._id);
          return cityRate ? { ...gi, price: cityRate.price } : gi;
        });
        setItems(merged);
      }

      fetchSettings();
      fetchReviews();
      fetchWalletStats();
      fetchAccountingData(); // New: Fetch accounting for overview
    } catch (error) {
      showToast("error", "Failed to load data.");
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
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      let ep = type === "rate" ? `/admin/scrap-items/${id}` : type === "ad" ? `/ads/${id}` : `/admin/${type}s/${id}`;
      await API.delete(ep);
      showToast("success", "Deleted"); fetchAdminData();
    } catch (e) { showToast("error", "Failed"); }
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

  const logout = () => { 
    localStorage.clear(); 
    eraseCookie("token");
    eraseCookie("user");
    eraseCookie("role");
    navigate("/franchise-login"); 
  };

  if (loading) return <div style={loaderStyle}><div className="spinner"></div></div>;

  const NavContent = () => (
    <>
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
    </>
  );

  return (
    <div style={container}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .sidebar-item:hover { background: rgba(255,255,255,0.1); transform: translateX(5px); }
        .premium-card { transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }
        .spinner { width: 40px; height: 40px; border: 4px solid #eef8f1; border-top: 4px solid #0b8f3a; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { .desktop-only { display: none !important; } }
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
      <div style={main}>
        <header style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button style={menuBtn} className="mobile-only" onClick={() => setIsMobileMenuOpen(true)}><FaBars /></button>
            <h2 style={headerTitle}>{activeTab.toUpperCase()}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ position: "relative", display: "flex", gap: "10px" }}>
              <button style={bellBtn} onClick={() => { setShowNotifPanel(!showNotifPanel); if (!showNotifPanel) markAllNotificationsRead(); }}>
                <FaBell /> {notifications.filter(n => !n.isRead).length > 0 && <span style={badge}>{notifications.filter(n => !n.isRead).length}</span>}
              </button>
              <button style={logoutHeaderBtn} onClick={logout} title="Logout">
                <FaSignOutAlt />
              </button>
              {showNotifPanel && (
                <div style={notifPanel}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>Alerts</h4>
                  {notifications.slice(0, 5).map(n => (
                    <div key={n._id} style={notifRow}><strong>{n.title}</strong><br />{n.message}</div>
                  ))}
                  {notifications.length === 0 && <p style={muted}>No new alerts</p>}
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={content} className="mobile-pad-bottom">
          {activeTab !== "overview" && activeTab !== "reports" && activeTab !== "support-chat" && (
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <input
                type="text"
                placeholder={`🔍 Search in ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                  fontSize: "14px",
                  background: "#fff",
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

          {activeTab === "overview" && (
            <>
              <div style={statGrid}>
                <StatCard icon={<FaTruck />} title="Local Pickups" value={stats.totalPickups} grad="linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)" />
                <StatCard icon={<FaChartLine />} title="Sales Amount" value={`₹${accountingStats.totalSaleAmount}`} grad="linear-gradient(135deg, #e67e22 0%, #d35400 100%)" />
                <StatCard icon={<FaRupeeSign />} title="Net Profit" value={`₹${accountingStats.overallProfit}`} grad="linear-gradient(135deg, #0b8f3a 0%, #000 100%)" />
                <StatCard icon={<FaWallet />} title="Wallet Balance" value={`₹${walletStats.totalAvailable}`} grad="linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)" />
              </div>
              <div style={mainGrid} className="responsive-flex">
                <div style={{ ...box, flex: 2 }} className="premium-card">
                  <h3 style={boxTitle}>Recent Pickup Requests</h3>
                  {filteredPickups.slice(0, 5).map(p => (
                    <div key={p._id} style={listRow}>
                      <span>{p.scrapType} • <span style={{ color: "#666" }}>{p.name}</span></span>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                  {pickups.length === 0 && <p style={muted}>No requests yet.</p>}
                </div>
                <div style={{ ...box, flex: 1 }} className="premium-card">
                  <h3 style={boxTitle}>Power Actions</h3>
                  <div style={btnStack}>
                    <QuickAction icon={<FaPlus />} text="New Collector" onClick={() => setShowCollectorModal(true)} />
                    <QuickAction icon={<FaTag />} text="Scrap Rates" onClick={() => setActiveTab("rates")} />
                    <QuickAction icon={<FaChartLine />} text="Accounting" onClick={() => { setActiveTab("accounting"); fetchAccountingData(); }} />
                    <QuickAction icon={<FaCog />} text="City Settings" onClick={() => { setActiveTab("dist-settings"); fetchDistSettings(); }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "pickups" && (
            <div style={box} className="premium-card">
              <h3 style={boxTitle}>Pickup History</h3>
              <div style={tableContainer}>
                {filteredPickups.map(p => (
                  <div key={p._id} style={listRow}>
                    <div style={{ flex: 1 }}>
                      <div style={rowTitle}>{p.scrapType}</div>
                      <small style={muted}>{p.name} • {p.mobile} <br /> {p.address}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <StatusBadge status={p.status} />
                      {["Pending", "Rejected"].includes(p.status) && <button style={assignBtn} onClick={() => { setSelectedPickup(p); setShowAssignModal(true); }}>Assign Now</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div style={box} className="premium-card">
              <h3 style={boxTitle}>Global Platform Settings</h3>
              <div style={settingsGrid}>
                <div style={settingsSection}>
                  <label style={labelStyle}><FaRupeeSign /> Min Order Value</label>
                  <Input type="number" value={settings.minAmount} onChange={v => setSettings({ ...settings, minAmount: v })} />

                  <label style={labelStyle}><FaEnvelope /> Business Email</label>
                  <Input value={settings.contactEmail} onChange={v => setSettings({ ...settings, contactEmail: v })} />

                  <label style={labelStyle}><FaPhone /> Business Phone</label>
                  <Input value={settings.contactPhone} onChange={v => setSettings({ ...settings, contactPhone: v })} />
                </div>
                <div style={settingsSection}>
                  <label style={labelStyle}><FaMapMarkerAlt /> Office Address</label>
                  <Input value={settings.officeAddress} onChange={v => setSettings({ ...settings, officeAddress: v })} />

                  <label style={labelStyle}><FaFacebook /> Facebook URL</label>
                  <Input value={settings.facebookUrl} onChange={v => setSettings({ ...settings, facebookUrl: v })} />

                  <label style={labelStyle}><FaInstagram /> Instagram URL</label>
                  <Input value={settings.instagramUrl} onChange={v => setSettings({ ...settings, instagramUrl: v })} />
                </div>
              </div>
              <button style={saveBtnBig} onClick={handleUpdateSettings}>Save All Configurations</button>
            </div>
          )}

          {/* OTHER TABS (Users, Collectors, Rates, Ads, Reviews) with same premium-card style... */}
          {activeTab === "rates" && (
            <div style={box} className="premium-card">
              <div style={titleBar}><h3>SCRAP RATES</h3> <button style={addBtn} onClick={() => setShowItemModal(true)}><FaPlus /></button></div>
              {filteredItems.map(it => (
                <div key={it._id} style={listRow}>
                  <span>{it.name} <br /><small style={muted}>{it.category}</small></span>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <strong style={{ color: "#0b8f3a" }}>₹{it.price}/{it.unit}</strong>
                    <button style={smBtn} onClick={() => { setEditingRate(it); setShowEditRateModal(true); }}><FaTools size={12} /></button>
                    <button style={smDelBtn} onClick={() => handleDeleteItem(it._id, "rate")}><FaTrash size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "collectors" && (
            <div style={box} className="premium-card">
              <div style={titleBar}>
                <h3>COLLECTORS</h3>
                <button style={addBtn} onClick={() => setShowCollectorModal(true)}><FaPlus /></button>
              </div>
              <div style={tableContainer}>
                {filteredCollectors.map(u => (
                  <div key={u._id} style={listRow}>
                    <span>{u.name} <br /><small style={muted}>{u.mobile} {u.area && `• ${u.area}`} {u.walletBalance !== undefined && `• Wallet: ₹${u.walletBalance}`}</small></span>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button style={smBtn} onClick={() => { setWalletForm({ userId: u._id, amount: "", type: "credit", description: "Franchise Transfer" }); setShowWalletModal(true); }}>Transfer</button>
                      <button style={smBtn} onClick={() => { setResetData({ userId: u._id, name: u.name, newPassword: "" }); setShowResetModal(true); }}><FaKey /></button>
                      <button style={smDelBtn} onClick={() => handleDeleteItem(u._id, "collector")}><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ads" && (
            <div style={box} className="premium-card">
              <div style={titleBar}><h3>MANAGED BANNERS</h3> <button style={addBtn} onClick={() => setShowAdModal(true)}><FaPlus /></button></div>
              <div style={adGrid}>
                {ads.map(ad => (
                  <div key={ad._id} style={adCard} className="premium-card">
                    <img src={ad.imageUrl} style={adImg} alt="" />
                    <div style={{ padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>{ad.title}</span>
                      <button style={smDelBtn} onClick={() => handleDeleteItem(ad._id, "ad")}><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={box} className="premium-card">
              <h3>PLATFORM REVIEWS</h3>
              {reviews.map(r => (
                <div key={r._id} style={listRow}>
                  <div>
                    <div style={{ color: "#f39c12", marginBottom: "5px" }}>{[...Array(r.rating)].map((_, i) => <FaStar key={i} size={12} />)}</div>
                    <div style={{ fontSize: "14px", marginBottom: "5px" }}>
                      <strong>{r.user?.name}</strong> <span style={{ color: "#999", fontSize: "12px" }}>reviewed</span> <strong>{r.collector?.name || "Unknown"}</strong>
                    </div>
                    <span style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>"{r.comment}"</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <small style={muted}>{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "wallet" && (
            <div style={box} className="premium-card">
              <div style={titleBar}>
                <h3>WALLET & TRANSACTIONS</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{ ...addBtn, background: "#4f46e5", marginRight: "10px" }} onClick={() => setShowFranchiseDepositModal(true)}><FaPlus /> Add Funds</button>
                  <button style={addBtn} onClick={() => setShowWalletModal(true)}><FaPlus /> Manual Adjust</button>
                </div>
              </div>

              <div style={statGrid}>
                <div style={{ ...miniStat, background: "#eef8f1" }}>
                  <small>Available Wallet Balance</small>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0b8f3a" }}>₹{walletStats.totalAvailable}</div>
                </div>
                <div style={{ ...miniStat, background: "#fff9e6" }}>
                  <small>Pending Wallet Balance</small>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f39c12" }}>₹{walletStats.totalPending}</div>
                </div>
                <div style={{ ...miniStat, background: "#eef2ff" }}>
                  <small>Total Users</small>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#4f46e5" }}>{walletStats.userCount}</div>
                </div>
              </div>

              <div style={tableContainer}>
                {filteredTransactions.map(tx => (
                  <div key={tx._id} style={listRow}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      <div style={{ ...txIcon, background: tx.status === "paid_in_cash" ? "#fff9e6" : (tx.type === "credit" ? "#eef8f1" : "#fff5f5") }}>
                        {tx.status === "paid_in_cash" ? <FaRupeeSign color="#f39c12" /> : (tx.type === "credit" ? <FaArrowUp color="#0b8f3a" /> : <FaArrowDown color="#dc3545" />)}
                      </div>
                      <div>
                        <div style={rowTitle}>{tx.description}</div>
                        <small style={muted}>{tx.user?.name} ({tx.user?.mobile}) • {new Date(tx.createdAt).toLocaleString()}</small>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: tx.status === "paid_in_cash" ? "#666" : (tx.type === "credit" ? "#0b8f3a" : "#dc3545") }}>
                        {tx.status === "paid_in_cash" ? "" : " "}{tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                      </div>
                      <small style={{ ...statusBadge, background: tx.status === "completed" ? "#eef8f1" : tx.status === "paid_in_cash" ? "#fff9e6" : "#fff5f5", color: tx.status === "completed" ? "#0b8f3a" : tx.status === "paid_in_cash" ? "#f39c12" : "#dc3545" }}>
                        {(tx.status || "").replace(/_/g, " ")}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "accounting" && (
            <div style={box} className="premium-card no-print">
              <div style={{ ...titleBar, flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{margin: 0}}>BILLING & ACCOUNTING</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{...addBtn, padding: "6px 12px", fontSize: "12px"}} onClick={() => setShowPurchaseModal(true)}>
                    <FaPlus /> <span className="desktop-only">Record </span>Purchase
                  </button>
                  <button style={{...addBtn, padding: "6px 12px", fontSize: "12px"}} onClick={() => setShowSaleModal(true)}>
                    <FaPlus /> <span className="desktop-only">Create Sale </span>Invoice
                  </button>
                </div>
              </div>

              <div style={statGrid}>
                <div style={{ ...miniStat, background: accountingStats.overallProfit >= 0 ? "#eef8f1" : "#fff5f5", border: accountingStats.overallProfit >= 0 ? "1px solid #c3e6cb" : "1px solid #f5c6cb" }}>
                  <small style={{ color: accountingStats.overallProfit >= 0 ? "#0b8f3a" : "#dc3545", fontWeight: "600" }}>📈 NET PROFIT / LOSS</small>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: accountingStats.overallProfit >= 0 ? "#155724" : "#721c24", marginTop: "5px" }}>
                    {accountingStats.overallProfit >= 0 ? "+" : "-"}₹{Math.abs(accountingStats.overallProfit).toFixed(2)}
                  </div>
                  <small style={{ color: "#666", fontSize: "10px" }}>Total Sales - Total Purchases</small>
                </div>
                <div style={{ ...miniStat, background: "#e8f4f8", border: "1px solid #bee5eb" }}>
                  <small style={{ color: "#0c5460", fontWeight: "600" }}>💰 CURRENT STOCK VALUE</small>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#0c5460", marginTop: "5px" }}>₹{accountingStats.stockValue?.toFixed(2) || 0}</div>
                  <small style={{ color: "#666", fontSize: "10px" }}>Investment sitting in warehouse</small>
                </div>
                <div style={{ ...miniStat, background: "#f8f9fa", border: "1px solid #dee2e6" }}>
                  <small style={{ color: "#333", fontWeight: "600" }}>🛒 TOTAL PURCHASES</small>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#222", marginTop: "5px" }}>₹{accountingStats.totalPurchaseAmount?.toFixed(2)}</div>
                  <small style={{ color: "#666", fontSize: "10px" }}>Total cash spent on buying</small>
                </div>
                <div style={{ ...miniStat, background: "#eef2ff", border: "1px solid #d1dbff" }}>
                  <small style={{ color: "#4f46e5", fontWeight: "600" }}>💵 TOTAL SALES</small>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#1e1b4b", marginTop: "5px" }}>₹{accountingStats.totalSaleAmount?.toFixed(2)}</div>
                  <small style={{ color: "#666", fontSize: "10px" }}>Total revenue generated</small>
                </div>
              </div>


              <h4 style={{ marginTop: "30px" }}>Live Inventory</h4>
              <div style={{ ...tableContainer, maxHeight: "250px", marginBottom: "30px" }}>
                {filteredInventory.map(inv => (
                  <div key={inv._id} style={listRow}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      <img src={inv.scrapItem?.image || "https://via.placeholder.com/40"} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} alt="" />
                      <div>
                        <div style={rowTitle}>{inv.scrapItem?.name} <span style={muted}>({inv.scrapItem?.category})</span></div>
                        <small style={muted}>Bought: {inv.totalBoughtQuantity} {inv.scrapItem?.unit} | Sold: {inv.totalSoldQuantity} {inv.scrapItem?.unit}</small>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: inv.quantityAvailable > 0 ? "#0b8f3a" : "#dc3545" }}>
                        {inv.quantityAvailable} {inv.scrapItem?.unit}
                      </div>
                      <small style={muted}>Available in Stock</small>
                    </div>
                  </div>
                ))}
                {inventory.length === 0 && <p style={muted}>No inventory data yet.</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <h4>Recent Purchases</h4>
                  <div style={tableContainer}>
                    {filteredPurchases.map(p => (
                      <div key={p._id} style={{...listRow, cursor: "pointer"}} onClick={() => openPurchaseBillModal(p)}>
                        <div>
                          <div style={rowTitle}>{p.supplierName} <span style={muted}>({p.supplierContact})</span></div>
                          <small style={muted}>{new Date(p.createdAt).toLocaleDateString()} | Items: {p.items.length} | <span style={{color: "#0b8f3a", fontWeight: "bold"}}>📄 View Bill</span></small>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: "bold", color: "#dc3545" }}>-₹{p.totalAmount}</div>
                          <small style={{ ...statusBadge, background: p.paymentStatus === "Paid" ? "#eef8f1" : "#fff9e6", color: p.paymentStatus === "Paid" ? "#0b8f3a" : "#f39c12" }}>{p.paymentStatus}</small>
                        </div>
                      </div>
                    ))}
                    {purchases.length === 0 && <p style={muted}>No manual purchases yet.</p>}
                  </div>
                </div>

                <div>
                  <h4>Sales & Invoices</h4>
                  <div style={tableContainer}>
                    {filteredSales.map(sale => (
                      <div key={sale._id} style={listRow}>
                        <div>
                          <div style={rowTitle}>{sale.buyerName} <span style={muted}>({sale.buyerContact})</span></div>
                          <small style={muted}>{new Date(sale.createdAt).toLocaleDateString()} | {sale.invoiceNumber || "INV"}</small>
                        </div>
                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                          <div style={{ fontWeight: "bold", color: "#0b8f3a" }}>+₹{sale.totalAmount}</div>
                          <button style={{ ...smBtn, fontSize: "10px", padding: "4px 8px" }} onClick={() => { setSelectedInvoice(sale); setShowInvoiceModal(true); }}>View Invoice</button>
                        </div>
                      </div>
                    ))}
                    {sales.length === 0 && <p style={muted}>No sales recorded yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div style={box} className="premium-card">
              <div style={titleBar}>
                <h3 style={{margin: 0}}>LIVE INVENTORY</h3>
                <div style={{ ...miniStat, background: "#e8f4f8", border: "1px solid #bee5eb", maxWidth: "250px", display: "inline-block", padding: "10px 15px", borderRadius: "12px" }}>
                  <small style={{ color: "#0c5460", fontWeight: "600", fontSize: "11px" }}>💰 STOCK VALUE</small>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#0c5460", marginTop: "3px" }}>₹{accountingStats.stockValue?.toFixed(2) || 0}</div>
                </div>
              </div>
              <div style={tableContainer}>
                {inventory.map(inv => (
                  <div key={inv._id} style={listRow}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      <img src={inv.scrapItem?.image || "https://via.placeholder.com/40"} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} alt="" />
                      <div>
                        <div style={rowTitle}>{inv.scrapItem?.name} <span style={muted}>({inv.scrapItem?.category})</span></div>
                        <small style={muted}>Bought: {inv.totalBoughtQuantity} {inv.scrapItem?.unit} | Sold: {inv.totalSoldQuantity} {inv.scrapItem?.unit}</small>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: inv.quantityAvailable > 0 ? "#0b8f3a" : "#dc3545" }}>
                        {inv.quantityAvailable} {inv.scrapItem?.unit}
                      </div>
                      <small style={muted}>Available in Stock</small>
                    </div>
                  </div>
                ))}
                {inventory.length === 0 && <p style={muted}>No inventory data yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div style={box} className="premium-card">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", flexWrap:"wrap", gap:"10px"}}>
                <h3 style={{margin:0}}>📊 Reports & Analytics</h3>
                <button style={{...addBtn, background:"#16a34a", display:"flex", alignItems:"center", gap:"6px"}} onClick={downloadCSV}>
                  ⬇️ Download CSV
                </button>
              </div>

              {/* Report Type Tabs */}
              <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"20px"}}>
                {[
                  {key:"purchases", label:"🧾 Purchases & Inventory"},
                  {key:"summary", label:"📈 Summary"},
                  {key:"collectors", label:"👷 Collectors"},
                  {key:"suppliers", label:"🏪 Suppliers"},
                  {key:"buyers", label:"🛒 Buyers"}
                ].map(t => (
                  <button key={t.key}
                    style={{padding:"8px 16px", borderRadius:"20px", border:"none", cursor:"pointer", fontWeight:"bold", fontSize:"13px",
                      background: reportType===t.key ? "#0b8f3a" : "#f0f0f0",
                      color: reportType===t.key ? "#fff" : "#333"}}
                    onClick={() => { setReportType(t.key); setReportData([]); setReportInventory([]); }}
                  >{t.label}</button>
                ))}
              </div>

              {/* Filters Row */}
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px", marginBottom:"15px", background:"#f8fffe", padding:"15px", borderRadius:"15px", border:"1px solid #bbf7d0"}}>
                <div>
                  <label style={{fontSize:"11px", fontWeight:"bold", color:"#666", display:"block", marginBottom:"4px"}}>📅 From Date</label>
                  <input type="date" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportFrom} onChange={e => setReportFrom(e.target.value)} />
                </div>
                <div>
                  <label style={{fontSize:"11px", fontWeight:"bold", color:"#666", display:"block", marginBottom:"4px"}}>📅 To Date</label>
                  <input type="date" style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportTo} onChange={e => setReportTo(e.target.value)} />
                </div>
                {reportType === "summary" && (
                  <div>
                    <label style={{fontSize:"11px", fontWeight:"bold", color:"#666", display:"block", marginBottom:"4px"}}>📊 Group By</label>
                    <select style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportGroupBy} onChange={e => setReportGroupBy(e.target.value)}>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
                {reportType === "collectors" && (
                  <div>
                    <label style={{fontSize:"11px", fontWeight:"bold", color:"#666", display:"block", marginBottom:"4px"}}>👷 Collector</label>
                    <select style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportCollectorId} onChange={e => setReportCollectorId(e.target.value)}>
                      <option value="">All Collectors</option>
                      {collectors.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {reportType === "suppliers" && (
                  <div>
                    <label style={{fontSize:"11px", fontWeight:"bold", color:"#666", display:"block", marginBottom:"4px"}}>🏪 Supplier Name</label>
                    <input type="text" placeholder="Search supplier..." style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportSupplierName} onChange={e => setReportSupplierName(e.target.value)} />
                  </div>
                )}
                {reportType === "buyers" && (
                  <div>
                    <label style={{fontSize:"11px", fontWeight:"bold", color:"#666", display:"block", marginBottom:"4px"}}>🛒 Buyer Name</label>
                    <input type="text" placeholder="Search buyer..." style={{...inputStyle, marginBottom:0, fontSize:"13px"}} value={reportBuyerName} onChange={e => setReportBuyerName(e.target.value)} />
                  </div>
                )}
                <div style={{display:"flex", alignItems:"flex-end"}}>
                  <button style={{...saveBtnBig, marginTop:0, padding:"12px"}} onClick={fetchReport} disabled={reportLoading}>
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
                          <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "5px" }}>₹{reportGrandTotal.toFixed(2)}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: "200px", background: "linear-gradient(135deg, #333, #555)", color: "#fff", padding: "20px", borderRadius: "15px", textAlign: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                          <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "bold" }}>Total Purchase Transactions</div>
                          <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "5px" }}>{reportData.length} Bills</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                        {/* Item Wise Inventory Breakdown */}
                        <div style={{ flex: 1, minWidth: "300px", background: "#f8fafc", padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0" }}>
                          <h4 style={{ margin: "0 0 12px 0", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>📦 Received Inventory (Item Wise)</h4>
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
                                    <td style={{ padding: "8px 4px", fontWeight: "600", color: "#1e293b" }}>{item.name}</td>
                                    <td style={{ padding: "8px 4px", textAlign: "center", fontWeight: "bold", color: "#0b8f3a" }}>{item.quantity} {item.unit}</td>
                                    <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: "600" }}>₹{item.amount.toFixed(0)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Bills List */}
                        <div style={{ flex: 1, minWidth: "300px", background: "#f8fafc", padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0" }}>
                          <h4 style={{ margin: "0 0 12px 0", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>🧾 Purchase Bills List</h4>
                          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            {reportData.map((p, idx) => (
                              <div key={idx} style={{ padding: "10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                                <div>
                                  <div style={{ fontWeight: "bold", color: "#1e293b" }}>{p.supplierName}</div>
                                  <div style={{ color: "#64748b", marginTop: "2px" }}>Bill No: #{p.billNo} | {p.date}</div>
                                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>{p.itemsCount} items • {p.paymentMethod}</div>
                                </div>
                                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                  <div style={{ fontWeight: "bold", color: "#dc3545", fontSize: "14px" }}>₹{p.totalAmount.toFixed(0)}</div>
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
                        <tr style={{background:"#0b8f3a", color:"#fff"}}>
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
                          <div style={{fontSize:"12px", color:"#666"}}>📞 {col.collectorMobile}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"20px", fontWeight:"bold", color:"#0b8f3a"}}>{col.totalPickups} Pickups</div>
                          <div style={{fontSize:"13px", color:"#dc3545"}}>Earned: ₹{col.totalEarnings}</div>
                          <div style={{fontSize:"12px", color:"#666"}}>Scrap: ₹{col.totalScrapValue}</div>
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
                              <div style={{fontSize:"12px", color:"#666"}}>📞 {s.supplierContact}</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:"18px", fontWeight:"bold", color:"#dc3545"}}>₹{s.totalAmount}</div>
                              <div style={{fontSize:"12px", color:"#666"}}>{s.totalPurchases} purchases | {s.totalItems} items</div>
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
                              <div style={{fontSize:"12px", color:"#666"}}>📞 {b.buyerContact} {b.buyerGSTIN && `• GSTIN: ${b.buyerGSTIN}`}</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:"18px", fontWeight:"bold", color:"#0b8f3a"}}>₹{b.totalAmount}</div>
                              <div style={{fontSize:"12px", color:"#666"}}>{b.totalSales} sales</div>
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
            <div style={box} className="premium-card">
              <div style={titleBar}>
                <h3>SUPPORT TICKETS</h3>
                <button style={addBtn} onClick={() => setShowTicketModal(true)}><FaPlus /> Raise Ticket</button>
              </div>
              <div style={tableContainer}>
                {filteredTickets.map(t => (
                  <div key={t._id} style={listRow}>
                    <div>
                      <div style={rowTitle}>{t.subject}</div>
                      <small style={muted}>Category: {t.category} • {new Date(t.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && <p style={muted}>No support tickets raised.</p>}
              </div>
            </div>
          )}

          {activeTab === "dist-settings" && (
            <div style={box} className="premium-card">
              <h3>DISTRICT CONFIGURATIONS</h3>
              <div style={settingsGrid}>
                <div style={settingsSection}>
                  <label style={labelStyle}>Service Radius (km)</label>
                  <Input type="number" value={distSettings.serviceRadius} onChange={v => setDistSettings({ ...distSettings, serviceRadius: v })} />

                  <label style={labelStyle}>Working Hours</label>
                  <Input value={distSettings.workingHours} onChange={v => setDistSettings({ ...distSettings, workingHours: v })} />
                </div>
                <div style={settingsSection}>
                  <label style={labelStyle}>Off Day</label>
                  <Input value={distSettings.offDay} onChange={v => setDistSettings({ ...distSettings, offDay: v })} />
                </div>
              </div>
              <button style={saveBtnBig} onClick={async () => {
                try {
                  const { data } = await API.post("/district-settings", distSettings);
                  if (data.success) showToast("success", "District Settings Updated!");
                } catch (e) { showToast("error", "Failed to save settings"); }
              }}>Save District Settings</button>
            </div>
          )}
        </div>
      </div>

      {/* MODALS (Enhanced styling) */}
      {showItemModal && (
        <Modal title="Add New Rate" onClose={() => setShowItemModal(false)}>
          <Input placeholder="Item Name" value={newItem.name} onChange={v => setNewItem({ ...newItem, name: v })} />
          <Input placeholder="Price (₹)" type="number" value={newItem.price} onChange={v => setNewItem({ ...newItem, price: v })} />
          <select style={inputStyle} value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
            <option value="kg">kg</option><option value="Pcs">Pcs</option><option value="Unit">Unit</option>
          </select>
          <select style={inputStyle} value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
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
          <button style={saveBtnBig} onClick={handleCreateItem}>Add To System</button>
        </Modal>
      )}

      {showAdModal && (
        <Modal title="Upload Ad Banner" onClose={() => setShowAdModal(false)}>
          <Input placeholder="Title" value={newAd.title} onChange={v => setNewAd({ ...newAd, title: v })} />
          <Input placeholder="Target Link (optional)" value={newAd.link} onChange={v => setNewAd({ ...newAd, link: v })} />
          <div style={{ padding: "15px", border: "2px dashed #eee", borderRadius: "12px", textAlign: "center", marginBottom: "15px" }}>
            <input type="file" onChange={e => setAdFile(e.target.files[0])} />
          </div>
          <button style={saveBtnBig} onClick={handleCreateAd}>Publish Banner</button>
        </Modal>
      )}

      {showResetModal && (
        <Modal title={`Reset: ${resetData.name}`} onClose={() => setShowResetModal(false)}>
          <Input placeholder="New Secure Password" value={resetData.newPassword} onChange={v => setResetData({ ...resetData, newPassword: v })} />
          <button style={saveBtnBig} onClick={handleResetPassword}>Update Credentials</button>
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
          <button style={saveBtnBig} onClick={handleUpdateRate}>Save Changes</button>
        </Modal>
      )}

      {showTicketModal && (
        <Modal title="Raise Support Ticket" onClose={() => { setShowTicketModal(false); }}>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={newTicketForm?.category || "General"} onChange={e => setNewTicketForm({ ...newTicketForm, category: e.target.value })}>
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
          <button style={saveBtnBig} onClick={handleCreateTicket}>Submit Ticket to Admin</button>
        </Modal>
      )}

      {showUserModal && (
        <Modal title="Quick User Add" onClose={() => setShowUserModal(false)}>
          <Input placeholder="Full Name" value={newUser.name} onChange={v => setNewUser({ ...newUser, name: v })} />
          <Input placeholder="Mobile No" value={newUser.mobile} onChange={v => setNewUser({ ...newUser, mobile: v })} />
          <Input placeholder="Initial Password" value={newUser.password} onChange={v => setNewUser({ ...newUser, password: v })} />
          <button style={saveBtnBig} onClick={handleCreateUser}>Register User</button>
        </Modal>
      )}

      {showCollectorModal && (
        <Modal title="New Collector Hire" onClose={() => setShowCollectorModal(false)}>
          <Input placeholder="Full Name" value={newCollector.name} onChange={v => setNewCollector({ ...newCollector, name: v })} />
          <Input placeholder="Mobile No" value={newCollector.mobile} onChange={v => setNewCollector({ ...newCollector, mobile: v })} />
          <Input placeholder="Service Area" value={newCollector.area} onChange={v => setNewCollector({ ...newCollector, area: v })} />
          <Input placeholder="Initial Password" value={newCollector.password} onChange={v => setNewCollector({ ...newCollector, password: v })} />
          <button style={saveBtnBig} onClick={handleCreateCollector}>Register Collector</button>
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
              <div style={{background: "#eefbf3", padding: "14px", borderRadius: "12px", border: "1px solid #bbf7d0", color: "#0b8f3a", textAlign: "center"}}>
                <div style={{fontWeight: "bold", fontSize: "15px"}}>💵 Deposit Funds to Wallet</div>
                <div style={{fontSize: "12px", marginTop: "4px", color: "#047857"}}>Minimum Deposit Amount is <strong>₹1,000</strong></div>
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
                 
                 <div style={{background: "#fff", padding: "12px", borderRadius: "16px", display: "inline-block", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", border: "2px solid #0b8f3a"}}>
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
          <select style={inputStyle} value={walletForm.userId} onChange={e => setWalletForm({ ...walletForm, userId: e.target.value })}>
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
              <select style={inputStyle} value={walletForm.type} onChange={e => setWalletForm({ ...walletForm, type: e.target.value })}>
                <option value="credit">Credit (+)</option>
                <option value="debit">Debit (-)</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Description (Reason)</label>
          <Input placeholder="e.g. Refund for pickup #123" value={walletForm.description} onChange={v => setWalletForm({ ...walletForm, description: v })} />

          <button style={saveBtnBig} onClick={handleUpdateWallet}>Apply Adjustment</button>
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

            <button style={saveBtnBig} onClick={handleCreateSale}>Generate E-Invoice</button>
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
                  <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "bold", color: activeDraftId === draft.id ? "#0b8f3a" : "#555", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => switchDraft(draft.id)}>
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
                      <select style={inputStyle} value={draft.supplierId}
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
                      <input style={inputStyle} disabled value={draft.supplierContact} readOnly />
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
                      <div style={{ background: "#f8f9fa", padding: "8px 12px", fontSize: "11px", fontWeight: "bold", color: "#555", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "6px" }}>
                        <span>Item</span><span>Qty</span><span>Rate</span><span style={{ color: "#0b8f3a" }}>Amount</span><span></span>
                      </div>
                      {draft.items.map((it, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "6px", padding: "8px 12px", borderTop: "1px solid #f0f0f0", alignItems: "center", fontSize: "12px" }}>
                          <span style={{ fontWeight: "600", color: "#333" }}>{it.name}</span>
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
                      <select style={inputStyle} value={draft.paymentStatus} onChange={e => updateActiveDraft({ paymentStatus: e.target.value })}>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Method</label>
                      <select style={inputStyle} value={draft.paymentMethod} onChange={e => updateActiveDraft({ paymentMethod: e.target.value })}>
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

          <button style={{ ...saveBtnBig, marginTop: "15px", background: "linear-gradient(135deg,#0b8f3a,#16a34a)" }} onClick={handleCreatePurchase}>
            ✅ Complete — {getActiveDraft()?.supplierName || "This Draft"}
          </button>
        </Modal>
      )}

            {showPurchasePrintModal && lastCreatedPurchase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "420px", width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div className="no-print" style={{ background: "linear-gradient(135deg,#0b8f3a,#16a34a)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>🧾 Purchase Bill</span>
              <button onClick={() => setShowPurchasePrintModal(false)} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: "bold" }}>✕</button>
            </div>
            
            <div id="purchase-bill-print" style={{ padding: "20px", fontFamily: "monospace", fontSize: "12px", color: "#000", background: "#fff" }}>
              <style>{`@media print { body * { visibility: hidden; } #purchase-bill-print, #purchase-bill-print * { visibility: visible; } #purchase-bill-print { position: fixed; left: 0; top: 0; width: 80mm; padding: 5mm; } .no-print { display: none !important; } }`}</style>
              <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>⚡ SCRAPVEX</div>
                <div style={{ fontSize: "10px", color: "#555" }}>Purchase Receipt</div>
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
                    <span>{it.name}<br /><span style={{ fontSize: "10px", color: "#555" }}>{it.quantity} × ₹{it.rate}</span></span>
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
              <button onClick={() => window.print()} style={{ flex: 1, minWidth: "80px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#333", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && selectedInvoice && (
        <Modal title="GST Tax Invoice Preview" onClose={() => setShowInvoiceModal(false)} wide>
          <div className="no-print" style={{display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "15px", borderRadius: "15px", marginBottom: "20px"}}>
             <div style={{fontSize: "13px", color: "#666"}}>Professional A4 Portrait Layout Ready</div>
             <button style={{...saveBtnBig, marginTop: 0, width: "auto", background: "#4f46e5", padding: "10px 25px"}} onClick={() => window.print()}>
                <FaFileInvoice style={{marginRight: "10px"}}/> Print A4 Invoice
             </button>
          </div>

          <div id="invoice-print-area" style={{padding: "40px", background: "#fff", color: "#000", fontFamily: "'Inter', sans-serif", fontSize: "12px", border: "1px solid #eee", minHeight: "800px"}}>
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
                   <p style={{margin: "5px 0", color: "#444"}}>DILLI, SAINIK COLONY JAMMU<br/>GSTIN: 01AMSPG9859M1ZA<br/>Ph: 9070000032</p>
                </div>
             </div>

             <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "30px"}}>
                <div>
                   <strong style={{fontSize: "10px", color: "#888", textTransform: "uppercase"}}>Bill To:</strong>
                   <h3 style={{margin: "5px 0 0 0"}}>{selectedInvoice.buyerName}</h3>
                   <p style={{margin: "5px 0", color: "#444"}}>{selectedInvoice.buyerAddress}<br/>GSTIN: {selectedInvoice.buyerGSTIN || "Unregistered"}</p>
                </div>
                <div>
                   <strong style={{fontSize: "10px", color: "#888", textTransform: "uppercase"}}>Shipped To:</strong>
                   <h3 style={{margin: "5px 0 0 0"}}>{selectedInvoice.consigneeName || selectedInvoice.buyerName}</h3>
                   <p style={{margin: "5px 0", color: "#444"}}>{selectedInvoice.consigneeAddress || selectedInvoice.buyerAddress}</p>
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
                   <p style={{fontSize: "11px", color: "#666", marginBottom: "5px"}}>Amount in words:</p>
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
      
      {/* MOBILE BOTTOM NAV */}
      <div style={bottomNavStyle} className="mobile-only">
        <BottomLink icon={<FaInfoCircle size={20}/>} text="Home" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <BottomLink icon={<FaTruck size={20}/>} text="Pickups" active={activeTab === "pickups"} onClick={() => setActiveTab("pickups")} />
        <BottomLink icon={<FaChartLine size={20}/>} text="Accounting" active={activeTab === "accounting"} onClick={() => {setActiveTab("accounting"); fetchAccountingData();}} />
        <BottomLink icon={<FaClipboardList size={20}/>} text="Inventory" active={activeTab === "inventory"} onClick={() => {setActiveTab("inventory"); fetchAccountingData();}} />
        <BottomLink icon={<FaWallet size={20}/>} text="Wallet" active={activeTab === "wallet"} onClick={() => {setActiveTab("wallet"); fetchWalletStats(); fetchAllTransactions();}} />
        <BottomLink icon={<FaBars size={20}/>} text="Menu" active={false} onClick={() => setIsMobileMenuOpen(true)} />
      </div>

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
  <div style={{ ...bottomLinkStyle, color: active ? "#0b8f3a" : "#666" }} onClick={onClick}>
     {icon} <span style={{fontSize:"10px", marginTop:"2px"}}>{text}</span>
  </div>
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
  <button style={actionBtn} onClick={onClick} className="premium-card">
    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#eef8f1", display: "flex", justifyContent: "center", alignItems: "center" }}>{icon}</div>
    <span>{text}</span>
  </button>
);

const Input = ({ placeholder, value, onChange, type = "text", ...props }) => (
  <input type={type} style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} {...props} />
);

const StatusBadge = ({ status }) => {
  const colors = { Pending: "#f39c12", Assigned: "#007bff", Completed: "#28a745" };
  return <span style={{ background: colors[status] + "20", color: colors[status], padding: "4px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "bold" }}>{status}</span>;
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
const box = { background: "var(--card-bg)", padding: "25px", borderRadius: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", marginBottom: "25px", width: "100%" };
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
const notifRow = { padding: "10px 0", borderBottom: "1px solid #f8f9fc", fontSize: "12px", color: "#555" };

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
const labelStyle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "8px" };
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

export default FranchiseDashboard;
