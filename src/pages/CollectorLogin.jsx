import React, {
  useState
} from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTruck,
  FaPhoneAlt,
  FaLock,
  FaArrowRight,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";

import Toast from "../components/Toast";

import API from "../services/api";
import { setCookie, getCookie } from "../utils/cookies";

function CollectorLogin() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user") || getCookie("user");
    const role = localStorage.getItem("role") || getCookie("role");
    if (rawUser && role === "collector") {
      navigate("/collector-dashboard");
    }
  }, [navigate]);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message
    });
  };

  const handleLogin = async (e) => {
    if (mobile.length !== 10) return showToast("error", "Enter valid mobile number");
    if (!password) return showToast("error", "Enter password");

    setLoading(true);

    try {
      const { data } = await API.post("/auth/collector-login", { mobile, password });

      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "collector");

      // Store in Cookies
      setCookie("token", data.token);
      setCookie("user", JSON.stringify(data.user));
      setCookie("role", "collector");

      showToast("success", "Collector Login Successful 🎉");

      setTimeout(() => {
        navigate("/collector-dashboard");
      }, 700);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() =>
          setToast({
            ...toast,
            show: false
          })
        }
      />

      <div
        style={card}
        className="rate-card"
      >
        <div style={topIcon}>
          <FaTruck />
        </div>

        <p style={tag}>
          Pickup Staff Access 🚚
        </p>

        <h1 style={title}>
          Collector Login
        </h1>

        <p style={sub}>
          Manage assigned
          pickups and
          complete orders.
        </p>

        <div style={pillWrap}>
          <span style={pill}>
            <FaCheckCircle />
            Secure
          </span>

          <span style={pill}>
            <FaCheckCircle />
            Fast
          </span>
        </div>

        <div style={inputWrap}>
          <FaPhoneAlt
            style={icon}
          />

          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) =>
              setMobile(
                e.target.value
                  .replace(
                    /\D/g,
                    ""
                  )
                  .slice(
                    0,
                    10
                  )
              )
            }
            style={input}
          />
        </div>

        <div style={inputWrap}>
          <FaLock
            style={icon}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            style={input}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "-10px", marginBottom: "20px" }}>
          <Link to="/login" style={{ color: "#0b8f3a", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}>Login as User</Link>
          <Link to="/forgot-password?role=collector" style={{ color: "#0b8f3a", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}>Forgot Password?</Link>
        </div>

        <button
          style={btn}
          className="btn pulse-btn"
          onClick={
            handleLogin
          }
        >
          {loading ? (
            <>
              <FaSpinner className="spin" />
              Logging...
            </>
          ) : (
            <>
              Login
              <FaArrowRight
                style={{
                  marginLeft:
                    "8px"
                }}
              />
            </>
          )}
        </button>

        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px", fontSize: "14px" }}>
          <span style={{ color: "var(--text-muted)" }}>New Collector?</span>
          <Link to="/collector-register" style={{ color: "#0b8f3a", fontWeight: "700", textDecoration: "none" }}>Register Here</Link>
        </div>

      </div>
    </div>
  );
}

/* styles */
const wrap = {
  minHeight: "100vh",
  display: "flex",
  justifyContent:
    "center",
  alignItems:
    "center",
  padding: "30px",
  background: "var(--bg-main)"
};

const card = {
  width: "460px",
  background: "var(--card-bg)",
  padding: "36px",
  borderRadius:
    "28px",
  boxShadow:
    "0 25px 55px rgba(0,0,0,.08)",
  textAlign:
    "center",
  border: "1px solid var(--glass-border)"
};

const topIcon = {
  fontSize: "70px",
  color: "var(--primary)",
  marginBottom:
    "10px"
};

const tag = {
  color: "var(--primary)",
  fontWeight:
    "bold"
};

const title = {
  margin:
    "12px 0",
  color: "var(--text-main)"
};

const sub = {
  color: "var(--text-muted)",
  marginBottom:
    "18px"
};

const pillWrap = {
  display: "flex",
  justifyContent:
    "center",
  gap: "10px",
  marginBottom:
    "22px"
};

const pill = {
  background:
    "var(--primary-light)",
  color: "var(--primary)",
  padding:
    "8px 12px",
  borderRadius:
    "999px",
  fontSize: "13px",
  display: "flex",
  gap: "6px",
  alignItems:
    "center"
};

const inputWrap = {
  display: "flex",
  gap: "12px",
  alignItems:
    "center",
  background:
    "var(--bg-main)",
  padding:
    "14px 16px",
  borderRadius:
    "14px",
  marginBottom:
    "14px",
  border: "1px solid var(--glass-border)"
};

const icon = {
  color: "var(--primary)"
};

const input = {
  border: "none",
  outline: "none",
  background:
    "transparent",
  width: "100%",
  color: "var(--text-main)"
};

const btn = {
  width: "100%",
  border: "none",
  padding: "14px",
  borderRadius:
    "14px",
  background:
    "var(--primary)",
  color: "#fff",
  fontWeight:
    "bold",
  cursor: "pointer",
  display: "flex",
  justifyContent:
    "center",
  alignItems:
    "center",
  gap: "8px"
};

const demo = {
  marginTop: "16px",
  color: "#888",
  fontSize: "13px"
};

export default CollectorLogin;