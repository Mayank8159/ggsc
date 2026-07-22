import React, { useState, useEffect } from "react";
import { FaGlobe, FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin, FaPhone, FaEnvelope } from "react-icons/fa";

const GoogleText = () => {
  const text = "Google Gemini Student Community ";
  const colors = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];
  let cIdx = 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {text.split("").map((char, i) => {
        if (char === " ") return <span key={i}>&nbsp;</span>;
        const color = colors[cIdx % colors.length];
        cIdx++;
        return <span key={i} style={{ color, paddingLeft: "1px", paddingRight: "1px" }}>{char}</span>;
      })}
    </span>
  );
};

const CyberLink = ({ href, icon, text }) => {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="interactive"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 12px",
        background: hover ? "#d946ef" : "transparent",
        border: "1px solid #d946ef",
        color: hover ? "#000" : "#fff",
        textDecoration: "none",
        transition: "all 0.1s ease",
        fontFamily: "'Rajdhani', sans-serif",
        textTransform: "uppercase",
        fontWeight: hover ? 700 : 500,
        boxShadow: hover ? "4px 4px 0 rgba(217, 70, 239, 0.5)" : "none",
        transform: hover ? "translate(-2px, -2px)" : "none"
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hover ? "#000" : "#d946ef",
        borderRight: hover ? "1px solid #000" : "1px solid #d946ef",
        paddingRight: "12px",
      }}>
        {icon}
      </div>
      <span style={{ letterSpacing: "0.1em" }}>
        {text}
      </span>
    </a>
  );
};
const ContactSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      id="contact-us"
      style={{
        width: "100%",
        minHeight: "85vh",
        padding: isMobile ? "80px 16px" : "120px 24px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Dynamic Overlapping Tickers */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "-10vw",
          width: "120vw",
          height: "220px",
          zIndex: 10,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes ticker-slide-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes ticker-slide-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .ticker-inner-left {
            display: flex;
            width: max-content;
            animation: ticker-slide-left 25s linear infinite;
            white-space: nowrap;
          }
          .ticker-inner-right {
            display: flex;
            width: max-content;
            animation: ticker-slide-right 25s linear infinite;
            white-space: nowrap;
          }
        `}} />

        {/* White Ribbon — Back, rotated -3.5deg */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "-10%",
            width: "120%",
            height: "46px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            transform: "rotate(-3.5deg)",
            transformOrigin: "center center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 4,
            overflow: "hidden",
          }}
        >
          <div className="ticker-inner-left" style={{ color: "#000000", fontFamily: "'Ethnocentric', 'Orbitron', sans-serif", fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", whiteSpace: "nowrap", display: "flex" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span key={i} style={{ paddingRight: "60px", flexShrink: 0, display: "flex", alignItems: "center", gap: "16px" }}>
                <img src="/img/GGSC.png" alt="GGSC" style={{ height: "24px", objectFit: "contain" }} />
                <GoogleText />
                <span>-</span>
              </span>
            ))}
          </div>
        </div>

        {/* Black Ribbon — Front, rotated 3.5deg */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "-10%",
            width: "120%",
            height: "46px",
            background: "#000000",
            borderTop: "2px solid #a855f7",
            borderBottom: "2px solid #a855f7",
            display: "flex",
            alignItems: "center",
            transform: "rotate(3.5deg)",
            transformOrigin: "center center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            zIndex: 5,
            overflow: "hidden",
          }}
        >
          <div className="ticker-inner-right" style={{ color: "#ffffff", fontFamily: "'Ethnocentric', 'Orbitron', sans-serif", fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", whiteSpace: "nowrap", display: "flex" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span key={i} style={{ paddingRight: "60px", flexShrink: 0, color: "#d8b4fe", display: "flex", alignItems: "center", gap: "16px" }}>
                <span>THANKS FOR VISITING - SEE YOU AT CYDROPRENEUR -</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1300px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginTop: "80px", marginBottom: "50px" }}>
          <h2
            style={{
              fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
              fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              textShadow: "0 0 25px rgba(168, 85, 247, 0.4)",
            }}
          >
            CONTACT
          </h2>
        </div>

        {/* Content Layout: Left Grid, Center Image, Right Grid */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? "48px" : "40px",
          width: "100%",
          marginBottom: "60px",
        }}>
          {/* Social Links Panel (Left) */}
          <div style={{
            flex: "1 1 300px",
            maxWidth: "350px",
            background: "#000",
            border: "2px solid #d946ef",
            padding: "40px 24px",
            boxShadow: "8px 8px 0 rgba(217, 70, 239, 0.2)",
            position: "relative",
            order: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <div style={{
              position: "absolute", top: "-14px", left: "16px", background: "#000", padding: "0 8px"
            }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#d946ef", fontWeight: 700, letterSpacing: "0.15em" }}>[ SOCIALS ]</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <CyberLink href="https://chat.whatsapp.com/ImdIqwRXTdcHxy0LirVSQQ" icon={<FaWhatsapp />} text="WHATSAPP COMM" />
              <CyberLink href="https://www.facebook.com/share/1Cd7Y97m99/" icon={<FaFacebook />} text="FACEBOOK" />
              <CyberLink href="https://www.instagram.com/ggsc_uemk" icon={<FaInstagram />} text="INSTAGRAM" />
              <CyberLink href="https://www.linkedin.com/in/ggsc-uemk" icon={<FaLinkedin />} text="LINKEDIN" />
            </div>
          </div>

          {/* Graphic Image (Center) */}
          <div style={{ flex: "1 1 400px", textAlign: "center", order: 2 }}>
            <img
              src="/img/footer--.png"
              alt="Cydropreneur Contact Artwork"
              style={{
                maxHeight: "500px",
                maxWidth: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
                filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.15))",
              }}
            />
          </div>

          {/* Direct Comms Panel (Right) */}
          <div style={{
            flex: "1 1 300px",
            maxWidth: "350px",
            background: "#000",
            border: "2px solid #38bdf8",
            padding: "40px 24px",
            boxShadow: "-8px 8px 0 rgba(56, 189, 248, 0.2)",
            position: "relative",
            order: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <div style={{
              position: "absolute", top: "-14px", right: "16px", background: "#000", padding: "0 8px"
            }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#38bdf8", fontWeight: 700, letterSpacing: "0.15em" }}>[ CONTACT ]</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div style={{ borderLeft: "4px solid #38bdf8", paddingLeft: "16px" }}>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa", fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em", marginBottom: "4px" }}>CHAIRPERSON</div>
                <div style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "1.3rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>PALLABI ROY</div>
                <a href="tel:8340525962" className="interactive" style={{ color: "#38bdf8", fontFamily: "'Rajdhani', sans-serif", fontSize: "1.2rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaPhone size={14} /> +91 83405 25962
                </a>
              </div>

              <div style={{ borderLeft: "4px solid #38bdf8", paddingLeft: "16px" }}>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa", fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em", marginBottom: "4px" }}>VICE CHAIRPERSON</div>
                <div style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "1.3rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>SWASTIK MANNA</div>
                <a href="tel:9163067541" className="interactive" style={{ color: "#38bdf8", fontFamily: "'Rajdhani', sans-serif", fontSize: "1.2rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaPhone size={14} /> +91 91630 67541
                </a>
              </div>

              <div style={{ borderLeft: "4px solid #d946ef", paddingLeft: "16px", marginTop: "8px", background: "rgba(217, 70, 239, 0.1)", padding: "16px" }}>
                <div style={{ fontSize: "0.75rem", color: "#d946ef", fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em", marginBottom: "4px" }}>EMAIL US</div>
                <a href="mailto:ggscuemk@gmail.com" className="interactive" style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "1.3rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaEnvelope size={16} color="#d946ef" /> ggscuemk@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
