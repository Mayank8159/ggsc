import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TiLocationArrow } from "react-icons/ti";
import { IoClose } from "react-icons/io5";
import { FiArrowUpRight, FiCalendar, FiMapPin } from "react-icons/fi";
import Button from "./Button";

gsap.registerPlugin(ScrollTrigger);

/* ─── THEME ─── */
const T = {
  bg: "#f8f9ff",
  surface: "#ffffff",
  text: "#0d1117",
  muted: "#6b7280",
  border: "rgba(0,0,0,0.07)",
  blue: "#4285F4",
  purple: "#8B5CF6",
  red: "#EA4335",
  green: "#34A853",
};

/* ─── DATA ─── */
const FEATURED_EVENT = {
  id: 1,
  title: "Build with AI",
  date: "July 12–13, 2026",
  venue: "Main Auditorium • UEM Kolkata",
  desc: "A next-generation AI workshop powered by Gemini APIs where developers, designers, and creators collaborate to build immersive products.",
  img: "/img/hackathon.jpeg",
  tag: "Workshop",
  color: T.blue,
};

const UPCOMING_EVENTS = [
  {
    id: 100,
    title: "Cydropreneur",
    date: "08th August 2026",
    venue: "FICCI Auditorium",
    desc: "Build Android applications in an immersive, hands-on workshop",
    img: "/img/static.png",
    tag: "AI & Android",
    color: T.purple,
    route: "/events/Cydropreneur",
  },
];

const PAST_EVENTS = [

  {
    id: 4,
    title: "Untold Perception",
    date: "Sept 26, 2025",
    venue: "Creative Hall",
    desc: "A visual exploration of human senses through abstract photography and storytelling.",
    img: "/img/photography_comp.jpeg",
    tag: "Photography",
    color: T.red,
  },
  {
    id: 5,
    title: "Coding Ninja",
    date: "Oct 19, 2025",
    venue: "Lab 4",
    desc: "Competitive coding challenge focused on speed, logic, and problem solving.",
    img: "/img/coding_comp.jpeg",
    tag: "Competitive",
    color: T.blue,
  },
  {
    id: 6,
    title: "MystiCanvas",
    date: "Sept 24, 2025",
    venue: "Design Arena",
    desc: "Digital poster design competition blending creativity and storytelling.",
    img: "/img/flyer_making_comp.jpeg",
    tag: "Design",
    color: T.purple,
  },
  {
    id: 7,
    title: "Game Night",
    date: "April 2026",
    venue: "Student Center",
    desc: "Strategy, chaos, and late-night gaming battles across multiple arenas.",
    img: "/img/gemini_game_night.jpeg",
    tag: "Gaming",
    color: T.green,
  },
  {
    id: 8,
    title: "Chamber of Secrets",
    date: "Feb 07, 2026",
    venue: "UEMK Campus (Offline)",
    desc: "An immersive treasure hunt adventure where participants navigate hidden clues and ancient mysteries to claim the ultimate prize.",
    img: "/img/treasure_hunt.jpeg",
    tag: "Treasure Hunt",
    color: T.gold,
  },
];

/* ─── PILL ─── */
function Pill({ children, color = T.blue }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        background: `${color}14`,
        border: `1px solid ${color}28`,
      }}
    >
      {children}
    </span>
  );
}

/* ─── SECTION LABEL ─── */
function SectionLabel({ label, title }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#4285F4,#8B5CF6)",
          }}
        />
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: T.muted,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {label}
        </span>
      </div>
      {title && (
        <h2
          style={{
            fontFamily: "'zentry', sans-serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            lineHeight: 1,
            textTransform: "uppercase",
            color: T.text,
          }}
        >
          {title}
        </h2>
      )}
    </div>
  );
}

