import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    id: 1,
    image: "/10_Onboarding_01.png",
    alt: "ScrapVex Onboarding 1"
  },
  {
    id: 2,
    image: "/11_Onboarding_02.png",
    alt: "ScrapVex Onboarding 2"
  },
  {
    id: 3,
    image: "/12_Onboarding_03.png",
    alt: "ScrapVex Onboarding 3"
  }
];

function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Touch Swipe Support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleFinish = () => {
    localStorage.setItem("scrapvex_onboarding_done", "true");
    navigate("/book");
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Swipe Gesture Handling
  const minSwipeDistance = 40;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  const activeSlide = slides[currentSlide];

  return (
    <div
      style={fullScreenStage}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* PURE 100% FULLSCREEN GRAPHIC IMAGE - NO VISIBLE HTML BUTTONS OR TEXT */}
      <img
        key={activeSlide.id}
        src={activeSlide.image}
        alt={activeSlide.alt}
        style={fullScreenImage}
      />

      {/* Invisible Touch Hotspot overlaying the printed "Skip" button at top-right */}
      <div
        onClick={handleFinish}
        style={topRightSkipHotspot}
        title="Skip"
      />

      {/* Invisible Touch Hotspot overlaying the printed "Continue / Get Started" button at bottom */}
      <div
        onClick={handleNext}
        style={bottomButtonHotspot}
        title="Next"
      />
    </div>
  );
}

/* 100% PURE FULLSCREEN ZERO-MARGIN STYLES */
const fullScreenStage = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  margin: 0,
  padding: 0,
  background: "var(--text-main)",
  zIndex: 999999,
  overflow: "hidden",
  touchAction: "pan-y"
};

const fullScreenImage = {
  width: "100vw",
  height: "100vh",
  objectFit: "cover", // 100% EDGE-TO-EDGE FULLSCREEN COVERAGE
  objectPosition: "center",
  display: "block",
  margin: 0,
  padding: 0,
  border: "none",
  outline: "none"
};

/* Top Right Invisible Hotspot over printed Skip button */
const topRightSkipHotspot = {
  position: "absolute",
  top: "1.5%",
  right: "2%",
  width: "100px",
  height: "55px",
  zIndex: 1000000,
  cursor: "pointer",
  background: "transparent",
  border: "none"
};

/* Bottom Invisible Hotspot over printed Continue / Get Started green button */
const bottomButtonHotspot = {
  position: "absolute",
  bottom: "1.5%",
  left: "4%",
  right: "4%",
  height: "85px",
  zIndex: 1000000,
  cursor: "pointer",
  background: "transparent",
  border: "none"
};

export default Onboarding;
