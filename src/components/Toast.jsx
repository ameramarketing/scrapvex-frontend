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
      const timer = setTimeout(() => {
        onClose();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div className="toast-portal-wrap" style={wrap}>
      <style>{`
        .toast-portal-wrap {
          position: fixed;
          top: calc(env(safe-area-inset-top, 0px) + 16px);
          right: 20px;
          z-index: 99999999;
          display: flex;
          justify-content: flex-end;
          pointer-events: none;
        }

        .native-toast-box {
          pointer-events: auto;
          min-width: 280px;
          max-width: 440px;
          padding: 10px 14px 10px 12px;
          border-radius: 999px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
          animation: nativeToastSpring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        @keyframes nativeToastSpring {
          from {
            opacity: 0;
            transform: translateY(-24px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* LIGHT THEME TOASTS */
        .toast-type-success {
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid #86efac;
          color: #0f172a;
        }
        .toast-type-success .toast-icon-wrap {
          color: #0b8f3a;
          background: #dcfce7;
        }

        .toast-type-error {
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid #fca5a5;
          color: #0f172a;
        }
        .toast-type-error .toast-icon-wrap {
          color: #ef4444;
          background: #fee2e2;
        }

        .toast-type-info {
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid #93c5fd;
          color: #0f172a;
        }
        .toast-type-info .toast-icon-wrap {
          color: #2563eb;
          background: #dbeafe;
        }

        /* DARK THEME TOASTS (MATCHING PLATFORM) */
        body.dark-mode .native-toast-box,
        [data-theme="dark"] .native-toast-box {
          background: rgba(30, 41, 59, 0.96) !important;
          color: #f8fafc !important;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.12) !important;
        }

        body.dark-mode .toast-type-success,
        [data-theme="dark"] .toast-type-success {
          border: 1.5px solid rgba(16, 185, 129, 0.5) !important;
        }
        body.dark-mode .toast-type-success .toast-icon-wrap,
        [data-theme="dark"] .toast-type-success .toast-icon-wrap {
          color: #34d399 !important;
          background: rgba(16, 185, 129, 0.25) !important;
        }

        body.dark-mode .toast-type-error,
        [data-theme="dark"] .toast-type-error {
          border: 1.5px solid rgba(239, 68, 68, 0.5) !important;
        }
        body.dark-mode .toast-type-error .toast-icon-wrap,
        [data-theme="dark"] .toast-type-error .toast-icon-wrap {
          color: #f87171 !important;
          background: rgba(239, 68, 68, 0.25) !important;
        }

        body.dark-mode .toast-type-info,
        [data-theme="dark"] .toast-type-info {
          border: 1.5px solid rgba(59, 130, 246, 0.5) !important;
        }
        body.dark-mode .toast-type-info .toast-icon-wrap,
        [data-theme="dark"] .toast-type-info .toast-icon-wrap {
          color: #60a5fa !important;
          background: rgba(59, 130, 246, 0.25) !important;
        }

        body.dark-mode .toast-close-btn,
        [data-theme="dark"] .toast-close-btn {
          color: #94a3b8 !important;
        }
        body.dark-mode .toast-close-btn:hover,
        [data-theme="dark"] .toast-close-btn:hover {
          color: #f1f5f9 !important;
        }

        /* NATIVE MOBILE RESPONSIVE FLOAT */
        @media (max-width: 600px) {
          .toast-portal-wrap {
            top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
            right: 12px !important;
            left: 12px !important;
            justify-content: center !important;
          }
          .native-toast-box {
            width: 100% !important;
            max-width: 390px !important;
            min-width: unset !important;
            padding: 9px 12px 9px 10px !important;
            border-radius: 999px !important;
          }
        }
      `}</style>

      <div className={`native-toast-box toast-type-${type}`} onClick={onClose}>
        <div style={left}>
          <div className="toast-icon-wrap" style={iconWrap}>
            {isSuccess ? <FaCheckCircle /> : isError ? <FaTimesCircle /> : <FaInfoCircle />}
          </div>

          <span style={msgText}>
            {message}
          </span>
        </div>

        <button
          className="toast-close-btn"
          style={closeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close notification"
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
  zIndex: 99999999
};

const left = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flex: 1,
  minWidth: 0
};

const iconWrap = {
  fontSize: "15px",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const msgText = {
  fontSize: "12.5px",
  fontWeight: "700",
  lineHeight: "1.35",
  wordBreak: "break-word"
};

const closeBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "13px",
  color: "#64748b",
  padding: "4px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "all 0.2s ease"
};

export default Toast;