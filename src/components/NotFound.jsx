import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

export default function NotFound() {
  const containerRef = useRef(null);
  const numRef = useRef(null);
  const subtitleRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(numRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .fromTo(btnRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-6">
      <div className="relative z-10 text-center max-w-lg">
        <div ref={numRef} className="flex items-center justify-center gap-2 mb-4">
          {[..."404"].map((d, i) => (
            <span
              key={i}
              style={{ color: GOOGLE_COLORS[i % GOOGLE_COLORS.length] }}
              className="text-[12rem] sm:text-[16rem] font-black leading-none select-none"
            >
              {d}
            </span>
          ))}
        </div>
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl font-medium text-gray-700 mb-10"
        >
          Oops! This page took a wrong turn.
        </p>
        <Link
          ref={btnRef}
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #4285F4, #EA4335)",
            boxShadow: "0 8px 32px rgba(66,133,244,0.3)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back Home
        </Link>
      </div>
    </section>
  );
}
