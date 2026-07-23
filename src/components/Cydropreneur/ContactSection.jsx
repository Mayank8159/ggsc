import React, { useState, useEffect } from "react";
import { FaGlobe, FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin, FaPhone, FaEnvelope } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";

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

const ClassySocialRow = ({ href, icon, platform, handle }) => {
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
        justifyContent: "space-between",
        padding: "14px 18px",
        background: hover
          ? "linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(30, 15, 60, 0.4) 100%)"
          : "rgba(255, 255, 255, 0.03)",
        border: hover
          ? "1px solid rgba(192, 132, 252, 0.45)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        textDecoration: "none",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hover ? "translateX(4px)" : "none",
        boxShadow: hover
          ? "0 8px 24px rgba(168, 85, 247, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
          : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: hover ? "rgba(168, 85, 247, 0.25)" : "rgba(255, 255, 255, 0.05)",
            border: hover ? "1px solid rgba(192, 132, 252, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: hover ? "#ffffff" : "#c084fc",
            transition: "all 0.3s ease",
            fontSize: "18px",
          }}
        >
          {icon}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {platform}
          </span>
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "0.82rem",
              color: hover ? "#e9d5ff" : "#a1a1aa",
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginTop: "2px",
              transition: "color 0.2s ease",
            }}
          >
            {handle}
          </span>
        </div>
      </div>

      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: hover ? "rgba(168, 85, 247, 0.3)" : "rgba(255, 255, 255, 0.04)",
          border: hover ? "1px solid rgba(192, 132, 252, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: hover ? "#ffffff" : "#a1a1aa",
          transition: "all 0.3s ease",
          transform: hover ? "translate(2px, -2px)" : "none",
        }}
      >
        <FiArrowUpRight size={15} />
      </div>
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
        minHeight: "auto",
        padding: isMobile ? "110px 16px 60px 16px" : "140px 24px 90px 24px",
        background: "transparent",
        position: "relative",
        overflow: "visible",
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
          top: isMobile ? "20px" : "40px",
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
            will-change: transform;
          }
          .ticker-inner-right {
            display: flex;
            width: max-content;
            animation: ticker-slide-right 25s linear infinite;
            white-space: nowrap;
            will-change: transform;
          }
        `}} />

        {/* White Ribbon — Back, rotated -5.5deg on mobile / -3.5deg on desktop */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "-25px" : "10px",
            left: "-10%",
            width: "120%",
            height: "46px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            transform: isMobile ? "rotate(-5.5deg)" : "rotate(-3.5deg)",
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

        {/* Black Ribbon — Front, rotated 5.5deg on mobile / 3.5deg on desktop */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "5px" : "40px",
            left: "-10%",
            width: "120%",
            height: "46px",
            background: "#000000",
            borderTop: "2px solid #a855f7",
            borderBottom: "2px solid #a855f7",
            display: "flex",
            alignItems: "center",
            transform: isMobile ? "rotate(5.5deg)" : "rotate(3.5deg)",
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
        {/* Main Section Header Removed */}

        {/* Footer Image Banner with Speech Bubbles */}
        <div style={{
          width: "100%",
          padding: isMobile ? "40px 16px 10px 16px" : "60px 40px 40px 40px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: isMobile ? "0" : "50px",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Left Speech Bubble (PC Only) */}
          {!isMobile && (
            <div
              className="speech-bubble-card"
              style={{
                position: "relative",
                flex: 1,
                maxWidth: "260px",
                background: "linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(88, 28, 135, 0.5) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(192, 132, 252, 0.4)",
                borderRadius: "20px",
                padding: "16px 20px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontFamily: "'Rajdhani', 'Outfit', sans-serif",
                fontSize: "15px",
                fontWeight: 800,
                lineHeight: 1.35,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "auto"
              }}
            >
              Turn your ideas into reality!

              {/* Curved SVG Dotted Line */}
              <svg
                style={{
                  position: "absolute",
                  top: "30%",
                  right: "-48px",
                  width: "50px",
                  height: "40px",
                  overflow: "visible",
                  pointerEvents: "none",
                }}
              >
                <path
                  d="M 0 0 C 25 5, 35 25, 48 35"
                  fill="none"
                  stroke="rgba(192, 132, 252, 0.85)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <circle
                  cx="48"
                  cy="35"
                  r="4"
                  fill="#c084fc"
                  style={{ filter: "drop-shadow(0 0 6px #c084fc)" }}
                />
              </svg>
            </div>
          )}

          <img 
            src="/img/footer--.png" 
            alt="Cydropreneur Footer Banner" 
            style={{ 
              width: "100%", 
              maxWidth: isMobile ? "340px" : "480px", 
              height: "auto", 
              objectFit: "contain",
              display: "block",
              position: "relative",
              zIndex: 2,
              flexShrink: 0
            }} 
          />

          {/* Right Speech Bubble (PC Only) */}
          {!isMobile && (
            <div
              className="speech-bubble-card"
              style={{
                position: "relative",
                flex: 1,
                maxWidth: "260px",
                background: "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 116, 144, 0.5) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "20px",
                padding: "16px 20px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontFamily: "'Rajdhani', 'Outfit', sans-serif",
                fontSize: "15px",
                fontWeight: 800,
                lineHeight: 1.35,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "auto"
              }}
            >
              Build the future with us!

              {/* Curved SVG Dotted Line */}
              <svg
                style={{
                  position: "absolute",
                  bottom: "30%",
                  left: "-48px",
                  width: "50px",
                  height: "40px",
                  overflow: "visible",
                  pointerEvents: "none",
                }}
              >
                <path
                  d="M 50 40 C 25 35, 15 15, 2 5"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.85)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <circle
                  cx="2"
                  cy="5"
                  r="4"
                  fill="#38bdf8"
                  style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Citadel-Style Open 4-Column Footer/Contact Layout */}
        <div style={{
          width: "100%",
          padding: "20px 0",
          boxSizing: "border-box",
          marginBottom: "20px",
        }}>
          {/* 4 Columns Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
            gap: isMobile ? "36px" : "32px",
            alignItems: "start",
            marginBottom: "40px",
          }}>
            {/* Column 1: Branding & Organized By */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0px", marginTop: "-40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/img/cydro-logo-footer.png" alt="CYDROPRENEUR Logo" style={{ height: "140px", objectFit: "contain" }} />
              </div>

              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "0.95rem",
                color: "#ffffff",
                lineHeight: 1.5,
                margin: 0,
                marginTop: "-30px",
                fontWeight: 500,
              }}>
                CydroPreneur is an immersive, hands-on workshop designed to introduce you to learn Android development
              </p>

              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "0px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "50px" }}>
                  <img src="/img/IEM_2.png" alt="IEM Logo" style={{ height: "85px", objectFit: "contain", marginTop: "-15px", marginBottom: "-15px" }} />
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem", color: "#ffffff", fontWeight: 600 }}>
                    Institute of Engineering and Management, Newtown
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "50px", marginTop: "10px" }}>
                  <img src="/img/UEM_2.png" alt="UEM Logo" style={{ height: "85px", objectFit: "contain", marginTop: "-15px", marginBottom: "-15px" }} />
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem", color: "#ffffff", fontWeight: 600 }}>
                    University of Engineering and Management, Kolkata
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: CONTACT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{
                fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                fontSize: "1rem",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.1em",
                margin: 0,
                textTransform: "uppercase",
              }}>
                CONTACT
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.95rem", color: "#ffffff", fontWeight: 600 }}>
                <div>
                  <span style={{ color: "#ffffff" }}>Pallabi Roy : </span>
                  <a href="tel:8340525962" className="interactive" style={{ color: "#ffffff", textDecoration: "none", fontWeight: 700 }}>
                    +91 83405 25962
                  </a>
                </div>

                <div>
                  <span style={{ color: "#ffffff" }}>Swastik Manna : </span>
                  <a href="tel:9163067541" className="interactive" style={{ color: "#ffffff", textDecoration: "none", fontWeight: 700 }}>
                    +91 91630 67541
                  </a>
                </div>

                <div>
                  <span style={{ color: "#ffffff" }}>Email : </span>
                  <a href="mailto:ggscuemk@gmail.com" className="interactive" style={{ color: "#ffffff", textDecoration: "none", fontWeight: 700 }}>
                    ggscuemk@gmail.com
                  </a>
                </div>

                <div>
                  <span style={{ color: "#ffffff" }}>Venue : </span>
                  <span style={{ color: "#ffffff", fontWeight: 700 }}>
                    Ficci Auditorium - IEM, New Town
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: RESOURCES / WORKSHOP DETAILS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{
                fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                fontSize: "1rem",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.1em",
                margin: 0,
                textTransform: "uppercase",
              }}>
                RESOURCES
              </h3>

              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "0.95rem",
                color: "#ffffff",
                fontWeight: 600,
              }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ffffff" }}>▪</span> Android Dev & Google AI Studio Guide
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ffffff" }}>▪</span> Startup Pitching & MVP Toolkit
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ffffff" }}>▪</span> Official Certificate & MAR Points
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ffffff" }}>▪</span> 1-on-1 Founder Mentorship & FAQs
                </li>
              </ul>
            </div>

            {/* Column 4: FOLLOW US & MAP */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{
                fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                fontSize: "1rem",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.1em",
                margin: 0,
                textTransform: "uppercase",
              }}>
                FOLLOW US
              </h3>

              {/* Social Icons Row */}
              <div style={{ display: "flex", gap: "24px" }}>
                {[
                  { icon: <FaWhatsapp size={26} />, href: "https://chat.whatsapp.com/ImdIqwRXTdcHxy0LirVSQQ" },
                  { icon: <FaInstagram size={26} />, href: "https://www.instagram.com/ggsc_uemk" },
                  { icon: <FaLinkedin size={26} />, href: "https://www.linkedin.com/in/ggsc-uemk" },
                  { icon: <FaFacebook size={26} />, href: "https://www.facebook.com/share/1Cd7Y97m99/" },
                ].map((s, idx) => (
                  <a
                    key={idx}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive"
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      transition: "all 0.2s ease",
                      textDecoration: "none",
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "0.85rem",
                color: "#ffffff",
                margin: 0,
                fontWeight: 500,
              }}>
                Join our community for updates and announcements
              </p>

              {/* Map Preview Box */}
              <div style={{
                width: "100%",
                height: "130px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
              }}>
                <iframe
                  title="UEM Kolkata Venue Map"
                  src="https://maps.google.com/maps?q=University%20of%20Engineering%20%26%20Management%20(UEM)%20Newtown%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright Section */}
          <div style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            paddingTop: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textAlign: "center",
          }}>
            {/* Designed By without name (as explicitly requested) */}
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "0.95rem",
              color: "#ffffff",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}>
              Designed By :
            </div>

            {/* Copyright Notice */}
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "0.9rem",
              color: "#ffffff",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}>
              © 2026 Google Gemini Student Community. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
