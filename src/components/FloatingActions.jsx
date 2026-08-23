import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaWhatsapp } from 'react-icons/fa';

const FloatingActions = () => {
  const location = useLocation();
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowActions(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const allowedPaths = ['/', '/rates', '/book', '/terms', '/about', '/privacy', '/contact'];
  const isAllowedPage = allowedPaths.includes(location.pathname);

  if (!isAllowedPage) return null;

  return (
    <>
      {/* 🟢 FLOATING WHATSAPP CHATBOT BUTTON (Meta Official Cloud Number) */}
      <a
        href="https://wa.me/919086373867?text=Hi"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp with ScrapVex Assistant"
      >
        <FaWhatsapp />
      </a>

      {showActions && (
        <div className="floating-actions desktop-only">
          <button className="action-btn btn-up" onClick={scrollToTop} title="Scroll to Top">
            <FaArrowUp />
          </button>
          <button className="action-btn btn-down" onClick={scrollToBottom} title="Scroll to Bottom (Footer)">
            <FaArrowDown />
          </button>
        </div>
      )}

      <style>{`
        .floating-whatsapp-btn {
          position: fixed;
          bottom: 30px;
          left: 25px;
          width: 54px;
          height: 54px;
          background: #25D366;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-decoration: none;
          animation: pulseGreen 2.5s infinite;
        }

        .floating-whatsapp-btn:hover {
          transform: scale(1.15) translateY(-3px);
          box-shadow: 0 8px 25px rgba(37, 211, 102, 0.6);
          color: white;
        }

        @keyframes pulseGreen {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }

        .floating-actions {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1000;
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .action-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary, #0b8f3a);
          box-shadow: 0 4px 15px rgba(11, 143, 58, 0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .btn-up {
          animation: floatUp 3s ease-in-out infinite;
        }

        .btn-down {
          animation: floatDown 3s ease-in-out infinite;
          animation-delay: 1.5s; /* Offset for premium organic flow */
        }

        .action-btn:hover {
          transform: scale(1.15) translateY(-3px) !important;
          box-shadow: 0 8px 25px rgba(11, 143, 58, 0.4);
          background: var(--primary-dark, #086b2b);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatUp {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes floatDown {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @media (max-width: 768px) {
          .floating-whatsapp-btn {
            bottom: 92px !important; /* Raised above mobile bottom navbar */
            left: 18px !important;
            width: 48px;
            height: 48px;
            font-size: 26px;
          }
          .floating-actions {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingActions;
