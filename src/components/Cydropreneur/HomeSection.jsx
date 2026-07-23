import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import gsap from "gsap";

/*
  HomeSection renders the contained aspect-ratio background (mobile image / desktop video)
  and the Register Now button relative to it.
*/
const HomeSection = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const isMobileView = screenSize.width < 768;

  useEffect(() => {
    if (screenSize.width >= 768) return;

    // Reset styles just in case
    gsap.set(".welcome-text", { strokeDashoffset: 1000, fill: "transparent" });

    const tl = gsap.timeline();

    // 1. Draw text outlines
    tl.to(".welcome-text", {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: "power2.inOut",
    });

    // 2. Fill text color
    tl.to(".welcome-text", {
      fill: "#000000",
      duration: 0.6,
      ease: "power1.out",
    }, "-=0.5");
  }, [screenSize.width]);

  useEffect(() => {
    const onResize = () =>
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const scrollToRegister = () =>
    window.open("https://forms.gle/qYHwXw7TmNuzv2iF8", "_blank");

  // Make video fill the screen on PC (border is handled by Cydropreneur index.jsx)
  let videoViewport = { width: "100%", height: "100%", top: 0, left: 0 };

  return (
    <section
      id="home"
      style={{
        position: "relative",
        width: screenSize.width ? `${screenSize.width}px` : "100vw",
        height: screenSize.height ? `${screenSize.height}px` : "100vh",
        maxWidth: "100vw",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: "#000000", // Solid black background for residue spaces
        zIndex: 1,
      }}
    >
      {isMobileView ? (
        // Mobile View
        <>
          <style>{`
            .mobile-comet-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 40%;
              overflow: hidden;
              pointer-events: none;
              z-index: 5; /* Over the image */
            }
            .mobile-comet {
              position: absolute;
              width: 150px;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), #ffffff);
              filter: drop-shadow(0 0 6px rgba(255,255,255,1));
              border-radius: 50%;
              opacity: 0;
            }
            .comet-1 {
              top: 5%;
              left: -10%;
              animation: cometMove 3s linear infinite;
              animation-delay: 0s;
            }
            .comet-2 {
              top: -5%;
              left: 20%;
              animation: cometMove 4.5s linear infinite;
              animation-delay: 1.5s;
            }
            .comet-3 {
              top: 15%;
              left: -15%;
              animation: cometMove 3.5s linear infinite;
              animation-delay: 2.8s;
            }
            @keyframes cometMove {
              0% {
                transform: rotate(35deg) translateX(-200px);
                opacity: 0;
              }
              5% {
                opacity: 1;
              }
              30% {
                transform: rotate(35deg) translateX(150vw);
                opacity: 0;
              }
              100% {
                transform: rotate(35deg) translateX(150vw);
                opacity: 0;
              }
            }
          `}</style>

          {/* Comet Animation Container restricted to top 30% */}
          <div className="mobile-comet-container">
            <div className="mobile-comet comet-1" />
            <div className="mobile-comet comet-2" />
            <div className="mobile-comet comet-3" />
          </div>

          <img
            src="/img/Cydropreneur bg mob.png"
            alt="Cydropreneur Mobile Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "bottom center",
              display: "block",
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
            }}
          />

          {/* Top Gradient Overlay to seamlessly blend the top edge of the image into the black background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "35%",
              background: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Welcome Title */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              maxWidth: "500px",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <svg
              viewBox="0 0 800 140"
              style={{
                width: "100%",
                filter: "drop-shadow(0 2px 5px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))"
              }}
            >
              <defs>
                <linearGradient id="welcome-silver-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#8a99ad" />
                </linearGradient>
              </defs>
              <text
                x="50%"
                y="70"
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily="'Ethnocentric', 'Orbitron', sans-serif"
                fontSize="46px"
                fontWeight="bold"
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="welcome-text"
                letterSpacing="0.05em"
              >
                WELCOME FOLKS!
              </text>
            </svg>
          </div>

          {/* Mobile Button wrapper */}
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              right: "50%",
              transform: "translateX(50%)",
              width: "auto",
              height: "auto",
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={scrollToRegister}
              style={{
                fontFamily: "'Ethnocentric','Orbitron',sans-serif",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 20px",
                borderRadius: "999px",
                background: "linear-gradient(135deg,#7e22ce 0%,#a855f7 50%,#c084fc 100%)",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "1px solid rgba(255,255,255,0.4)",
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(168,85,247,0.6),inset 0 1px 0 rgba(255,255,255,0.4)",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
              className="hover:scale-105"
            >
              REGISTER NOW <FiArrowRight size={13} style={{ marginLeft: "8px" }} />
            </button>
          </div>
        </>
      ) : (
        // Desktop View: Perfectly contained 16:9 aspect-ratio frame
        <div
          style={{
            position: "absolute",
            width: videoViewport.width,
            height: videoViewport.height,
            top: videoViewport.top,
            left: videoViewport.left,
            zIndex: 1,
            overflow: "hidden",
            backgroundColor: "#000000",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            src="/videos/hero-frame embedded.mp4"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
              display: "block",
              margin: 0,
            }}
          />

          {/* Desktop Button - positioned relative to video frame boundaries */}
          <div
            style={{
              position: "absolute",
              bottom: "2%",
              right: "4.8%",
              width: "268px",
              height: "110px",
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={scrollToRegister}
              style={{
                width: "100%",
                height: "100%",
                fontFamily: "'Ethnocentric','Orbitron',sans-serif",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0",
                paddingLeft: "42px",
                background: "url('/img/CTA Button.png') no-repeat center",
                backgroundSize: "contain",
                backgroundColor: "transparent",
                color: "#eceff1",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                boxShadow: "none",
                transition: "all 0.3s ease",
              }}
              className="hover:scale-105"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "10px",
                  lineHeight: "1",
                  filter: "drop-shadow(0 0 4px rgba(244, 114, 182, 0.65))",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #8a99ad 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  REGISTER
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #8a99ad 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    NOW
                  </span>
                  <FiArrowRight size={22} style={{ color: "#cbd5e1" }} />
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeSection;
