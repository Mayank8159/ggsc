import { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import HorizontalScroll from "./components/HorizontalScroll";
import BigTextScroll from "./components/BigTextScroll";
import Features from "./components/Features";
import StackedCards from "./components/StackedCards";
import Story from "./components/Story";
import Events from "./components/Events";
import Team from "./components/Team";
import Contact from "./components/Contact";
import VintageMemory from "./components/VintageMemory";
import Footer from "./components/Footer";
import DiscussionBoard from "./components/DiscussionBoard";
import NotFound from "./components/NotFound";
import Cydropreneur from "./components/Cydropreneur";

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <HorizontalScroll />
      <BigTextScroll />
      <Features />
      <StackedCards />
      <Story />
      <Contact />
      <VintageMemory />
    </>
  );
}

/* ─── Ultra-Smooth Negative Cursor ─────────────── */
const NegativeCursor = () => {
  const [isTouch] = useState(() => typeof window !== "undefined" && "ontouchstart" in window);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const isText = useRef(false);
  const isLink = useRef(false);
  const location = useLocation();

  if (isTouch) return null;

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;

    const lerp = (a, b, t) => a + (b - a) * t;

    let raf;
    const tick = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.10);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.10);
      gsap.set(ring, { x: pos.current.x - 22, y: pos.current.y - 22 });
      gsap.set(dot, { x: mouse.current.x - 4, y: mouse.current.y - 4 });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const onEnterText = () => {
      if (isText.current) return;
      isText.current = true;
      gsap.to(ring, {
        width: 80, height: 80, x: pos.current.x - 40, y: pos.current.y - 40,
        background: "rgba(255,255,255,0.9)",
        mixBlendMode: "difference",
        borderColor: "transparent",
        duration: 0.35, ease: "power3.out",
      });
      gsap.to(dot, { opacity: 0, duration: 0.2 });
    };

    const onLeaveText = () => {
      if (!isText.current) return;
      isText.current = false;
      gsap.to(ring, {
        width: 44, height: 44,
        background: "transparent",
        mixBlendMode: "normal",
        borderColor: "rgba(0,0,0,0.25)",
        duration: 0.35, ease: "power3.out",
      });
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    };

    const onEnterLink = (e) => {
      isLink.current = true;
      const txt = e.currentTarget.innerText?.slice(0, 12) || "";
      gsap.to(ring, {
        scale: 3.2, background: "rgba(255,255,255,0.85)",
        mixBlendMode: "difference", borderColor: "transparent",
        duration: 0.4, ease: "power3.out",
      });
      gsap.to(dot, { scale: 0, duration: 0.25 });
      if (txt && label) {
        label.innerText = txt;
        gsap.to(label, { opacity: 1, duration: 0.2 });
      }
    };

    const onLeaveLink = () => {
      isLink.current = false;
      gsap.to(ring, {
        scale: 1, background: "transparent",
        mixBlendMode: "normal", borderColor: "rgba(0,0,0,0.25)",
        duration: 0.4, ease: "power3.out",
      });
      gsap.to(dot, { scale: 1, duration: 0.25 });
      if (label) gsap.to(label, { opacity: 0, duration: 0.15 });
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    const textEls = document.querySelectorAll("p, h1, h2, h3, h4, span:not(button span), li");
    textEls.forEach(el => {
      el.addEventListener("mouseenter", onEnterText);
      el.addEventListener("mouseleave", onLeaveText);
    });

    const linkEls = document.querySelectorAll("a, [role=button], .ethos-card, .team-card-item");
    linkEls.forEach(el => {
      el.addEventListener("mouseenter", onEnterLink);
      el.addEventListener("mouseleave", onLeaveLink);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      textEls.forEach(el => {
        el.removeEventListener("mouseenter", onEnterText);
        el.removeEventListener("mouseleave", onLeaveText);
      });
      linkEls.forEach(el => {
        el.removeEventListener("mouseenter", onEnterLink);
        el.removeEventListener("mouseleave", onLeaveLink);
      });
    };
  }, [location]);

  return (
    <>
      <div ref={ringRef} style={{
        position: "fixed", top: 0, left: 0,
        width: "44px", height: "44px",
        borderRadius: "50%",
        border: "1.5px solid rgba(0,0,0,0.25)",
        pointerEvents: "none", zIndex: 999999,
        display: "flex", alignItems: "center", justifyContent: "center",
        willChange: "transform, width, height",
      }}>
        <span ref={labelRef} style={{
          fontFamily: "'Bungee', sans-serif", fontSize: "6px",
          letterSpacing: "0.1em", color: "inherit",
          opacity: 0, textTransform: "uppercase",
          textAlign: "center", userSelect: "none",
          pointerEvents: "none", maxWidth: "90%", overflow: "hidden",
        }} />
      </div>
      <div ref={dotRef} style={{
        position: "fixed", top: 0, left: 0,
        width: "8px", height: "8px",
        borderRadius: "50%",
        background: "linear-gradient(135deg,#4285F4,#EA4335)",
        pointerEvents: "none", zIndex: 999999,
        willChange: "transform",
        boxShadow: "0 0 8px rgba(66,133,244,0.6)",
      }} />
    </>
  );
};

