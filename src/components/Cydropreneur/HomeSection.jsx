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
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    // Only update if crossing the mobile boundary to avoid unnecessary re-renders
    const onResize = () => {
      const currentlyMobile = window.innerWidth < 768;
      if (currentlyMobile !== isMobile) {
        setIsMobile(currentlyMobile);
      }
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [isMobile]);

  const scrollToRegister = () =>
    window.open("https://forms.gle/qYHwXw7TmNuzv2iF8", "_blank");

  return (
    <section
      id="home"
      style={{
        position: "relative",
        width: "100vw",
        height: "100dvh",
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
      {isMobile ? (
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
          bottom: isMobile ? "36px" : "6.8%",
          right: isMobile ? "50%" : "3.8%",
          transform: isMobile ? "translateX(50%)" : "none",
          width: isMobile ? "auto" : "290px",
          height: isMobile ? "auto" : "68px",
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
            justifyContent: "center",
            gap: "10px",
            padding: isMobile ? "10px 20px" : "0 28px",
            borderRadius: isMobile ? "999px" : "24px",
            background: "linear-gradient(135deg,#7e22ce 0%,#a855f7 50%,#c084fc 100%)",
            color: "#ffffff",
            fontSize: isMobile ? "10px" : "13px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            border: "1px solid rgba(255,255,255,0.4)",
            cursor: "pointer",
            boxShadow: "0 6px 24px rgba(168,85,247,0.6),inset 0 1px 0 rgba(255,255,255,0.4)",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}
          className="hover:scale-105 hover:shadow-purple-500/90"
        >
          REGISTER NOW <FiArrowRight size={isMobile ? 13 : 16} />
        </button>
      </div>
    </section>
  );
};

export default HomeSection;
