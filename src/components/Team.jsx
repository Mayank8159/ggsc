import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TEAM = [
  {
    name: "Pallabi Roy",
    role: "Chairperson",
    color: "#4285F4",
    img: "/img/pallabi.jpeg",
    desc: "Visionary leader driving GGSC's mission to make AI education accessible to every student at UEM Kolkata.",
    emoji: "🎯",
  },
  {
    name: "Swastik Manna",
    role: "Vice Chairperson",
    color: "#EA4335",
    img: "/img/swastik.jpeg",
    desc: "Strategist and organizer orchestrating GGSC's events, partnerships, and community programs.",
    emoji: "⚡",
  },
  {
    name: "Parnatash Mukherjee",
    role: "Secretary",
    color: "#FBBC05",
    img: "/img/parnatash.jpeg",
    desc: "Keeping GGSC operations smooth — from documentation to coordinating workshops and hackathons.",
    emoji: "📋",
  },
  {
    name: "Debojeet Bannerjee",
    role: "Secretary",
    color: "#34A853",
    img: "/img/debojeet.jpeg",
    desc: "Technical backbone of GGSC, ensuring every workshop, session, and event runs flawlessly.",
    emoji: "🛠️",
  },
  {
    name: "Sagnik Saha",
    role: "Treasurer",
    color: "#4285F4",
    img: "/img/sagnik.jpeg",
    desc: "Managing GGSC's resources and finances with transparency to power every initiative we run.",
    emoji: "💎",
  },
];

