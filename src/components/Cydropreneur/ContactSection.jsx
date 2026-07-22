import React from "react";

const ContactSection = () => {
  return (
    <section
      id="contact-us"
      style={{
        width: "100%",
        minHeight: "85vh",
        padding: "120px 24px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "16px solid #000000",
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
              <span key={i} style={{ paddingRight: "60px", flexShrink: 0 }}>
                CREATE - LEAD - INSPIRE - BUILD - CYDROPRENEUR -
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
              <span key={i} style={{ paddingRight: "60px", flexShrink: 0, color: "#d8b4fe" }}>
                THANKS FOR VISITING - SEE YOU AT CYDROPRENEUR -
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginTop: "80px", marginBottom: "30px" }}>
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

        {/* Graphic Image - Intact without extra animations */}
        <div style={{ textAlign: "center", width: "100%", margin: "0 auto" }}>
          <img
            src="/img/footer--.png"
            alt="Cydropreneur Contact Artwork"
            style={{
              maxHeight: "580px",
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
