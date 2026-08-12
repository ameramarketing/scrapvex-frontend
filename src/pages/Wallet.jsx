import React, { useState, useEffect } from "react";
import { FaWallet, FaArrowUp, FaArrowDown, FaMobileAlt, FaUniversity, FaHistory, FaCheckCircle, FaClock, FaExclamationTriangle, FaRecycle } from "react-icons/fa";
import API from "../services/api";
import Toast from "../components/Toast";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history"); // history, recharge, withdraw
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [withdrawOtpSent, setWithdrawOtpSent] = useState(false);
  const [withdrawOtp, setWithdrawOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  // Form states
  const [rechargeForm, setRechargeForm] = useState({ mobile: "", operator: "", amount: "" });
  const [withdrawForm, setWithdrawForm] = useState({ upi: "", name: "", amount: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  const fetchData = async () => {
    try {
      const { data } = await API.get("/wallet/info");
      if (data.success) {
        setBalance(data.balance);
        setPendingBalance(data.pendingBalance);
        setTransactions(data.transactions);
      }
    } catch (error) {
      showToast("error", "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (balance < Number(rechargeForm.amount)) return showToast("error", "Insufficient balance");
    setSubmitting(true);
    try {
      const { data } = await API.post("/wallet/recharge", rechargeForm);
      if (data.success) {
        showToast("success", "Recharge successful! 🎉");
        setRechargeForm({ mobile: "", operator: "", amount: "" });
        fetchData();
        setActiveTab("history");
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "Recharge failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWithdrawalOTP = async (e) => {
    e.preventDefault();
    if (balance < Number(withdrawForm.amount)) return showToast("error", "Insufficient balance");
    if (Number(withdrawForm.amount) < 100) return showToast("error", "Min withdrawal ₹100");
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
    if (!withdrawOtp || withdrawOtp.length !== 6) return showToast("error", "Please enter the 6-digit security OTP");
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
        setActiveTab("history");
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

  if (loading) return (
    <div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"80vh"}}>
      <FaRecycle className="spin" size={40} color="#0b8f3a" />
    </div>
  );

  return (
    <div className="fade-in" style={container}>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({...toast, show: false})} />
      
      {/* WALLET HEADER */}
      <div style={walletCard}>
        <div style={cardTop}>
          <div>
            <span style={label}>Total Available Balance</span>
            <h1 style={balanceText}>₹{balance.toFixed(2)}</h1>
          </div>
          <div style={iconCircle}>
            <FaWallet size={24} color="#0b8f3a" />
          </div>
        </div>
        
        {pendingBalance > 0 && (
          <div style={pendingSection}>
             <FaClock size={12} />
             <span>Pending: ₹{pendingBalance.toFixed(2)} (Locked until pickup completion)</span>
          </div>
        )}

        <div style={actionButtons}>
           <button style={{...actionBtn, background: activeTab==="recharge"?"var(--card-bg)":"rgba(255,255,255,0.2)", color: activeTab==="recharge"?"var(--primary)":"#fff"}} onClick={()=>setActiveTab("recharge")}>
             <FaMobileAlt /> Recharge
           </button>
           <button style={{...actionBtn, background: activeTab==="withdraw"?"var(--card-bg)":"rgba(255,255,255,0.2)", color: activeTab==="withdraw"?"var(--primary)":"#fff"}} onClick={()=>setActiveTab("withdraw")}>
             <FaUniversity /> Withdraw
           </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={contentBox}>
        <div style={tabHeader}>
           <h3 onClick={()=>setActiveTab("history")} style={{...tabTitle, color: activeTab==="history"?"var(--primary)":"var(--text-muted)", borderBottom: activeTab==="history"?"3px solid var(--primary)":"none"}}>
             <FaHistory /> Transactions
           </h3>
        </div>

        {activeTab === "history" && (
          <div className="fade-up">
            {transactions.length === 0 ? (
              <div style={emptyState}>No transactions yet</div>
            ) : (
              transactions.map(tx => (
                 <div key={tx._id} style={{...txRow, borderBottom: "1px solid var(--glass-border)"}}>
                   <div style={{...txIcon, background: tx.type==="credit"?"var(--primary-light)":"rgba(231, 76, 60, 0.1)"}}>
                    {tx.type === "credit" ? <FaArrowUp color="#0b8f3a" /> : <FaArrowDown color="#e74c3c" />}
                  </div>
                   <div style={{flex:1}}>
                     <div style={{...txTitle, color: "var(--text-main)"}}>{tx.description}</div>
                     <div style={{...txDate, color: "var(--text-muted)"}}>{new Date(tx.createdAt).toLocaleString()}</div>
                   </div>
                  <div style={{textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px"}}>
                      <div style={{...txAmount, color: tx.type==="credit"?"var(--primary)":"#e74c3c"}}>
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
                        <div style={{...txStatus, color: tx.status==="completed"?"var(--primary)":tx.status==="pending"?"#f39c12":"#e74c3c"}}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </div>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "recharge" && (
           <form onSubmit={handleRecharge} className="fade-up" style={formStyle}>
             <h4 style={{marginBottom:"15px", color: "var(--text-main)"}}>Mobile Recharge</h4>
             <div style={{...inputGroup, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
               <FaMobileAlt style={{...inputIcon, color: "var(--primary)"}} />
               <input type="text" placeholder="Mobile Number" required value={rechargeForm.mobile} onChange={e=>setRechargeForm({...rechargeForm, mobile: e.target.value.replace(/\D/g,"").slice(0,10)})} style={{...input, color: "var(--text-main)"}} />
             </div>
             <div style={{...inputGroup, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
               <FaUniversity style={{...inputIcon, color: "var(--primary)"}} />
               <select required value={rechargeForm.operator} onChange={e=>setRechargeForm({...rechargeForm, operator: e.target.value})} style={{...input, color: "var(--text-main)"}}>
                 <option value="">Select Operator</option>
                 <option value="Jio">Jio</option>
                 <option value="Airtel">Airtel</option>
                 <option value="Vi">Vi</option>
                 <option value="BSNL">BSNL</option>
               </select>
             </div>
             <div style={{...inputGroup, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
               <span style={{...inputIcon, color: "var(--primary)"}}>₹</span>
               <input type="number" placeholder="Amount" required value={rechargeForm.amount} onChange={e=>setRechargeForm({...rechargeForm, amount: e.target.value})} style={{...input, color: "var(--text-main)"}} />
             </div>
            <button type="submit" className="btn-premium" disabled={submitting} style={{width:"100%"}}>
              {submitting ? <FaRecycle className="spin" /> : `Recharge Now`}
            </button>
          </form>
        )}

        {activeTab === "withdraw" && (
           <form onSubmit={withdrawOtpSent ? handleWithdraw : handleSendWithdrawalOTP} className="fade-up" style={formStyle}>
             <h4 style={{marginBottom:"15px", color: "var(--text-main)"}}>Withdraw to UPI</h4>
             {!withdrawOtpSent ? (
               <>
                 <div style={{...inputGroup, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
                   <FaUniversity style={{...inputIcon, color: "var(--primary)"}} />
                   <input type="text" placeholder="UPI ID (e.g. user@okaxis)" required value={withdrawForm.upi} onChange={e=>setWithdrawForm({...withdrawForm, upi: e.target.value})} style={{...input, color: "var(--text-main)"}} />
                 </div>
                 <div style={{...inputGroup, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
                   <FaUniversity style={{...inputIcon, color: "var(--primary)"}} />
                   <input type="text" placeholder="Account Holder Name" required value={withdrawForm.name} onChange={e=>setWithdrawForm({...withdrawForm, name: e.target.value})} style={{...input, color: "var(--text-main)"}} />
                 </div>
                 <div style={{...inputGroup, background: "var(--bg-main)", border: "1px solid var(--glass-border)"}}>
                   <span style={{...inputIcon, color: "var(--primary)"}}>₹</span>
                   <input type="number" placeholder="Amount (Min ₹100)" required value={withdrawForm.amount} onChange={e=>setWithdrawForm({...withdrawForm, amount: e.target.value})} style={{...input, color: "var(--text-main)"}} />
                 </div>
                 
                 <div style={{ background: "rgba(11, 143, 58, 0.05)", borderLeft: "3px solid var(--primary)", padding: "12px", borderRadius: "12px", fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", marginBottom: "15px" }}>
                   <strong>🔒 Withdrawal Protection:</strong> A verification OTP will be sent to your registered mobile to ensure only you can withdraw funds.
                 </div>

                 <button type="submit" className="btn-premium" disabled={submitting} style={{width:"100%"}}>
                   {submitting ? <FaRecycle className="spin" /> : "Verify & Send Security OTP"}
                 </button>
               </>
             ) : (
               <>
                 <div style={{ background: "var(--bg-main)", padding: "15px", borderRadius: "12px", border: "1px solid var(--glass-border)", fontSize: "13px", marginBottom: "15px" }}>
                   <div style={{ marginBottom: "5px", color: "var(--text-muted)" }}>Confirming UPI Transfer:</div>
                   <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--primary)", marginBottom: "5px" }}>₹{withdrawForm.amount}</div>
                   <div style={{ color: "var(--text-main)" }}><strong>UPI ID:</strong> {withdrawForm.upi}</div>
                   <div style={{ color: "var(--text-main)", marginTop: "3px" }}><strong>Holder:</strong> {withdrawForm.name}</div>
                 </div>

                 <div style={{...inputGroup, background: "var(--bg-main)", border: "2px solid var(--primary)"}}>
                   <FaLock style={{...inputIcon, color: "var(--primary)"}} />
                   <input 
                     type="text" 
                     maxLength={6}
                     placeholder="Enter 6-Digit OTP" 
                     required 
                     value={withdrawOtp} 
                     onChange={e=>setWithdrawOtp(e.target.value.replace(/\D/g,"").slice(0, 6))} 
                     style={{...input, color: "var(--text-main)", fontWeight: "bold", textAlign: "center", letterSpacing: "4px"}} 
                   />
                 </div>

                 <button type="submit" className="btn-premium" disabled={submitting} style={{width:"100%"}}>
                   {submitting ? <FaRecycle className="spin" /> : "Confirm & Withdraw Funds"}
                 </button>

                 <button 
                   type="button"
                   style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", marginTop: "10px", width: "100%", textAlign: "center" }} 
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
  );
}

const container = { maxWidth: "600px", margin: "20px auto", padding: "0 15px" };
const walletCard = { background: "linear-gradient(135deg, #0b8f3a 0%, #15b34d 100%)", borderRadius: "24px", padding: "25px", color: "#fff", boxShadow: "0 10px 30px rgba(11,143,58,0.3)", marginBottom: "30px", position: "relative", overflow: "hidden" };
const cardTop = { display: "flex", justifyContent: "space-between", alignItems: "flex-start" };
const label = { fontSize: "14px", opacity: 0.8, fontWeight: "500" };
const balanceText = { fontSize: "36px", fontWeight: "800", margin: "10px 0" };
const iconCircle = { background: "rgba(255,255,255,0.9)", width: "50px", height: "50px", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center" };
const pendingSection = { background: "rgba(255,255,255,0.15)", padding: "8px 15px", borderRadius: "10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", marginTop: "15px" };
const actionButtons = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "25px" };
const actionBtn = { border: "none", padding: "12px", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "0.3s" };
const contentBox = { background: "var(--card-bg)", borderRadius: "24px", padding: "25px", boxShadow: "0 5px 20px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const tabHeader = { display: "flex", gap: "20px", borderBottom: "1px solid #eee", marginBottom: "20px" };
const tabTitle = { paddingBottom: "10px", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "0.3s" };
const txRow = { display: "flex", alignItems: "center", gap: "15px", padding: "15px 0", borderBottom: "1px solid #f9f9f9" };
const txIcon = { width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" };
const txTitle = { fontWeight: "600", fontSize: "15px", color: "var(--text-main)" };
const txDate = { fontSize: "12px", color: "#999" };
const txAmount = { fontWeight: "bold", fontSize: "16px" };
const txStatus = { fontSize: "11px", fontWeight: "600" };
const emptyState = { textAlign: "center", padding: "40px 0", color: "#999" };
const formStyle = { padding: "10px 0" };
const inputGroup = { display: "flex", alignItems: "center", gap: "12px", background: "#f8f9fa", padding: "12px 15px", borderRadius: "12px", marginBottom: "15px", border: "1px solid #eee" };
const inputIcon = { color: "#0b8f3a", width: "20px" };
const input = { border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "15px", fontWeight: "500" };

export default Wallet;