const Team = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const bgImgRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(".team-title-word",
        { y: 80, opacity: 0, filter: "blur(10px)" },
        {
          y: 0, opacity: 1, filter: "blur(0px)",
          stagger: 0.08, duration: 1.2, ease: "power4.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );

      // Cards cascade in
      gsap.fromTo(".team-card-item",
        { y: 100, opacity: 0, rotateX: -20, filter: "blur(8px)" },
        {
          y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)",
          stagger: 0.1, duration: 1.0, ease: "power4.out",
          scrollTrigger: { trigger: ".team-cards-wrap", start: "top 80%", toggleActions: "play none none reverse" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Animate bg image swap on active change
  useEffect(() => {
    if (!bgImgRef.current) return;
    gsap.fromTo(bgImgRef.current,
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
    );
  }, [active]);

  const handleCardClick = (i) => {
    setActive(i);
    // Tilt in the card
    const card = cardRefs.current[i];
    if (card) {
      gsap.fromTo(card, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
    }
  };

  const member = TEAM[active];

  return (
    <>
      <style>{`
        .team-panel {
          display: grid;
          grid-template-columns: 1fr 480px;
          min-height: 600px;
          margin: 0 60px;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 40px 120px rgba(0,0,0,0.12);
        }
        .team-heading {
          padding: 0 60px;
          margin-bottom: 60px;
          perspective: 600px;
        }
        @media (max-width: 900px) {
          .team-panel {
            grid-template-columns: 1fr;
            margin: 0 20px;
            min-height: auto;
          }
          .team-heading {
            padding: 0 24px;
          }
        }
      `}</style>
    <section
      id="team"
      ref={sectionRef}
      style={{
        background: "transparent",
        padding: "100px 0 100px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Heading */}
      <div className="team-heading" style={{ marginBottom: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg,transparent,#4285F4)" }} />
          <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>
            Leadership Roster
          </span>
          <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg,#EA4335,transparent)" }} />
        </div>
        <div>
          {["Meet", "the", "Team"].map((w, i) => (
            <span key={i} className="team-title-word"
              style={{
                display: "inline-block", marginRight: "0.3em",
                fontFamily: "'zentry', sans-serif", fontWeight: 900,
                fontSize: "clamp(3rem,8vw,8rem)", textTransform: "uppercase",
                lineHeight: 0.88, letterSpacing: "-0.03em", opacity: 0,
                ...(w === "Team" ? {
                  background: "linear-gradient(90deg,#4285F4,#EA4335)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                } : { color: "#0a0a0a" }),
              }}>
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Main panel - split layout */}
      <div className="team-panel">

        {/* Left: active member showcase */}
        <div style={{
          position: "relative", overflow: "hidden",
          background: "#060608",
          minHeight: "600px",
        }}>
          {/* Background image with transition */}
          <img
            ref={bgImgRef}
            src={member.img}
            alt={member.name}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
            }}
          />
          {/* Gradient overlays */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${member.color}60 0%, rgba(0,0,0,0.85) 60%)`,
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
          }} />

          {/* Heavy glass card over image */}
          <div style={{
            position: "absolute", bottom: "40px", left: "40px", right: "40px",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            borderRadius: "24px",
            border: `1px solid ${member.color}40`,
            padding: "32px",
            boxShadow: `0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}>
            <div style={{
              fontFamily: "'Bungee', sans-serif", fontSize: "9px",
              letterSpacing: "0.3em", textTransform: "uppercase",
              color: member.color, marginBottom: "10px",
            }}>
              {member.emoji} {member.role}
            </div>
            <h3 style={{
              fontFamily: "'zentry', sans-serif", fontWeight: 900,
              fontSize: "clamp(2rem,4vw,3.5rem)", textTransform: "uppercase",
              color: "#ffffff", lineHeight: 0.9, letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}>
              {member.name}
            </h3>
            <div style={{ height: "1px", background: `linear-gradient(90deg, ${member.color}60, transparent)`, marginBottom: "16px" }} />
            <p style={{
              fontFamily: "'Nanum Gothic', sans-serif", fontSize: "14px",
              color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: "400px",
            }}>
              {member.desc}
            </p>
            {/* Google dots */}
            <div style={{ display: "flex", gap: "6px", marginTop: "20px" }}>
              {["#4285F4","#EA4335","#FBBC05","#34A853"].map((c, i) => (
                <div key={i} style={{
                  width: c === member.color ? "20px" : "7px",
                  height: "7px", borderRadius: "100px",
                  background: c, opacity: c === member.color ? 1 : 0.25,
                  transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
                }} />
              ))}
            </div>
          </div>

          {/* Big ghost name */}
          <div style={{
            position: "absolute", top: "20px", right: "30px",
            fontFamily: "'zentry', sans-serif", fontWeight: 900,
            fontSize: "clamp(4rem,8vw,8rem)", textTransform: "uppercase",
            color: "rgba(255,255,255,0.04)", lineHeight: 1,
            userSelect: "none", letterSpacing: "-0.04em",
          }}>
            {member.name.split(" ")[0]}
          </div>
        </div>

        {/* Right: member list */}
        <div className="team-cards-wrap" style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderLeft: "1px solid rgba(255,255,255,0.8)",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}>
          {TEAM.map((m, i) => (
            <div
              key={i}
              ref={el => cardRefs.current[i] = el}
              className="team-card-item"
              onClick={() => handleCardClick(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "20px 28px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                background: i === active
                  ? `${m.color}12`
                  : hovered === i ? "rgba(0,0,0,0.03)" : "transparent",
                borderLeft: `3px solid ${i === active ? m.color : "transparent"}`,
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                opacity: 0,
              }}
            >
              {/* Avatar with image */}
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px",
                overflow: "hidden", flexShrink: 0,
                border: `2px solid ${i === active ? m.color : "rgba(0,0,0,0.08)"}`,
                boxShadow: i === active ? `0 4px 20px ${m.color}40` : "none",
                transition: "all 0.4s ease",
              }}>
                <img
                  src={m.img}
                  alt={m.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'zentry', sans-serif", fontWeight: 900,
                  fontSize: "1.1rem", textTransform: "uppercase",
                  lineHeight: 1, letterSpacing: "-0.01em",
                  color: i === active ? "#0a0a0a" : "#0a0a0a",
                  marginBottom: "4px",
                }}>
                  {m.name}
                </div>
                <div style={{
                  fontFamily: "'Bungee', sans-serif", fontSize: "8px",
                  letterSpacing: "0.25em", textTransform: "uppercase",
                  color: i === active ? m.color : "rgba(0,0,0,0.3)",
                  transition: "color 0.3s",
                }}>
                  {m.role}
                </div>
              </div>

              {/* Active indicator */}
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: i === active ? m.color : "rgba(0,0,0,0.1)",
                boxShadow: i === active ? `0 0 12px ${m.color}` : "none",
                flexShrink: 0, transition: "all 0.3s",
              }} />
            </div>
          ))}

          {/* Footer badge */}
          <div style={{ padding: "24px 28px", marginTop: "auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              borderRadius: "100px", padding: "10px 20px",
              background: "rgba(66,133,244,0.06)",
              border: "1px solid rgba(66,133,244,0.15)",
            }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {["#4285F4","#EA4335","#FBBC05","#34A853"].map((c, i) => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c }} />
                ))}
              </div>
              <span style={{
                fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px",
                color: "rgba(0,0,0,0.35)", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                GSAP · UEM Kolkata
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Team;
