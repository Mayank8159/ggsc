import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Menu, X } from "lucide-react";

export function NavBar({ items, activeTab, onSelect, className }) {
  const [currentTab, setCurrentTab] = useState(activeTab || items[0]?.name);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabClick = (item) => {
    setCurrentTab(item.name);
    setMenuOpen(false);
    if (onSelect) {
      onSelect(item);
    } else if (item.url) {
      const targetId = item.url.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed top-6 z-50",
        isMobile ? "right-6 left-auto translate-x-0" : "left-1/2 -translate-x-1/2",
        className
      )}
    >
      {/* Desktop Navbar */}
      {!isMobile && (
        <div className="flex items-center gap-2 bg-black/60 border border-purple-500/30 backdrop-blur-xl py-1.5 px-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {items.map((item) => {
            const isActive = currentTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => handleTabClick(item)}
                className={cn(
                  "relative cursor-pointer text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-300 uppercase tracking-widest",
                  "text-purple-200/70 hover:text-white",
                  isActive && "text-white font-extrabold"
                )}
              >
                <span className="inline" style={{ fontFamily: "'Ethnocentric', 'Orbitron', sans-serif", fontSize: "10px" }}>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full rounded-full -z-10 border border-purple-400/80 bg-purple-600/30 shadow-[0_0_20px_rgba(168,85,247,0.7),inset_0_0_10px_rgba(192,132,252,0.5)]"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-3 rounded-full bg-black/80 border border-purple-500/50 text-white backdrop-blur-xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all outline-none"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-0 w-[220px] bg-[#0a051a]/95 border border-purple-500/40 rounded-2xl p-3 flex flex-col gap-2 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => handleTabClick(item)}
                  className={cn(
                    "flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-300 uppercase tracking-widest",
                    isActive ? "bg-purple-500/30 text-white border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "text-purple-200/70 hover:bg-purple-500/10 hover:text-white"
                  )}
                >
                  {Icon && <Icon size={18} />}
                  <span style={{ fontFamily: "'Ethnocentric', 'Orbitron', sans-serif", fontSize: "10px", marginTop: "2px" }}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
