import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Cydropreneur WhyToAttendSection - Updated Layout
const WhyToAttendSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const questionsLeft = [
    {
      question: "Is this just another workshop?",
      answer: "No! It's a high-energy hybrid workshop & venture accelerator combining Android dev and startup pitching.",
    },
    {
      question: "Will this help me beyond exams?",
      answer: "100%. Build real-world portfolio projects, earn official certificates (MAR Points), and gain industry mentorship.",
    },
  ];

  const questionsRight = [
    {
      question: "What do I gain from participating?",
      answer: "Hands-on tech skills, direct guidance from tech founders, certificates and quiz winning prizes, and complimentary lunch!",
    },
    {
      question: "Is it worth my time?",
      answer: "Absolutely. In just one day, turn your app idea into a pitch-ready mobile startup project.",
    },
  ];

  const perksFaq = [
    {
      question: "What hands-on technical skills will I gain during the event?",
      answer: "You will master Android mobile app development fundamentals. Build production-ready intelligent mobile applications from scratch under expert guidance.",
    },
    {
      question: "How does Cydropreneur help me launch my app as a startup?",
      answer: "Learn the complete founder journey from initial idea validation to building an MVP and delivering a high-impact demo pitch to industry investors and venture mentors.",
    },
    {
      question: "What rewards, certificates, and academic credits can participants earn?",
      answer: "Receive an official Certificate of Participation recognized for university MAR Points, win exciting quiz winning prizes, and build portfolio projects.",
    },
    {
      question: "Who will be guiding and reviewing participant projects?",
      answer: "Get direct 1-on-1 mentorship from successful tech founders and senior software engineers for real-time code feedback and career networking.",
    },
    {
      question: "Are food, beverages, and event hospitality included?",
      answer: "Yes! Complimentary delicious lunch, snacks, and energy drinks are fully provided for all registered participants to keep you energized throughout the workshop.",
    },
  ];

  return (
    <section
      id="why-to-attend"
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: isMobile ? "60px 16px" : "80px 24px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Top-Left Galaxy Decoration */}
      <div style={{ position: "absolute", top: "5%", left: "-5%", width: isMobile ? "80vw" : "50vw", height: isMobile ? "80vw" : "50vw", maxWidth: "600px", maxHeight: "600px", zIndex: 1, opacity: 0.8, transform: "rotate(15deg)", pointerEvents: "none" }}>
        <img src="/img/galaxy.jpeg" alt="Galaxy Decoration" style={{ width: "100%", height: "100%", objectFit: "cover", maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 60%)", WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 60%)", mixBlendMode: "screen" }} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .speech-bubble-card {
          transition: all 0.3s ease;
        }
        .speech-bubble-card:hover {
          transform: translateY(-4px) scale(1.02);
          filter: drop-shadow(0 12px 25px rgba(255, 255, 255, 0.3));
        }
        .saas-faq-card {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .saas-faq-card:hover {
          border-color: rgba(192, 132, 252, 0.45) !important;
          transform: translateY(-2px);
        }
      `}} />

      <div
        style={{
          maxWidth: "1360px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Main Heading */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? "30px" : "50px" }}>
          <h2
            style={{
              fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
              fontSize: "clamp(1.6rem, 3.8vw, 3.2rem)",
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.25,
              textShadow: "0 0 25px rgba(168, 85, 247, 0.4)",
            }}
          >
            WHY YOU SHOULDN'T MISS CYDROPRENEUR!
          </h2>
        </div>

        {/* Hero Character & Speech Bubbles Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
            gap: isMobile ? "24px" : "36px",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "50px",
          }}
        >
          {/* Left Column Speech Bubbles */}
          <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", justifyContent: "space-evenly", alignItems: isMobile ? "center" : "flex-end", height: "100%", minHeight: isMobile ? "auto" : "500px", gap: isMobile ? "12px" : "28px", width: "100%", transform: isMobile ? "translateY(48px)" : "none" }}>
            {questionsLeft.map((q, idx) => (
              <div
                key={idx}
                className="speech-bubble-card"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: isMobile ? "100%" : "280px",
                  margin: isMobile ? "0 auto" : "0 0 0 auto",
                  background: "linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(88, 28, 135, 0.5) 100%)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(192, 132, 252, 0.4)",
                  borderRadius: "20px",
                  padding: isMobile ? "12px 14px" : "16px 20px",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontFamily: "'Rajdhani', 'Outfit', sans-serif",
                  fontSize: isMobile ? "13px" : "15px",
                  fontWeight: 800,
                  lineHeight: 1.35,
                  textAlign: "center",
                }}
              >
                {q.question}

                {/* Curved SVG Dotted Line connecting left bubbles to character */}
                {!isMobile && (
                  <svg
                    style={{
                      position: "absolute",
                      top: idx === 0 ? "50%" : "auto",
                      bottom: idx === 1 ? "50%" : "auto",
                      right: "-48px",
                      width: "50px",
                      height: "40px",
                      overflow: "visible",
                      pointerEvents: "none",
                    }}
                  >
                    <path
                      d={idx === 0 ? "M 0 0 C 25 5, 35 25, 48 35" : "M 0 40 C 25 35, 35 15, 48 5"}
                      fill="none"
                      stroke="rgba(192, 132, 252, 0.85)"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="48"
                      cy={idx === 0 ? "35" : "5"}
                      r="4"
                      fill="#c084fc"
                      style={{ filter: "drop-shadow(0 0 6px #c084fc)" }}
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Center Character Column */}
          <div style={{ textAlign: "center", position: "relative" }}>
            <img
              src="/img/David-lucy-why-attend.png"
              alt="Cydropreneur Characters David & Lucy"
              style={{
                maxHeight: isMobile ? "440px" : "600px",
                width: "auto",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
              }}
            />
          </div>

          {/* Right Column Speech Bubbles */}
          <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", justifyContent: "space-evenly", alignItems: isMobile ? "center" : "flex-start", height: "100%", minHeight: isMobile ? "auto" : "500px", gap: isMobile ? "12px" : "28px", width: "100%" }}>
            {questionsRight.map((q, idx) => (
              <div
                key={idx}
                className="speech-bubble-card"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: isMobile ? "100%" : "280px",
                  margin: isMobile ? "0 auto" : "0 auto 0 0",
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 116, 144, 0.5) 100%)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  borderRadius: "20px",
                  padding: isMobile ? "12px 14px" : "16px 20px",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontFamily: "'Rajdhani', 'Outfit', sans-serif",
                  fontSize: isMobile ? "13px" : "15px",
                  fontWeight: 800,
                  lineHeight: 1.35,
                  textAlign: "center",
                }}
              >
                {q.question}

                {/* Curved SVG Dotted Line connecting right bubbles to character */}
                {!isMobile && (
                  <svg
                    style={{
                      position: "absolute",
                      top: idx === 0 ? "50%" : "auto",
                      bottom: idx === 1 ? "50%" : "auto",
                      left: "-48px",
                      width: "50px",
                      height: "40px",
                      overflow: "visible",
                      pointerEvents: "none",
                    }}
                  >
                    <path
                      d={idx === 0 ? "M 50 0 C 25 5, 15 25, 2 35" : "M 50 40 C 25 35, 15 15, 2 5"}
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.85)"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="2"
                      cy={idx === 0 ? "35" : "5"}
                      r="4"
                      fill="#38bdf8"
                      style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }}
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Modern SaaS FAQ Accordion Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "980px", margin: "0 auto" }}>
          {perksFaq.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="saas-faq-card"
                style={{
                  background: isOpen
                    ? "linear-gradient(135deg, rgba(32, 16, 64, 0.85) 0%, rgba(16, 8, 36, 0.95) 100%)"
                    : "linear-gradient(135deg, rgba(22, 12, 44, 0.45) 0%, rgba(12, 6, 26, 0.65) 100%)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: isOpen ? "1px solid rgba(192, 132, 252, 0.55)" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: isOpen
                    ? "0 20px 45px -10px rgba(168, 85, 247, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
                    : "0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.04)",
                }}
              >
                {/* FAQ Header Row */}
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    padding: isMobile ? "16px 18px" : "22px 28px",
                    background: "transparent",
                    border: "none",
                    color: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    textAlign: "left",
                    outline: "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                      fontSize: isMobile ? "15px" : "17px",
                      fontWeight: 800,
                      color: "#ffffff",
                      flex: 1,
                      lineHeight: 1.35,
                    }}
                  >
                    {faq.question}
                  </div>

                  <div
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                      background: isOpen ? "rgba(168, 85, 247, 0.25)" : "rgba(255, 255, 255, 0.06)",
                      border: isOpen ? "1px solid rgba(192, 132, 252, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* FAQ Expanded Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          padding: isMobile ? "0 18px 20px 18px" : "0 28px 24px 28px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                          paddingTop: "18px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: isMobile ? "15px" : "16px",
                            fontWeight: 600,
                            color: "#ffffff",
                            lineHeight: 1.65,
                            margin: 0,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyToAttendSection;
