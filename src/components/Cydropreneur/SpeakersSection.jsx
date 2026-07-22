import React, { useState, useEffect } from "react";
import { FaLinkedin } from "react-icons/fa";

const SpeakersSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const topRowSpeakers = [
    { 
      name: "Narendra Nath Chatterjee", 
      img: "/img/narendra.png",
      linkedin: "https://www.linkedin.com/in/narendra-nath-chatterjee-8a7651133/" 
    },
    { 
      name: "Shantanu Mukhopadhyay", 
      img: "/img/shantanu.png",
      linkedin: "https://www.linkedin.com/in/shantanu-mukhopadhyay-b9403b2b" 
    },
    { 
      name: "Suman Mondal", 
      img: "/img/suman front.png",
      linkedin: "https://www.linkedin.com/in/suman-mondal03/" 
    },
  ];

  const bottomRowSpeakers = [
    { 
      name: "Sayantan Samanta", 
      img: "/img/sayantan.png",
      linkedin: "https://www.linkedin.com/in/sayantan-samanta-8344ba19b/" 
    },
    { 
      name: "Nilanjan Joarder", 
      img: "/img/nilanjan.png",
      linkedin: "https://www.linkedin.com/in/nilanjan-joarder/" 
    },
  ];

  const renderSpeaker = (speaker, index) => (
    <div
      key={index}
      style={{
        width: isMobile ? "calc(50% - 8px)" : "280px",
        maxWidth: isMobile ? "200px" : "100%",
        borderRadius: isMobile ? "16px" : "24px",
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease",
        cursor: "pointer",
      }}
      className="hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
    >
      <img
        src={speaker.img}
        alt={speaker.name}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />

      {/* LinkedIn Logo Button in Bottom Left Corner */}
      {speaker.linkedin && (
        <a
          href={speaker.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            bottom: isMobile ? "6px" : "12px",
            left: isMobile ? "6px" : "12px",
            width: isMobile ? "26px" : "34px",
            height: isMobile ? "26px" : "34px",
            borderRadius: "50%",
            background: "#0077b5",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 119, 181, 0.6)",
            zIndex: 10,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
          className="hover:scale-115 hover:brightness-125"
        >
          <FaLinkedin size={isMobile ? 14 : 18} />
        </a>
      )}
    </div>
  );

  return (
    <section
      id="speakers"
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "80px 16px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1360px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
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
            SPEAKERS
          </h2>
          <p
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              color: "#c084fc",
              fontSize: "17px",
              maxWidth: "600px",
              margin: "12px auto 0",
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}
          >
            Learn directly from Google Developer Experts and industry ecosystem leaders.
          </p>
        </div>

        {/* Speakers Grid Container */}
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", width: "100%" }}>
              {[topRowSpeakers[0], topRowSpeakers[1]].map((s, i) => renderSpeaker(s, i))}
            </div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", width: "100%" }}>
              {[topRowSpeakers[2]].map((s, i) => renderSpeaker(s, i + 2))}
            </div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", width: "100%" }}>
              {[bottomRowSpeakers[0], bottomRowSpeakers[1]].map((s, i) => renderSpeaker(s, i + 3))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "80px", width: "100%", alignItems: "center" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "64px", width: "100%" }}>
              {topRowSpeakers.map((s, i) => renderSpeaker(s, i))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "64px", width: "100%" }}>
              {bottomRowSpeakers.map((s, i) => renderSpeaker(s, i + 3))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpeakersSection;
