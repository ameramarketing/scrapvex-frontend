import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle, FaPhoneAlt, FaMapMarkerAlt, FaEdit, FaSave, FaTimes,
  FaSignOutAlt, FaEnvelope, FaSpinner, FaLock, FaArrowLeft,
  FaHome, FaHistory, FaPlusCircle, FaWallet, FaUser, FaCamera
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import API from "../services/api";
import { eraseCookie } from "../utils/cookies";

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab] = useState("profile");
  
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const baseURL = (API.defaults.baseURL || "").replace(/\/api$/, "") || "https://scrapvex-backend.onrender.com";
  const [user, setUser] = useState({
    name: storedUser.name || "Scrapvex User",
    mobile: storedUser.mobile || "",
    email: storedUser.email || "",
    address: storedUser.address || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(storedUser.profilePhoto ? `${baseURL}${storedUser.profilePhoto}` : null);
  
  const fileInputRef = React.useRef(null);

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async () => {
    if (!user.name.trim()) return showToast("error", "Name is required");
    if (user.newPassword && user.newPassword !== user.confirmPassword) {
      return showToast("error", "New passwords do not match");
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("address", user.address);
      if (user.oldPassword) formData.append("oldPassword", user.oldPassword);
      if (user.newPassword) formData.append("newPassword", user.newPassword);
      if (photoFile) formData.append("profilePhoto", photoFile);

      const { data } = await API.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        const updatedUser = { ...storedUser, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(prev => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
        setEditMode(false);
        showToast("success", "Profile updated successfully! ✨");
      }
    } catch (e) {
      showToast("error", e.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    eraseCookie("token");
    eraseCookie("user");
    eraseCookie("role");
    showToast("success", "Logged Out Successfully");
    setTimeout(() => navigate("/login"), 700);
  };

  return (
    <div style={pageContainer}>
      <Navbar />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      <style>{`
        .profile-input { transition: 0.3s; width: 100%; box-sizing: border-box; }
        .profile-input:focus { border-color: #0b8f3a !important; box-shadow: 0 0 0 4px rgba(11, 143, 58, 0.1); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        @media (max-width: 768px) { 
          .desktop-only { display: none !important; }
          .main-content { padding: 10px 10px 100px 10px !important; }
          .layout-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
          .profile-card { padding: 25px 15px !important; border-radius: 20px !important; }
          .profile-header { flex-direction: column !important; text-align: center; gap: 15px !important; }
          .action-row { flex-direction: column; }
          .header-section { padding: 30px 0 60px 0 !important; }
          .greeting-text { fontSize: 22px !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={headerSection} className="header-section">
         <div className="container">
            <div style={greetingBox}>
               <div>
                  <h1 style={greetingText} className="greeting-text">My Profile</h1>
                  <p style={subGreeting}>Manage your account and preferences</p>
               </div>
               <div style={headerIcons}>
                  <div style={iconBtn} onClick={() => navigate("/dashboard")}><FaHome /></div>
               </div>
            </div>
         </div>
      </div>

      <div className="container" style={{ marginTop: "-40px" }}>
        <div style={layoutGrid} className="layout-grid">
          {/* DESKTOP SIDEBAR */}
          <div style={sidebar} className="desktop-only">
             <div style={sidebarProfile}>
                <div style={bigAvatar}><FaUserCircle color="var(--primary)"/></div>
                <h3 style={{margin:"10px 0 5px 0", color: "var(--text-main)"}}>{user.name}</h3>
                <p style={{color:"var(--text-muted)", fontSize:"13px"}}>{user.mobile}</p>
             </div>
             <div style={sideNav}>
                <SideLink icon={<FaHome/>} text="Dashboard" onClick={() => navigate("/dashboard")} />
                <SideLink icon={<FaPlusCircle/>} text="Book Pickup" onClick={() => navigate("/book")} />
                <SideLink icon={<FaHistory/>} text="My Pickups" onClick={() => navigate("/my-pickups")} />
                <SideLink icon={<FaWallet/>} text="Rates" onClick={() => navigate("/rates")} />
                <SideLink active icon={<FaUser/>} text="Profile" onClick={() => navigate("/profile")} />
                <button style={logoutBtnSide} onClick={logout}><FaSignOutAlt/> Logout</button>
             </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={mainContent} className="main-content">
             <div style={profileCard} className="profile-card">
                <div style={profileHeader} className="profile-header">
                   <div style={avatarWrapper}>
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary)" }} />
                      ) : (
                        <FaUserCircle size={100} color="var(--primary)" />
                      )}
                      {editMode && (
                        <div 
                          style={{...cameraBtn, background: "var(--primary)", border: "3px solid var(--card-bg)"}}
                          onClick={() => fileInputRef.current.click()}
                        >
                           <FaCamera size={14} />
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handlePhotoChange} />
                   </div>
                   <div style={headerInfo}>
                      <h2 style={{margin:0, color: "var(--text-main)"}}>{user.name}</h2>
                   </div>
                   {!editMode && (
                     <button style={editBtnTop} onClick={() => setEditMode(true)}>
                        <FaEdit /> Edit
                     </button>
                   )}
                </div>

                <div style={formGrid}>
                   <div style={inputGroup}>
                      <label style={label}><FaUserCircle /> Full Name</label>
                      <input 
                        className="profile-input"
                        style={editMode ? activeInput : {...disabledInput, background: "var(--bg-main)", color: "var(--text-muted)"}} 
                        name="name" 
                        value={user.name} 
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                   </div>

                   <div style={inputGroup}>
                      <label style={label}><FaPhoneAlt /> Mobile Number</label>
                      <input 
                        style={{...disabledInput, background: "var(--bg-main)", color: "var(--text-muted)"}} 
                        value={user.mobile} 
                        disabled 
                      />
                   </div>

                   <div style={inputGroup}>
                      <label style={label}><FaEnvelope /> Email Address</label>
                      <input 
                        className="profile-input"
                        style={editMode ? activeInput : {...disabledInput, background: "var(--bg-main)", color: "var(--text-muted)"}} 
                        name="email" 
                        value={user.email} 
                        placeholder="your@email.com"
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                   </div>

                   <div style={inputGroup}>
                      <label style={label}><FaMapMarkerAlt /> Primary Address</label>
                      <textarea 
                        className="profile-input"
                        style={editMode ? { ...activeInput, height: "100px", resize: "none" } : { ...disabledInput, height: "100px", resize: "none", background: "var(--bg-main)", color: "var(--text-muted)" }} 
                        name="address" 
                        value={user.address} 
                        placeholder="Your full address here..."
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                   </div>

                   {editMode && (
                     <>
                       <h4 style={{ margin: "10px 0 0 0", color: "var(--text-main)" }}>Change Password (Optional)</h4>
                       <div style={inputGroup}>
                          <label style={label}><FaLock /> Old Password</label>
                          <input type="password" name="oldPassword" value={user.oldPassword} onChange={handleChange} className="profile-input" style={activeInput} placeholder="Enter current password" />
                       </div>
                       <div style={inputGroup}>
                          <label style={label}><FaLock /> New Password</label>
                          <input type="password" name="newPassword" value={user.newPassword} onChange={handleChange} className="profile-input" style={activeInput} placeholder="Enter new password" />
                       </div>
                       <div style={inputGroup}>
                          <label style={label}><FaLock /> Confirm New Password</label>
                          <input type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} className="profile-input" style={activeInput} placeholder="Confirm new password" />
                       </div>
                     </>
                   )}
                </div>

                {editMode && (
                   <div style={actionRow} className="action-row">
                      <button style={saveBtn} onClick={saveProfile}>
                         {loading ? <FaSpinner className="spin" /> : <><FaSave /> Save Changes</>}
                      </button>
                      <button style={cancelBtn} onClick={() => { setEditMode(false); setUser(storedUser); }}>
                         <FaTimes /> Cancel
                      </button>
                   </div>
                )}
             </div>

             {/* STATS PREVIEW */}
             <div style={infoBox}>
                <FaLock style={{color:"var(--primary)", fontSize:"20px"}} />
                <div>
                   <h4 style={{margin:0, fontSize:"14px", color: "var(--text-main)"}}>Security & Privacy</h4>
                   <p style={{margin:"4px 0 0 0", fontSize:"12px", color:"var(--text-muted)"}}>Your data is encrypted and secure with Scrapvex.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION (MOBILE) */}
      <div style={bottomNav} className="mobile-only">
         <BottomLink icon={<FaHome/>} text="Home" onClick={() => navigate("/dashboard")} />
         <BottomLink icon={<FaPlusCircle/>} text="Book" onClick={() => navigate("/book")} />
         <BottomLink icon={<FaHistory/>} text="History" onClick={() => navigate("/my-pickups")} />
         <BottomLink active icon={<FaUser/>} text="Profile" onClick={() => navigate("/profile")} />
      </div>

      <Footer />
    </div>
  );
}

/* SUB-COMPONENTS */
const SideLink = ({ icon, text, onClick, active }) => (
  <div style={{ ...sideLinkStyle, background: active ? "var(--primary-light)" : "transparent", color: active ? "var(--primary)" : "var(--text-main)" }} onClick={onClick}>
     {icon} <span>{text}</span>
  </div>
);

const BottomLink = ({ icon, text, onClick, active }) => (
  <div style={{ ...bottomLinkStyle, color: active ? "var(--primary)" : "var(--text-muted)" }} onClick={onClick}>
     {icon} <span style={{fontSize:"10px", marginTop:"2px"}}>{text}</span>
  </div>
);

/* STYLES */
const pageContainer = { background: "var(--bg-main)", minHeight: "100vh" };
const headerSection = { background: "var(--primary)", padding: "40px 0 80px 0", color: "#fff" };
const greetingBox = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const greetingText = { margin: 0, fontSize: "28px", fontWeight: "800" };
const subGreeting = { margin: "5px 0 0 0", opacity: 0.8, fontSize: "14px" };
const headerIcons = { display: "flex", gap: "15px" };
const iconBtn = { width: "45px", height: "45px", borderRadius: "15px", background: "rgba(255,255,255,0.15)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", fontSize: "18px" };

const layoutGrid = { display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px", marginBottom: "50px" };
const sidebar = { background: "var(--card-bg)", padding: "30px", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", height: "fit-content", border: "1px solid var(--glass-border)" };
const sidebarProfile = { textAlign: "center", marginBottom: "30px" };
const bigAvatar = { fontSize: "80px", color: "#0b8f3a" };
const sideNav = { display: "flex", flexDirection: "column", gap: "5px" };
const sideLinkStyle = { display: "flex", alignItems: "center", gap: "15px", padding: "14px 20px", borderRadius: "15px", cursor: "pointer", fontWeight: "600", transition: "0.3s" };
const logoutBtnSide = { ...sideLinkStyle, marginTop: "20px", color: "#e74c3c", border: "none", background: "transparent", width: "100%" };

const mainContent = { display: "flex", flexDirection: "column", gap: "25px" };
const profileCard = { background: "var(--card-bg)", padding: "40px", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid var(--glass-border)" };
const profileHeader = { display: "flex", alignItems: "center", gap: "25px", marginBottom: "40px", position: "relative" };
const avatarWrapper = { position: "relative" };
const cameraBtn = { position: "absolute", bottom: "5px", right: "5px", width: "30px", height: "30px", background: "#0b8f3a", color: "#fff", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", border: "3px solid #fff", cursor: "pointer" };
const headerInfo = { flex: 1 };
const roleBadge = { background: "var(--primary-light)", color: "var(--primary)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", marginTop: "5px", display: "inline-block" };
const editBtnTop = { background: "var(--bg-main)", border: "1px solid var(--glass-border)", padding: "8px 18px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" };

const formGrid = { display: "flex", flexDirection: "column", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const label = { fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" };
const activeInput = { padding: "14px", borderRadius: "15px", border: "1.5px solid var(--glass-border)", fontSize: "14px", outline: "none", background: "var(--card-bg)", color: "var(--text-main)" };
const disabledInput = { padding: "14px", borderRadius: "15px", border: "1.5px solid var(--glass-border)", fontSize: "14px", background: "var(--bg-main)", color: "var(--text-muted)" };

const actionRow = { display: "flex", gap: "15px", marginTop: "30px" };
const saveBtn = { flex: 2, padding: "15px", borderRadius: "15px", border: "none", background: "var(--primary)", color: "#fff", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };
const cancelBtn = { flex: 1, padding: "15px", borderRadius: "15px", border: "1px solid var(--glass-border)", background: "var(--card-bg)", color: "var(--text-muted)", fontWeight: "bold", cursor: "pointer" };

const infoBox = { padding: "20px", background: "var(--card-bg)", borderRadius: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", border: "1px solid var(--glass-border)" };
const bottomNav = { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card-bg)", display: "flex", justifyContent: "space-around", padding: "12px 10px 25px 10px", boxShadow: "0 -5px 25px rgba(0,0,0,0.05)", zIndex: 1500, borderTop: "1px solid var(--glass-border)" };
const bottomLinkStyle = { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" };

export default Profile;