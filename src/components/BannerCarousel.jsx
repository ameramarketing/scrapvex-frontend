import React, { useState, useEffect } from "react";
import API from "../services/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function BannerCarousel() {
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);

  useEffect(() => {
    fetchAds();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAds = async () => {
    try {
      const { data } = await API.get("/ads");
      if (data.success && data.data.filter(ad => ad.isActive).length > 0) {
        setAds(data.data.filter(ad => ad.isActive));
      } else {
        setAds(defaultBanners);
      }
    } catch (e) { 
      setAds(defaultBanners); 
    }
  };

  const defaultBanners = [
    { _id: "b1", title: "Doorstep Scrap Pickup in Rajouri", imageUrl: "/05_Hero_Banner_01.png", mobileImageUrl: "/05_Hero_Banner_01.png", link: "/book", isActive: true },
    { _id: "b2", title: "Best Scrap Market Rates & Instant Cash", imageUrl: "/06_Hero_Banner_02.png", mobileImageUrl: "/06_Hero_Banner_02.png", link: "/rates", isActive: true },
    { _id: "b3", title: "Certified Digital Weight Guarantee", imageUrl: "/07_Hero_Banner_03.png", mobileImageUrl: "/07_Hero_Banner_03.png", link: "/book", isActive: true }
  ];

  useEffect(() => {
    if (ads.length > 0) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [ads]);

  if (ads.length === 0) return null;

  return (
    <div style={container} className="reveal active">
      <div style={{ ...carousel, height: isMobile ? "210px" : "340px", borderRadius: isMobile ? "16px" : "24px" }}>
        {ads.map((ad, index) => {
          const bannerImg = (isMobile && ad.mobileImageUrl) ? ad.mobileImageUrl : ad.imageUrl;
          return (
            <div
              key={ad._id}
              style={{
                ...slide,
                opacity: index === current ? 1 : 0,
                transform: `scale(${index === current ? 1 : 0.95})`,
                zIndex: index === current ? 1 : 0,
              }}
            >
              <a href={ad.link || "#"} target="_blank" rel="noreferrer">
                <img src={bannerImg} alt={ad.title} style={image} />
              </a>
              <div style={{ ...overlay, padding: isMobile ? "15px" : "30px" }}>
                <h3 style={{ ...adTitle, fontSize: isMobile ? "16px" : "24px" }}>{ad.title}</h3>
              </div>
            </div>
          );
        })}

        {/* CONTROLS */}
        <button style={leftBtn} onClick={() => setCurrent(current === 0 ? ads.length - 1 : current - 1)}>
          <FaChevronLeft />
        </button>
        <button style={rightBtn} onClick={() => setCurrent(current === ads.length - 1 ? 0 : current + 1)}>
          <FaChevronRight />
        </button>

        {/* DOTS */}
        <div style={dotsWrap}>
          {ads.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                ...dot,
                background: i === current ? "#0b8f3a" : "rgba(255,255,255,0.5)",
                width: i === current ? "25px" : "8px"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const container = { margin: "20px 0", width: "100%" };
const carousel = { position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", transition: "0.3s" };
const slide = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transition: "all 0.8s ease" };
const image = { width: "100%", height: "100%", objectFit: "cover" };
const overlay = { position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.75))", color: "#fff" };
const adTitle = { fontWeight: "bold", margin: 0 };
const leftBtn = { position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", zIndex: 5, background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", padding: "8px 12px", borderRadius: "50%", cursor: "pointer", backdropFilter: "blur(5px)" };
const rightBtn = { ...leftBtn, left: "auto", right: "15px" };
const dotsWrap = { position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 5 };
const dot = { height: "8px", borderRadius: "4px", cursor: "pointer", transition: "0.3s" };

export default BannerCarousel;
