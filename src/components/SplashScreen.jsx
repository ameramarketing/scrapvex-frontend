import React, { useEffect, useState } from "react";

function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let innerTimer;
    const timer = setTimeout(() => {
      setFade(true);
      innerTimer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 500); // 500ms fade out
    }, 2800); // 2.8s display

    return () => {
      clearTimeout(timer);
      clearTimeout(innerTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        ...splashContainer,
        opacity: fade ? 0 : 1,
        transform: fade ? "scale(1.03)" : "scale(1)"
      }}
    >
      {/* Full Uncropped High-Res Splash Image */}
      <div style={imageContainer}>
        <img
          src="/08_Splash_Screen.png"
          alt="ScrapVex Splash Screen"
          style={fullSplashImage}
          onError={(e) => {
            e.target.src = "/01_Primary_Logo.png";
          }}
        />
      </div>

      {/* Tagline */}
      <div style={bottomProgressWrap}>
        <span style={taglineText}>Jammu & Kashmir Ka Pehla Digital Kabadiwala</span>
      </div>
    </div>
  );
}

const splashContainer = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99999,
  background: "#0b1320", // Sleek dark matching theme
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  fontFamily: "var(--font-main, system-ui, sans-serif)",
  padding: 0,
  overflow: "hidden"
};

const imageContainer = {
  flex: 1,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
};

const fullSplashImage = {
  width: "100%",
  height: "100%",
  maxHeight: "100vh",
  objectFit: "contain", // GUARANTEES 100% UNCROPPED FULL PHOTO
  display: "block"
};

const bottomProgressWrap = {
  position: "absolute",
  bottom: "30px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "80%",
  maxWidth: "280px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  zIndex: 10
};

const loaderTrack = {
  width: "100%",
  height: "5px",
  background: "rgba(255,255,255,0.2)",
  borderRadius: "3px",
  overflow: "hidden"
};

const loaderBar = {
  height: "100%",
  width: "100%",
  background: "linear-gradient(90deg, #0b8f3a, #2ecc71)",
  borderRadius: "3px",
  animation: "splashProgress 2.5s ease-in-out forwards"
};

const taglineText = {
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  opacity: 0.9,
  textShadow: "0 2px 4px rgba(0,0,0,0.5)"
};

export default SplashScreen;
