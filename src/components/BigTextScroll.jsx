import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROW1 = ["Build", "·", "Learn", "·", "Create", "·", "Lead", "·", "Inspire", "·"];
const ROW2 = ["Gemini", "·", "AI", "·", "Research", "·", "Design", "·", "Code", "·"];

const COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

const TextRow = ({ words, direction = 1, speed = 120, coloredIndices = [] }) => {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Duplicate content for seamless loop
    const clone = track.innerHTML;
    track.innerHTML = clone + clone;

    const totalW = track.scrollWidth / 2;
    const startX = direction === 1 ? 0 : -totalW;

    gsap.fromTo(
      track,
      { x: startX },
      {
        x: direction === 1 ? -totalW : 0,
        duration: totalW / speed,
        ease: "none",
        repeat: -1,
      }
    );
  }, [direction, speed]);

  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div
        ref={trackRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            style={{
              fontFamily: word === "·" ? "sans-serif" : "'zentry', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(4rem, 8vw, 9rem)",
              textTransform: "uppercase",
              lineHeight: 1,
              color: coloredIndices.includes(i)
                ? COLORS[coloredIndices.indexOf(i) % COLORS.length]
                : word === "·"
                ? "rgba(0,0,0,0.15)"
                : "rgba(0,0,0,0.08)",
              letterSpacing: word === "·" ? "0" : "-0.02em",
              userSelect: "none",
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

const BigTextScroll = () => {
  const sectionRef = useRef(null);
  const labelRef = useRef(null);
  const centerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on the center content
      gsap.fromTo(
        centerRef.current,
        { y: 60, opacity: 0, filter: "blur(16px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Label fade
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#ffffff",
        paddingTop: "100px",
        paddingBottom: "100px",
        overflow: "hidden",
      }}
    >
      {/* Section blobs */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "80vw",
          height: "80vw",
          maxWidth: "800px",
          maxHeight: "800px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(66,133,244,0.04) 0%, rgba(234,67,53,0.03) 40%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        ref={labelRef}
        style={{
          textAlign: "center",
          marginBottom: "60px",
          opacity: 0,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #4285F4)",
            }}
          />
          <span
            style={{
              fontFamily: "'Bungee', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.35)",
            }}
          >
            What We Do
          </span>
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "linear-gradient(90deg, #EA4335, transparent)",
            }}
          />
        </div>
      </div>

      {/* Row 1 — left scroll */}
      <div style={{ marginBottom: "20px" }}>
        <TextRow words={ROW1} direction={1} speed={80} coloredIndices={[0, 4, 8]} />
      </div>

      {/* Center floating card */}
      <div
        ref={centerRef}
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 20px",
          opacity: 0,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "0 20px 80px rgba(66,133,244,0.10), 0 1px 0 rgba(255,255,255,1) inset",
            borderRadius: "28px",
            padding: "48px 56px",
            textAlign: "center",
            maxWidth: "580px",
          }}
        >
          {/* Google dots */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {["#4285F4", "#EA4335", "#FBBC05", "#34A853"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>

          <h2
            style={{
              fontFamily: "'zentry', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              textTransform: "uppercase",
              lineHeight: 0.95,
              color: "#0a0a0a",
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            One community.
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Infinite potential.
            </span>
          </h2>

          <p
            style={{
              fontFamily: "'Nanum Gothic', sans-serif",
              fontSize: "15px",
              color: "rgba(0,0,0,0.5)",
              lineHeight: 1.7,
              maxWidth: "380px",
              margin: "0 auto",
            }}
          >
            GGSC unites the builders, researchers, designers and dreamers of
            UEM Kolkata — all powered by Google Gemini.
          </p>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(66,133,244,0.3), rgba(234,67,53,0.2), transparent)",
              margin: "28px 0",
            }}
          />

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "40px",
            }}
          >
            {[
              { num: "200+", label: "Members" },
              { num: "12+", label: "Events" },
              { num: "3", label: "Awards" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Bungee', sans-serif",
                    fontSize: "1.8rem",
                    color: COLORS[i],
                    lineHeight: 1,
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    fontFamily: "'Nanum Gothic', sans-serif",
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,0.4)",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 — right scroll */}
      <div style={{ marginTop: "20px" }}>
        <TextRow words={ROW2} direction={-1} speed={100} coloredIndices={[2, 6]} />
      </div>
    </section>
  );
};

export default BigTextScroll;
