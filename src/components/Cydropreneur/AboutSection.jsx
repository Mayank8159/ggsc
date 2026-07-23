import React, { useState, useEffect } from "react";
import { MapPin, Clock, Calendar } from "lucide-react";

const AboutSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <section
      id="about"
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "40px 12px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Background ambient radial glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main Glassmorphic About Card Wrapper */}
      <div
        style={{
          maxWidth: "1360px",
          width: "100%",
          margin: "0 auto",
          background: "linear-gradient(135deg, rgba(22, 10, 48, 0.55) 0%, rgba(10, 5, 26, 0.75) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "32px",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {isMobile && (
          <h2
            style={{
              fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              fontWeight: 900,
              color: "#d946ef",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "center",
              width: "100%",
              marginTop: "40px",
              marginBottom: "10px",
              textShadow: "0 0 20px rgba(217, 70, 239, 0.3)",
            }}
          >
            ABOUT
          </h2>
        )}

        {/* Left Column: Character Image */}
        <div
          style={{
            flex: isMobile ? "1 1 100%" : "1.15 1 520px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            position: "relative",
            minHeight: isMobile ? "280px" : "540px",
            boxSizing: "border-box",
            overflow: "hidden",
            order: isMobile ? 2 : 1, // Ensure image is second on mobile
          }}
        >
          <img
            src="/img/about img.png"
            alt="Android Developer Character"
            style={{
              width: isMobile ? "95%" : "102%",
              height: "auto",
              maxHeight: isMobile ? "400px" : "630px",
              objectFit: "contain",
              objectPosition: "left bottom",
              display: "block",
              transform: isMobile ? "none" : "scale(1.02)",
              transformOrigin: "left bottom",
            }}
          />
        </div>

        {/* Right Column: Title, Description, and Info Pills */}
        <div
          style={{
            flex: isMobile ? "1 1 100%" : "1.2 1 500px",
            padding: isMobile ? "20px" : "clamp(30px, 4.5vw, 60px) clamp(30px, 4.5vw, 60px) 20px clamp(30px, 4.5vw, 60px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxSizing: "border-box",
            textAlign: isMobile ? "center" : "left",
            order: isMobile ? 3 : 2, // Ensure text is third on mobile
          }}
        >
          {!isMobile && (
            <h2
              style={{
                fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
                fontWeight: 900,
                color: "#d946ef",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "28px",
                textShadow: "0 0 20px rgba(217, 70, 239, 0.3)",
              }}
            >
              ABOUT
            </h2>
          )}

          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.1rem, 1.3vw, 1.25rem)",
              color: "#e9d5ff",
              lineHeight: 1.6,
              fontWeight: 600,
              letterSpacing: "0.02em",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            <p style={{ margin: 0 }}>
              CydroPreneur is an immersive, hands-on workshop designed to
              introduce you to learn Android development and its fundamentals
              and help you to build intelligent mobile applications from the
              ground up. Whether you're a beginner or an aspiring developer or
              eager to explore app creation, this workshop will equip you with
              practical skills to transform your ideas into real-world solutions.
            </p>
            <p style={{ margin: 0 }}>
              More than just a coding session, CydroPreneur is an opportunity
              to learn, collaborate, network and connect with like-minded
              innovators while gaining valuable insights into technology,
              entrepreneurship and product development.
            </p>
          </div>

          {/* Event Detail Pills */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Location Pill Row */}
            <div style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: isMobile ? "12px 16px" : "12px 24px",
                  borderRadius: "8px",
                  background: "rgba(147, 51, 234, 0.35)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  boxShadow: "0 4px 20px rgba(147, 51, 234, 0.15)",
                  color: "#ffffff",
                  fontSize: isMobile ? "10px" : "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                <MapPin size={15} style={{ color: "#d8b4fe", flexShrink: 0 }} />
                <span>INSTITUTE OF ENGINEERING AND MANAGEMENT, NEWTOWN</span>
              </div>
            </div>

            {/* Time & Date Pills Row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row", // Keep side-by-side on mobile
                gap: "12px",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: isMobile ? "12px 16px" : "12px 24px",
                  borderRadius: "8px",
                  background: "rgba(147, 51, 234, 0.35)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  boxShadow: "0 4px 20px rgba(147, 51, 234, 0.15)",
                  color: "#ffffff",
                  fontSize: isMobile ? "10px" : "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                  flex: 1,
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                <Clock size={15} style={{ color: "#d8b4fe", flexShrink: 0 }} />
                <span>10:00 AM</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: isMobile ? "12px 16px" : "12px 24px",
                  borderRadius: "8px",
                  background: "rgba(147, 51, 234, 0.35)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  boxShadow: "0 4px 20px rgba(147, 51, 234, 0.15)",
                  color: "#ffffff",
                  fontSize: isMobile ? "10px" : "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                  flex: 1,
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                <Calendar size={15} style={{ color: "#d8b4fe", flexShrink: 0 }} />
                <span>8th August</span>
              </div>
            </div>

            {/* Organized-by Badge Container */}
            <div
              style={{
                width: "100%",
                background: "linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(192, 132, 252, 0.05) 100%)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(192, 132, 252, 0.2)",
                borderRadius: "20px",
                padding: isMobile ? "16px 20px" : "20px 24px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                color: "#ffffff",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)",
                fontWeight: 600,
                lineHeight: 1.5,
                letterSpacing: "0.03em",
                boxSizing: "border-box",
                marginTop: "4px",
                textAlign: "center",
              }}
            >
              Organized by: Google Student Club (GGSC) UEMK in
              collaboration with the Innovation & Entrepreneurship Development
              Cell and The Dept. of CST, CSIT, CSE (CS) & CSE (NW).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
