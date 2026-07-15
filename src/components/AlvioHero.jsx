import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   AlvioHero – Self-contained hero section
   Light theme · Neural brain centerpiece
   ───────────────────────────────────────────── */

const AlvioHero = () => {
  const canvasRef = useRef(null);

  /* ── Canvas particle system for the neural brain ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w, h;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const NODES = [
      { x: 0.5, y: 0.38, r: 3.5, phase: 0 },
      { x: 0.42, y: 0.32, r: 2.8, phase: 0.8 },
      { x: 0.58, y: 0.30, r: 3.0, phase: 1.6 },
      { x: 0.46, y: 0.44, r: 2.5, phase: 2.4 },
      { x: 0.55, y: 0.46, r: 2.6, phase: 3.2 },
      { x: 0.38, y: 0.40, r: 2.2, phase: 4.0 },
      { x: 0.62, y: 0.38, r: 2.3, phase: 4.8 },
      { x: 0.30, y: 0.28, r: 1.8, phase: 0.4 },
      { x: 0.70, y: 0.26, r: 1.9, phase: 1.2 },
      { x: 0.26, y: 0.42, r: 1.6, phase: 2.0 },
      { x: 0.74, y: 0.40, r: 1.7, phase: 2.8 },
      { x: 0.35, y: 0.52, r: 1.5, phase: 3.6 },
      { x: 0.65, y: 0.54, r: 1.4, phase: 4.4 },
      { x: 0.22, y: 0.34, r: 1.2, phase: 0.6 },
      { x: 0.78, y: 0.32, r: 1.3, phase: 1.8 },
      { x: 0.40, y: 0.58, r: 1.1, phase: 3.0 },
      { x: 0.60, y: 0.60, r: 1.0, phase: 4.2 },
      { x: 0.50, y: 0.22, r: 2.0, phase: 0.2 },
      { x: 0.50, y: 0.56, r: 1.8, phase: 2.6 },
    ];

    const EDGES = [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
      [1, 3], [2, 4], [1, 7], [2, 8], [3, 5], [4, 6],
      [5, 9], [6, 10], [5, 11], [6, 12], [7, 13], [8, 14],
      [9, 15], [10, 16], [11, 17], [12, 18],
      [1, 2], [3, 4], [7, 9], [8, 10], [13, 14],
      [1, 4], [2, 3], [5, 6], [15, 17], [16, 18],
      [0, 17], [0, 18], [11, 17], [12, 18],
      [9, 11], [10, 12], [13, 7], [14, 8],
    ];

    let t = 0;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      for (const [a, b] of EDGES) {
        const na = NODES[a];
        const nb = NODES[b];
        const ax = na.x * w;
        const ay = na.y * h;
        const bx = nb.x * w;
        const by = nb.y * h;
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + na.phase + nb.phase);
        const alpha = 0.04 + pulse * 0.07;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const progress = (Math.sin(t * 0.6 + na.phase * 0.5) + 1) / 2;
        const dx = ax + (bx - ax) * progress;
        const dy = ay + (by - ay) * progress;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${0.15 + pulse * 0.2})`;
        ctx.fill();
      }

      for (const node of NODES) {
        const nx = node.x * w;
        const ny = node.y * h;
        const pulse = Math.sin(t * 1.5 + node.phase);
        const r = node.r + pulse * 0.6;

        const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 5);
        glow.addColorStop(0, "rgba(139, 92, 246, 0.12)");
        glow.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.beginPath();
        ctx.arc(nx, ny, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${0.6 + pulse * 0.2})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx - r * 0.3, ny - r * 0.3, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.2})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="font-inter relative min-h-screen w-full overflow-hidden bg-[#fafbfe]">
      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-5%] h-[600px] w-[600px] rounded-full bg-cyan-200/30 blur-[140px]" />
        <div className="absolute right-[-8%] top-[0%] h-[500px] w-[500px] rounded-full bg-purple-200/25 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[40%] h-[400px] w-[400px] rounded-full bg-indigo-100/20 blur-[100px]" />
      </div>

      {/* ── Grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ═══ NAVBAR ═══ */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0f172a]">
            Alvio
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {["Home", "About", "Programs", "Pricing"].map((link) => (
            <a
              key={link}
              href="#"
              className="group relative text-sm font-medium text-[#475569] transition-colors duration-300 hover:text-[#0f172a]"
            >
              {link}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <button className="rounded-full border border-[#e2e8f0] bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[#0f172a] shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-indigo-200 hover:bg-white hover:shadow-md hover:shadow-indigo-500/5">
          Contact Us
        </button>
      </nav>

      {/* ═══ HERO CONTENT (centered) ═══ */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-8 text-center sm:pt-24 lg:pt-20">

        {/* Pill badge */}
        <div className="hero-pill mb-8 inline-flex items-center gap-2.5 rounded-full border border-purple-200/60 bg-purple-50/60 px-4 py-2 opacity-0 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-purple-700/80">
            Intelligence Meets Innovation
          </span>
        </div>

        {/* Headline */}
        <div className="mb-6 max-w-3xl">
          <h1
            className="hero-headline opacity-0"
            style={{
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              lineHeight: 1.15,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}
          >
            Powering Possibilities with{" "}
            <span
              className="hero-headline-accent block bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text font-bold not-italic"
              style={{
                WebkitTextFillColor: "transparent",
                fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Human-Centric AI
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <p
          className="hero-sub mb-10 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: "#64748b", fontWeight: 400 }}
        >
          We craft intelligent systems that amplify human creativity, streamline
          decision-making, and unlock new dimensions of possibility — so you can
          focus on what truly matters.
        </p>

        {/* Buttons */}
        <div className="hero-buttons mb-6 flex flex-wrap items-center justify-center gap-4 opacity-0">
          <button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0">
            <span className="relative z-10 flex items-center gap-2">
              Try It Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </button>

          <button className="rounded-full border border-[#e2e8f0] bg-white/80 px-8 py-3.5 text-sm font-semibold text-[#0f172a] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 active:translate-y-0">
            Learn More
          </button>
        </div>

        {/* Trust line */}
        <div className="hero-sub mb-14 flex items-center gap-3 opacity-0">
          <div className="flex -space-x-1.5">
            {["from-indigo-400 to-blue-500", "from-purple-400 to-pink-500", "from-violet-400 to-indigo-500"].map((g, i) => (
              <div key={i} className={`h-6 w-6 rounded-full bg-gradient-to-br ${g} ring-2 ring-white`} />
            ))}
          </div>
          <span className="text-xs font-medium text-[#94a3b8]">
            Trusted by 2,000+ teams worldwide
          </span>
        </div>
      </div>

      {/* ═══ CENTERPIECE – NEURAL BRAIN (Canvas) ═══ */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24 sm:pb-32">
        <div className="hero-visual relative opacity-0">
          <div className="absolute inset-0 -m-16 rounded-full bg-gradient-to-b from-indigo-200/30 via-purple-100/20 to-transparent blur-[80px]" />

          <div className="hero-brain-bob relative mx-auto w-full" style={{ maxWidth: "520px" }}>
            <canvas
              ref={canvasRef}
              className="h-auto w-full"
              style={{ aspectRatio: "5 / 4" }}
            />

            {/* Overlay SVG glow rings */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 520 416"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="alvio-ring-grad" cx="50%" cy="45%" r="40%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0)" />
                  <stop offset="70%" stopColor="rgba(99,102,241,0.04)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.02)" />
                </radialGradient>
              </defs>
              <ellipse cx="260" cy="190" rx="220" ry="170" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
              <ellipse cx="260" cy="190" rx="180" ry="140" stroke="rgba(139,92,246,0.05)" strokeWidth="0.8" strokeDasharray="4 8" />
              <ellipse cx="260" cy="190" rx="260" ry="200" fill="url(#alvio-ring-grad)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fafbfe] to-transparent" />
    </div>
  );
};

export default AlvioHero;