/* ─── Google Color Gradient Background ─────────────── */
const GoogleGradientBG = () => {
  const blob1 = useRef(null);
  const blob2 = useRef(null);
  const blob3 = useRef(null);
  const blob4 = useRef(null);

  useEffect(() => {
    gsap.to(blob1.current, { x: 60, y: -40, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(blob2.current, { x: -80, y: 60, duration: 11, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
    gsap.to(blob3.current, { x: 40, y: 80, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
    gsap.to(blob4.current, { x: -50, y: -60, duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden",
      background: "#f8f6f2",
    }}>
      <div ref={blob1} style={{
        position: "absolute", width: "70vw", height: "70vw",
        top: "-25vw", right: "-20vw", borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, rgba(66,133,244,0.22) 0%, rgba(66,133,244,0.08) 40%, transparent 70%)",
        filter: "blur(60px)",
      }} />
      <div ref={blob2} style={{
        position: "absolute", width: "60vw", height: "60vw",
        bottom: "-20vw", left: "-15vw", borderRadius: "50%",
        background: "radial-gradient(circle at 60% 60%, rgba(234,67,53,0.18) 0%, rgba(234,67,53,0.07) 40%, transparent 70%)",
        filter: "blur(70px)",
      }} />
      <div ref={blob3} style={{
        position: "absolute", width: "50vw", height: "50vw",
        top: "30%", left: "25%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,188,5,0.14) 0%, rgba(251,188,5,0.05) 45%, transparent 70%)",
        filter: "blur(80px)",
      }} />
      <div ref={blob4} style={{
        position: "absolute", width: "55vw", height: "55vw",
        bottom: "5%", right: "-10vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(52,168,83,0.16) 0%, rgba(52,168,83,0.06) 45%, transparent 70%)",
        filter: "blur(70px)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `
          conic-gradient(from 0deg at 20% 20%, rgba(66,133,244,0.05) 0deg, transparent 60deg, transparent 300deg, rgba(66,133,244,0.03) 360deg),
          conic-gradient(from 180deg at 80% 80%, rgba(234,67,53,0.05) 0deg, transparent 60deg, transparent 300deg, rgba(234,67,53,0.03) 360deg)
        `,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(66,133,244,0.08) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        opacity: 0.5,
      }} />
      <svg style={{
        position: "absolute", top: "-8%", right: "-8%",
        width: "60vw", height: "60vw", opacity: 0.04,
        pointerEvents: "none",
      }} viewBox="0 0 500 500" fill="none">
        <circle cx="250" cy="250" r="240" stroke="#4285F4" strokeWidth="1.5" />
        <circle cx="250" cy="250" r="180" stroke="#EA4335" strokeWidth="1" strokeDasharray="10 8" />
        <circle cx="250" cy="250" r="120" stroke="#FBBC05" strokeWidth="0.8" />
        <circle cx="250" cy="250" r="60" stroke="#34A853" strokeWidth="0.6" strokeDasharray="4 6" />
      </svg>
      <svg style={{
        position: "absolute", bottom: "-5%", left: "-5%",
        width: "40vw", height: "40vw", opacity: 0.035,
        pointerEvents: "none",
      }} viewBox="0 0 300 300" fill="none">
        <circle cx="150" cy="150" r="140" stroke="#EA4335" strokeWidth="1.2" />
        <circle cx="150" cy="150" r="95" stroke="#34A853" strokeWidth="0.8" strokeDasharray="6 5" />
        <circle cx="150" cy="150" r="50" stroke="#FBBC05" strokeWidth="0.6" />
      </svg>
      <div className="noise-overlay" />
    </div>
  );
};

/* ─── BGM Button ─────────────── */
const BGMButton = () => {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const audioRef = useRef(null);
  const location = useLocation();
  const isCydropreneur = location.pathname.toLowerCase().startsWith("/events/cydropreneur");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize the audio object once
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 1.0;
    setTimeout(() => setVisible(true), 1500);
    return () => {
      audioRef.current.pause();
    };
  }, []);

  // Handle route changes and set default states
  useEffect(() => {
    if (!audioRef.current) return;

    // Use loop.mp3 for Cydropreneur, bgm.mp3 for main website
    const targetSrc = isCydropreneur ? "/audio/loop.mp3" : "/music/bgm.mp3";

    const attemptPlayWithFallback = () => {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlaying(true);
        }).catch(() => {
          // Autoplay blocked by browser policy on refresh
          setPlaying(false);

          // Setup one-time interaction listeners to bypass autoplay restriction
          const handleFirstInteraction = () => {
            if (isCydropreneur && audioRef.current && audioRef.current.paused) {
              audioRef.current.play().then(() => setPlaying(true)).catch(() => { });
            }
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("touchstart", handleFirstInteraction);
            window.removeEventListener("scroll", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
          };

          window.addEventListener("click", handleFirstInteraction, { once: true });
          window.addEventListener("touchstart", handleFirstInteraction, { once: true });
          window.addEventListener("scroll", handleFirstInteraction, { once: true });
          window.addEventListener("keydown", handleFirstInteraction, { once: true });
        });
      }
    };

    // Only update source if it has changed to prevent resetting audio continuously
    if (!audioRef.current.src.endsWith(targetSrc)) {
      audioRef.current.src = targetSrc;
      audioRef.current.load(); // ensure new source is loaded

      if (isCydropreneur) {
        // Cydropreneur is default ON
        attemptPlayWithFallback();
      } else {
        // Main website is default OFF
        audioRef.current.pause();
        setPlaying(false);
      }
    } else {
      // If the source is the same, just sync the playing state (just in case)
      setPlaying(!audioRef.current.paused);
      if (isCydropreneur && audioRef.current.paused) {
        attemptPlayWithFallback();
      }
    }
  }, [location.pathname, isCydropreneur]);

  const toggle = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => { });
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={toggle}
      style={{
        position: "fixed",
        bottom: isMobile && isCydropreneur ? "24px" : "36px",
        left: isCydropreneur ? (isMobile ? "24px" : "36px") : "auto",
        right: isCydropreneur ? "auto" : "32px",
        zIndex: 9998,
        width: isMobile && isCydropreneur ? "48px" : "52px",
        height: isMobile && isCydropreneur ? "48px" : "52px",
        borderRadius: "50%",
        background: isCydropreneur ? "rgba(18,10,36,0.75)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
        border: isCydropreneur ? "1px solid rgba(192,132,252,0.4)" : "1px solid rgba(255,255,255,0.9)",
        boxShadow: isCydropreneur ? "0 8px 32px rgba(168,85,247,0.5)" : "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {playing ? (
        <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "18px" }}>
          {[1, 0.6, 1, 0.8].map((h, i) => (
            <div key={i} style={{
              width: "3px", borderRadius: "2px",
              background: "linear-gradient(180deg,#4285F4,#34A853)",
              height: `${h * 100}%`,
              animation: `bgm-bar-${i} 0.7s ease-in-out ${i * 0.1}s infinite alternate`,
            }} />
          ))}
        </div>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 5.14v14l11-7-11-7z" fill="#4285F4" />
        </svg>
      )}
    </button>
  );
};

/* ─── Cyberpunk Cursor (Zero Lag CSS) ─────────────── */
const CyberpunkCursor = () => {
  useEffect(() => {
    const defaultSvg = `
      <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M5,5 L11,19 L14,14 L19,11 Z" fill="#4285F4" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
    const pointerSvg = `
      <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M5,5 L11,19 L14,14 L19,11 Z" fill="rgba(66, 133, 244, 0.2)" stroke="#4285F4" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `;
    const defaultUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(defaultSvg)}') 7 7, auto`;
    const pointerUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(pointerSvg)}') 7 7, pointer`;

    const style = document.createElement("style");
    style.id = "cyberpunk-cursor-style";
    style.innerHTML = `
      * {
        cursor: ${defaultUrl} !important;
      }
      a, button, [role="button"], input, select, textarea, .cursor-pointer, .interactive {
        cursor: ${pointerUrl} !important;
      }
      a *, button *, [role="button"] * {
        cursor: ${pointerUrl} !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById("cyberpunk-cursor-style");
      if (el) el.remove();
    };
  }, []);

  return null;
};

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isCydropreneur = location.pathname.toLowerCase().startsWith("/events/cydropreneur");
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !isHome) { bar && (bar.style.width = "0%"); return; }
    const update = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      bar.style.width = ((window.scrollY / total) * 100) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ cursor: isCydropreneur ? "auto" : "none", background: "transparent" }}>
      <div ref={barRef} id="scroll-progress" style={{
        position: "fixed", top: 0, left: 0, height: "2px", width: "0%",
        background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)",
        zIndex: 9999, transition: "width 0.1s linear",
      }} />

      <style>{`
        @keyframes bgm-bar-0 { from { height: 40% } to { height: 100% } }
        @keyframes bgm-bar-1 { from { height: 60% } to { height: 30% } }
        @keyframes bgm-bar-2 { from { height: 100% } to { height: 50% } }
        @keyframes bgm-bar-3 { from { height: 70% } to { height: 90% } }
      `}</style>

      {isCydropreneur ? <CyberpunkCursor /> : <NegativeCursor />}
      <GoogleGradientBG />
      <BGMButton />

      <div style={{ position: "relative", zIndex: 2 }}>
        {!isCydropreneur && <NavBar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discussion" element={<DiscussionBoard />} />
          <Route path="/login" element={<DiscussionBoard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/Cydropreneur" element={<Cydropreneur />} />
          <Route path="/teams" element={<Team />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isCydropreneur && <Footer />}
      </div>
    </main>
  );
}

export default App;
