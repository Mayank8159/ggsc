import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import gsap from "gsap";

/*
  HomeSection renders the contained aspect-ratio background (mobile image / desktop video)
  and the Register Now button relative to it.
*/
const HomeSection = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (screenSize.width >= 768) return;

    // Reset styles just in case
    gsap.set(".welcome-text", { strokeDashoffset: 1000, fill: "transparent" });

    const tl = gsap.timeline();

    // 1. Draw text outlines
    tl.to(".welcome-text", {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: "power2.inOut",
    });

    // 2. Fill text color
    tl.to(".welcome-text", {
      fill: "#000000",
      duration: 0.6,
      ease: "power1.out",
    }, "-=0.5");
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

  const isMobileView = screenSize.width < 768;

  // Calculate contained video frame dimensions (16:9 aspect ratio) for PC view to prevent cropping
  let videoViewport = { width: "100%", height: "100%", top: 0, left: 0 };
  if (!isMobileView && screenSize.width && screenSize.height) {
    const videoRatio = 16 / 9;
    const screenRatio = screenSize.width / screenSize.height;

    if (screenRatio > videoRatio) {
      // Screen is wider than video ratio -> Pillarbox (black bars left and right)
      const height = screenSize.height;
      const width = height * videoRatio;
      const left = (screenSize.width - width) / 2;
      videoViewport = {
        width: `${width}px`,
        height: `${height}px`,
        top: 0,
        left: `${left}px`,
      };
    } else {
      // Screen is taller than video ratio -> Letterbox (black bars top and bottom)
      const width = screenSize.width;
      const height = width / videoRatio;
      const top = (screenSize.height - height) / 2;
      videoViewport = {
        width: `${width}px`,
        height: `${height}px`,
        top: `${top}px`,
        left: 0,
      };
    }
  }

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
            .shooting-star-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              pointer-events: none;
              z-index: 2;
            }
            .shooting-star {
              position: absolute;
              width: 200px;
              height: 3px;
              background: linear-gradient(-45deg, #c084fc, rgba(255, 255, 255, 0));
              filter: drop-shadow(0 0 8px #c084fc);
              opacity: 0;
            }
            .star-1 {
              top: 15%;
              right: 10%;
              animation: shoot1 8s ease-in-out infinite;
              animation-delay: 1s;
            }
            .star-2 {
              top: 30%;
              right: 35%;
              animation: shoot2 10s ease-in-out infinite;
              animation-delay: 3.5s;
            }
            .star-3 {
              top: 8%;
              right: 20%;
              animation: shoot3 9s ease-in-out infinite;
              animation-delay: 6s;
            }
            
            @keyframes shoot1 {
              0% {
                transform: translate(0, 0) rotate(-40deg) scale(0.5);
                opacity: 0;
              }
              1% {
                opacity: 1;
              }
              25% {
                transform: translate(-500px, 420px) rotate(-40deg) scale(2.0);
                opacity: 0;
              }
              100% {
                transform: translate(-500px, 420px) rotate(-40deg) scale(2.0);
                opacity: 0;
              }
            }
            @keyframes shoot2 {
              0% {
                transform: translate(0, 0) rotate(-35deg) scale(0.6);
                opacity: 0;
              }
              1% {
                opacity: 1;
              }
              28% {
                transform: translate(-600px, 480px) rotate(-35deg) scale(2.3);
                opacity: 0;
              }
              100% {
                transform: translate(-600px, 480px) rotate(-35deg) scale(2.3);
                opacity: 0;
              }
            }
            @keyframes shoot3 {
              0% {
                transform: translate(0, 0) rotate(-42deg) scale(0.4);
                opacity: 0;
              }
              1% {
                opacity: 1;
              }
              24% {
                transform: translate(-400px, 340px) rotate(-42deg) scale(1.8);
                opacity: 0;
              }
              100% {
                transform: translate(-400px, 340px) rotate(-42deg) scale(1.8);
                opacity: 0;
              }
            }
          `}</style>
          
          <div className="shooting-star-container">
            <div className="shooting-star star-1" />
            <div className="shooting-star star-2" />
            <div className="shooting-star star-3" />
          </div>

          <img
            src="/img/Cydropreneur bg mob.png"
            alt="Cydropreneur Mobile Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
              margin: "0 auto",
              backgroundColor: "#000000",
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
                WELCOME FOKES !
              </text>
            </svg>
          </div>

          {/* Mobile Button wrapper */}
          <div
            style={{
              position: "absolute",
              bottom: "36px",
              right: "50%",
              transform: "translateX(50%)",
              width: "auto",
              height: "auto",
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
                padding: "10px 20px",
                borderRadius: "999px",
                background: "linear-gradient(135deg,#7e22ce 0%,#a855f7 50%,#c084fc 100%)",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "1px solid rgba(255,255,255,0.4)",
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(168,85,247,0.6),inset 0 1px 0 rgba(255,255,255,0.4)",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
              className="hover:scale-105"
            >
              REGISTER NOW <FiArrowRight size={13} style={{ marginLeft: "8px" }} />
            </button>
          </div>
        </>
      ) : (
        // Desktop View: Perfectly contained 16:9 aspect-ratio frame
        <div
          style={{
            position: "absolute",
            width: videoViewport.width,
            height: videoViewport.height,
            top: videoViewport.top,
            left: videoViewport.left,
            zIndex: 1,
            overflow: "hidden",
            backgroundColor: "#000000",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            src="/videos/hero-frame embedded.mp4"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              margin: 0,
            }}
          />

          {/* Desktop Button - positioned relative to video frame boundaries */}
          <div
            style={{
              position: "absolute",
              bottom: "3%",
              right: "4.8%",
              width: "268px",
              height: "110px",
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
                paddingLeft: "42px",
                background: "url('/img/CTA Button.png') no-repeat center",
                backgroundSize: "contain",
                backgroundColor: "transparent",
                color: "#eceff1",
                fontSize: "22px",
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
                  gap: "10px",
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
                    gap: "6px",
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
                  <FiArrowRight size={22} style={{ color: "#cbd5e1" }} />
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeSection;
