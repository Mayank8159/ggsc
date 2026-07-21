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
        padding: "16px",
        boxSizing: "border-box",
        overflow: "hidden",
        background: "#000000",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "16px",
          display: "block",
          margin: 0,
        }}
      >
        <source
          src="/videos/Untitled design.mp4"
          type="video/mp4"
        />
      </video>

      {/* Floating Register Now Button on Bottom Right of Video Frame */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          right: "36px",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={scrollToRegister}
          style={{
            fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #c084fc 100%)",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            cursor: "pointer",
            boxShadow:
              "0 6px 24px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
            transition: "all 0.3s ease",
          }}
          className="hover:scale-105 hover:shadow-purple-500/90"
        >
          REGISTER NOW <FiArrowRight size={15} />
        </button>
      </div>
    </section>
  );
};

export default HomeSection;
