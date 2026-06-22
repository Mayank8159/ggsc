import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VintageMemory = () => {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const grainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade-in the whole section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Slow parallax on photo
      gsap.to(imgRef.current, {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      });

      // Text lines stagger
      gsap.fromTo(
        ".vintage-line",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.18,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".vintage-text",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Grain flicker
      gsap.to(grainRef.current, {
        opacity: 0.55,
        duration: 0.08,
        yoyo: true,
        repeat: -1,
        ease: "none",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="memory"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "90vh", background: "#0e0b08" }}
    >
      {/* Vintage photo */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <img
          ref={imgRef}
          src="/img/ggsc_grp.png"
          alt="GGSC Team"
          style={{
            width: "100%",
            height: "120%",
            objectFit: "cover",
            objectPosition: "center top",
            willChange: "transform",
            /* Vintage filter stack */
            filter:
              "sepia(55%) contrast(1.08) brightness(0.78) saturate(0.75) grayscale(20%)",
            mixBlendMode: "normal",
          }}
        />

        {/* Warm amber overlay for vintage toning */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(120,80,20,0.38) 0%, rgba(60,30,10,0.72) 100%)",
            mixBlendMode: "multiply",
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.82) 100%)",
          }}
        />

        {/* Film grain overlay */}
        <div
          ref={grainRef}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            opacity: 0.45,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />

        {/* Light leak top-left */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "50%",
            height: "35%",
            background:
              "radial-gradient(ellipse at top left, rgba(255,200,80,0.18), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Horizontal scan lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Content overlay */}
      <div
        className="relative z-10 vintage-text"
        style={{
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "10vh 6vw",
        }}
      >
        {/* Decorative stamp */}
        <div
          className="vintage-line"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
            opacity: 0,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "1px",
              background: "rgba(255,200,80,0.5)",
            }}
          />
          <span
            style={{
              fontFamily: "'Bungee', sans-serif",
              fontSize: "9px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,200,80,0.65)",
            }}
          >
            GGSC · UEM Kolkata · 2024–25
          </span>
          <div
            style={{
              width: "32px",
              height: "1px",
              background: "rgba(255,200,80,0.5)",
            }}
          />
        </div>

        {/* Main quote */}
        <div className="vintage-line" style={{ opacity: 0, marginBottom: "16px" }}>
          <h2
            style={{
              fontFamily: "'zentry', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.4rem,5.5vw,6rem)",
              textTransform: "uppercase",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              color: "rgba(255,240,200,0.92)",
              textShadow: "0 2px 40px rgba(0,0,0,0.6)",
            }}
          >
            Not everyone was there.
          </h2>
        </div>
        <div className="vintage-line" style={{ opacity: 0, marginBottom: "32px" }}>
          <h2
            style={{
              fontFamily: "'zentry', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.4rem,5.5vw,6rem)",
              textTransform: "uppercase",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              color: "rgba(255,200,80,0.55)",
              textShadow: "0 2px 40px rgba(0,0,0,0.5)",
            }}
          >
            But the feeling was.
          </h2>
        </div>

        {/* Body */}
        <p
          className="vintage-line"
          style={{
            fontFamily: "'Nanum Gothic', sans-serif",
            fontSize: "clamp(13px,1.5vw,16px)",
            color: "rgba(255,240,200,0.45)",
            lineHeight: 1.85,
            maxWidth: "520px",
            marginBottom: "36px",
            opacity: 0,
          }}
        >
          This is us — imperfect, incomplete, and entirely real. A community
          still writing its story, one event, one late night, one breakthrough
          at a time. Every face here is part of something larger than a photo
          can hold.
        </p>

        {/* Instagram CTA */}
        <div className="vintage-line" style={{ opacity: 0 }}>
          <a
            href="https://instagram.com/ggsc_uemk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "999px",
              border: "1px solid rgba(255,200,80,0.35)",
              background: "rgba(255,200,80,0.08)",
              backdropFilter: "blur(12px)",
              color: "rgba(255,220,120,0.85)",
              fontFamily: "'Nanum Gothic', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,200,80,0.2)";
              e.currentTarget.style.borderColor = "rgba(255,200,80,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,200,80,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,200,80,0.35)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
            @ggsc_uemk
          </a>
        </div>

        {/* Film frame corners */}
        {[
          { top: "5%", left: "4%" },
          { top: "5%", right: "4%" },
          { bottom: "5%", left: "4%" },
          { bottom: "5%", right: "4%" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "22px",
              height: "22px",
              borderColor: "rgba(255,200,80,0.28)",
              borderStyle: "solid",
              borderWidth: i % 2 === 0 ? "1.5px 0 0 1.5px" : i === 1 ? "1.5px 1.5px 0 0" : "0 0 1.5px 1.5px",
              ...pos,
              borderTopLeftRadius: i === 0 ? "3px" : 0,
              borderTopRightRadius: i === 1 ? "3px" : 0,
              borderBottomLeftRadius: i === 2 ? "3px" : 0,
              borderBottomRightRadius: i === 3 ? "3px" : 0,
            }}
          />
        ))}
        {/* Fix corner 3 border */}
        <div
          style={{
            position: "absolute",
            width: "22px",
            height: "22px",
            borderColor: "rgba(255,200,80,0.28)",
            borderStyle: "solid",
            borderWidth: "0 1.5px 1.5px 0",
            bottom: "5%",
            right: "4%",
            borderBottomRightRadius: "3px",
          }}
        />
      </div>
    </section>
  );
};

export default VintageMemory;
