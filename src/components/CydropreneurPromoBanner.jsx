import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiCalendar, FiMapPin } from "react-icons/fi";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CydropreneurPromoBanner = () => {
  const navigate = useNavigate();
  const bannerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bannerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8f6f2", padding: "40px 24px" }}>
      <div 
        ref={bannerRef}
        onClick={() => navigate("/events/Cydropreneur")}
        className="group"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
          borderRadius: "32px",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "row",
          background: "#120a24",
          border: "1px solid rgba(192,132,252,0.3)"
        }}
      >
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 100% 50%, rgba(168,85,247,0.15) 0%, transparent 60%)",
          pointerEvents: "none"
        }} />

        <div style={{ flex: 1, padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: "99px", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "20px", width: "fit-content" }}>
            Flagship Upcoming Event
          </div>
          
          <h2 style={{ fontFamily: "'zentry', sans-serif", fontSize: "clamp(2.5rem, 4vw, 4rem)", color: "#ffffff", lineHeight: 1, textTransform: "uppercase", marginBottom: "16px", letterSpacing: "0.02em" }}>
            CYDROPRENEUR
          </h2>
          
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", lineHeight: 1.6, marginBottom: "32px", maxWidth: "480px" }}>
            Build Android applications in an immersive, hands-on workshop. Join us for a deep dive into AI & Android development.
          </p>

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: 600 }}>
              <FiCalendar color="#c084fc" size={16} /> 08th August 2026
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: 600 }}>
              <FiMapPin color="#c084fc" size={16} /> FICCI Auditorium
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#c084fc", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "13px" }} className="transition-transform duration-300 group-hover:translate-x-2">
            Explore Event
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", color: "#120a24" }}>
              <FiArrowUpRight size={16} />
            </div>
          </div>
        </div>

        <div style={{ width: "45%", position: "relative", overflow: "hidden" }} className="hidden md:block">
          <img 
            src="/img/event-banner.png" 
            alt="Cydropreneur" 
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} 
            className="transition-transform duration-700 group-hover:scale-105"
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #120a24 0%, transparent 100%)" }} />
        </div>
      </div>
    </div>
  );
};

export default CydropreneurPromoBanner;
