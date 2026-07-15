import { useId } from "react";

const GeminiFlowPanel = ({ className = "" }) => {
  const uid = useId().replace(/:/g, "");

  return (
    <div className={`relative ${className}`}>
      {/* Floating glow orbs behind the panel */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-blue-400/20 blur-[60px] animate-[drift-a_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-purple-400/20 blur-[50px] animate-[drift-b_10s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute right-1/4 -top-6 h-24 w-24 rounded-full bg-pink-300/15 blur-[40px] animate-[drift-a_12s_ease-in-out_infinite_2s]" />

      {/* Main glass card */}
      <div
        className="hero-panel-glow relative overflow-hidden rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Animated gradient border (top edge) */}
        <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden rounded-t-3xl">
          <div className="hero-gradient-bar h-full w-[200%]" />
        </div>

        {/* Inner subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* SVG S-Curve Flow */}
        <div className="relative z-10 flex items-center justify-center px-6 py-12 sm:px-10 sm:py-16 md:px-12 md:py-20">
          <svg
            viewBox="0 0 300 500"
            className="h-full w-full max-h-[460px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${uid}-lg`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="35%" stopColor="#2979ff" />
                <stop offset="65%" stopColor="#7c4dff" />
                <stop offset="100%" stopColor="#e040fb" />
              </linearGradient>

              <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id={`${uid}-og`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
              </filter>
            </defs>

            {/* Tube outer glow */}
            <path
              d="M 150 24 C 262 24, 262 148, 150 168 C 38 188, 38 312, 150 332 C 262 352, 262 476, 150 476"
              stroke={`url(#${uid}-lg)`}
              strokeWidth="32"
              strokeLinecap="round"
              opacity="0.07"
              filter={`url(#${uid}-og)`}
            />

            {/* Tube frosted glass body */}
            <path
              d="M 150 24 C 262 24, 262 148, 150 168 C 38 188, 38 312, 150 332 C 262 352, 262 476, 150 476"
              stroke="rgba(0,0,0,0.04)"
              strokeWidth="26"
              strokeLinecap="round"
            />

            {/* Tube inner highlight */}
            <path
              d="M 150 24 C 262 24, 262 148, 150 168 C 38 188, 38 312, 150 332 C 262 352, 262 476, 150 476"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="22"
              strokeLinecap="round"
            />

            {/* Liquid glow trail */}
            <path
              className="flow-liquid-glow"
              d="M 150 24 C 262 24, 262 148, 150 168 C 38 188, 38 312, 150 332 C 262 352, 262 476, 150 476"
              stroke={`url(#${uid}-lg)`}
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.3"
              filter={`url(#${uid}-og)`}
            />

            {/* Liquid core */}
            <path
              className="flow-liquid"
              d="M 150 24 C 262 24, 262 148, 150 168 C 38 188, 38 312, 150 332 C 262 352, 262 476, 150 476"
              stroke={`url(#${uid}-lg)`}
              strokeWidth="8"
              strokeLinecap="round"
              filter={`url(#${uid}-glow)`}
            />

            {/* Liquid bright core */}
            <path
              className="flow-liquid-bright"
              d="M 150 24 C 262 24, 262 148, 150 168 C 38 188, 38 312, 150 332 C 262 352, 262 476, 150 476"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Glass reflection */}
            <path
              d="M 150 24 C 262 24, 262 148, 150 168 C 38 188, 38 312, 150 332 C 262 352, 262 476, 150 476"
              stroke="rgba(0,0,0,0.03)"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Particles */}
            <circle className="flow-particle flow-particle-1" r="3" fill="#00e5ff" opacity="0.8" />
            <circle className="flow-particle flow-particle-2" r="2" fill="#7c4dff" opacity="0.7" />
            <circle className="flow-particle flow-particle-3" r="1.5" fill="#e040fb" opacity="0.6" />
            <circle className="flow-particle flow-particle-4" r="2.5" fill="#2979ff" opacity="0.5" />

            {/* Junction nodes */}
            <circle cx="150" cy="168" r="5" fill="white" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            <circle cx="150" cy="168" r="2" fill="#00e5ff" opacity="0.7" />
            <circle cx="150" cy="332" r="5" fill="white" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            <circle cx="150" cy="332" r="2" fill="#7c4dff" opacity="0.7" />
          </svg>
        </div>

        {/* Bottom label */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-black/[0.03] px-6 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
            <span className="font-nanum text-[10px] font-medium uppercase tracking-[0.18em] text-black/25">
              Liquid Flow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-nanum text-[10px] uppercase tracking-[0.12em] text-black/18">
              Live
            </span>
            <div className="flex gap-[3px]">
              {[4, 7, 10, 6].map((h, i) => (
                <div key={i} className="w-[2px] rounded-full bg-black/12" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiFlowPanel;
