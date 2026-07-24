import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import gsap from "gsap";

const TypewriterTagline = () => {
  const line1Full = "YOUR NEXT LINE OF CODE";
  const line2Full = "COULD BE A COMPANY";

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index1 = 0;
    let index2 = 0;
    let timer2;

    setLine1("");
    setLine2("");
    setIsComplete(false);

    // Start typing immediately at t=0
    const timer1 = setInterval(() => {
      if (index1 < line1Full.length) {
        setLine1(line1Full.slice(0, index1 + 1));
        index1++;
      } else {
        clearInterval(timer1);
        setTimeout(() => {
          timer2 = setInterval(() => {
            if (index2 < line2Full.length) {
              setLine2(line2Full.slice(0, index2 + 1));
              index2++;
            } else {
              clearInterval(timer2);
              setIsComplete(true);
            }
          }, 70);
        }, 180);
      }
    }, 70);

    return () => {
      clearInterval(timer1);
      if (timer2) clearInterval(timer2);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        maxWidth: "600px",
        zIndex: 10,
        pointerEvents: "none",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "clamp(12px, 3.6vw, 18px)",
          fontWeight: 900,
          color: "#000000",
          WebkitTextStroke: "1.2px #ffffff",
          letterSpacing: "0.04em",
          lineHeight: 1.3,
          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.6))",
          minHeight: "1.4em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span>{line1}</span>
        {line1.length < line1Full.length && (
          <span style={{ color: "#c084fc", marginLeft: "2px", fontWeight: 400 }} className="animate-pulse">|</span>
        )}
      </div>

      <div
        style={{
          fontSize: "clamp(12px, 3.6vw, 18px)",
          fontWeight: 900,
          color: "#000000",
          WebkitTextStroke: "1.2px #ffffff",
          letterSpacing: "0.04em",
          lineHeight: 1.3,
          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.6))",
          minHeight: "1.4em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span>{line2}</span>
        {line1.length === line1Full.length && !isComplete && (
          <span style={{ color: "#c084fc", marginLeft: "2px", fontWeight: 400 }} className="animate-pulse">|</span>
        )}
      </div>
    </div>
  );
};

