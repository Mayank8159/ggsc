import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  { title: "Build with Gemini", desc: "Hands-on workshops where students ship real AI-powered products using the Gemini API.", accent: "#4285F4", tag: "Workshops", img: "/img/skills.jpeg" },
  { title: "Build the Future", desc: "Interactive workshops with mentorship from Google engineers and hands-on guidance.", accent: "#EA4335", tag: "Workshops", img: "/img/coding.jpeg" },
  { title: "Research & Publish", desc: "From prompt engineering to fine-tuning — explore AI's frontier and make your mark.", accent: "#FBBC05", tag: "Research", img: "/img/research.jpeg" },
  { title: "Lead & Inspire", desc: "Grow as a Google Student Ambassador and represent your college to the world.", accent: "#34A853", tag: "Leadership", img: "/img/inno.png" },
  { title: "Connect & Grow", desc: "A thriving community of 200+ students, mentors, and AI enthusiasts united by curiosity.", accent: "#4285F4", tag: "Community", img: "/img/collab.jpeg" },
];

const StackedCards = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".stk-label",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ".stk-label", start: "top 85%", toggleActions: "play none none reverse" },
        }
      );

      const cards = gsap.utils.toArray(".stk-card");
      const stackHeight = window.innerHeight * 0.22;

      cards.forEach((card, i) => {
        const inner = card.querySelector(".stk-inner");

        gsap.fromTo(inner,
          { scale: 1, transformOrigin: "center top", filter: "blur(0px)" },
          {
            y: gsap.utils.mapRange(1, cards.length, -20, -stackHeight + 20, cards.length - i),
            scale: gsap.utils.mapRange(1, cards.length, 0.55, 0.93, i),
            filter: "blur(" + gsap.utils.mapRange(1, cards.length, 2, 16, cards.length - i) + "px)",
            scrollTrigger: {
              trigger: card,
              scrub: 1,
              start: "top " + stackHeight,
              end: "+=" + window.innerHeight * 2,
              invalidateOnRefresh: true,
            },
          }
        );

        ScrollTrigger.create({
          trigger: card,
          pin: true,
          start: "top " + stackHeight,
          endTrigger: ".stk-end",
          end: "top " + (stackHeight + 100),
          pinSpacing: false,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} style={{ background: "#fff", position: "relative" }}>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div className="stk-label" style={{ textAlign: "center", opacity: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg,transparent,#4285F4)" }} />
            <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>
              What We Offer
            </span>
            <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg,#EA4335,transparent)" }} />
          </div>
          <h2 style={{
            fontFamily: "'zentry', sans-serif", fontWeight: 900,
            fontSize: "clamp(3rem,7vw,7rem)", textTransform: "uppercase",
            lineHeight: 0.9, color: "#0a0a0a", letterSpacing: "-0.02em",
          }}>
            Scroll to{" "}
            <span style={{ background: "linear-gradient(90deg,#4285F4,#EA4335)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              explore
            </span>
          </h2>
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "90%", maxWidth: "860px" }}>
          {CARDS.map((card, i) => (
            <div key={i} className="stk-card" style={{ position: "relative", margin: "40px auto", width: "100%" }}>
              
              {/* GEMINI GRADIENT BORDER WRAPPER */}
              <div className="stk-inner" style={{
                position: "relative",
                padding: "1.5px", // This creates the border thickness
                borderRadius: "26px",
                background: "linear-gradient(135deg, #4285F4, #9b72cb, #D96570, #FBBC05)",
                boxShadow: `0 30px 60px rgba(0,0,0,0.08)`,
                willChange: "transform, filter",
              }}>
                
                {/* Main Content Container */}
                <div style={{
                  width: "100%", 
                  borderRadius: "24px", 
                  overflow: "hidden",
                  background: "#fff",
                }}>
                  {/* Image */}
                  <div style={{ position: "relative", height: "360px", overflow: "hidden" }}>
                    <img src={card.img} alt={card.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    
                    <div style={{
                      position: "absolute", top: "20px", right: "24px",
                      fontFamily: "'Bungee', sans-serif", fontSize: "56px",
                      color: "rgba(255,255,255,0.4)", lineHeight: 1, userSelect: "none",
                    }}>0{i + 1}</div>

                    <div style={{
                      position: "absolute", top: "20px", left: "20px",
                      background: card.accent, color: "#fff",
                      fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px",
                      fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
                      padding: "6px 14px", borderRadius: "100px",
                    }}>{card.tag}</div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "36px 44px", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                      <div style={{ width: "4px", minHeight: "56px", borderRadius: "100px", background: card.accent, flexShrink: 0, marginTop: "4px" }} />
                      <div>
                        <h3 style={{
                          fontFamily: "'zentry', sans-serif", fontWeight: 900,
                          fontSize: "clamp(1.8rem,4vw,2.8rem)", textTransform: "uppercase",
                          color: "#0a0a0a", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: "12px",
                        }}>{card.title}</h3>
                        <p style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.5)", lineHeight: 1.7 }}>
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
  className="stk-end"
  style={{
    height: "60vh",
  }}
/>
    </section>
  );
};

export default StackedCards;