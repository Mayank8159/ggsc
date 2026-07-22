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
          bottom: screenSize.width < 768 ? "36px" : "6.8%",
          right: screenSize.width < 768 ? "50%" : "3.8%",
          transform: screenSize.width < 768 ? "translateX(50%)" : "none",
          width: screenSize.width < 768 ? "auto" : "290px",
          height: screenSize.width < 768 ? "auto" : "68px",
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
            padding: screenSize.width < 768 ? "10px 20px" : "0 28px",
            borderRadius: screenSize.width < 768 ? "999px" : "24px",
            background: "linear-gradient(135deg,#7e22ce 0%,#a855f7 50%,#c084fc 100%)",
            color: "#ffffff",
            fontSize: screenSize.width < 768 ? "10px" : "13px",
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
          REGISTER NOW <FiArrowRight size={screenSize.width < 768 ? 13 : 16} />
        </button>
      </div>
    </section>
  );
};

export default HomeSection;