/*
  HomeSection renders the contained aspect-ratio background (mobile image / desktop video)
  and the Register Now button relative to it.
*/
const HomeSection = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const isMobileView = screenSize.width < 768;

  useEffect(() => {
    if (screenSize.width >= 768) return;

    // Reset styles just in case
    gsap.set(".welcome-text", { strokeDashoffset: 1400, fill: "transparent" });

    const tl = gsap.timeline();

    // 1. Draw text outlines with slower duration
    tl.to(".welcome-text", {
      strokeDashoffset: 0,
      duration: 4.5,
      ease: "power2.inOut",
    });

    // 2. Fill text color with black
    tl.to(".welcome-text", {
      fill: "#000000",
      duration: 1.5,
      ease: "power1.out",
    }, "-=0.8");
  }, [screenSize.width]);

  useEffect(() => {
    const onResize = () =>
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const scrollToRegister = () =>
    window.open("https://forms.gle/qYHwXw7TmNuzv2iF8", "_blank");

  // Calculate 16:9 contained viewport bounds for PC view to prevent video & button distortion across screen sizes
  const targetAspect = 16 / 9;
  const currW = screenSize.width || 1920;
  const currH = screenSize.height || 1080;
  const currentAspect = currW / currH;

  let frameW, frameH;
  if (currentAspect > targetAspect) {
    frameH = currH;
    frameW = currH * targetAspect;
  } else {
    frameW = currW;
    frameH = currW / targetAspect;
  }

  const videoViewport = {
    width: `${frameW}px`,
    height: `${frameH}px`,
    top: `${(currH - frameH) / 2}px`,
    left: `${(currW - frameW) / 2}px`,
  };

  const buttonW = frameW * 0.165;
  const buttonH = frameH * 0.125;
  const buttonFontSize = Math.max(14, Math.round(frameW * 0.0135));
  const arrowSize = Math.max(14, Math.round(frameW * 0.0135));

  return (
    <section
      id="home"
      style={{
        position: "relative",
        width: screenSize.width ? `${screenSize.width}px` : "100vw",
        height: screenSize.height ? `${screenSize.height}px` : "100vh",
        maxWidth: "100vw",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: "#000000", // Solid black background for residue spaces
        zIndex: 1,
      }}
    >
      {isMobileView ? (
        // Mobile View
        <>
          <style>{`
            .mobile-comet-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 40%;
              overflow: hidden;
              pointer-events: none;
              z-index: 5; /* Over the image */
            }
            .mobile-comet {
              position: absolute;
              width: 150px;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), #ffffff);
              filter: drop-shadow(0 0 6px rgba(255,255,255,1));
              border-radius: 50%;
              opacity: 0;
            }
            .comet-1 {
              top: 5%;
              left: -10%;
              animation: cometMove 3s linear infinite;
              animation-delay: 0s;
            }
            .comet-2 {
              top: -5%;
              left: 20%;
              animation: cometMove 4.5s linear infinite;
              animation-delay: 1.5s;
            }
            .comet-3 {
              top: 15%;
              left: -15%;
              animation: cometMove 3.5s linear infinite;
              animation-delay: 2.8s;
            }
            @keyframes cometMove {
              0% {
                transform: rotate(35deg) translateX(-200px);
                opacity: 0;
              }
              5% {
                opacity: 1;
              }
              30% {
                transform: rotate(35deg) translateX(150vw);
                opacity: 0;
              }
              100% {
                transform: rotate(35deg) translateX(150vw);
                opacity: 0;
              }
            }
          `}</style>

          {/* Comet Animation Container restricted to top 30% */}
          <div className="mobile-comet-container">
            <div className="mobile-comet comet-1" />
            <div className="mobile-comet comet-2" />
            <div className="mobile-comet comet-3" />
          </div>

          <img
            src="/img/Cydropreneur bg mob.png"
            alt="Cydropreneur Mobile Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "bottom center",
              display: "block",
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
            }}
          />

          {/* Top Gradient Overlay to seamlessly blend the top edge of the image into the black background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "35%",
              background: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Welcome Title */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              maxWidth: "500px",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <svg
              viewBox="0 0 800 140"
              style={{
                width: "100%",
                filter: "drop-shadow(0 2px 5px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))"
              }}
            >
              <defs>
                <linearGradient id="welcome-silver-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#8a99ad" />
                </linearGradient>
              </defs>
              <text
                x="50%"
                y="70"
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily="'Ethnocentric', 'Orbitron', sans-serif"
                fontSize="46px"
                fontWeight="bold"
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="welcome-text"
                letterSpacing="0.05em"
              >
                WELCOME FOLKS!
              </text>
            </svg>
          </div>

          {/* Typewriter Tagline Title */}
          <TypewriterTagline />

          {/* Mobile Button wrapper */}
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "max-content",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={scrollToRegister}
              style={{
                fontFamily: "'Ethnocentric','Orbitron',sans-serif",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 24px",
                borderRadius: "999px",
                background: "linear-gradient(135deg,#7e22ce 0%,#a855f7 50%,#c084fc 100%)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "1px solid rgba(255,255,255,0.4)",
                cursor: "pointer",
                boxShadow: "0 6px 28px rgba(168,85,247,0.7),inset 0 1px 0 rgba(255,255,255,0.4)",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
              className="hover:scale-105"
            >
              REGISTER NOW <FiArrowRight size={14} style={{ marginLeft: "8px" }} />
            </button>
          </div>
        </>
      ) : (
        // Desktop View: hero bg.png as full-screen absolute background + 16:9 video frame
        <>
          {/* Absolute full-screen background image for PC view */}
          <img
            src="/img/hero bg.png"
            alt="Hero Background PC"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              zIndex: 0,
            }}
          />

          <div
            style={{
              position: "absolute",
              width: videoViewport.width,
              height: videoViewport.height,
              top: videoViewport.top,
              left: videoViewport.left,
              zIndex: 1,
              overflow: "hidden",
              backgroundColor: "transparent",
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              src="/videos/hero-frame embedded.mp4"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                margin: 0,
                zIndex: 1,
              }}
            />

          {/* Hardcoded Desktop CTA Button */}
          <div
            style={{
              position: "absolute",
              bottom: "4.6%",
              right: "5.5%",
              width: "250px",
              height: "105px",
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={scrollToRegister}
              style={{
                width: "100%",
                height: "100%",
                fontFamily: "'Ethnocentric','Orbitron',sans-serif",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0",
                paddingLeft: "39px",
                background: "url('/img/CTA Button.png') no-repeat center",
                backgroundSize: "contain",
                backgroundColor: "transparent",
                color: "#eceff1",
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                boxShadow: "none",
                transition: "all 0.3s ease",
              }}
              className="hover:scale-105"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "8px",
                  lineHeight: "1",
                  filter: "drop-shadow(0 0 4px rgba(244, 114, 182, 0.65))",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #8a99ad 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  REGISTER
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #8a99ad 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    NOW
                  </span>
                  <FiArrowRight size={20} style={{ color: "#cbd5e1" }} />
                </span>
              </div>
            </button>
          </div>
        </div>
      </>
    )}
    </section>
  );
};

export default HomeSection;
