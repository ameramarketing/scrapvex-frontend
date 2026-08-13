import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaArrowLeft, FaGift, FaTruck, FaTag, FaCheckCircle, FaTrashAlt } from "react-icons/fa";

const mockNotifications = [
  {
    id: 1,
    title: "🎉 Welcome to ScrapVex Rajouri!",
    message: "Rajouri's first digital doorstep scrap collection service is now live. Book your first pickup today!",
    time: "Just now",
    type: "promo",
    icon: <FaGift />,
    unread: true
  },
  {
    id: 2,
    title: "🏷️ First Pickup Bonus Active",
    message: "Get ₹30 Extra Cash Bonus on your first completed scrap booking in Rajouri.",
    time: "2 hours ago",
    type: "offer",
    icon: <FaTag />,
    unread: true
  },
  {
    id: 3,
    title: "🚛 Doorstep Pickup Coverage",
    message: "Collectors are active in Gujjar Mandi, Kheora, Jawahar Nagar, and Salani Bridge area.",
    time: "Yesterday",
    type: "info",
    icon: <FaTruck />,
    unread: false
  }
];

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState(mockNotifications);

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      
      <div className="container" style={wrapper}>
        <div style={topHeaderRow}>
          <button style={backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <h2 style={pageTitle}>Notifications</h2>
          {notifications.length > 0 && (
            <button style={clearBtn} onClick={clearAll}>
              <FaTrashAlt /> Clear
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={emptyBox}>
            <div style={emptyIcon}><FaBell /></div>
            <h3>No new notifications</h3>
            <p>You are all caught up!</p>
          </div>
        ) : (
          <div style={listWrap}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  ...itemCard,
                  background: n.unread ? "#ffffff" : "#f8fafc",
                  borderColor: n.unread ? "#bbf7d0" : "#e2e8f0"
                }}
              >
                <div style={iconBadge}>{n.icon}</div>
                <div style={contentWrap}>
                  <div style={titleRow}>
                    <h4 style={titleText}>{n.title}</h4>
                    <span style={timeText}>{n.time}</span>
                  </div>
                  <p style={messageText}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const wrapper = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px 16px 60px 16px"
};

const topHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
};

const backBtn = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  padding: "8px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const pageTitle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#0f172a",
  margin: 0
};

const clearBtn = {
  background: "none",
  border: "none",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "4px"
};

const listWrap = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const itemCard = {
  borderRadius: "16px",
  padding: "16px",
  border: "1px solid #e2e8f0",
  display: "flex",
  gap: "14px",
  alignItems: "flex-start",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
};

const iconBadge = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  background: "#f0fdf4",
  color: "#0b8f3a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  flexShrink: 0
};

const contentWrap = {
  flex: 1
};

const titleRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: "4px"
};

const titleText = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0
};

const timeText = {
  fontSize: "11px",
  color: "#94a3b8"
};

const messageText = {
  fontSize: "13px",
  color: "#64748b",
  margin: 0,
  lineHeight: "1.4"
};

const emptyBox = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#64748b"
};

const emptyIcon = {
  fontSize: "40px",
  color: "#cbd5e1",
  marginBottom: "12px"
};

export default Notifications;
