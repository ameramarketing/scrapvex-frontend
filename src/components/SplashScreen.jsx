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
    }, 2000); // 2s display

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
        transform: fade ? "scale(1.02)" : "scale(1)"
      }}
    >
      {/* Full High-Res Portrait Splash Screen Image */}
      <img
        src="/splash_screen.png"
        alt="ScrapVex Splash Screen"
        style={fullSplashImage}
        onError={(e) => {
          e.target.src = "/splash.png";
        }}
      />
    </div>
  );
}

const splashContainer = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 999999,
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  padding: 0,
  overflow: "hidden"
};

const fullSplashImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  display: "block"
};

export default SplashScreen;
