import { useState, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";

export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relX = (event.clientX - left) / width;
    const relY = (event.clientY - top) / height;

    const tiltX = (relY - 0.5) * 5;
    const tiltY = (relX - 0.5) * -5;

    setTransformStyle(
      `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.98,.98,.98)`
    );
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTransformStyle("")}
      style={{
        transform: transformStyle,
        transition: "transform 0.12s ease",
      }}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  src,
  title,
  description,
  accentColor = "#4285F4",
  negativeText,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative size-full overflow-hidden rounded-3xl"
      data-dark="true"
    >
      {/* MEDIA */}
      {src.endsWith(".mp4") ? (
        <video
          src={src}
          loop
          muted
          autoPlay
          playsInline
          preload="auto"
          onLoadedData={() => setLoaded(true)}
          className="absolute left-0 top-0 size-full object-cover object-center"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.35s ease",
            transform: "scale(1.03)",
          }}
        />
      ) : (
        <img
          src={src}
          alt="bento-img"
          onLoad={() => setLoaded(true)}
          className="absolute left-0 top-0 size-full object-cover object-center"
          style={{
            filter: "brightness(0.76) saturate(1.08)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.35s ease",
            transform: "scale(1.03)",
          }}
        />
      )}

      {/* LOADER */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.08)",
            backdropFilter: "blur(2px)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "999px",
              border: "2px solid rgba(255,255,255,0.25)",
              borderTopColor: accentColor,
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}

      {/* LIGHT OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(0,0,0,0.04) 0%,
              rgba(0,0,0,0.20) 100%
            )
          `,
        }}
      />

      {/* COLOR GLOW */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 60%)`,
        }}
      />

      {/* WAVY DESIGN */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M0,150 C80,80 160,220 240,150 S320,80 400,150"
          stroke={accentColor}
          strokeWidth="1"
          fill="none"
        />

        <path
          d="M0,180 C80,110 160,250 240,180 S320,110 400,180"
          stroke={accentColor}
          strokeWidth="0.6"
          fill="none"
        />
      </svg>

      {/* CONTENT */}
      <div className="relative z-10 flex size-full flex-col justify-between p-6 text-white">
        <div>
          {negativeText ? (
            <h1
              className="bento-title special-font"
              style={{
                mixBlendMode: "screen",
                color: "#ffffff",
                WebkitTextStroke: `1px rgba(255,255,255,0.9)`,
                WebkitTextFillColor: "transparent",
                fontSize: "clamp(2rem,5vw,4rem)",
                textShadow: "0 4px 20px rgba(0,0,0,0.18)",
              }}
            >
              {title}
            </h1>
          ) : (
            <h1
              className="bento-title special-font"
              style={{
                textShadow: "0 4px 20px rgba(0,0,0,0.25)",
              }}
            >
              {title}
            </h1>
          )}

          {description && (
            <p
              className="mt-3 max-w-64 text-xs md:text-sm font-outfit leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.88)",
                textShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section
      id="features"
      className="bg-white pb-52 relative overflow-hidden"
    >
      {/* BG GRID */}
      <div className="absolute inset-0 dot-grid-bg opacity-30 pointer-events-none" />

      <div className="container mx-auto px-3 md:px-10 relative z-10">
        {/* HEADER */}
        <div className="px-5 py-32">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#4285F4)",
              }}
            />

            <p className="font-outfit text-[10px] uppercase tracking-[.3em] text-black/40">
              Mission & Objectives
            </p>

            <div
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg,#EA4335,transparent)",
              }}
            />
          </div>

          <p className="font-zentry font-black text-5xl md:text-7xl uppercase text-black special-font leading-none">
            Wh<b>a</b>t drives <br />

            <span
              style={{
                background:
                  "linear-gradient(90deg,#4285F4,#EA4335)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              G<b>G</b>SC
            </span>
          </p>

          <p className="max-w-md font-outfit text-base text-black/50 mt-4 leading-relaxed">
            A community built on curiosity, collaboration, and cutting-edge AI
            exploration—powered by Google Gemini.
          </p>
        </div>

        {/* TOP BANNER */}
        <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-3xl md:h-[65vh]">
          <BentoCard
            src="img/inno.png"
            accentColor="#4285F4"
            negativeText
            title={
              <>
                Inn<b>o</b>vation
              </>
            }
            description="Pushing the boundaries of what's possible with AI-driven innovation and Google Gemini technologies."
          />
        </BentoTilt>

        {/* GRID */}
        <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
          {/* AI HUB */}
          <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
            <BentoCard
              src="videos/feature.mp4"
              accentColor="#4285F4"
              
              title={
                <>
                  Feature Hub
                </>
              }
              description="Real-time multimodal exploration and hands-on workshops."
            />
          </BentoTilt>

          {/* SKILLS */}
          <BentoTilt className="bento-tilt_1 row-span-1 ms-0 md:col-span-1 md:ms-0">
            <BentoCard
              src="img/skills.jpeg"
              accentColor="#FBBC05"
              
              title={
                <>
                  Ski<b>l</b>ls
                </>
              }
              description="Mastering practical AI applications and advanced design with hands-on workshops."
            />
          </BentoTilt>

          {/* RESEARCH */}
          <BentoTilt className="bento-tilt_1 me-0 md:col-span-1 md:me-0">
            <BentoCard
              src="img/research.jpeg"
              accentColor="#34A853"
              title={
                <>
                  Res<b>e</b>arch
                </>
              }
              description="Exploring the frontier of AI—from large language models to multimodal systems."
            />
          </BentoTilt>

          {/* MORE CARD */}
          <BentoTilt className="bento-tilt_2">
            <div
              data-dark="true"
              className="flex size-full flex-col justify-between p-5 rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg,#4285F4,#EA4335)",
              }}
            >
              <h1 className="bento-title special-font max-w-64 text-white">
                M<b>o</b>re co<b>m</b>ing s<b>o</b>on.
              </h1>

              <TiLocationArrow className="m-5 scale-[5] self-end text-white/60" />
            </div>
          </BentoTilt>

          {/* COLLAB */}
          <BentoTilt className="bento-tilt_2">
            <BentoCard
              src="img/collab.jpeg"
              accentColor="#EA4335"
              negativeText
              title={
                <>
                  Coll<b>a</b>b
                </>
              }
              description="Encouraging cosmic curiosity and collective growth."
            />
          </BentoTilt>
        </div>
      </div>
    </section>
  );
};

export default Features;