import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";

const HomeSection = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const scrollToRegister = () => {
    const contactSection = document.getElementById("contact-us");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      {screenSize.width < 768 ? (
        <img
          src="/img/mob view home page .png"
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
          autoPlay
          loop
          muted
          playsInline
          src="/videos/Home page main.mp4"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            margin: 0,
          }}
        />
      )}

      {/* Floating Register Now Button on Bottom Right of Video Frame */}
      <div
        style={{
          position: "absolute",
          bottom: screenSize.width < 768 ? "24px" : "36px",
          right: screenSize.width < 768 ? "50%" : "36px",
          transform: screenSize.width < 768 ? "translateX(50%)" : "none",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={scrollToRegister}
          style={{
            fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: screenSize.width < 768 ? "10px 20px" : "12px 28px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #c084fc 100%)",
            color: "#ffffff",
            fontSize: screenSize.width < 768 ? "10px" : "12px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            cursor: "pointer",
            boxShadow:
              "0 6px 24px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}
          className="hover:scale-105 hover:shadow-purple-500/90"
        >
          REGISTER NOW <FiArrowRight size={screenSize.width < 768 ? 13 : 15} />
        </button>
      </div>
    </section>
  );
};

export default HomeSection;
