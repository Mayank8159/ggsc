import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Info, Sparkles, Users, Mail, ArrowLeft } from "lucide-react";
import { FiHome } from "react-icons/fi";
import { NavBar } from "../ui/tubelight-navbar";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const NAV_ITEMS_HOME = [
  { label: "ABOUT", target: "about" },
  { label: "WHY TO ATTEND", target: "why-to-attend" },
  { label: "SPEAKERS", target: "speakers" },
  { label: "CONTACT US", target: "contact-us" },
];

const CydropreneurNav = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("HOME");
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440
  );

  const navItems = [
    { name: "HOME", url: "#home", icon: Home },
    { name: "ABOUT", url: "#about", icon: Info },
    { name: "WHY TO ATTEND", url: "#why-to-attend", icon: Sparkles },
    { name: "SPEAKERS", url: "#speakers", icon: Users },
    { name: "CONTACT US", url: "#contact-us", icon: Mail },
  ];

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 300;
          for (let i = navItems.length - 1; i >= 0; i--) {
            const el = document.getElementById(navItems[i].url.replace("#", ""));
            if (el && el.offsetTop <= scrollPos) {
              setActiveTab(navItems[i].name);
              break;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const isDesktop = screenWidth >= 768;
  const isHome = activeTab === "HOME";

  // Show absolute Home buttons on desktop ONLY when activeTab is HOME (scrolled within Home section)
  const showAbsoluteHomeButtons = isDesktop && isHome;

  // Show universal NavBar on desktop when NOT on Home, and ALWAYS show it on mobile
  const showNavBar = isDesktop ? !isHome : true;

  /* ── shared glass button style ── */
  const glass = {
    background: "rgba(18, 10, 36, 0.78)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(168, 85, 247, 0.42)",
    color: "#ffffff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 18px rgba(0,0,0,0.55)",
    fontFamily: "'Ethnocentric','Orbitron',sans-serif",
    fontWeight: 800,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  return (
    <>
      {/* ── Back to Events button (always visible on mobile, hidden on PC) ── */}
      {!isDesktop && (
        <div style={{ position: "fixed", top: "24px", left: "24px", zIndex: 100000 }}>
          <button
            onClick={() => navigate("/events")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "rgba(18, 10, 36, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(168, 85, 247, 0.35)",
              color: "#e9d5ff",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              transition: "all 0.3s ease",
            }}
            className="hover:border-purple-400 hover:text-white hover:scale-105"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      )}

      {/* ── STATIC ABSOLUTE HOME BUTTONS ────────────────────────── */}
      <AnimatePresence>
        {showAbsoluteHomeButtons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="home-buttons-container"
          >
            {/* Circular Back button (replaces Home) */}
            <div style={{ position: "absolute", top: "6.5vh", left: "4.5vw", zIndex: 9999 }}>
              <motion.button
                layoutId="nav-item-HOME"
                onClick={() => navigate("/events")}
                title="Go back to Events"
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 18,
                  mass: 0.8
                }}
                style={{
                  ...glass,
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                }}
                className="hover:scale-110 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              >
                <ArrowLeft size={26} />
              </motion.button>
            </div>

            {/* 4 navigation buttons */}
            <div
              style={{
                position: "absolute",
                top: "6.0vh",
                left: "30vw",
                width: "65vw",
                height: "50px",
                zIndex: 9999,
                display: "flex",
                gap: "30px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {NAV_ITEMS_HOME.map((item, idx) => (
                <motion.button
                  layoutId={`nav-item-${item.label}`}
                  key={idx}
                  onClick={() => scrollToSection(item.target)}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 18,
                    mass: 0.8
                  }}
                  style={{
                    ...glass,
                    flex: 1,
                    height: "100%",
                    borderRadius: "20px",
                    fontSize: "12px",
                    padding: "0 8px",
                  }}
                  className="hover:scale-105 hover:border-purple-400 hover:bg-purple-900/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Universal Tubelight NavBar ── */}
      <AnimatePresence>
        {showNavBar && (
          <NavBar
            items={navItems}
            activeTab={activeTab}
            onSelect={(item) => {
              setActiveTab(item.name);
              const el = document.getElementById(item.url.replace("#", ""));
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CydropreneurNav;
