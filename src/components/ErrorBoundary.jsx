import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ScrapVex UI Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background: "var(--bg-main, #f8fafc)",
          color: "var(--text-main, #0f172a)",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            borderRadius: "20px",
            padding: "32px 24px",
            maxWidth: "440px",
            width: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid var(--card-border, #e2e8f0)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>♻️</div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 8px 0" }}>ScrapVex</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", margin: "0 0 20px 0" }}>
              Something refreshed unexpectedly. Click below to continue smoothly.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("voted_areas");
                sessionStorage.clear();
                window.location.href = "/";
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "#0b8f3a",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Reload ScrapVex 🔄
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
