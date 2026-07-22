import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const headingRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!headingRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      ".hero-pill",
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8 },
      0.3
    )
      .fromTo(
        headingRef.current.querySelectorAll(".hero-word"),
        { y: 80, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, stagger: 0.1, duration: 1.2 },
        0.4
      )
      .fromTo(
        ".hero-gradient-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "power4.out" },
        0.7
      )
      .fromTo(
        ".hero-sub",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 },
        0.8
      )
      .fromTo(
        ".hero-cta",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.7 },
        1.2
      )
      .fromTo(
        ".hero-stat",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 },
        1.4
      )
      .fromTo(
        ".hero-scroll-hint",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        2
      );
  }, []);

  useGSAP(() => {
    gsap.to(".hero-aurora-1", {
      x: 60, y: -40, scale: 1.1, duration: 20, ease: "sine.inOut", yoyo: true, repeat: -1,
    });
    gsap.to(".hero-aurora-2", {
      x: -50, y: 30, scale: 0.95, duration: 25, ease: "sine.inOut", yoyo: true, repeat: -1,
    });
    gsap.to(".hero-aurora-3", {
      x: 30, y: 50, scale: 1.05, duration: 22, ease: "sine.inOut", yoyo: true, repeat: -1,
    });
  });

  return (
    <div className="relative min-h-dvh w-full overflow-hidden" style={{ backgroundColor: "#f8f6f2" }}>
      {/* ── Floating aurora blobs ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="hero-aurora-1 absolute left-[-5%] top-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-300/25 via-cyan-200/15 to-transparent blur-[120px]" />
        <div className="hero-aurora-2 absolute right-[-8%] top-[20%] h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-purple-300/20 via-pink-200/10 to-transparent blur-[100px]" />
        <div className="hero-aurora-3 absolute bottom-[5%] left-[30%] h-[350px] w-[350px] rounded-full bg-gradient-to-tr from-amber-200/15 via-orange-100/10 to-transparent blur-[90px]" />
      </div>

      {/* ── Subtle dot grid ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-start justify-center px-6 pt-32 pb-12 sm:px-8 lg:px-12">
        {/* Pill badge */}
        <div className="hero-pill mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-blue-200/60 bg-blue-50/50 px-4 py-2 opacity-0 backdrop-blur-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: "#4285F4" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="font-nanum text-xs font-semibold tracking-wide text-blue-700/80">
            AI-First Student Community
          </span>
        </div>

        {/* Heading */}
        <div ref={headingRef} className="mb-6" style={{ perspective: "1000px" }}>
          <h1
            className="overflow-hidden"
            style={{
              fontFamily: "'zentry', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.6rem, 6.5vw, 7.5rem)",
              textTransform: "uppercase",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              color: "#0a0a0a",
            }}
          >
            <span className="hero-word block opacity-0" style={{ transformOrigin: "left bottom" }}>
              Shaping
            </span>
            <span className="hero-word block opacity-0" style={{ transformOrigin: "left bottom" }}>
              the Future
            </span>
            <span className="hero-word hero-gradient-text block opacity-0" style={{ transformOrigin: "left bottom" }}>
              with Gemini
            </span>
          </h1>
        </div>

        {/* Animated gradient line */}
        <div className="hero-gradient-line mb-8 h-[3px] w-24 origin-left rounded-full" style={{ background: "linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)" }} />

        {/* Subtitle */}
        <div className="mb-4">
          <p className="hero-sub font-nanum text-lg font-bold leading-relaxed text-black/80 sm:text-xl opacity-0">
            The official Google Gemini Student Community at{" "}
            <span className="text-[#EA4335]">UEM Kolkata</span>.
          </p>
          <p className="hero-sub font-nanum text-sm leading-relaxed text-black/40 opacity-0">
            Exploring the power of Google Gemini &amp; AI through workshops, interactive sessions, and research.
          </p>
        </div>

        {/* Ambassador pill */}
        <div className="hero-sub mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-green-200/50 bg-green-50/40 px-4 py-2 opacity-0">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: "#4285F4", fontSize: "10px", fontWeight: 800 }}>
            G
          </div>
          <span className="font-nanum text-xs font-semibold text-green-700/70">
            Google Student Ambassador Program
          </span>
        </div>

        {/* CTAs */}
        <div className="mb-10 flex flex-wrap gap-3">
          {!isAuthenticated && (
            <div className="hero-cta opacity-0">
              <Button
                id="cta-main"
                title="Get Started"
                leftIcon={<TiLocationArrow />}
                containerClass="flex-center gap-1"
                onClick={() => navigate("/login")}
              />
            </div>
          )}
          <div className="hero-cta opacity-0">
            <Button
              id="cta-events"
              title="View Events"
              containerClass="flex-center gap-1"
              variant="outline"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 sm:gap-10">
          {[
            { value: "200+", label: "Members" },
            { value: "12+", label: "Events" },
            { value: "50+", label: "Projects" },
          ].map((stat, i) => (
            <div key={i} className="hero-stat opacity-0">
              <p className="font-zentry text-2xl font-black text-black sm:text-3xl">{stat.value}</p>
              <p className="font-nanum text-[10px] uppercase tracking-[0.15em] text-black/30">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll hint ── */}
      <div className="hero-scroll-hint pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 opacity-0">
        <span className="font-nanum text-[10px] uppercase tracking-[0.2em] text-black/20">Scroll</span>
        <div className="flex h-10 w-[1px] items-start overflow-hidden rounded-full bg-black/10">
          <div className="hero-scroll-dot h-3 w-full rounded-full bg-gradient-to-b from-[#4285F4] to-[#EA4335]" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
