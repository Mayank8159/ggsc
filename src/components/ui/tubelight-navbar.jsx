import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function NavBar({ items, activeTab, onSelect, className }) {
  const [currentTab, setCurrentTab] = useState(activeTab || items[0]?.name);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabClick = (item) => {
    setCurrentTab(item.name);
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
        "fixed top-6 left-1/2 -translate-x-1/2 z-50",
        className
      )}
    >
      <div className="flex items-center gap-2 bg-black/60 border border-purple-500/30 backdrop-blur-xl py-1.5 px-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {items.map((item) => {
          const Icon = item.icon;
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
              <span className="hidden md:inline" style={{ fontFamily: "'Ethnocentric', 'Orbitron', sans-serif", fontSize: "10px" }}>{item.name}</span>
              <span className="md:hidden">
                {Icon && <Icon size={18} strokeWidth={2.5} />}
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-purple-500/20 rounded-full -z-10 border border-purple-400/40"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  {/* Tubelight Lamp Beam */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-purple-400 rounded-t-full shadow-[0_0_12px_#c084fc]">
                    <div className="absolute w-14 h-6 bg-purple-500/40 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-10 h-6 bg-purple-400/50 rounded-full blur-sm -top-1" />
                    <div className="absolute w-5 h-4 bg-purple-300/60 rounded-full blur-xs top-0 left-2.5" />
                  </div>
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
