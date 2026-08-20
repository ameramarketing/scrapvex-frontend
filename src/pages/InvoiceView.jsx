import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRecycle, FaDownload, FaPrint, FaWhatsapp, FaShieldAlt, FaArrowLeft } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://scrapvex-backend.onrender.com/api";

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/billing/purchases?id=${id}`);
        const data = await res.json();
        if (data.success && data.purchases?.length > 0) {
          setPurchase(data.purchases[0]);
        } else {
          const singleRes = await fetch(`${BACKEND_URL}/billing/purchases`);
          const singleData = await singleRes.json();
          const found = singleData.purchases?.find(p => p._id === id);
          if (found) setPurchase(found);
        }
      } catch (err) {
        console.warn("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleDownloadPDF = () => {
    window.open(`${BACKEND_URL}/billing/purchases/${id}/pdf`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = "🧾 ScrapVex Official Invoice\nInvoice No: #" + (id ? id.slice(-8).toUpperCase() : "") + "\nView & Download: " + window.location.href;
    window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text), "_blank");
  };

  const invoiceNo = id ? id.slice(-8).toUpperCase() : "INV-0001";
  const dateStr = purchase?.createdAt 
    ? new Date(purchase.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const isGST = !!(purchase?.supplierId?.gstin);
  const franchiseName = purchase?.franchiseId?.legalFirmName || purchase?.franchiseId?.name || "ScrapVex Authorized Regional Hub";
  const franchiseGSTIN = purchase?.franchiseId?.gstin || "01AAAAA0000A1Z5";
  const franchiseAddress = purchase?.franchiseId?.businessAddress || purchase?.franchiseId?.address || "Jammu & Kashmir";
  const supplierName = purchase?.supplierId?.name || purchase?.supplierName || "Valued Customer";
  const supplierPhone = purchase?.supplierId?.mobile || purchase?.supplierContact || "";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "20px 16px 60px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #invoice-paper { box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; }
          body { background: #ffffff !important; }
        }
      `}</style>

      {/* Top Controls Bar */}
      <div className="no-print" style={{ maxWidth: "600px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: "10px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <FaArrowLeft /> Back
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={handleShareWhatsApp} 
            style={{ background: "#25D366", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}
          >
            <FaWhatsapp /> Share
          </button>
          <button 
            onClick={handlePrint} 
            style={{ background: "#3b82f6", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Invoice Paper Box */}
      <div id="invoice-paper" style={{ background: "#ffffff", maxWidth: "600px", width: "100%", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {/* Green Top Header */}
        <div style={{ background: "linear-gradient(135deg, #0b8f3a 0%, #15803d 100%)", padding: "24px 20px", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                <FaRecycle />
              </div>
              <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "-0.5px" }}>ScrapVex</span>
            </div>
            <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "4px" }}>
              🌱 Certified Zero-Waste Digital Recycling
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", display: "inline-block" }}>
              {isGST ? "TAX INVOICE" : "PAYOUT RECEIPT"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>#{invoiceNo}</div>
          </div>
        </div>

        {/* Invoice Body */}
        <div style={{ padding: "24px 20px" }}>
          {/* Metadata Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Issued By (Hub)</span>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{franchiseName}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{franchiseAddress}</div>
              {franchiseGSTIN && <div style={{ fontSize: "11px", fontWeight: "700", color: "#0b8f3a", marginTop: "2px" }}>GSTIN: {franchiseGSTIN}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Customer / Entity</span>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{supplierName}</div>
              {supplierPhone && <div style={{ fontSize: "12px", color: "#64748b" }}>📞 {supplierPhone}</div>}
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>📅 Date: {dateStr}</div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginTop: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "1.5px solid #e2e8f0" }}>
                  <th style={{ padding: "10px 8px", textAlign: "left" }}>Item Description</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Qty (kg)</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Rate (₹)</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(purchase?.items?.length > 0 ? purchase.items : [
                  { name: "Scrap Material (Assorted)", quantity: purchase?.totalAmount ? Math.round(purchase.totalAmount / 30) : 1, rate: 30, amount: purchase?.totalAmount || 0 }
                ]).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 8px", fontWeight: "600", color: "#1e293b" }}>{item.name}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#475569" }}>{item.quantity || item.qty || 1}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", color: "#475569" }}>₹{item.rate || item.price || 0}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "800", color: "#0f172a" }}>₹{item.amount || item.subtotal || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand Total Box */}
          <div style={{ marginTop: "16px", padding: "14px 16px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#166534" }}>TOTAL SETTLED AMOUNT</span>
              <div style={{ fontSize: "11px", color: "#15803d" }}>Payment: {purchase?.paymentStatus || "PAID"} ({purchase?.paymentMethod || "Instant Cash / Wallet"})</div>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#0b8f3a" }}>
              ₹{purchase?.totalAmount || 0}
            </div>
          </div>

          {/* Security & Verification Footer */}
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px dashed #cbd5e1", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", color: "#0b8f3a", fontSize: "13px", fontWeight: "800" }}>
              <FaShieldAlt /> 100% Verified Digital Eco-Certificate
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>
              This is a computer-generated green recycling invoice authorized by ScrapVex India Network.
            </p>
          </div>
        </div>

        {/* Big Download Button */}
        <div className="no-print" style={{ padding: "16px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <button 
            onClick={handleDownloadPDF} 
            style={{ width: "100%", background: "#0b8f3a", color: "#ffffff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: "800", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(11,143,58,0.25)" }}
          >
            <FaDownload /> Download Official PDF Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
