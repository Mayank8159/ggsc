import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [loading, setLoading] = useState(true);
  const headingRef = useRef(null);
  const videoRef = useRef(null); // Ref to control the video

  useEffect(() => {
    if (!loading && headingRef.current) {
      // Content Animations
      const words = headingRef.current.querySelectorAll(".hero-word");
      gsap.fromTo(words,
        { y: 100, opacity: 0, filter: "blur(12px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.08, duration: 1.4, ease: "power4.out", delay: 0.4 }
      );
      gsap.fromTo(".hero-sub-line",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power3.out", delay: 0.9 }
      );
      gsap.fromTo(".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", delay: 1.4 }
      );

      // Video Entrance Animation
      gsap.fromTo("#video-frame",
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" }
      );
    }
  }, [loading]);

  // Video Playback Logic (Play once and pause 1s before end)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || loading) return;

    const handleTimeUpdate = () => {
      // If the video is within 1 second of ending, pause it
      if (video.duration && video.currentTime >= video.duration - 1) {
        video.pause();
        // Remove listener once paused to prevent it from firing repeatedly
        video.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };

    // Attempt to play the video programmatically
    video.play().catch(error => {
      console.log("Autoplay was prevented by the browser:", error);
    });

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      if (video) {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [loading]);

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden bg-white">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-white/80 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="three-body">
              <div className="three-body__dot" />
              <div className="three-body__dot" />
              <div className="three-body__dot" />
            </div>
            <p style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)" }}>
              Initializing GGSC Portal
            </p>
          </div>
        </div>
      )}

      <div id="video-frame" data-dark="true" className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-black">
        {/* Adjusted gradient for visibility without inverse filter */}
        <div className="absolute inset-0 z-10"
          style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.6) 100%)" }} />

        {/* Video controlled via ref, removed autoPlay and loop */}
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute left-0 top-0 size-full object-cover object-[50%_28%] md:object-center"
          onCanPlay={() => setLoading(false)}
        >
          <source src="/videos/herobw.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback image */}
        <img
          src="/img/herobgimg.jpeg"
          alt="GGSC Hero"
          className="absolute left-0 top-0 size-full object-cover object-[50%_28%] md:object-center"
          style={{ zIndex: -1 }}
          onLoad={() => setLoading(false)}
        />

        {/* Ghost watermark */}
        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 select-none"
          style={{ color: "rgba(255,255,255,0.04)" }}>
          G<b>G</b>SC
        </h1>

        {/* Hero copy */}
        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-[42vh] px-6 sm:px-12 max-w-5xl">

            {/* Main Heading Text */}
            <div ref={headingRef} className="overflow-hidden mb-6" style={{ perspective: "1000px" }}>
              <h1 style={{
                fontFamily: "'zentry', sans-serif", fontWeight: 900,
                fontSize: "clamp(3rem, 8vw, 10rem)", textTransform: "uppercase",
                lineHeight: 0.9, color: "#ffffff", letterSpacing: "-0.02em",
              }}>
                <span className="hero-word" style={{ display: "inline-block", opacity: 0 }}>
                  
                </span>
              </h1>
              <h2 className="hero-word mt-2 text-2xl md:text-4xl text-white font-serif tracking-wide" style={{ opacity: 0 }}>
                
              </h2>
            </div>

            {/* Subtext Lines */}
            <p className="hero-sub-line mb-1 font-nanum text-white text-xl leading-relaxed"
              style={{ opacity: 0 }}>
              AI-first student leadership at{" "}
              <span style={{ color: "#FBBC05", fontWeight: 700 }}>UEM Kolkata.</span>
            </p>
            <p className="hero-sub-line mb-4 font-nanum text-sm leading-relaxed max-w-lg"
              style={{ opacity: 0, color: "rgba(255,255,255,0.8)" }}>
              Exploring the power of Google Gemini & AI.
            </p>

            {/* Google Ambassador Program Pill */}
            <div className="hero-sub-line mb-10 inline-flex items-center gap-3 rounded-full px-4 py-2"
              style={{ background: "rgba(52, 168, 83, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(52, 168, 83, 0.4)", opacity: 0 }}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-bold" style={{ color: "#4285F4" }}>
                G
              </div>
              <span style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "14px", fontWeight: "600", color: "#4ade80" }}>
                Google Student Ambassador Program
              </span>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <div className="hero-cta" style={{ opacity: 0 }}>
                <Button id="cta-main" title="Get Started" leftIcon={<TiLocationArrow />}
                  containerClass="flex-center gap-1" />
              </div>
              <div className="hero-cta" style={{ opacity: 0 }}>
                <Button id="cta-events" title="View Events"
                  containerClass="flex-center gap-1" variant="glass" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 select-none"
        style={{ color: "rgba(0,0,0,0.03)" }}>
        G<b>G</b>SC
      </h1>
    </div>
  );
};

export default Hero;