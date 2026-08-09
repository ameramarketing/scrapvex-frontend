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

function FranchiseDashboard() {
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
        setLastCreatedPurchase({ ...draft, totalAmount, createdAt: new Date() });
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
                  {pickups.slice(0, 5).map(p => (
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
                {pickups.map(p => (
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
              {items.map(it => (
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
                {collectors.map(u => (
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
                {transactions.map(tx => (
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <h4>Recent Purchases</h4>
                  <div style={tableContainer}>
                    {purchases.map(p => (
                      <div key={p._id} style={listRow}>
                        <div>
                          <div style={rowTitle}>{p.supplierName} <span style={muted}>({p.supplierContact})</span></div>
                          <small style={muted}>{new Date(p.createdAt).toLocaleDateString()} | Items: {p.items.length}</small>
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
                    {sales.map(sale => (
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

          {activeTab === "support" && (
            <div style={box} className="premium-card">
              <div style={titleBar}>
                <h3>SUPPORT TICKETS</h3>
                <button style={addBtn} onClick={() => setShowTicketModal(true)}><FaPlus /> Raise Ticket</button>
              </div>
              <div style={tableContainer}>
                {tickets.map(t => (
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
            <option value="Paper">Paper</option><option value="Plastic">Plastic</option><option value="Metal">Metal</option><option value="Other">Other</option>
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
        <Modal title="Record Material Purchase" onClose={() => setShowPurchaseModal(false)}>
          <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "4px" }}>

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Select Collector (Supplier)</label>
                <select
                  style={inputStyle}
                  value={newPurchase.supplierId}
                  onChange={e => {
                    const collector = collectors.find(c => c._id === e.target.value);
                    setNewPurchase({
                      ...newPurchase,
                      supplierId: e.target.value,
                      supplierName: collector?.name || "",
                      supplierContact: collector?.mobile || ""
                    });
                  }}
                >
                  <option value="">Choose Collector</option>
                  {collectors.map(c => <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Contact</label>
                <Input disabled placeholder="Contact" value={newPurchase.supplierContact} />
              </div>
            </div>

            <div style={{ border: "1px solid #eee", padding: "15px", borderRadius: "12px", marginBottom: "15px", background: "#f8f9fa" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Add Items</h4>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                <select style={{ ...inputStyle, marginBottom: 0 }} value={purchaseItemInput.scrapItem} onChange={e => setPurchaseItemInput({ ...purchaseItemInput, scrapItem: e.target.value })}>
                  <option value="">Select Item</option>
                  {items.map(i => (
                    <option key={i._id} value={i._id}>{i.name}</option>
                  ))}
                </select>
                <Input type="number" placeholder="Qty" value={purchaseItemInput.quantity} onChange={v => setPurchaseItemInput({ ...purchaseItemInput, quantity: v })} />
                <Input type="number" placeholder="Rate/Unit" value={purchaseItemInput.rate} onChange={v => setPurchaseItemInput({ ...purchaseItemInput, rate: v })} />
              </div>
              <button style={{ ...assignBtn, width: "100%", marginTop: "10px" }} onClick={handleAddPurchaseItem}>Add Item</button>
            </div>

            {newPurchase.items.length > 0 && (
              <div style={{ maxHeight: "120px", overflowY: "auto", marginBottom: "15px" }}>
                {newPurchase.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: "600" }}>{it.name}</span><br />
                      <span style={{ color: "#666" }}>{it.quantity} x ₹{it.rate}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong style={{ color: "#0b8f3a" }}>₹{it.amount}</strong>
                      <button style={{ border: "none", background: "none", color: "#e74c3c", cursor: "pointer", padding: "5px" }} onClick={() => handleRemovePurchaseItem(idx)}>
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: "right", marginTop: "10px", fontWeight: "bold", color: "var(--text-main)" }}>
                  Total: ₹{newPurchase.items.reduce((a, b) => a + b.amount, 0).toFixed(2)}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Payment Status</label>
                <select style={inputStyle} value={newPurchase.paymentStatus} onChange={e => setNewPurchase({ ...newPurchase, paymentStatus: e.target.value })}>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Method</label>
                <select style={inputStyle} value={newPurchase.paymentMethod} onChange={e => setNewPurchase({ ...newPurchase, paymentMethod: e.target.value })}>
                  <option value="Cash">Cash</option>
                  <option value="Cash Wallet">Cash Wallet (App)</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* SMART SETTLEMENT INFO — shown once */}
            {(() => {
              const selectedCollector = collectors.find(c => c._id === newPurchase.supplierId);
              const totalAmt = newPurchase.items.reduce((a, b) => a + b.amount, 0);
              const debtAmount = selectedCollector && selectedCollector.walletBalance < 0 ? Math.abs(selectedCollector.walletBalance) : 0;
              const autoSettle = Math.min(debtAmount, totalAmt);
              const freshNeeded = totalAmt - autoSettle;
              if (autoSettle > 0) {
                return (
                  <div style={{ background: "linear-gradient(135deg, #eef8f1, #e8f5e9)", border: "1px solid #c3e6cb", borderRadius: "12px", padding: "12px 15px", marginTop: "15px", fontSize: "13px" }}>
                    <div style={{ fontWeight: "bold", color: "#0b8f3a", marginBottom: "6px" }}>⚡ Auto-Settlement Will Apply</div>
                    <div style={{ color: "#555", lineHeight: "1.8" }}>
                      <div>🔴 Collector Debt: <strong>₹{debtAmount.toFixed(2)}</strong></div>
                      <div>✅ Auto-Settled: <strong style={{color:"#0b8f3a"}}>₹{autoSettle.toFixed(2)}</strong> (franchise refund + commission)</div>
                      {freshNeeded > 0 && <div>💰 Fresh Payment: <strong style={{color:"#e67e22"}}>₹{freshNeeded.toFixed(2)}</strong> — select Cash/UPI above</div>}
                      {freshNeeded === 0 && <div style={{color:"#0b8f3a"}}>✅ No extra payment needed!</div>}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

          </div>{/* end scroll wrapper */}

          <button style={{ ...saveBtnBig, marginTop: "15px" }} onClick={handleCreatePurchase}>Complete Purchase</button>
        </Modal>
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
