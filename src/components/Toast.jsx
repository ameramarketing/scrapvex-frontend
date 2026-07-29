import React, {
  useEffect
} from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaTimes
} from "react-icons/fa";

function Toast({
  show,
  type = "success",
  message,
  onClose
}) {
  useEffect(() => {
    if (show) {
      const timer =
        setTimeout(() => {
          onClose();
        }, 3000);

      return () =>
        clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const config = {
    success: {
      icon: <FaCheckCircle />,
      bg: "#eaffef",
      color: "#0b8f3a",
      border:
        "1px solid #b7efc5"
    },

    error: {
      icon: <FaTimesCircle />,
      bg: "#fff0f0",
      color: "#d62828",
      border:
        "1px solid #f5b5b5"
    },

    info: {
      icon: <FaInfoCircle />,
      bg: "#eef6ff",
      color: "#1d4ed8",
      border:
        "1px solid #bfd8ff"
    }
  };

  const style =
    config[type] ||
    config.success;

  return (
    <div style={wrap}>
      <div
        style={{
          ...toast,
          background:
            style.bg,
          color:
            style.color,
          border:
            style.border
        }}
      >
        <div style={left}>
          <span
            style={icon}
          >
            {style.icon}
          </span>

          <span>
            {message}
          </span>
        </div>

        <button
          style={closeBtn}
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

/* styles */
const wrap = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 9999999
};

const toast = {
  minWidth: "340px",
  maxWidth: "420px",
  padding: "16px 18px",
  borderRadius: "16px",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  boxShadow:
    "0 20px 40px rgba(0,0,0,.08)",
  animation:
    "slideIn .35s ease"
};

const left = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontWeight: "600"
};

const icon = {
  fontSize: "20px"
};

const closeBtn = {
  border: "none",
  background:
    "transparent",
  cursor: "pointer",
  fontSize: "16px",
  color: "inherit"
};

export default Toast;