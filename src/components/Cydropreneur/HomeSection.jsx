import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";

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
          src="/img/mob view--final.png"
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
          bottom: screenSize.width < 768 ? "16px" : "3%",
          right: screenSize.width < 768 ? "50%" : "4.8%",
          transform: screenSize.width < 768 ? "translateX(50%)" : "none",
          width: screenSize.width < 768 ? "180px" : "268px",
          height: screenSize.width < 768 ? "74px" : "110px",
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
            paddingLeft: screenSize.width < 768 ? "28px" : "42px",
            background: "url('/img/CTA Button.png') no-repeat center",
            backgroundSize: "contain",
            backgroundColor: "transparent",
            color: "#eceff1",
            fontSize: screenSize.width < 768 ? "15px" : "22px",
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
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: screenSize.width < 768 ? "6px" : "10px",
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
              <FiArrowRight size={screenSize.width < 768 ? 16 : 22} style={{ color: "#cbd5e1" }} />
            </span>
          </div>
        </button>
      </div>
    </section>
  );
};

export default HomeSection;
