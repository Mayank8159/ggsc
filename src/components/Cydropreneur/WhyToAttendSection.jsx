import { useState, useEffect } from "react";

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
      question: "Is this just another hackathon?",
      answer: "No! It's a high-energy hybrid workshop & venture accelerator combining Google AI Studio, Android dev, and startup pitching.",
    },
    {
      question: "Will this help me beyond exams?",
      answer: "100%. Build real-world portfolio projects, earn official certificates (MAR Points), and gain industry mentorship.",
    },
  ];

  const questionsRight = [
    {
      question: "What do I gain from participating?",
      answer: "Hands-on AI skills, direct guidance from tech founders, cash prizes, cool goodies, and complimentary lunch!",
    },
    {
      question: "Is it worth my time?",
      answer: "Absolutely. In just one day, turn your app idea into a pitch-ready mobile startup project.",
    },
  ];

  const perksFaq = [
    {
      question: "What hands-on technical skills will I gain during the event?",
      answer: "You will master Android mobile app development fundamentals integrated with Google AI Studio and Gemini API. Build production-ready intelligent mobile applications from scratch under expert guidance.",
    },
    {
      question: "How does Cydropreneur help me launch my app as a startup?",
      answer: "Learn the complete founder journey from initial idea validation to building an MVP and delivering a high-impact demo pitch to industry investors and venture mentors.",
    },
    {
      question: "What rewards, swags, and academic credits can participants earn?",
      answer: "Compete for substantial cash prize pools, exclusive developer swags, cool goodies, and receive an official Certificate of Participation recognized for university MAR Points.",
    },
    {
      question: "Who will be guiding and reviewing participant projects?",
      answer: "Get direct 1-on-1 mentorship from successful tech founders, Google Developer Group leaders, and senior software engineers for real-time code feedback and career networking.",
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
        border: "16px solid #000000",
        boxSizing: "border-box",
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        .speech-bubble-card {
          transition: all 0.3s ease;
        }
        .speech-bubble-card:hover {
          transform: translateY(-4px) scale(1.02);
          filter: drop-shadow(0 12px 25px rgba(255, 255, 255, 0.3));
        }
      `}} />

      <div
        style={{
          maxWidth: "1280px",
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
            WHY YOU CAN'T MISS CYDROPRENEUR!
          </h2>
        </div>

        {/* Hero Character & Speech Bubbles Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr 1fr",
            gap: isMobile ? "24px" : "30px",
            alignItems: "center",
            marginBottom: "50px",
          }}
        >
          {/* Left Column Speech Bubbles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {questionsLeft.map((q, idx) => (
              <div
                key={idx}
                className="speech-bubble-card"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "340px",
                  margin: "0 auto",
                }}
              >
                <img
                  src="/img/text-bubble.png"
                  alt="Speech Bubble"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "auto",
                    display: "block",
                    transform: "scaleX(-1)",
                    filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: "50%",
                    transform: "translate(-50%, -58%)",
                    width: "82%",
                    textAlign: "center",
                    color: "#ffffff",
                    fontFamily: "'Rajdhani', 'Outfit', sans-serif",
                    fontSize: isMobile ? "15px" : "17px",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    zIndex: 2,
                  }}
                >
                  {q.question}
                </div>
              </div>
            ))}
          </div>

          {/* Center Character Column */}
          <div style={{ textAlign: "center", position: "relative" }}>
            <img
              src="/img/David-lucy-why-attend.png"
              alt="Cydropreneur Characters David & Lucy"
              style={{
                maxHeight: isMobile ? "440px" : "680px",
                width: "auto",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
              }}
            />
          </div>

          {/* Right Column Speech Bubbles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {questionsRight.map((q, idx) => (
              <div
                key={idx}
                className="speech-bubble-card"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "340px",
                  margin: "0 auto",
                }}
              >
                <img
                  src="/img/text-bubble.png"
                  alt="Speech Bubble"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "auto",
                    display: "block",
                    filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: "50%",
                    transform: "translate(-50%, -58%)",
                    width: "82%",
                    textAlign: "center",
                    color: "#ffffff",
                    fontFamily: "'Rajdhani', 'Outfit', sans-serif",
                    fontSize: isMobile ? "15px" : "17px",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    zIndex: 2,
                  }}
                >
                  {q.question}
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Clean FAQ Accordion Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {perksFaq.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                style={{
                  background: isOpen ? "rgba(28, 14, 56, 0.85)" : "rgba(14, 7, 30, 0.6)",
                  backdropFilter: "blur(16px)",
                  border: isOpen ? "1.5px solid rgba(192, 132, 252, 0.6)" : "1px solid rgba(168, 85, 247, 0.25)",
                  borderRadius: "18px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  boxShadow: isOpen ? "0 10px 30px rgba(168, 85, 247, 0.25)" : "none",
                }}
              >
                {/* FAQ Header Row */}
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
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
                  <div style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif", fontSize: isMobile ? "15px" : "17px", fontWeight: 800, color: isOpen ? "#38bdf8" : "#ffffff", flex: 1, lineHeight: 1.35 }}>
                    {faq.question}
                  </div>

                  <div
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "20px",
                      fontWeight: 800,
                      color: isOpen ? "#38bdf8" : "#c084fc",
                      background: "rgba(168, 85, 247, 0.15)",
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </div>
                </button>

                {/* FAQ Expanded Answer */}
                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 22px 24px",
                      borderTop: "1px solid rgba(168, 85, 247, 0.2)",
                      paddingTop: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#e9d5ff",
                        lineHeight: 1.65,
                        margin: 0,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyToAttendSection;
