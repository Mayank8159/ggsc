import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });
    clipAnimation.to(".mask-clip-path", { width: "100vw", height: "100vh", borderRadius: 0 });
  });

  return (
    <div id="about" className="min-h-screen w-screen relative overflow-hidden" style={{ background: "transparent" }}>
      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid-bg opacity-30 pointer-events-none" />

      {/* Google color bar top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-24 rounded-full"
        style={{ background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)" }} />

      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-px" style={{ background: "linear-gradient(90deg,transparent,#4285F4)" }} />
          <p style={{ fontFamily: "'Bungee', sans-serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>
            Who We Are
          </p>
          <div className="w-8 h-px" style={{ background: "linear-gradient(90deg,#EA4335,transparent)" }} />
        </div>

        <AnimatedTitle
          title="Sh<b>a</b>ping the future <br /> with <b>G</b>oogle Gemini"
          containerClass="mt-5 !text-black text-center"
        />

        <div className="about-subtext">
          <p style={{ fontFamily: "'Nanum Gothic', sans-serif", fontWeight: 700, color: "#0a0a0a" }}>
            The next generation of AI builders starts here.
          </p>
          <p style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.45)", marginTop: "8px", lineHeight: 1.75 }}>
            GGSC is the official Google Gemini Student Community at UEM Kolkata — part of the
            Google Student Ambassador Program. We unite students across engineering, design, and
            research into a unified AI-learning community.
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image"
          style={{ boxShadow: "0 0 100px rgba(66,133,244,0.15)" }}>
          <img src="/img/aboutv.png" alt="About GGSC"
            className="absolute left-0 top-0 size-full object-cover" />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg,rgba(66,133,244,0.2),rgba(234,67,53,0.1))" }} />
        </div>
      </div>
    </div>
  );
};

export default About;
