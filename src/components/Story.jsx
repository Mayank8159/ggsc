import gsap from "gsap";
import { useRef, useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TiLocationArrow } from "react-icons/ti";
import Button from "./Button";

gsap.registerPlugin(ScrollTrigger);

const Story = () => {
  const sectionRef = useRef(null);
  const glowRef1 = useRef(null);
  const glowRef2 = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating glows
      gsap.to(glowRef1.current, {
        x: 40,
        y: -30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glowRef2.current, {
        x: -30,
        y: 40,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Title reveal
      gsap.fromTo(
        ".story-title-line",
        {
          y: 120,
          opacity: 0,
          rotateX: -90,
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          stagger: 0.12,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".story-title-line",
            start: "top 85%",
          },
        }
      );

      // Fade reveal
      gsap.fromTo(
        ".story-fade",
        {
          y: 40,
          opacity: 0,
          filter: "blur(10px)",
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".story-fade",
            start: "top 90%",
          },
        }
      );

      // Glass cards
      gsap.fromTo(
        ".glass-card",
        {
          y: 80,
          opacity: 0,
          scale: 0.94,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".glass-card",
            start: "top 88%",
          },
        }
      );

      // Counter animation (FIXED)
      gsap.utils.toArray(".stat-number").forEach((el) => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || "";

        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true, // Optional: ensures it only runs once per page load
          onEnter: () => {
            gsap.to({ val: 0 }, {
              val: target,
              duration: 2,
              ease: "power3.out",
              onUpdate: function () {
                el.innerText = Math.round(this.targets()[0].val) + suffix;
              },
            });
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f2]"
    >
      {/* GRID BACKGROUND */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* RADIAL GRADIENT */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at top left, rgba(66,133,244,0.08), transparent 35%),
            radial-gradient(circle at bottom right, rgba(234,67,53,0.07), transparent 35%)
          `,
        }}
      />

      {/* FLOATING BLURS */}
      <div
        ref={glowRef1}
        className="absolute left-[10%] top-[20%] h-[280px] w-[280px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(66,133,244,0.10), transparent 70%)",
        }}
      />

      <div
        ref={glowRef2}
        className="absolute right-[10%] bottom-[10%] h-[300px] w-[300px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251,188,5,0.10), transparent 70%)",
        }}
      />

      {/* WATERMARK */}
      <div
        className="absolute right-[4vw] top-[7vh] z-[1] select-none"
        style={{
          fontFamily: "'zentry', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(6rem,15vw,16rem)",
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: "rgba(0,0,0,0.035)",
        }}
      >
        GGSC
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-end px-6 pb-20 pt-32 md:px-16">
        <div className="w-full">
          {/* TOP LABEL */}
          <div className="story-fade mb-8 flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500" />

            <p
              style={{
                fontFamily: "'Bungee', sans-serif",
                letterSpacing: "0.35em",
              }}
              className="text-[10px] uppercase text-black/40"
            >
              Our Journey
            </p>
          </div>

          {/* TITLE */}
          <div className="mb-12 overflow-hidden">
            <div className="overflow-hidden">
              <h1
                className="story-title-line"
                style={{
                  fontFamily: "'zentry', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(3rem,7vw,8rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  background:
                    "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                From curiosity —
              </h1>
            </div>

            <div className="overflow-hidden">
              <h1
                className="story-title-line"
                style={{
                  fontFamily: "'zentry', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(3rem,7vw,8rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.72)",
                }}
              >
                to AI innovation.
              </h1>
            </div>
          </div>

          {/* GRID */}
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* LEFT CARD */}
            <div
              className="glass-card rounded-[32px] border border-black/5 p-8"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
              }}
            >
              <p
                className="story-fade mb-8 max-w-2xl"
                style={{
                  fontFamily: "'Nanum Gothic', sans-serif",
                  fontSize: "15px",
                  lineHeight: 1.9,
                  color: "rgba(0,0,0,0.58)",
                }}
              >
                GGSC was founded under the Google Student Ambassador Program at
                UEM Kolkata with one vision — empowering students to explore,
                build, and lead the future of AI through collaboration,
                creativity, and hands-on innovation using Google Gemini.
              </p>

              <div className="story-fade">
                <Button
                  id="story-btn"
                  title="Explore Community"
                  leftIcon={<TiLocationArrow />}
                  containerClass="flex-center gap-2"
                />
              </div>
            </div>

            {/* RIGHT CARD */}
            <div
              className="glass-card rounded-[32px] border border-black/5 p-8"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
              }}
            >
              <div className="grid grid-cols-2 gap-8">
                {[
                  {
                    val: 70,
                    suffix: "+",
                    label: "Students",
                    gradient:
                      "linear-gradient(135deg,#4285F4,#34A853)",
                  },
                  {
                    val: 6,
                    suffix: "+",
                    label: "Events",
                    gradient:
                      "linear-gradient(135deg,#EA4335,#FBBC05)",
                  },
                  {
                    val: 2024,
                    suffix: "",
                    label: "Founded",
                    gradient:
                      "linear-gradient(135deg,#FBBC05,#4285F4)",
                  },
                  {
                    val: 5,
                    suffix: "+",
                    label: "Projects",
                    gradient:
                      "linear-gradient(135deg,#34A853,#4285F4)",
                  },
                ].map((item, index) => (
                  <div key={index}>
                    <h2
                      style={{
                        fontFamily: "'zentry', sans-serif",
                        fontWeight: 900,
                        fontSize: "clamp(2rem,4vw,4rem)",
                        lineHeight: 0.9,
                        background: item.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      <span
                        className="stat-number"
                        data-target={item.val}
                        data-suffix={item.suffix}
                      >
                        0{item.suffix}
                      </span>
                    </h2>

                    <p
                      style={{
                        fontFamily: "'Bungee', sans-serif",
                        letterSpacing: "0.25em",
                      }}
                      className="mt-2 text-[9px] uppercase text-black/35"
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;