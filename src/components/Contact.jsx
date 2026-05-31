import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";
import { TiLocationArrow } from "react-icons/ti";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   FLOATING IMAGE (Refined & Subtle)
───────────────────────────────────────────── */
const FloatingPhoto = ({ src, className = "", imgClass = "" }) => {
  return (
    <div
      className={`
        absolute overflow-hidden rounded-[2rem]
        border border-white/5
        bg-black/20
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.5)]
        transition-transform duration-700
        ${className}
      `}
    >
      {/* Subtle Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent z-10 pointer-events-none" />

      {/* Image */}
      <img
        src={src}
        alt="Showcase"
        className={`w-full h-full object-cover opacity-90 ${imgClass}`}
        style={{
          filter: "brightness(0.85) contrast(1.1) grayscale(0.2)",
        }}
      />

      {/* Soft Reflection */}
      <div className="absolute -top-10 left-[-20%] h-40 w-20 rotate-[25deg] bg-white/5 blur-3xl" />
    </div>
  );
};

const Contact = () => {
  const sectionRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;

    const subject = encodeURIComponent(`GGSC Inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    window.open(
      `mailto:gambassador2025@gmail.com?subject=${subject}&body=${body}`,
      "_blank"
    );

    setSent(true);

    setTimeout(() => {
      setSent(false);
    }, 4000);
  };

  /* ─────────────────────────────────────────────
     GSAP (Smoother, Matured Animations)
  ────────────────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Reveal Animation */
      gsap.from(".reveal", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      /* Gentle Floating */
      gsap.to(".float-slow", {
        y: -12,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".float-fast", {
        y: 10,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /* Layered Parallax (Smoothed) */
      gsap.to(".parallax-1", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".parallax-2", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(".parallax-3", {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      });

      gsap.to(".parallax-4", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      /* Subtle Ambient Breathing */
      gsap.to(".orb", {
        scale: 1.05,
        opacity: 0.5,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="
        relative w-screen overflow-hidden
        bg-[#030305] px-5 py-28 md:px-10
      "
    >
      {/* GRID BG (Highly Transparent) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ORBS (Sophisticated Ambient Lighting) */}
      <div className="orb absolute left-[-10rem] top-0 h-[30rem] w-[30rem] rounded-full bg-indigo-900/20 blur-[140px]" />
      <div className="orb absolute right-[-6rem] bottom-0 h-[25rem] w-[25rem] rounded-full bg-slate-800/30 blur-[150px]" />
      <div className="orb absolute left-1/2 top-1/3 h-[20rem] w-[20rem] rounded-full bg-white/5 blur-[120px] -translate-x-1/2" />

      {/* MAIN CARD */}
      <div
        className="
          relative mx-auto max-w-7xl overflow-hidden
          rounded-[2.5rem] border border-white/[0.05]
        "
        style={{
          background: "linear-gradient(180deg, rgba(15,15,20,0.8), rgba(8,8,12,0.9))",
          backdropFilter: "blur(20px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Sleek Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] opacity-50"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {/* PHOTOS (Refined Layout & Angles) */}
        <div className="hidden lg:block pointer-events-none">
          <FloatingPhoto
            src="/img/skills.jpeg"
            className="parallax-1 float-slow left-[-3rem] top-24 h-[28rem] w-[20rem] rotate-[-3deg]"
            imgClass="p-2"
          />
          <FloatingPhoto
            src="/img/gemini_game_night.jpeg"
            className="parallax-2 float-fast left-28 bottom-12 h-[16rem] w-[14rem] rotate-[2deg]"
            imgClass="p-1"
          />
          <FloatingPhoto
            src="/img/Ideas.jpeg"
            className="parallax-3 float-slow right-[-4rem] top-20 h-[24rem] w-[18rem] rotate-[4deg]"
            imgClass="p-2"
          />
          <FloatingPhoto
            src="/img/coding.jpeg"
            className="parallax-4 float-fast right-28 bottom-20 h-[14rem] w-[12rem] rotate-[-2deg]"
            imgClass="p-1"
          />
        </div>

        {/* CONTENT */}
        <div className="relative z-20 flex flex-col items-center px-6 py-24 text-center md:px-14">
          
          {/* MINI LABEL */}
          <div className="reveal mb-8 flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/30" />
            <p className="font-outfit text-[10px] uppercase tracking-[0.35em] text-white/50">
              Connect With GGSC
            </p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          {/* TITLE */}
          <AnimatedTitle
            title="let&#39;s create <br /> something <b>m</b>eaningful <br /> t<b>o</b>gether."
            containerClass="
              special-font reveal
              !font-black !leading-[0.9]
              !text-white
              !text-5xl md:!text-7xl
              max-w-5xl tracking-tight
            "
          />

          {/* SUBTITLE */}
          <p className="reveal mt-8 max-w-xl text-sm md:text-base leading-relaxed text-white/50 font-light">
            Builders, developers, creators, designers — GGSC is where ideas become real projects. Let's build the future.
          </p>

          {/* PREMIUM FORM */}
          <div
            className="
              reveal mt-16 w-full max-w-xl
              rounded-[1.5rem]
              border border-white/[0.08]
              p-6 md:p-10
            "
            style={{
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6 text-left">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                Direct Inquiry
              </p>
              <p className="mt-1 text-sm text-white/70">
                gambassador2025@gmail.com
              </p>
            </div>

            {/* Inputs */}
            <div className="grid gap-6">
              
              {/* Name */}
              <div className="text-left">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">
                  Your Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Arya Sen"
                  className="
                    w-full rounded-xl
                    border border-white/10
                    bg-white/[0.03]
                    px-5 py-4
                    text-sm text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-white/20
                    focus:border-white/30
                    focus:bg-white/[0.05]
                    focus:shadow-[0_0_15px_rgba(255,255,255,0.05)]
                  "
                />
              </div>

              {/* Email */}
              <div className="text-left">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@uem.edu.in"
                  className="
                    w-full rounded-xl
                    border border-white/10
                    bg-white/[0.03]
                    px-5 py-4
                    text-sm text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-white/20
                    focus:border-white/30
                    focus:bg-white/[0.05]
                    focus:shadow-[0_0_15px_rgba(255,255,255,0.05)]
                  "
                />
              </div>

              {/* Message */}
              <div className="text-left">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your ideas..."
                  className="
                    w-full resize-none rounded-xl
                    border border-white/10
                    bg-white/[0.03]
                    px-5 py-4
                    text-sm text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-white/20
                    focus:border-white/30
                    focus:bg-white/[0.05]
                    focus:shadow-[0_0_15px_rgba(255,255,255,0.05)]
                  "
                />
              </div>

              {/* Button */}
              <div className="pt-4">
                <Button
                  title={sent ? "Opening Mail Client..." : "Send Message"}
                  rightIcon={<TiLocationArrow />}
                  containerClass="w-full justify-center py-4 bg-white text-black hover:bg-gray-200 transition-colors rounded-xl font-medium"
                  onClick={handleSubmit}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <p className="text-[11px] text-white/30">
                Usually replies within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;