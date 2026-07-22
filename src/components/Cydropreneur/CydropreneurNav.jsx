import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Info, Sparkles, Users, Mail, ArrowLeft } from "lucide-react";
import { NavBar } from "../ui/tubelight-navbar";

const CydropreneurNav = () => {
  const [activeTab, setActiveTab] = useState("HOME");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "HOME", url: "#home", icon: Home },
    { name: "ABOUT", url: "#about", icon: Info },
    { name: "WHY TO ATTEND", url: "#why-to-attend", icon: Sparkles },
    { name: "SPEAKERS", url: "#speakers", icon: Users },
    { name: "CONTACT US", url: "#contact-us", icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) =>
        document.getElementById(item.url.replace("#", ""))
      );
      const scrollPosition = window.scrollY + 250;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(navItems[i].name);
          break;
        }
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSelect = (item) => {
    setActiveTab(item.name);
    const targetId = item.url.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Top Left: Back to GGSC Events Button */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: isMobile ? "16px" : "32px",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => navigate("/events")}
          style={{
            fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: isMobile ? "10px" : "10px 18px",
            borderRadius: "999px",
            background: "rgba(18, 10, 36, 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(168, 85, 247, 0.35)",
            color: "#e9d5ff",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
            transition: "all 0.3s ease",
          }}
          className="hover:border-purple-400 hover:text-white hover:scale-105"
        >
          <ArrowLeft size={14} /> 
          {!isMobile && <span>Back to Events</span>}
        </button>
      </div>

      {/* Tubelight Glowing Navbar */}
      <NavBar
        items={navItems}
        activeTab={activeTab}
        onSelect={handleSelect}
      />
    </>
  );
};

export default CydropreneurNav;
