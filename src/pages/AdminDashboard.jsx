import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaTruck, FaClock, FaCheckCircle, FaRupeeSign,
  FaSignOutAlt, FaTrash, FaPlus, FaKey, FaBell, FaInfoCircle,
  FaAd, FaTag, FaTools, FaStar, FaUserPlus, FaBars, FaTimes, FaCog,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaRecycle, FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaChartLine,
  FaFileInvoice, FaBuilding, FaIdCard, FaCar, FaUserCheck, FaMap, FaTicketAlt, FaPercent, FaShareAlt, FaRss, FaClipboardList, FaMoneyCheckAlt, FaBoxOpen, FaWhatsapp
} from "react-icons/fa";
import API from "../services/api";
import Toast from "../components/Toast";
import { eraseCookie } from "../utils/cookies";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
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
  const [walletForm, setWalletForm] = useState({ userId: "", amount: "", type: "credit", description: "" });
  
  const [accountingStats, setAccountingStats] = useState({ totalPurchaseAmount: 0, todayPurchaseAmount: 0, totalSaleAmount: 0, todaySaleAmount: 0, overallProfit: 0, todayProfit: 0, totalCommission: 0, todayCommission: 0, stockValue: 0 });
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const initialSaleState = { 
    irn: "", ackNo: "", ackDate: "",
    buyerName: "", buyerContact: "", buyerAddress: "", buyerGSTIN: "", buyerPAN: "", buyerState: "Jammu & Kashmir", buyerStateCode: "01",
    consigneeName: "", consigneeAddress: "", consigneeGSTIN: "", consigneePAN: "", consigneeState: "Jammu & Kashmir", consigneeStateCode: "01",
    eWayBillNo: "", dispatchDocNo: "", dispatchedThrough: "", motorVehicleNo: "", deliveryNote: "", deliveryNoteDate: "", referenceNo: "", buyersOrderNo: "", destination: "", termsOfDelivery: "",
    notes: "", items: [], paymentStatus: "Paid", paymentMethod: "Cash"
  };
  const [newSale, setNewSale] = useState(initialSaleState);
  const [newPurchase, setNewPurchase] = useState({ supplierName: "", supplierContact: "", notes: "", items: [], paymentStatus: "Paid", paymentMethod: "Cash" });
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
    fetchAdminData();
    // Animation trigger
    document.body.style.overflowX = "hidden";
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resStats, resPickups, resCollectors, resItems, resUsers, resFranchises] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/pickups"),
        API.get("/admin/collectors"),
        API.get("/scrap-items"),
        API.get("/admin/users"),
        API.get("/admin/franchises")
      ]);

      if (resStats.data.success) setStats(resStats.data.stats);
      if (resPickups.data.success) setPickups(resPickups.data.pickups);
      if (resCollectors.data.success) setCollectors(resCollectors.data.collectors);
      if (resItems.data.success) setItems(resItems.data.data);
      if (resUsers.data.success) setAllUsers(resUsers.data.users);
      if (resFranchises.data.success) setFranchises(resFranchises.data.franchises);
      
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

  const handleAddPurchaseItem = () => {
    if(!purchaseItemInput.scrapItem || !purchaseItemInput.quantity || !purchaseItemInput.rate) return showToast("error", "Fill all item fields");
    const itemInfo = items.find(i => i._id === purchaseItemInput.scrapItem);
    const amount = parseFloat(purchaseItemInput.quantity) * parseFloat(purchaseItemInput.rate);
    setNewPurchase({...newPurchase, items: [...newPurchase.items, { scrapItem: purchaseItemInput.scrapItem, name: itemInfo?.name || "", quantity: purchaseItemInput.quantity, rate: purchaseItemInput.rate, amount }]});
    setPurchaseItemInput({ scrapItem: "", name: "", quantity: "", rate: "" });
  };

  const handleCreatePurchase = async () => {
    if(!newPurchase.supplierName || newPurchase.items.length === 0) return showToast("error", "Add supplier and items");
    const totalAmount = newPurchase.items.reduce((acc, item) => acc + item.amount, 0);
    try {
      const { data } = await API.post("/billing/purchases", { ...newPurchase, totalAmount });
      if(data.success) {
        showToast("success", "Purchase Recorded!");
        setShowPurchaseModal(false);
        setNewPurchase({ supplierName: "", supplierContact: "", notes: "", items: [], paymentStatus: "Paid", paymentMethod: "Cash" });
        fetchAccountingData();
      }
    } catch(e) { showToast("error", "Failed to record purchase"); }
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
        if (key !== 'brandLogo') {
          formData.append(key, settings[key] !== undefined && settings[key] !== null ? settings[key] : '');
        }
      });
      if (brandLogoFile) {
        formData.append('brandLogo', brandLogoFile);
      }
      const { data } = await API.put("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (data.success) {
        showToast("success", "Platform & Brand Settings Updated Successfully!");
        if (data.data) setSettings(data.data);
      }
    } catch (e) { showToast("error", "Failed to save settings"); }
  };

  // ... (Other handlers like handleCreateAd, handleResetPassword etc same as before)
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

  const logout = () => { 
    localStorage.clear(); 
    eraseCookie("token");
    eraseCookie("user");
    eraseCookie("role");
    navigate("/admin-login"); 
  };

  if (loading) return <div style={loaderStyle}><div className="spinner"></div></div>;

  const NavContent = () => (
    <>
      <NavItem active={activeTab === "overview"} icon={<FaInfoCircle />} text="Overview" onClick={() => {setActiveTab("overview"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "pickups"} icon={<FaTruck />} text="Pickups" onClick={() => {setActiveTab("pickups"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "users"} icon={<FaUsers />} text="Users" onClick={() => {setActiveTab("users"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "collectors"} icon={<FaTools />} text="Collectors" onClick={() => {setActiveTab("collectors"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "franchises"} icon={<FaMapMarkerAlt />} text="Franchises" onClick={() => {setActiveTab("franchises"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "rates"} icon={<FaTag />} text="Rates" onClick={() => {setActiveTab("rates"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "accounting"} icon={<FaChartLine />} text="Accounting" onClick={() => {setActiveTab("accounting"); fetchAccountingData(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "buyers"} icon={<FaUsers />} text="Buyers" onClick={() => {setActiveTab("buyers"); fetchBuyers(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "suppliers"} icon={<FaTruck />} text="Sellers" onClick={() => {setActiveTab("suppliers"); fetchSuppliers(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "wallet"} icon={<FaWallet />} text="Wallet Mgmt" onClick={() => {setActiveTab("wallet"); fetchAllTransactions(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "withdrawals"} icon={<FaMoneyCheckAlt />} text="Withdrawals" onClick={() => {setActiveTab("withdrawals"); fetchWithdrawals(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "support"} icon={<FaTicketAlt />} text="Support" onClick={() => {setActiveTab("support"); fetchTickets(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "contacts"} icon={<FaEnvelope />} text="Inquiries" onClick={() => {setActiveTab("contacts"); fetchContactMessages(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "broadcasts"} icon={<FaRss />} text="Broadcasts" onClick={() => {setActiveTab("broadcasts"); fetchBroadcasts(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "audit"} icon={<FaClipboardList />} text="Audit Logs" onClick={() => {setActiveTab("audit"); fetchAuditLogs(); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "ads"} icon={<FaAd />} text="Banners" onClick={() => {setActiveTab("ads"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "reviews"} icon={<FaStar />} text="Reviews" onClick={() => {setActiveTab("reviews"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "settings"} icon={<FaCog />} text="Settings" onClick={() => {setActiveTab("settings"); setIsMobileMenuOpen(false);}} />
      <NavItem active={activeTab === "whatsapp"} icon={<FaWhatsapp style={{ color: "#25D366" }} />} text="WhatsApp QR 💬" onClick={() => {setActiveTab("whatsapp"); setIsMobileMenuOpen(false);}} />
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
        <header style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button style={menuBtn} className="mobile-only" onClick={() => setIsMobileMenuOpen(true)}><FaBars /></button>
            <h2 style={headerTitle}>{activeTab.toUpperCase()}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ position: "relative", display:"flex", gap:"10px" }}>
              <button style={bellBtn} onClick={() => { setShowNotifPanel(!showNotifPanel); if(!showNotifPanel) markAllNotificationsRead(); }}>
                <FaBell /> {notifications.filter(n => !n.isRead).length > 0 && <span style={badge}>{notifications.filter(n => !n.isRead).length}</span>}
              </button>
              <button style={logoutHeaderBtn} onClick={logout} title="Logout">
                <FaSignOutAlt />
              </button>
              {showNotifPanel && (
                <div style={notifPanel}>
                  <h4 style={{margin: "0 0 10px 0", color:"#333"}}>Alerts</h4>
                  {notifications.slice(0, 5).map(n => (
                    <div key={n._id} style={notifRow}><strong>{n.title}</strong><br/>{n.message}</div>
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
                <StatCard icon={<FaUsers />} title="Total Users" value={stats.totalUsers} grad="linear-gradient(135deg, #0b8f3a 0%, #20b050 100%)" />
                <StatCard icon={<FaTruck />} title="All Pickups (Count)" value={stats.totalPickups} grad="linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)" />
                <StatCard icon={<FaChartLine />} title="App Pickups Value" value={`₹${accountingStats.totalCompletedPickupAmount?.toFixed(0) || 0}`} grad="linear-gradient(135deg, #f39c12 0%, #d35400 100%)" />
                <StatCard icon={<FaChartLine />} title="System Sale Vol." value={`₹${accountingStats.totalNetworkSale?.toFixed(0) || 0}`} grad="linear-gradient(135deg, #e67e22 0%, #d35400 100%)" />
                <StatCard icon={<FaPercent />} title="Commission Earned" value={`₹${accountingStats.totalCommission?.toFixed(2) || 0}`} grad="linear-gradient(135deg, #16a085 0%, #1abc9c 100%)" />
                <StatCard icon={<FaRupeeSign />} title="Admin Net Profit" value={`₹${((accountingStats.overallProfit || 0) + (accountingStats.totalCommission || 0)).toFixed(2)}`} grad="linear-gradient(135deg, #0b8f3a 0%, #000 100%)" />
                <StatCard icon={<FaWallet />} title="Users Wallet Balance" value={`₹${walletStats.customerWalletBalance || 0}`} grad="linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)" />
                <StatCard icon={<FaBuilding />} title="Partner Wallets (Fran/Coll)" value={`₹${walletStats.partnerWalletBalance || 0}`} grad="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" />
                <StatCard icon={<FaBoxOpen />} title="Franchise Stock Value" value={`₹${accountingStats.franchiseStockValue?.toFixed(0) || 0}`} grad="linear-gradient(135deg, #34495e 0%, #2c3e50 100%)" />
              </div>
              <div style={mainGrid} className="responsive-flex">
                 <div style={{...box, flex: 2}} className="premium-card">
                    <h3 style={boxTitle}>Recent Activity</h3>
                    <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                       <h4 style={{fontSize: "12px", color: "var(--text-muted)", margin: "0"}}>LATEST PICKUPS</h4>
                       {pickups.slice(0, 3).map(p => (
                         <div key={p._id} style={listRow}>
                           <span>{p.scrapType} • <span style={{color:"var(--text-muted)"}}>{p.name}</span></span>
                           <StatusBadge status={p.status} />
                         </div>
                       ))}
                       
                       <h4 style={{fontSize: "12px", color: "var(--text-muted)", margin: "15px 0 0 0"}}>LATEST WALLET ACTIONS</h4>
                       {transactions.slice(0, 3).map(tx => (
                         <div key={tx._id} style={listRow}>
                           <span>{tx.description} • <small style={{color:"var(--text-muted)"}}>{tx.user?.name}</small></span>
                           <span style={{fontWeight:"bold", color: tx.type==="credit"?"#0b8f3a":"#dc3545", fontSize:"13px"}}>
                             {tx.type==="credit"?"+":"-"}₹{tx.amount}
                           </span>
                         </div>
                       ))}
                    </div>
                    {pickups.length === 0 && transactions.length === 0 && <p style={muted}>No activity recorded yet.</p>}
                 </div>
                 <div style={{...box, flex: 1}} className="premium-card">
                    <h3 style={boxTitle}>Quick Access</h3>
                    <div style={btnStack}>
                       <QuickAction icon={<FaUserPlus/>} text="Register User" onClick={()=>setShowUserModal(true)} />
                       <QuickAction icon={<FaPlus/>} text="Hire Collector" onClick={()=>setShowCollectorModal(true)} />
                       <QuickAction icon={<FaChartLine/>} text="Open Accounting" onClick={()=>{setActiveTab("accounting"); fetchAccountingData();}} />
                       <QuickAction icon={<FaWallet/>} text="Wallet Adjust" onClick={()=>setShowWalletModal(true)} />
                       <QuickAction icon={<FaTag/>} text="Update Rates" onClick={()=>setActiveTab("rates")} />
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
                        <div style={{flex:1}}>
                           <div style={rowTitle}>{p.scrapType}</div>
                           <small style={muted}>{p.name} • {p.mobile} <br/> {p.address}</small>
                        </div>
                        <div style={{textAlign: "right"}}>
                           <StatusBadge status={p.status} />
                           {["Pending", "Rejected"].includes(p.status) && <button style={assignBtn} onClick={()=>{setSelectedPickup(p); setShowAssignModal(true);}}>Assign Now</button>}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === "settings" && (
             <div style={box} className="premium-card">
                <h3 style={boxTitle}>Global Platform & Dynamic Brand Settings</h3>
                <div style={settingsGrid}>
                   <div style={settingsSection}>
                      <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", fontSize: "14px" }}>🎨 Brand & App Identity</h4>
                      
                      <label style={labelStyle}> Upload Brand Logo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setBrandLogoFile(e.target.files[0])}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      {settings.brandLogo && (
                        <div style={{ margin: "5px 0 15px 0" }}>
                          <small style={{ color: "var(--text-muted)", display: "block" }}>Current Active Logo:</small>
                          <img src={`http://localhost:5000${settings.brandLogo}`} alt="Brand Logo" style={{ height: "45px", objectFit: "contain", borderRadius: "8px", background: "#f8f9fa", padding: "4px", border: "1px solid #ddd" }} />
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

                   <div style={settingsSection}>
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
                <button style={saveBtnBig} onClick={handleUpdateSettings}>Save All Configurations</button>
             </div>
          )}

          {/* OTHER TABS (Users, Collectors, Rates, Ads, Reviews) with same premium-card style... */}
          {activeTab === "rates" && (
             <div style={box} className="premium-card">
                <div style={titleBar}><h3>SCRAP RATES</h3> <button style={addBtn} onClick={()=>setShowItemModal(true)}><FaPlus/></button></div>
                {items.map(it => (
                  <div key={it._id} style={listRow}>
                     <span>{it.name} <br/><small style={muted}>{it.category}</small></span>
                     <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
                        <strong style={{color:"#0b8f3a"}}>₹{it.price}/{it.unit}</strong>
                        <button style={smBtn} onClick={()=>{setEditingRate(it); setShowEditRateModal(true);}}><FaTools size={12}/></button>
                        <button style={smDelBtn} onClick={()=>handleDeleteItem(it._id, "rate")}><FaTrash size={12}/></button>
                     </div>
                  </div>
                ))}
             </div>
          )}
          
          {(activeTab === "users" || activeTab === "collectors" || activeTab === "franchises") && (
            <div style={box} className="premium-card">
              <div style={titleBar}><h3>{activeTab.toUpperCase()}</h3> <button style={addBtn} onClick={() => activeTab === "users" ? setShowUserModal(true) : activeTab === "franchises" ? setShowFranchiseModal(true) : setShowCollectorModal(true)}><FaPlus/></button></div>
              <div style={tableContainer}>
                {(activeTab === "users" ? allUsers : activeTab === "franchises" ? franchises : collectors).map(u => (
                  <div key={u._id} style={listRow}>
                    <span>{u.name} <br/><small style={muted}>{u.mobile} {u.area && `• ${u.area}`} {u.assignedCity && `• ${u.assignedCity}`} {u.walletBalance !== undefined && `• Wallet: ₹${u.walletBalance}`}</small></span>
                    <div style={{display: "flex", gap: "10px"}}>
                      <button style={smBtn} onClick={() => { setWalletForm({ userId: u._id, amount: "", type: "credit", description: "Admin Transfer" }); setShowWalletModal(true); }}>Transfer</button>
                      <button style={smBtn} onClick={() => { setResetData({ userId: u._id, name: u.name, newPassword: "" }); setShowResetModal(true); }}><FaKey/></button>
                      <button style={smDelBtn} onClick={() => handleDeleteItem(u._id, activeTab === "users" ? "user" : activeTab === "franchises" ? "franchise" : "collector")}><FaTrash/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ads" && (
            <div style={box} className="premium-card">
              <div style={titleBar}><h3>MANAGED BANNERS</h3> <button style={addBtn} onClick={() => setShowAdModal(true)}><FaPlus/></button></div>
              <div style={adGrid}>
                {ads.map(ad => (
                  <div key={ad._id} style={adCard} className="premium-card">
                    <img src={ad.imageUrl} style={adImg} alt="" />
                    <div style={{padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                       <span style={{fontSize: "12px", fontWeight: "bold"}}>{ad.title}</span>
                       <button style={smDelBtn} onClick={() => handleDeleteItem(ad._id, "ad")}><FaTrash/></button>
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
                      <div style={{color: "#f39c12", marginBottom:"5px"}}>{[...Array(r.rating)].map((_, i) => <FaStar key={i} size={12}/>)}</div>
                      <div style={{fontSize:"14px", marginBottom: "5px"}}>
                        <strong>{r.user?.name}</strong> <span style={{color:"#999", fontSize:"12px"}}>reviewed</span> <strong>{r.collector?.name || "Unknown"}</strong>
                      </div>
                      <span style={{fontSize:"13px", color:"#555", fontStyle: "italic"}}>"{r.comment}"</span>
                   </div>
                   <div style={{textAlign: "right"}}>
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
                <div style={{display:"flex", gap:"10px"}}>
                   <button style={addBtn} onClick={()=>setShowWalletModal(true)}><FaPlus/> Manual Adjust</button>
                </div>
              </div>
              
              <div style={statGrid}>
                 <div style={{...miniStat, background: "#eef8f1"}}>
                    <small>Available Liability</small>
                    <div style={{fontSize:"18px", fontWeight:"bold", color:"#0b8f3a"}}>₹{walletStats.totalAvailable}</div>
                 </div>
                 <div style={{...miniStat, background: "#fff9e6"}}>
                    <small>Pending Liability</small>
                    <div style={{fontSize:"18px", fontWeight:"bold", color:"#f39c12"}}>₹{walletStats.totalPending}</div>
                 </div>
                 <div style={{...miniStat, background: "#eef2ff"}}>
                    <small>Total Users</small>
                    <div style={{fontSize:"18px", fontWeight:"bold", color:"#4f46e5"}}>{walletStats.userCount}</div>
                 </div>
              </div>

              
              {/* PENDING UPI DEPOSITS PANEL */}
              {transactions.filter(tx => tx.source === "deposit" && tx.status === "pending").length > 0 && (
                <div style={{ marginBottom: "25px", border: "1px solid #ffeeba", background: "#fffdf5", padding: "20px", borderRadius: "18px" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#856404", fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                    ⚠️ PENDING UPI DEPOSITS REQUESTS ({transactions.filter(tx => tx.source === "deposit" && tx.status === "pending").length})
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {transactions.filter(tx => tx.source === "deposit" && tx.status === "pending").map(dep => (
                      <div key={dep._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "12px 18px", borderRadius: "12px", border: "1px solid #f1f1f1" }} className="premium-card">
                        <div>
                          <div style={{ fontWeight: "bold", fontSize: "14px", color: "#000" }}>{dep.user?.name || "Unknown User"} ({dep.user?.mobile || "N/A"})</div>
                          <div style={{ fontSize: "12px", color: "#666", marginTop: "3px" }}>
                            <strong>UTR/UPI Ref No:</strong> <span style={{ fontFamily: "monospace", background: "#f8f9fa", padding: "2px 6px", borderRadius: "4px", fontSize: "12px", border: "1px solid #e1e1e1", fontWeight: "bold", letterSpacing: "1px", color: "#000" }}>{dep.depositDetails?.upiRefNo || "N/A"}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "3px" }}>Requested: {new Date(dep.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "18px", fontWeight: "bold", color: "#0b8f3a", marginRight: "10px" }}>₹{dep.amount}</span>
                          <button 
                            style={{ background: "#eef8f1", color: "#0b8f3a", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }} 
                            onClick={() => handleApproveDeposit(dep._id)}
                          >
                            Approve ✅
                          </button>
                          <button 
                            style={{ background: "#fff5f5", color: "#dc3545", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }} 
                            onClick={() => handleRejectDeposit(dep._id)}
                          >
                            Reject ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
<div style={tableContainer}>
                {transactions.map(tx => (
                  <div key={tx._id} style={listRow}>
                    <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
                       <div style={{...txIcon, background: tx.status==="paid_in_cash" ? "#fff9e6" : (tx.type==="credit"?"#eef8f1":"#fff5f5")}}>
                          {tx.status==="paid_in_cash" ? <FaRupeeSign color="#f39c12"/> : (tx.type==="credit" ? <FaArrowUp color="#0b8f3a"/> : <FaArrowDown color="#dc3545"/>)}
                       </div>
                       <div>
                          <div style={rowTitle}>{tx.description}</div>
                          <small style={muted}>{tx.user?.name} ({tx.user?.mobile}) • {new Date(tx.createdAt).toLocaleString()}</small>
                       </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                       <div style={{fontWeight:"bold", color: tx.status==="paid_in_cash" ? "#666" : (tx.type==="credit"?"#0b8f3a":"#dc3545")}}>
                          {tx.status==="paid_in_cash"?"":" "}{tx.type==="credit"?"+":"-"}₹{tx.amount}
                       </div>
                       <small style={{...statusBadge, background: tx.status==="completed"?"#eef8f1": tx.status==="paid_in_cash"?"#fff9e6":"#fff5f5", color: tx.status==="completed"?"#0b8f3a": tx.status==="paid_in_cash"?"#f39c12":"#dc3545"}}>
                          {tx.status.replace(/_/g, " ")}
                       </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "accounting" && (
            <div style={box} className="premium-card no-print">
              <div style={titleBar}>
                <h3>VYAPAR BILLING & ACCOUNTING</h3>
                <div style={{display: "flex", gap: "10px"}}>
                  <button style={addBtn} onClick={()=>setShowPurchaseModal(true)}><FaPlus/> Record Purchase</button>
                  <button style={addBtn} onClick={()=>setShowSaleModal(true)}><FaPlus/> Create Sale Invoice</button>
                </div>
              </div>


              
              <div style={statGrid}>
                <div style={{...miniStat, background: accountingStats.overallProfit >= 0 ? "#eef8f1" : "#fff5f5", border: accountingStats.overallProfit >= 0 ? "1px solid #c3e6cb" : "1px solid #f5c6cb"}}>
                    <small style={{color: accountingStats.overallProfit >= 0 ? "#0b8f3a" : "#dc3545", fontWeight: "600"}}>📈 ADMIN NET PROFIT</small>
                    <div style={{fontSize:"20px", fontWeight:"800", color: accountingStats.overallProfit >= 0 ? "#155724" : "#721c24", marginTop: "5px"}}>
                      +₹{accountingStats.overallProfit?.toFixed(2) || 0}
                    </div>
                    <small style={{color:"#666", fontSize:"10px"}}>Total Sales - Total Purchases</small>
                </div>
                <div style={{...miniStat, background: "#e8f4f8", border: "1px solid #bee5eb"}}>
                    <small style={{color: "#0c5460", fontWeight: "600"}}>💰 ADMIN STOCK VALUE</small>
                    <div style={{fontSize:"20px", fontWeight:"800", color:"#0c5460", marginTop: "5px"}}>₹{accountingStats.stockValue?.toFixed(2) || 0}</div>
                    <small style={{color:"#666", fontSize:"10px"}}>Investment in your stock</small>
                </div>
                <div style={{...miniStat, background: "#f8f9fa", border: "1px solid #dee2e6"}}>
                    <small style={{color: "#333", fontWeight: "600"}}>🛒 ADMIN PURCHASES</small>
                    <div style={{fontSize:"20px", fontWeight:"800", color:"#222", marginTop: "5px"}}>₹{accountingStats.totalPurchaseAmount?.toFixed(2)}</div>
                    <small style={{color:"#666", fontSize:"10px"}}>Your direct material buys</small>
                </div>
                <div style={{...miniStat, background: "#eef2ff", border: "1px solid #d1dbff"}}>
                    <small style={{color: "#4f46e5", fontWeight: "600"}}>💵 ADMIN SALES</small>
                    <div style={{fontSize:"20px", fontWeight:"800", color:"#1e1b4b", marginTop: "5px"}}>₹{accountingStats.totalSaleAmount?.toFixed(2)}</div>
                    <small style={{color:"#666", fontSize:"10px"}}>Your direct revenue</small>
                </div>
              </div>

              <h4 style={{marginTop: "30px"}}>Live Inventory</h4>
              <div style={{...tableContainer, maxHeight: "250px", marginBottom: "30px"}}>
                 {inventory.map(inv => (
                   <div key={inv._id} style={listRow}>
                      <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
                         <img src={inv.scrapItem?.image || "https://via.placeholder.com/40"} style={{width:"40px", height:"40px", borderRadius:"8px", objectFit:"cover"}} alt=""/>
                         <div>
                            <div style={rowTitle}>{inv.scrapItem?.name} <span style={muted}>({inv.scrapItem?.category})</span></div>
                            <small style={muted}>Bought: {inv.totalBoughtQuantity} {inv.scrapItem?.unit} | Sold: {inv.totalSoldQuantity} {inv.scrapItem?.unit}</small>
                         </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                         <div style={{fontSize: "16px", fontWeight: "bold", color: inv.quantityAvailable > 0 ? "#0b8f3a" : "#dc3545"}}>
                           {inv.quantityAvailable} {inv.scrapItem?.unit}
                         </div>
                         <small style={muted}>Available in Stock</small>
                      </div>
                   </div>
                 ))}
                 {inventory.length === 0 && <p style={muted}>No inventory data yet.</p>}
              </div>

              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                <div>
                  <h4>Recent Purchases (Kharida)</h4>
                  <div style={tableContainer}>
                     {purchases.map(p => (
                       <div key={p._id} style={listRow}>
                          <div>
                             <div style={rowTitle}>{p.supplierName} <span style={muted}>({p.supplierContact})</span></div>
                             <small style={muted}>{new Date(p.createdAt).toLocaleDateString()} | Items: {p.items.length}</small>
                          </div>
                          <div style={{textAlign:"right"}}>
                             <div style={{fontWeight:"bold", color:"#dc3545"}}>-₹{p.totalAmount}</div>
                             <small style={{...statusBadge, background: p.paymentStatus==="Paid"?"#eef8f1":"#fff9e6", color: p.paymentStatus==="Paid"?"#0b8f3a":"#f39c12"}}>{p.paymentStatus}</small>
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
                          <div style={{textAlign:"right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px"}}>
                             <div style={{fontWeight:"bold", color:"#0b8f3a"}}>+₹{sale.totalAmount}</div>
                             <button style={{...smBtn, fontSize: "10px", padding: "4px 8px"}} onClick={() => { setSelectedInvoice(sale); setShowInvoiceModal(true); }}>View Invoice</button>
                          </div>
                       </div>
                     ))}
                     {sales.length === 0 && <p style={muted}>No sales recorded yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === "withdrawals" && (
            <div style={box} className="premium-card">
              <h3>PAYOUT REQUESTS</h3>
              <div style={tableContainer}>
                {withdrawals.map(w => (
                  <div key={w._id} style={listRow}>
                    <div>
                      <div style={rowTitle}>₹{w.amount}</div>
                      <small style={muted}>{w.user?.name} ({w.user?.mobile})</small>
                      {w.bankDetails && (
                        <div style={{background:"#f8f9fa", padding:"5px 10px", borderRadius:"6px", marginTop:"5px", fontSize:"11px"}}>
                          <strong>UPI:</strong> {w.bankDetails.upiId} <br/>
                          <strong>Name:</strong> {w.bankDetails.accountName}
                        </div>
                      )}
                      <small style={muted}>{new Date(w.createdAt).toLocaleString()}</small>
                    </div>
                    <div style={{textAlign: "right"}}>
                      <StatusBadge status={w.status} />
                      {w.status === "Pending" && <button style={smBtn} onClick={() => {
                        const tid = prompt("Enter Transaction ID:");
                        if(tid) API.put(`/withdrawals/${w._id}`, { status: "Completed", transactionId: tid }).then(()=>fetchWithdrawals());
                      }}>Approve</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {activeTab === "support" && (
            <div style={box} className="premium-card">
              {!selectedTicket ? (
                <>
                  <h3 style={{ margin: "0 0 20px 0", color: "var(--text-main)", fontSize: "18px", fontWeight: "bold" }}>Global Support Tickets</h3>
                  <div style={tableContainer}>
                    {tickets.map(t => (
                      <div key={t._id} style={{ ...listRow, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ ...rowTitle, fontSize: "15px", color: "var(--text-main)" }}>{t.subject}</div>
                          <small style={muted}>
                            By: <strong>{t.user?.name}</strong> ({t.user?.mobile}) • Cat: <strong>{t.category}</strong> • {new Date(t.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", background: t.status === "open" ? "rgba(11, 143, 58, 0.1)" : t.status === "resolved" ? "rgba(66, 133, 244, 0.1)" : "rgba(243, 156, 18, 0.1)", color: t.status === "open" ? "#0b8f3a" : t.status === "resolved" ? "#4285f4" : "#f39c12" }}>
                            {t.status}
                          </span>
                          <button style={smBtn} onClick={() => setSelectedTicket(t)}>View & Reply</button>
                        </div>
                      </div>
                    ))}
                    {tickets.length === 0 && <p style={muted}>No support tickets found.</p>}
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
            <div style={box} className="premium-card">
              <div style={titleBar}><h3>PUSH BROADCASTS</h3> <button style={addBtn} onClick={() => {
                const title = prompt("Broadcast Title:");
                const message = prompt("Message Content:");
                const target = prompt("Target (Users/Collectors/Franchises):");
                if(title && message) API.post("/broadcasts", { title, message, target }).then(()=>fetchBroadcasts());
              }}><FaPlus/></button></div>
              <div style={tableContainer}>
                {broadcasts.map(b => (
                  <div key={b._id} style={listRow}>
                    <div>
                      <div style={rowTitle}>{b.title}</div>
                      <small style={muted}>To: {b.target} • {new Date(b.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div style={box} className="premium-card">
              <h3>SYSTEM AUDIT LOGS</h3>
              <div style={tableContainer}>
                {auditLogs.map(l => (
                  <div key={l._id} style={listRow}>
                    <div>
                      <div style={rowTitle}>{l.action}</div>
                      <small style={muted}>{l.module} • By: {l.performedBy?.name} • {new Date(l.createdAt).toLocaleString()}</small>
                    </div>
                    <div style={{fontSize: "10px", color: "#999"}}>{l.ipAddress}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "buyers" && (
            <div style={box} className="premium-card">
               <div style={titleBar}><h3>MANAGED BUYERS</h3> <button style={addBtn} onClick={()=>{setNewBuyer({ name: "", contact: "", email: "", address: "", gstin: "", pan: "" }); setShowBuyerModal(true);}}><FaPlus/></button></div>
               <div style={tableContainer}>
                  {buyers.map(b => (
                    <div key={b._id} style={listRow}>
                       <div>
                          <div style={rowTitle}>{b.name}</div>
                          <small style={muted}>{b.contact} • {b.gstin || "No GST"}</small>
                       </div>
                       <div style={{display:"flex", gap:"10px"}}>
                          <button style={smBtn} onClick={()=>{setNewBuyer(b); setShowBuyerModal(true);}}><FaTools/></button>
                          <button style={smDelBtn} onClick={()=>handleDeleteItem(b._id, "buyer")}><FaTrash/></button>
                       </div>
                    </div>
                  ))}
                  {buyers.length === 0 && <p style={muted}>No buyers registered.</p>}
               </div>
            </div>
          )}

          {activeTab === "suppliers" && (
            <div style={box} className="premium-card">
               <div style={titleBar}><h3>MANAGED SELLERS (SUPPLIERS)</h3> <button style={addBtn} onClick={()=>{setNewSupplier({ name: "", contact: "", address: "", gstin: "", category: "Individual" }); setShowSupplierModal(true);}}><FaPlus/></button></div>
               <div style={tableContainer}>
                  {suppliers.map(s => (
                    <div key={s._id} style={listRow}>
                       <div>
                          <div style={rowTitle}>{s.name}</div>
                          <small style={muted}>{s.contact} • {s.category}</small>
                       </div>
                       <div style={{display:"flex", gap:"10px"}}>
                          <button style={smBtn} onClick={()=>{setNewSupplier(s); setShowSupplierModal(true);}}><FaTools/></button>
                          <button style={smDelBtn} onClick={()=>handleDeleteItem(s._id, "supplier")}><FaTrash/></button>
                       </div>
                    </div>
                  ))}
                  {suppliers.length === 0 && <p style={muted}>No sellers registered.</p>}
               </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div style={box} className="premium-card">
              <h3 style={{ margin: "0 0 20px 0", color: "var(--text-main)", fontSize: "18px", fontWeight: "bold" }}>Guest Inquiries (Contact Us Messages)</h3>
              <div style={tableContainer}>
                {contacts.map(c => (
                  <div key={c._id} style={{ ...listRow, display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ ...rowTitle, fontSize: "16px", color: "var(--text-main)" }}>{c.subject}</div>
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
                {contacts.length === 0 && <p style={muted}>No inquiries found.</p>}
              </div>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: "0 0 5px 0", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <FaWhatsapp style={{ color: "#25D366", fontSize: "28px" }} /> WhatsApp Gateway Setup (Admin Only)
                  </h2>
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
                    Scan QR code below with your WhatsApp app to enable 100% Free OTPs & Pickup Notifications.
                  </p>
                </div>
                <a 
                  href="http://localhost:5000/api/auth/whatsapp-qr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ background: "#25D366", color: "#fff", padding: "12px 20px", borderRadius: "14px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(37,211,102,0.3)" }}
                >
                  <FaWhatsapp style={{ fontSize: "18px" }} /> Open Full Scanner Window ↗
                </a>
              </div>

              <div style={{ background: "#0f172a", borderRadius: "24px", border: "1px solid var(--glass-border)", padding: "10px", boxShadow: "0 15px 35px rgba(0,0,0,0.15)", minHeight: "560px" }}>
                <iframe
                  src="http://localhost:5000/api/auth/whatsapp-qr"
                  title="WhatsApp Gateway QR Code"
                  style={{ width: "100%", height: "550px", border: "none", borderRadius: "18px", background: "#0f172a" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS (Enhanced styling) */}
      {showItemModal && (
        <Modal title="Add New Rate" onClose={() => setShowItemModal(false)}>
          <Input placeholder="Item Name" value={newItem.name} onChange={v => setNewItem({...newItem, name: v})} />
          <Input placeholder="Price (₹)" type="number" value={newItem.price} onChange={v => setNewItem({...newItem, price: v})} />
          <select style={inputStyle} value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
             <option value="kg">kg</option><option value="Pcs">Pcs</option><option value="Unit">Unit</option>
          </select>
          <select style={inputStyle} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
             <option value="Paper">Paper</option><option value="Plastic">Plastic</option><option value="Metal">Metal</option><option value="Other">Other</option>
          </select>
          <button style={saveBtnBig} onClick={handleCreateItem}>Add To System</button>
        </Modal>
      )}

      {showAdModal && (
        <Modal title="Upload Ad Banner" onClose={() => setShowAdModal(false)}>
           <Input placeholder="Title" value={newAd.title} onChange={v => setNewAd({...newAd, title: v})} />
           <Input placeholder="Target Link (optional)" value={newAd.link} onChange={v => setNewAd({...newAd, link: v})} />
           <div style={{padding:"15px", border:"2px dashed #eee", borderRadius:"12px", textAlign:"center", marginBottom:"15px"}}>
              <input type="file" onChange={e => setAdFile(e.target.files[0])} />
           </div>
           <button style={saveBtnBig} onClick={handleCreateAd}>Publish Banner</button>
        </Modal>
      )}

      {showResetModal && (
        <Modal title={`Reset: ${resetData.name}`} onClose={() => setShowResetModal(false)}>
           <Input placeholder="New Secure Password" value={resetData.newPassword} onChange={v => setResetData({...resetData, newPassword: v})} />
           <button style={saveBtnBig} onClick={handleResetPassword}>Update Credentials</button>
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
           <button style={saveBtnBig} onClick={handleUpdateRate}>Save Changes</button>
        </Modal>
      )}

      {showUserModal && (
        <Modal title="Quick User Add" onClose={() => setShowUserModal(false)}>
           <Input placeholder="Full Name" value={newUser.name} onChange={v => setNewUser({...newUser, name: v})} />
           <Input placeholder="Mobile No" value={newUser.mobile} onChange={v => setNewUser({...newUser, mobile: v})} />
           <Input placeholder="Initial Password" value={newUser.password} onChange={v => setNewUser({...newUser, password: v})} />
           <button style={saveBtnBig} onClick={handleCreateUser}>Register User</button>
        </Modal>
      )}

      {showCollectorModal && (
        <Modal title="New Collector Hire" onClose={() => setShowCollectorModal(false)}>
           <Input placeholder="Full Name" value={newCollector.name} onChange={v => setNewCollector({...newCollector, name: v})} />
           <Input placeholder="Mobile No" value={newCollector.mobile} onChange={v => setNewCollector({...newCollector, mobile: v})} />
           <Input placeholder="Service Area" value={newCollector.area} onChange={v => setNewCollector({...newCollector, area: v})} />
           <Input placeholder="Initial Password" value={newCollector.password} onChange={v => setNewCollector({...newCollector, password: v})} />
           <button style={saveBtnBig} onClick={handleCreateCollector}>Register Collector</button>
        </Modal>
      )}

      {showFranchiseModal && (
        <Modal title="New Franchise" onClose={() => setShowFranchiseModal(false)}>
           <Input placeholder="Franchise Name / Manager" value={newFranchise.name} onChange={v => setNewFranchise({...newFranchise, name: v})} />
           <Input placeholder="Mobile No" value={newFranchise.mobile} onChange={v => setNewFranchise({...newFranchise, mobile: v})} />
           <Input placeholder="Email (For Login)" value={newFranchise.email} onChange={v => setNewFranchise({...newFranchise, email: v})} />
           <Input placeholder="Assigned District/City" value={newFranchise.assignedCity} onChange={v => setNewFranchise({...newFranchise, assignedCity: v})} />
           <Input placeholder="Initial Password" value={newFranchise.password} onChange={v => setNewFranchise({...newFranchise, password: v})} />
           <button style={saveBtnBig} onClick={handleCreateFranchise}>Register Franchise</button>
        </Modal>
      )}

      {showWalletModal && (
        <Modal title="Manual Wallet Adjustment" onClose={() => setShowWalletModal(false)}>
           <label style={labelStyle}>Select User</label>
           <select style={inputStyle} value={walletForm.userId} onChange={e=>setWalletForm({...walletForm, userId: e.target.value})}>
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
                <select style={inputStyle} value={walletForm.type} onChange={e=>setWalletForm({...walletForm, type: e.target.value})}>
                   <option value="credit">Credit (+)</option>
                   <option value="debit">Debit (-)</option>
                </select>
              </div>
           </div>
           
           <label style={labelStyle}>Description (Reason)</label>
           <Input placeholder="e.g. Refund for pickup #123" value={walletForm.description} onChange={v=>setWalletForm({...walletForm, description: v})} />
           
           <button style={saveBtnBig} onClick={handleUpdateWallet}>Apply Adjustment</button>
        </Modal>
      )}

      {showSaleModal && (
        <Modal title="Create GST E-Invoice" onClose={() => setShowSaleModal(false)}>
          <div style={{maxHeight: "70vh", overflowY: "auto", paddingRight: "10px"}}>
           <h4 style={{marginTop:0}}>Select Saved Buyer</h4>
           <select style={{...inputStyle, marginBottom: "20px"}} onChange={(e) => {
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
               <select style={{...inputStyle, marginBottom: 0}} value={saleItemInput.scrapItem} onChange={e => setSaleItemInput({...saleItemInput, scrapItem: e.target.value})}>
                 <option value="">Select Item</option>
                 {inventory.filter(i => i.quantityAvailable > 0).map(i => (
                   <option key={i.scrapItem?._id} value={i.scrapItem?._id}>{i.scrapItem?.name} (Avail: {i.quantityAvailable})</option>
                 ))}
               </select>
               <Input type="text" placeholder="HSN/SAC" value={saleItemInput.hsnCode} onChange={v => setSaleItemInput({...saleItemInput, hsnCode: v})} />
               <Input type="number" placeholder="Qty" value={saleItemInput.quantity} onChange={v => setSaleItemInput({...saleItemInput, quantity: v})} />
               <Input type="number" placeholder="Rate/Unit" value={saleItemInput.rate} onChange={v => setSaleItemInput({...saleItemInput, rate: v})} />
               <Input type="number" placeholder="CGST %" value={saleItemInput.cgstRate} onChange={v => setSaleItemInput({...saleItemInput, cgstRate: v})} />
               <Input type="number" placeholder="SGST %" value={saleItemInput.sgstRate} onChange={v => setSaleItemInput({...saleItemInput, sgstRate: v})} />
             </div>
             <button style={{...assignBtn, width: "100%", marginTop: "10px"}} onClick={handleAddSaleItem}>Add Item</button>
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

           <button style={saveBtnBig} onClick={handleCreateSale}>Generate E-Invoice</button>
          </div>
        </Modal>
      )}

      {showPurchaseModal && (
        <Modal title="Record Material Purchase" onClose={() => setShowPurchaseModal(false)}>
           <h4 style={{marginTop:0}}>Select Saved Seller</h4>
           <select style={{...inputStyle, marginBottom: "20px"}} onChange={(e) => {
             const s = suppliers.find(sx => sx._id === e.target.value);
             if(s) setNewPurchase({...newPurchase, supplierId: s._id, supplierName: s.name, supplierContact: s.contact});
           }}>
             <option value="">-- Choose Seller --</option>
             {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.contact})</option>)}
           </select>

           <div style={{display:"flex", gap:"10px", marginBottom:"10px"}}>
             <Input placeholder="Supplier Name" value={newPurchase.supplierName} onChange={v => setNewPurchase({...newPurchase, supplierName: v})} />
             <Input placeholder="Contact" value={newPurchase.supplierContact} onChange={v => setNewPurchase({...newPurchase, supplierContact: v})} />
           </div>
           
           <div style={{border: "1px solid #eee", padding: "15px", borderRadius: "12px", marginBottom: "15px", background: "#f8f9fa"}}>
             <h4 style={{margin: "0 0 10px 0", fontSize: "14px"}}>Add Items</h4>
             <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"10px"}}>
               <select style={{...inputStyle, marginBottom: 0}} value={purchaseItemInput.scrapItem} onChange={e => setPurchaseItemInput({...purchaseItemInput, scrapItem: e.target.value})}>
                 <option value="">Select Item</option>
                 {items.map(i => (
                   <option key={i._id} value={i._id}>{i.name}</option>
                 ))}
               </select>
               <Input type="number" placeholder="Qty" value={purchaseItemInput.quantity} onChange={v => setPurchaseItemInput({...purchaseItemInput, quantity: v})} />
               <Input type="number" placeholder="Rate/Unit" value={purchaseItemInput.rate} onChange={v => setPurchaseItemInput({...purchaseItemInput, rate: v})} />
             </div>
             <button style={{...assignBtn, width: "100%", marginTop: "10px"}} onClick={handleAddPurchaseItem}>Add Item</button>
           </div>

           {newPurchase.items.length > 0 && (
             <div style={{maxHeight: "120px", overflowY: "auto", marginBottom: "15px"}}>
               {newPurchase.items.map((it, idx) => (
                 <div key={idx} style={{display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #eee", fontSize:"12px"}}>
                    <span>{it.name} ({it.quantity} x ₹{it.rate})</span>
                    <strong>₹{it.amount}</strong>
                 </div>
               ))}
               <div style={{textAlign: "right", marginTop: "10px", fontWeight: "bold"}}>Total: ₹{newPurchase.items.reduce((a, b)=>a+b.amount, 0)}</div>
             </div>
           )}

           <div style={{display:"flex", gap:"10px"}}>
             <div style={{flex: 1}}>
               <label style={labelStyle}>Payment Status</label>
               <select style={inputStyle} value={newPurchase.paymentStatus} onChange={e=>setNewPurchase({...newPurchase, paymentStatus: e.target.value})}>
                 <option value="Paid">Paid</option>
                 <option value="Pending">Pending</option>
               </select>
             </div>
             <div style={{flex: 1}}>
               <label style={labelStyle}>Method</label>
               <select style={inputStyle} value={newPurchase.paymentMethod} onChange={e=>setNewPurchase({...newPurchase, paymentMethod: e.target.value})}>
                 <option value="Cash">Cash</option>
                 <option value="Bank Transfer">Bank Transfer</option>
                 <option value="UPI">UPI</option>
               </select>
             </div>
           </div>
           
           <button style={saveBtnBig} onClick={handleCreatePurchase}>Complete Purchase</button>
        </Modal>
      )}

      {showInvoiceModal && selectedInvoice && (
        <Modal title="Invoice Preview" onClose={() => setShowInvoiceModal(false)}>
          <div id="invoice-print-area" style={{padding: "20px", border: "1px solid #000", background: "#fff", marginBottom: "15px", fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#000"}}>
            
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
            
            <div style={{textAlign: "center", marginTop: "10px", fontSize: "10px", color: "#666"}}>
              This is a Computer Generated Invoice
            </div>
          </div>
          
          <button style={{...saveBtnBig, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}} onClick={() => window.print()}>
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
           <button style={saveBtnBig} onClick={handleCreateBuyer}>Save Buyer Record</button>
        </Modal>
      )}

      {showSupplierModal && (
        <Modal title="Manage Seller (Supplier)" onClose={() => setShowSupplierModal(false)}>
           <Input placeholder="Supplier Name" value={newSupplier.name} onChange={v => setNewSupplier({...newSupplier, name: v})} />
           <Input placeholder="Contact Number" value={newSupplier.contact} onChange={v => setNewSupplier({...newSupplier, contact: v})} />
           <Input placeholder="Full Address" value={newSupplier.address} onChange={v => setNewSupplier({...newSupplier, address: v})} />
           <Input placeholder="GSTIN" value={newSupplier.gstin} onChange={v => setNewSupplier({...newSupplier, gstin: v})} />
           <select style={inputStyle} value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}>
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
           </select>
           <button style={saveBtnBig} onClick={handleCreateSupplier}>Save Seller Record</button>
        </Modal>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div style={bottomNavStyle} className="mobile-only">
        <BottomLink icon={<FaInfoCircle size={22}/>} text="Home" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <BottomLink icon={<FaTruck size={22}/>} text="Pickups" active={activeTab === "pickups"} onClick={() => setActiveTab("pickups")} />
        <BottomLink icon={<FaWallet size={22}/>} text="Wallet" active={activeTab === "wallet"} onClick={() => {setActiveTab("wallet"); fetchAllTransactions();}} />
        <BottomLink icon={<FaBars size={22}/>} text="Menu" active={false} onClick={() => setIsMobileMenuOpen(true)} />
      </div>

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
  <div style={{ ...bottomLinkStyle, color: active ? "#0b8f3a" : "#666" }} onClick={onClick}>
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
  <button style={actionBtn} onClick={onClick} className="premium-card">
    <div style={{width:"30px", height:"30px", borderRadius:"8px", background:"#eef8f1", display:"flex", justifyContent:"center", alignItems:"center"}}>{icon}</div>
    <span>{text}</span>
  </button>
);

const Input = ({ placeholder, value, onChange, type = "text" }) => (
  <input type={type} style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
);

const StatusBadge = ({ status }) => {
  const colors = { Pending: "#f39c12", Assigned: "#007bff", Completed: "#28a745" };
  return <span style={{ background: colors[status]+"20", color: colors[status], padding: "4px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "bold"}}>{status}</span>;
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
const box = { background: "var(--card-bg)", padding: "25px", borderRadius: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", marginBottom: "25px", width: "100%" };
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
const notifRow = { padding: "10px 0", borderBottom: "1px solid #f8f9fc", fontSize: "12px", color: "#555" };

const loaderStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-main)" };
const mobileSidebar = { width: "260px", height: "100%", background: "#0b8f3a", padding: "30px 20px", color: "#fff", overflowY: "auto" };
const mobileMenuOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 3000 };

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

export default AdminDashboard;