/* ─── PAST EVENT CARD ─── */
function PastCard({ event, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(event)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: hovered
          ? "0 20px 48px rgba(0,0,0,0.10)"
          : "0 4px 16px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.4s cubic-bezier(0.19,1,0.22,1)",
      }}
    >
      {/* Image */}
      <div
        style={{
          height: 200,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={event.img}
          alt={event.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.7s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
          }}
        >
          <Pill color={event.color}>{event.tag}</Pill>
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "scale(1)" : "scale(0.8)",
            transition: "all 0.3s ease",
          }}
        >
          <FiArrowUpRight size={16} color={T.text} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px 24px" }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 12,
            color: T.muted,
            fontSize: 12,
          }}
        >
          <span
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <FiCalendar size={11} /> {event.date}
          </span>
          <span
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <FiMapPin size={11} /> {event.venue}
          </span>
        </div>

        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            marginBottom: 8,
            color: T.text,
            lineHeight: 1.3,
          }}
        >
          {event.title}
        </h3>

        <p
          style={{
            color: T.muted,
            fontSize: 13.5,
            lineHeight: 1.65,
          }}
        >
          {event.desc}
        </p>
      </div>
    </div>
  );
}

/* ─── MODAL ─── */
function EventModal({ event, onClose }) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out", delay: 0.05 }
    );
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current, {
      opacity: 0,
      y: 30,
      scale: 0.97,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.35,
      delay: 0.05,
      onComplete: onClose,
    });
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(13,17,23,0.72)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="event-modal-grid"
        style={{
          width: "100%",
          maxWidth: 860,
          background: T.surface,
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 40px 100px rgba(0,0,0,0.25)",
        }}
      >
        {/* Left – image */}
        <div className="modal-image" style={{ position: "relative", minHeight: 520 }}>
          <img
            src={event.img}
            alt={event.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, transparent 50%, rgba(0,0,0,0.45))",
            }}
          />
          <div style={{ position: "absolute", bottom: 24, left: 24 }}>
            <Pill color={event.color}>{event.tag}</Pill>
          </div>
        </div>

        {/* Right – info */}
        <div
          style={{
            padding: "44px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: event.color,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Event Details
            </p>

            <h2
              style={{
                fontFamily: "'zentry', sans-serif",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                lineHeight: 1,
                textTransform: "uppercase",
                color: T.text,
                marginBottom: 28,
              }}
            >
              {event.title}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {[
                { icon: <FiCalendar size={14} />, text: event.date },
                { icon: <FiMapPin size={14} />, text: event.venue },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    borderRadius: 12,
                    background: "#f3f4f6",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: T.text,
                  }}
                >
                  <span style={{ color: event.color }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>

            <p
              style={{
                color: T.muted,
                lineHeight: 1.8,
                fontSize: 14.5,
              }}
            >
              {event.desc}
            </p>
          </div>

          
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.95)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            color: T.text,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <IoClose size={18} />
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
const Events = () => {
  const sectionRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".fade-up").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 48,
          duration: 0.9,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        #events * { box-sizing: border-box; }

        .upcoming-card {
          display: grid;
          grid-template-columns: 300px 1fr;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.19,1,0.22,1);
        }

        .upcoming-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
        }

        .upcoming-card:hover .uc-img {
          transform: scale(1.05);
        }

        .uc-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .past-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .featured-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .event-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 960px) {
          .upcoming-card {
            grid-template-columns: 1fr;
          }
          .past-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .featured-card-grid {
            grid-template-columns: 1fr;
          }
          .event-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .event-modal-grid .modal-image {
            min-height: 280px;
          }
        }

        @media (max-width: 600px) {
          .past-grid {
            grid-template-columns: 1fr;
          }
          .featured-card-grid {
            min-height: auto;
          }
          .featured-card-grid .featured-content {
            padding: 32px 24px;
          }
        }
      `}</style>

      <section
        id="events"
        ref={sectionRef}
        style={{
          background: T.bg,
          padding: "100px 0 120px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Subtle dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.035,
            backgroundImage:
              "radial-gradient(circle, #4285F4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        {/* Soft glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(66,133,244,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 28px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* ── PAGE HEADER ── */}
          <div className="fade-up" style={{ marginBottom: 80 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(66,133,244,0.08)",
                border: "1px solid rgba(66,133,244,0.16)",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#4285F4,#8B5CF6,#EA4335,#34A853)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: T.blue,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 500,
                }}
              >
                Community Experiences
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'zentry', sans-serif",
                fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
                lineHeight: 0.95,
                textTransform: "uppercase",
                color: T.text,
                maxWidth: 800,
                letterSpacing: "-0.01em",
              }}
            >
              Events that
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#4285F4 0%,#8B5CF6 50%,#EA4335 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                move creators.
              </span>
            </h1>
          </div>

          {/* ══════════════════════════════
              FEATURED WORKSHOP
          ══════════════════════════════ */}
          <div className="fade-up" style={{ marginBottom: 80 }}>
            <SectionLabel label="Featured" title="Flagship Event" />

            <div className="featured-card-grid"
              style={{
                borderRadius: 28,
                overflow: "hidden",
                background: T.surface,
                border: `1px solid ${T.border}`,
                boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                minHeight: 420,
              }}
            >
              {/* Left – content */}
              <div className="featured-content"
                style={{
                  padding: "48px 48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Pill color={T.blue}>Workshop</Pill>

                  <h2
                    style={{
                      fontFamily: "'zentry', sans-serif",
                      fontSize: "clamp(2.4rem, 4vw, 3.8rem)",
                      lineHeight: 0.95,
                      margin: "20px 0 18px",
                      textTransform: "uppercase",
                      color: T.text,
                    }}
                  >
                    {FEATURED_EVENT.title}
                  </h2>

                  <p
                    style={{
                      color: T.muted,
                      fontSize: 15,
                      lineHeight: 1.75,
                      maxWidth: 460,
                    }}
                  >
                    {FEATURED_EVENT.desc}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 24,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      {
                        icon: <FiCalendar size={13} />,
                        text: FEATURED_EVENT.date,
                      },
                      {
                        icon: <FiMapPin size={13} />,
                        text: FEATURED_EVENT.venue,
                      },
                    ].map(({ icon, text }) => (
                      <div
                        key={text}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "9px 16px",
                          borderRadius: 12,
                          background: "#f0f4ff",
                          fontSize: 13,
                          fontWeight: 600,
                          color: T.text,
                        }}
                      >
                        <span style={{ color: T.blue }}>{icon}</span>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 36 }}>
                  <Button
                    title="Register Now"
                    leftIcon={<TiLocationArrow />}
                    containerClass=""
                    onClick={() => window.open("https://forms.gle/qYHwXw7TmNuzv2iF8", "_blank")}
                  />
                </div>
              </div>

              {/* Right – image */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 380,
                }}
              >
                <img
                  src={FEATURED_EVENT.img}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.12), transparent)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════
              UPCOMING EVENTS
          ══════════════════════════════ */}
          <div className="fade-up" style={{ marginBottom: 80 }}>
            <SectionLabel label="On the horizon" title="Upcoming." />

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {UPCOMING_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="upcoming-card"
                  onClick={() => {
                    if (event.route) {
                      navigate(event.route);
                    } else {
                      setSelected(event);
                    }
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      overflow: "hidden",
                      minHeight: 220,
                      position: "relative",
                    }}
                  >
                    <img
                      className="uc-img"
                      src={event.img}
                      alt={event.title}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                      }}
                    >
                      <Pill color={event.color}>{event.tag}</Pill>
                    </div>
                  </div>

                  {/* Info */}
                  <div
                    style={{
                      padding: "32px 36px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 16,
                        color: T.muted,
                        fontSize: 12.5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <FiCalendar size={12} /> {event.date}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <FiMapPin size={12} /> {event.venue}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                        fontWeight: 800,
                        color: T.text,
                        marginBottom: 14,
                        lineHeight: 1.15,
                        fontFamily: "'zentry', sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      {event.title}
                    </h3>

                    <p
                      style={{
                        color: T.muted,
                        lineHeight: 1.7,
                        fontSize: 14,
                        maxWidth: 480,
                        marginBottom: 24,
                      }}
                    >
                      {event.desc}
                    </p>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        color: event.color,
                      }}
                    >
                      View Details <FiArrowUpRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════
              PAST EVENTS
          ══════════════════════════════ */}
          <div className="fade-up">
            <SectionLabel label="Archive" title="Past Moments." />

            <div className="past-grid">
              {PAST_EVENTS.map((event) => (
                <PastCard
                  key={event.id}
                  event={event}
                  onClick={setSelected}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL ── */}
      {selected && (
        <EventModal event={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};

export default Events;