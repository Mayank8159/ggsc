import { useEffect, useState } from "react";
import CydropreneurNav from "./CydropreneurNav";
import HomeSection from "./HomeSection";
import AboutSection from "./AboutSection";
import WhyToAttendSection from "./WhyToAttendSection";
import SpeakersSection from "./SpeakersSection";
import ContactSection from "./ContactSection";
import CydropreneurFooter from "./CydropreneurFooter";
import ShaderBackground from "./ShaderBackground";
import { FaArrowUp } from "react-icons/fa";

const Cydropreneur = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "transparent",
        color: "#ffffff",
        fontFamily: "'Rajdhani', 'Orbitron', 'Chakra Petch', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <ShaderBackground />
      <CydropreneurNav />
      <HomeSection />
      <AboutSection />
      <WhyToAttendSection />
      <SpeakersSection />
      <ContactSection />
      <CydropreneurFooter />
      
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="hover:scale-110 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(88, 28, 135, 0.7))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(192, 132, 252, 0.5)",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          cursor: "pointer",
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? "auto" : "none",
          transform: showScrollTop ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <FaArrowUp size={20} />
      </button>
    </div>
  );
};

export default Cydropreneur;

