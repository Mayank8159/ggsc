import { useState, useEffect, useRef } from "react";
import { FiArrowRight } from "react-icons/fi";
import gsap from "gsap";

/*
  HomeSection only renders the background (video / mobile image)
  and the Register Now button.

  The 5 nav buttons and their morph animation live in
  CydropreneurNav.jsx so they sit at the root DOM level and are
  never clipped by overflow:hidden or a positioned ancestor.
*/
const HomeSection = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

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
        background: "transparent",
        zIndex: 1,
      }}
    >
      {/* ── Background: mobile image or desktop video ── */}
      {screenSize.width < 768 ? (
        <img
          src="/img/Cydropreneur bg mob.png"
          alt="Cydropreneur Mobile Hero"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
            margin: "0 auto",
            backgroundColor: "#000000",
          }}
        />
      ) : (
        <video
          autoPlay loop muted playsInline
          src="/videos/hero-frame embedded.mp4"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            margin: 0,
          }}
        />
      )}

      {/* ── Register Now button (bottom-right frame notch) ── */}
      <div
        style={{
          position: "absolute",
          bottom: screenSize.width < 768 ? "36px" : "3%",
          right: screenSize.width < 768 ? "50%" : "4.8%",
          transform: screenSize.width < 768 ? "translateX(50%)" : "none",
          width: screenSize.width < 768 ? "auto" : "268px",
          height: screenSize.width < 768 ? "auto" : "110px",
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
            justifyContent: screenSize.width < 768 ? "center" : "flex-start",
            padding: screenSize.width < 768 ? "10px 20px" : "0",
            paddingLeft: screenSize.width < 768 ? "20px" : "42px",
            borderRadius: screenSize.width < 768 ? "999px" : "0",
            background: screenSize.width < 768
              ? "linear-gradient(135deg,#7e22ce 0%,#a855f7 50%,#c084fc 100%)"
              : "url('/img/CTA Button.png') no-repeat center",
            backgroundSize: screenSize.width < 768 ? "auto" : "contain",
            backgroundColor: "transparent",
            color: screenSize.width < 768 ? "#ffffff" : "#eceff1",
            fontSize: screenSize.width < 768 ? "10px" : "22px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            border: screenSize.width < 768 ? "1px solid rgba(255,255,255,0.4)" : "none",
            cursor: "pointer",
            boxShadow: screenSize.width < 768 ? "0 6px 24px rgba(168,85,247,0.6),inset 0 1px 0 rgba(255,255,255,0.4)" : "none",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}
          className="hover:scale-105"
        >
          {screenSize.width < 768 ? (
            <>
              REGISTER NOW <FiArrowRight size={13} style={{ marginLeft: "8px" }} />
            </>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "10px",
              lineHeight: "1",
              filter: "drop-shadow(0 0 4px rgba(244, 114, 182, 0.65))",
            }}>
              <span style={{
                background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #8a99ad 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>REGISTER</span>
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #8a99ad 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>NOW</span>
                <FiArrowRight size={22} style={{ color: "#cbd5e1" }} />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* ── Welcome Fokes ! Mobile Title ── */}
      {screenSize.width < 768 && (
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
            {/* Welcome Text */}
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
              WELCOME FOKES !
            </text>
          </svg>
        </div>
      )}
    </section>
  );
};

export default HomeSection;
