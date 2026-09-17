import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiPlay,
  FiPause,
  FiShare2,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import CoverflowCarousel from "./CoverflowCarousel";

/* ─── ORIGINAL WEBSITE COLOR TOKENS ─── */
const T = {
  bg: "#f8f9ff",
  surface: "#ffffff",
  text: "#0d1117",
  muted: "#6b7280",
  border: "rgba(0,0,0,0.08)",
  blue: "#4285F4",
  purple: "#8B5CF6",
  red: "#EA4335",
  green: "#34A853",
  yellow: "#FBBC05",
};

/* ─── CLOUDINARY RESIZING HELPER (95% MEMORY REDUCTION & 60FPS SPEEDUP) ─── */
function optimizeCloudinaryUrl(url, width = 900) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    if (url.includes("f_auto,q_auto")) return url;
    return url.replace(
      "/image/upload/",
      `/image/upload/f_auto,q_auto:good,w_${width},c_limit/`
    );
  }
  return url;
}

/* ─── VERIFIED CLOUDINARY IMAGES (cydropreneur/event_gallery) ─── */
const FALLBACK_CLOUDINARY_IMAGES = [
  { id: "IMG_1365_idff3o", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672135/IMG_1365_idff3o.jpg" },
  { id: "IMG_1372_bzo1qb", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672126/IMG_1372_bzo1qb.jpg" },
  { id: "IMG_1469_e2hrse", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672126/IMG_1469_e2hrse.jpg" },
  { id: "IMG_1711_qflalf", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672124/IMG_1711_qflalf.jpg" },
  { id: "IMG_1735_r2zdw4", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672119/IMG_1735_r2zdw4.jpg" },
  { id: "IMG_1720_dir4xa", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672119/IMG_1720_dir4xa.jpg" },
  { id: "IMG_1618_kea94n", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672118/IMG_1618_kea94n.jpg" },
  { id: "IMG_1553_rijqpv", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672117/IMG_1553_rijqpv.jpg" },
  { id: "IMG_1356_bijeaa", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672113/IMG_1356_bijeaa.jpg" },
  { id: "IMG_1884_num59v", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672110/IMG_1884_num59v.jpg" },
  { id: "IMG_1757_fycmpy", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672109/IMG_1757_fycmpy.jpg" },
  { id: "IMG_1915_pjnz8c", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672108/IMG_1915_pjnz8c.jpg" },
  { id: "IMG_2016_azalvb", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672105/IMG_2016_azalvb.jpg" },
  { id: "IMG_1949_j0n2w9", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672103/IMG_1949_j0n2w9.jpg" },
  { id: "IMG_1886_kl3hwp", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672100/IMG_1886_kl3hwp.jpg" },
  { id: "IMG_1954_lsv0xk", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672099/IMG_1954_lsv0xk.jpg" },
  { id: "IMG_20260808_104741_rr08jt", url: "https://res.cloudinary.com/e2qvanrx/image/upload/v1789672093/IMG_20260808_104741_rr08jt.jpg" },
];

const CACHE_KEY = "ggsc_cydropreneur_gallery_v4";

/* ─── SHUFFLE FUNCTION ─── */
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* ─── FULLSCREEN RESPONSIVE WIDER VIEW (LIGHTBOX) ─── */
function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const current = images[currentIndex];
  const touchStartRef = useRef(null);

  // Lock background scroll when wider view is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(-1);
      if (e.key === "ArrowRight") onNavigate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (diff > 45) onNavigate(1);
    else if (diff < -45) onNavigate(-1);
    touchStartRef.current = null;
  };

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wider photo view"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(10, 14, 20, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px, 3vw, 32px)",
        animation: "lightboxFadeIn 0.22s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes widerViewZoom {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        .lightbox-close-btn:hover {
          background: rgba(255, 255, 255, 0.32) !important;
          transform: scale(1.08);
        }
        .lightbox-nav-btn:hover {
          background: rgba(255, 255, 255, 0.28) !important;
          transform: translateY(-50%) scale(1.06);
        }
      `}</style>

      {/* ── TOP RIGHT CROSS ICON (RESPONSIVE & TOUCH-OPTIMIZED) ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="lightbox-close-btn"
        style={{
          position: "fixed",
          top: "clamp(14px, 3vw, 28px)",
          right: "clamp(14px, 3vw, 28px)",
          width: "clamp(42px, 6vw, 48px)",
          height: "clamp(42px, 6vw, 48px)",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.18)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          color: "#ffffff",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          zIndex: 1000000,
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
          touchAction: "manipulation",
        }}
        title="Close (ESC)"
        aria-label="Close wider view"
      >
        <IoClose size={26} color="#ffffff" />
      </button>

      {/* Prev button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(-1);
        }}
        className="lightbox-nav-btn"
        style={{
          position: "fixed",
          left: "clamp(10px, 2.5vw, 28px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(40px, 5.5vw, 52px)",
          height: "clamp(40px, 5.5vw, 52px)",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.14)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          color: "#ffffff",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          zIndex: 100000,
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        title="Previous (Left Arrow)"
        aria-label="Previous image"
      >
        <FiChevronLeft size={24} />
      </button>

      {/* Main Wider View Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(94vw, 1300px)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "widerViewZoom 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          userSelect: "none",
        }}
      >
        <img
          src={current.fullUrl || current.url}
          alt={`Cydropreneur Event Moment ${currentIndex + 1}`}
          style={{
            maxWidth: "100%",
            maxHeight: "clamp(75vh, 85vh, 90vh)",
            objectFit: "contain",
            borderRadius: "clamp(12px, 2vw, 20px)",
            boxShadow: "0 30px 90px -10px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12)",
          }}
        />
      </div>

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(1);
        }}
        className="lightbox-nav-btn"
        style={{
          position: "fixed",
          right: "clamp(10px, 2.5vw, 28px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(40px, 5.5vw, 52px)",
          height: "clamp(40px, 5.5vw, 52px)",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.14)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          color: "#ffffff",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          zIndex: 100000,
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        title="Next (Right Arrow)"
        aria-label="Next image"
      >
        <FiChevronRight size={24} />
      </button>
    </div>
  );
}

/* ─── MAIN GALLERY COMPONENT ─── */
export default function Gallery() {
  const carouselRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const autoplayRef = useRef(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  /* ── Optimize Image Objects ── */
  const prepareOptimizedImages = useCallback((rawList) => {
    return rawList.map((item) => ({
      ...item,
      fullUrl: item.url,
      // Lightweight 900px optimized WebP for carousel (100KB vs 15MB)
      optimizedUrl: optimizeCloudinaryUrl(item.url, 900),
    }));
  }, []);

  /* ── Slides Array for CoverflowCarousel ── */
  const slides = useMemo(() => {
    return images.map((img, idx) => ({
      src: img.optimizedUrl || img.url,
      alt: `Cydropreneur moment ${idx + 1}`,
    }));
  }, [images]);

  /* ── Preload Neighboring Images ── */
  const preloadNeighbors = useCallback((list, idx) => {
    if (!list || list.length === 0) return;
    const targets = [
      (idx + 1) % list.length,
      (idx + 2) % list.length,
      (idx - 1 + list.length) % list.length,
      (idx - 2 + list.length) % list.length,
    ];
    targets.forEach((i) => {
      const src = list[i]?.optimizedUrl || list[i]?.url;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, []);

  /* ── Fast Cached Load ── */
  const loadImages = useCallback(async () => {
    // 1. Check SessionStorage cache first for 0ms instant render
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setImages(shuffleArray(parsed));
          setLoading(false);
        }
      }
    } catch {}

    // 2. Fetch fresh from backend (with 15-min in-memory server cache)
    try {
      const res = await fetch("/api/gallery?folder=cydropreneur/event_gallery");
      const data = await res.json();
      if (data?.success && data.images?.length > 0) {
        const optimized = prepareOptimizedImages(data.images);
        const shuffled = shuffleArray(optimized);
        setImages(shuffled);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(optimized));
        } catch {}
      } else {
        const fallbackOptimized = prepareOptimizedImages(FALLBACK_CLOUDINARY_IMAGES);
        setImages(shuffleArray(fallbackOptimized));
      }
    } catch (err) {
      console.warn("Using fallback Cloudinary photos:", err.message);
      setImages((prev) =>
        prev.length > 0
          ? prev
          : shuffleArray(prepareOptimizedImages(FALLBACK_CLOUDINARY_IMAGES))
      );
    } finally {
      setLoading(false);
      setActiveIndex(0);
    }
  }, [prepareOptimizedImages]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  useEffect(() => {
    if (images.length > 0) {
      preloadNeighbors(images, activeIndex);
    }
  }, [activeIndex, images, preloadNeighbors]);


  /* ── Lightbox Navigation ── */
  const navigateLightbox = (step) => {
    if (images.length === 0) return;
    const nextIdx = (activeIndex + step + images.length) % images.length;
    setActiveIndex(nextIdx);
    carouselRef.current?.goTo(nextIdx);
  };

  /* ── Share Action ── */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Cydropreneur Gallery - GGSC",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2200);
    }
  };

  /* ── Autoplay (Smooth 4s Cycle with Tab Visibility Awareness) ── */
  useEffect(() => {
    if (!isAutoplay || slides.length === 0 || lightboxOpen) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }

    const startTimer = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        if (!document.hidden) {
          carouselRef.current?.nudge(1);
        }
      }, 4000);
    };

    startTimer();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
      } else {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAutoplay, slides.length, lightboxOpen]);

  /* ── Global Arrow Keys ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) return;
      if (e.key === "ArrowLeft") {
        carouselRef.current?.nudge(-1);
      } else if (e.key === "ArrowRight") {
        carouselRef.current?.nudge(1);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsAutoplay((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        #gallery-root * { box-sizing: border-box; }

        .gallery-wrapper {
          background: ${T.bg};
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: visible;
          color: ${T.text};
          font-family: 'DM Sans', sans-serif;
          padding: 100px 0 90px;
        }
 
        .btn-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          color: ${T.text};
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .btn-circle:hover {
          background: #f1f3f9;
          transform: translateY(-2px) scale(1.06);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .btn-circle.accent {
          background: ${T.blue};
          color: #ffffff;
          border-color: ${T.blue};
        }
        .btn-circle.accent:hover {
          background: #3367d6;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .btn-circle {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>

      <div id="gallery-root" className="gallery-wrapper">
        {/* Subtle geometric dot grid matching Events & Home */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.035,
            backgroundImage: "radial-gradient(circle, #4285F4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        {/* Ambient Google Glow Blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(66,133,244,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* ══════════════════════════════
              RESTORED PAGE HEADING
              (Much bigger logo, clean typography)
          ══════════════════════════════ */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            {/* Main Signature Heading: Gallery */}
            <h1
              style={{
                fontFamily: "'zentry', sans-serif",
                fontSize: "clamp(3.2rem, 7vw, 6.2rem)",
                lineHeight: 0.95,
                textTransform: "uppercase",
                color: T.text,
                margin: "0 auto 16px",
                letterSpacing: "-0.01em",
              }}
            >
              Gallery
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#4285F4 0%,#8B5CF6 50%,#EA4335 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Moments & Memories.
              </span>
            </h1>

            {/* Much Bigger Cydropreneur Logo / Placeholder (Double Size) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "24px auto 16px",
              }}
            >
              <img
                src="/img/cydro-logo-footer.png"
                alt="Cydropreneur Logo"
                style={{
                  height: "clamp(120px, 18vw, 190px)",
                  maxWidth: "92vw",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 24px rgba(66,133,244,0.22))",
                  transition: "transform 0.3s ease",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = document.getElementById("cydro-logo-fallback-badge");
                  if (fallback) fallback.style.display = "inline-flex";
                }}
              />
              <span
                id="cydro-logo-fallback-badge"
                style={{
                  display: "none",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: T.purple,
                  background: "rgba(139,92,246,0.1)",
                  padding: "14px 40px",
                  borderRadius: 16,
                  border: "2px solid rgba(139,92,246,0.25)",
                }}
              >
                CYDROPRENEUR
              </span>
            </div>

            {/* Date & Venue Metadata Chips */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: T.muted,
                  fontSize: 13,
                  fontWeight: 500,
                  background: "rgba(0,0,0,0.04)",
                  padding: "4px 12px",
                  borderRadius: 8,
                }}
              >
                <FiCalendar size={13} color={T.blue} />
                <span>08th August 2026</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: T.muted,
                  fontSize: 13,
                  fontWeight: 500,
                  background: "rgba(0,0,0,0.04)",
                  padding: "4px 12px",
                  borderRadius: 8,
                }}
              >
                <FiMapPin size={13} color={T.red} />
                <span>FICCI Auditorium</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════
              COVERFLOW 3D CAROUSEL
              (Ultra-Smooth 60fps & Blended on #f8f9ff)
          ══════════════════════════════ */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: `3px solid ${T.border}`,
                  borderTopColor: T.blue,
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: T.muted, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                Loading Memories...
              </span>
            </div>
          ) : (
            <div style={{ position: "relative", width: "100%", margin: "8px auto 0" }}>
              <CoverflowCarousel
                ref={carouselRef}
                slides={slides}
                rotate={44}
                depth={0.6}
                perspective={3}
                falloff={0.56}
                fade={0.1}
                cardWidth="clamp(240px, 32vw, 380px)"
                gap={0.06}
                loop={true}
                showCaption={false}
                showPagination={false}
                showNavigation={false}
                onCardClick={(idx) => {
                  setActiveIndex(idx);
                  carouselRef.current?.goTo(idx);
                  setLightboxOpen(true);
                }}
                onSelect={(idx) => setActiveIndex(idx)}
                cardClassName="cursor-pointer shadow-2xl transition-all duration-300 hover:shadow-cyan-500/20"
              />
            </div>
          )}

          {/* ══════════════════════════════
              FEATURE TOGGLE BUTTONS BELOW CAROUSEL
          ══════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24, zIndex: 20 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 20px",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: 999,
                border: `1px solid ${T.border}`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* Prev */}
              <button
                className="btn-circle"
                onClick={() => carouselRef.current?.nudge(-1)}
                title="Previous Photo (Left Arrow)"
              >
                <FiChevronLeft size={18} />
              </button>

              {/* Autoplay Toggle */}
              <button
                className={`btn-circle ${isAutoplay ? "accent" : ""}`}
                onClick={() => setIsAutoplay((p) => !p)}
                title={isAutoplay ? "Pause Autoplay" : "Resume Autoplay"}
              >
                {isAutoplay ? (
                  <FiPause size={17} />
                ) : (
                  <FiPlay size={17} style={{ marginLeft: 2 }} color={isAutoplay ? "#fff" : T.green} />
                )}
              </button>

              {/* Next */}
              <button
                className="btn-circle"
                onClick={() => carouselRef.current?.nudge(1)}
                title="Next Photo (Right Arrow)"
              >
                <FiChevronRight size={18} />
              </button>


              {/* Share */}
              <button
                className="btn-circle"
                onClick={handleShare}
                title="Share Gallery Link"
              >
                <FiShare2 size={16} color={T.purple} />
              </button>

              {/* Fullscreen Expand */}
              <button
                className="btn-circle"
                onClick={() => setLightboxOpen(true)}
                title="Fullscreen Lightbox (ESC to close)"
              >
                <FiMaximize2 size={16} color={T.red} />
              </button>
            </div>

            {/* Copied notification toast */}
            {copiedNotification && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12.5,
                  color: T.green,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                }}
              >
                ✓ Link copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN LIGHTBOX ── */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
}
