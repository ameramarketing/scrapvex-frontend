import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserCircle, FaPhoneAlt, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, 
  FaSignOutAlt, FaEnvelope, FaLock, FaArrowLeft, FaHome, FaHistory, 
  FaWallet, FaUser, FaCamera, FaRecycle, FaBell, FaInfoCircle, FaPhone, FaChevronRight, FaShieldAlt 
} from "react-icons/fa";

import Footer from "../components/Footer";
import Toast from "../components/Toast";
import API from "../services/api";
import { performLogout } from "../utils/auth";
import { isMobileEnvironment } from "../platform/platform";

function Profile() {
  const navigate = useNavigate();
  const isMobile = isMobileEnvironment();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
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
      formData.append("email", user.email);
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

  const logout = async () => {
    await performLogout();
    showToast("success", "Logged Out Successfully");
    setTimeout(() => navigate("/login"), 700);
  };

  // ────────────────────────────────────────────────────────
  // MOBILE / NATIVE LAYOUT
  // ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "40px" }}>
        <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

        <style>{`
          .mobile-settings-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            background: #ffffff;
            border-bottom: 1px solid #f1f5f9;
            cursor: pointer;
            transition: background 0.2s;
          }
          .mobile-settings-row:active {
            background: #f8fafc;
          }
          .settings-icon-box {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          }
          .settings-input {
            width: 100%;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1.5px solid #e2e8f0;
            outline: none;
            background: #f8fafc;
            font-size: 14px;
            color: #0f172a;
            font-weight: 500;
            box-sizing: border-box;
          }
          .settings-input:focus {
            border-color: #0b8f3a;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(11,143,58,0.1);
          }
        `}</style>

        {/* MOBILE HEADER */}
        <div style={{ padding: "20px 16px 10px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
          {editMode && (
            <button 
              onClick={() => setEditMode(false)} 
              style={{ background: "none", border: "none", color: "#0f172a", fontSize: "16px", padding: "4px", display: "flex", alignItems: "center" }}
            >
              <FaArrowLeft />
            </button>
          )}
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              {editMode ? "Edit Profile" : "Account"}
            </h1>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
              {editMode ? "Update details and security preferences" : "Manage settings & details"}
            </p>
          </div>
        </div>

        {/* EDIT PROFILE MODE */}
        {editMode ? (
          <div className="container" style={{ padding: "0 16px" }}>
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "20px", border: "1px solid rgba(15,23,42,0.06)", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
              {/* Photo Area */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ position: "relative", width: "80px", height: "80px" }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid #0b8f3a" }} />
                  ) : (
                    <FaUserCircle size={80} color="#cbd5e1" />
                  )}
                  <div 
                    style={{ position: "absolute", bottom: 0, right: 0, background: "#0b8f3a", border: "2px solid #ffffff", color: "#ffffff", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyBox: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px" }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaCamera />
                  </div>
                  <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handlePhotoChange} />
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px" }}>FULL NAME</label>
                  <input className="settings-input" name="name" value={user.name} onChange={handleChange} />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px" }}>MOBILE NUMBER</label>
                  <input className="settings-input" value={user.mobile} disabled style={{ color: "#94a3b8", cursor: "not-allowed" }} />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px" }}>EMAIL ADDRESS</label>
                  <input className="settings-input" name="email" value={user.email} onChange={handleChange} />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px" }}>PRIMARY ADDRESS</label>
                  <textarea className="settings-input" name="address" value={user.address} onChange={handleChange} style={{ height: "70px", resize: "none" }} />
                </div>

                {/* Password Fields */}
                <div style={{ height: "1px", background: "#f1f5f9", margin: "8px 0" }} />
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>Change Password (Optional)</span>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px" }}>CURRENT PASSWORD</label>
                  <input type="password" className="settings-input" name="oldPassword" value={user.oldPassword} onChange={handleChange} placeholder="••••••••" />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px" }}>NEW PASSWORD</label>
                  <input type="password" className="settings-input" name="newPassword" value={user.newPassword} onChange={handleChange} placeholder="••••••••" />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px" }}>CONFIRM NEW PASSWORD</label>
                  <input type="password" className="settings-input" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button 
                  className="btn-premium" 
                  style={{ flex: 1.2, height: "44px", border: "none", fontSize: "13px", fontWeight: "800" }} 
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? <FaRecycle className="spin" /> : <><FaSave /> Save Changes</>}
                </button>
                <button 
                  style={{ flex: 0.8, height: "44px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }} 
                  onClick={() => { setEditMode(false); setUser(storedUser); }}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* VIEW SETTINGS MENU LIST */
          <div className="container" style={{ padding: "0 16px" }}>
            
            {/* TOP PROFILE CARD */}
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "16px", border: "1px solid rgba(15,23,42,0.06)", boxShadow: "0 4px 12px rgba(0,0,0,0.01)", display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", background: "#f0fdf4", border: "2px solid #0b8f3a" }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <FaUserCircle size={60} color="#0b8f3a" style={{ transform: "scale(1.1)" }} />
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{user.name}</h2>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{user.mobile}</span>
                {user.email && <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{user.email}</span>}
              </div>
            </div>

            {/* GROUPED SECTIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* ACCOUNT SECTION */}
              <div>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", display: "block", marginBottom: "6px", paddingLeft: "4px", letterSpacing: "0.5px" }}>ACCOUNT</span>
                <div style={{ borderRadius: "14px", overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
                  <div className="mobile-settings-row" onClick={() => setEditMode(true)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="settings-icon-box" style={{ background: "#f0fdf4", color: "#0b8f3a" }}><FaEdit /></div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Edit Profile Details</span>
                    </div>
                    <FaChevronRight style={{ color: "#cbd5e1", fontSize: "10px" }} />
                  </div>
                </div>
              </div>

              {/* ACTIVITY SECTION */}
              <div>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", display: "block", marginBottom: "6px", paddingLeft: "4px", letterSpacing: "0.5px" }}>ACTIVITY</span>
                <div style={{ borderRadius: "14px", overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
                  <div className="mobile-settings-row" onClick={() => navigate("/my-pickups")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="settings-icon-box" style={{ background: "#eff6ff", color: "#2563eb" }}><FaHistory /></div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>My Pickup History</span>
                    </div>
                    <FaChevronRight style={{ color: "#cbd5e1", fontSize: "10px" }} />
                  </div>

                  <div className="mobile-settings-row" onClick={() => navigate("/wallet")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="settings-icon-box" style={{ background: "#fef3c7", color: "#d97706" }}><FaWallet /></div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>My Wallet & Payouts</span>
                    </div>
                    <FaChevronRight style={{ color: "#cbd5e1", fontSize: "10px" }} />
                  </div>
                </div>
              </div>

              {/* APP SECTION */}
              <div>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", display: "block", marginBottom: "6px", paddingLeft: "4px", letterSpacing: "0.5px" }}>APP & HELP</span>
                <div style={{ borderRadius: "14px", overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
                  <div className="mobile-settings-row" onClick={() => navigate("/notifications")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="settings-icon-box" style={{ background: "#f0fdf4", color: "#0b8f3a" }}><FaBell /></div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Notifications</span>
                    </div>
                    <FaChevronRight style={{ color: "#cbd5e1", fontSize: "10px" }} />
                  </div>

                  <div className="mobile-settings-row" onClick={() => navigate("/contact")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="settings-icon-box" style={{ background: "#eff6ff", color: "#2563eb" }}><FaPhone /></div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Help & Support</span>
                    </div>
                    <FaChevronRight style={{ color: "#cbd5e1", fontSize: "10px" }} />
                  </div>

                  <div className="mobile-settings-row" onClick={() => navigate("/about")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="settings-icon-box" style={{ background: "#f8fafc", color: "#64748b" }}><FaInfoCircle /></div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>About ScrapVex</span>
                    </div>
                    <FaChevronRight style={{ color: "#cbd5e1", fontSize: "10px" }} />
                  </div>

                  <div className="mobile-settings-row" onClick={() => navigate("/privacy")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="settings-icon-box" style={{ background: "#f0fdf4", color: "#0b8f3a" }}><FaShieldAlt /></div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Privacy Policy</span>
                    </div>
                    <FaChevronRight style={{ color: "#cbd5e1", fontSize: "10px" }} />
                  </div>
                </div>
              </div>

              {/* LOGOUT */}
              <button 
                onClick={logout} 
                style={{ width: "100%", border: "none", padding: "14px", borderRadius: "14px", background: "#fef2f2", color: "#dc2626", fontWeight: "800", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
              >
                <FaSignOutAlt /> Log Out Account
              </button>
            </div>

          </div>
        )}

      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // DESKTOP LAYOUT (100% Unmodified Safety)
  // ────────────────────────────────────────────────────────
  return (
    <div style={pageContainer}>
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
                <h3 style={{ margin: "10px 0 5px 0", color: "var(--text-main)" }}>{user.name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{user.mobile}</p>
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
                          style={{ ...cameraBtn, background: "var(--primary)", border: "3px solid var(--card-bg)" }}
                          onClick={() => fileInputRef.current.click()}
                        >
                           <FaCamera size={14} />
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handlePhotoChange} />
                   </div>
                   <div style={headerInfo}>
                      <h2 style={{ margin: 0, color: "var(--text-main)" }}>{user.name}</h2>
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
                        style={editMode ? activeInput : { ...disabledInput, background: "var(--bg-main)", color: "var(--text-muted)" }} 
                        name="name" 
                        value={user.name} 
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                   </div>

                   <div style={inputGroup}>
                      <label style={label}><FaPhoneAlt /> Mobile Number</label>
                      <input 
                        style={{ ...disabledInput, background: "var(--bg-main)", color: "var(--text-muted)" }} 
                        value={user.mobile} 
                        disabled 
                      />
                   </div>

                   <div style={inputGroup}>
                      <label style={label}><FaEnvelope /> Email Address</label>
                      <input 
                        className="profile-input"
                        style={editMode ? activeInput : { ...disabledInput, background: "var(--bg-main)", color: "var(--text-muted)" }} 
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
                         {loading ? <FaRecycle className="spin" /> : <><FaSave /> Save Changes</>}
                      </button>
                      <button style={cancelBtn} onClick={() => { setEditMode(false); setUser(storedUser); }}>
                         <FaTimes /> Cancel
                      </button>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* DESKTOP SIDEBAR LINK */
const SideLink = ({ icon, text, onClick, active }) => (
  <div style={{ ...sideLinkStyle, background: active ? "var(--primary-light)" : "transparent", color: active ? "var(--primary)" : "var(--text-main)" }} onClick={onClick}>
     {icon} <span>{text}</span>
  </div>
);

/* DESKTOP SIDEBAR STYLES */
const pageContainer = { background: "var(--bg-main)", minHeight: "100vh" };
const headerSection = { background: "#0b8f3a", padding: "40px 0 80px 0", color: "#fff" };
const greetingBox = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const greetingText = { margin: 0, fontSize: "28px", fontWeight: "800" };
const subGreeting = { margin: "5px 0 0 0", opacity: 0.8, fontSize: "14px" };
const headerIcons = { display: "flex", gap: "15px" };
const iconBtn = { width: "45px", height: "45px", borderRadius: "15px", background: "rgba(255,255,255,0.15)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", fontSize: "18px" };
const layoutGrid = { display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px" };
const sidebar = { background: "var(--card-bg)", borderRadius: "24px", padding: "25px", border: "1px solid var(--glass-border)", height: "fit-content", boxShadow: "0 10px 35px rgba(0,0,0,0.03)" };
const sidebarProfile = { textAlign: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "20px", marginBottom: "20px" };
const bigAvatar = { width: "65px", height: "65px", borderRadius: "50%", background: "var(--bg-main)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "30px", margin: "0 auto" };
const sideNav = { display: "flex", flexDirection: "column", gap: "8px" };
const sideLinkStyle = { display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "0.2s" };
const logoutBtnSide = { display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", background: "none", border: "none", color: "#e74c3c", width: "100%", textAlign: "left" };

/* DESKTOP PROFILE FORM CARD STYLES */
const mainContent = { paddingBottom: "100px" };
const profileCard = { background: "var(--card-bg)", borderRadius: "24px", padding: "40px", border: "1px solid var(--glass-border)", boxShadow: "0 10px 35px rgba(0,0,0,0.03)" };
const profileHeader = { display: "flex", alignItems: "center", gap: "25px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "30px", marginBottom: "30px" };
const avatarWrapper = { position: "relative", width: "100px", height: "100px" };
const cameraBtn = { position: "absolute", bottom: "5px", right: "5px", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" };
const headerInfo = { flex: 1 };
const editBtnTop = { background: "none", border: "1px solid var(--border-color)", padding: "8px 18px", borderRadius: "10px", fontWeight: "bold", fontSize: "13px", color: "var(--text-main)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const label = { fontSize: "13px", fontWeight: "bold", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" };
const disabledInput = { padding: "14px 16px", borderRadius: "12px", border: "1.5px solid var(--border-color)", fontSize: "15px", outline: "none" };
const activeInput = { padding: "14px 16px", borderRadius: "12px", border: "1.5px solid var(--primary)", fontSize: "15px", outline: "none" };
const actionRow = { display: "flex", gap: "15px", marginTop: "30px" };
const saveBtn = { background: "#0b8f3a", color: "#fff", border: "none", padding: "12px 30px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const cancelBtn = { background: "none", border: "1px solid var(--border-color)", color: "var(--text-main)", padding: "12px 25px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" };

export default Profile;