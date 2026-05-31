import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";
import Button from "./Button";

const navItems = ["Discussion Board", "Events", "Team"];

const NavBar = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  useEffect(() => {
    if (isAudioPlaying) audioElementRef.current.play();
    else audioElementRef.current.pause();
  }, [isAudioPlaying]);

  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.4,
      ease: "power3.out",
    });
  }, [isNavVisible]);

  return (
    <div ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6">
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center gap-2.5">
              {/* G logo */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base select-none"
                style={{ background: "linear-gradient(135deg,#4285F4,#EA4335)" }}>
                <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "16px" }}>G</span>
              </div>
              <div className="hidden md:flex flex-col leading-none">
                <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "12px", letterSpacing: "0.15em", color: "#0a0a0a" }}>
                  GGSC
                </span>
                <span style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(0,0,0,0.4)", textTransform: "uppercase" }}>
                  UEM Kolkata
                </span>
              </div>
            </div>
            <Button id="product-button" title="Join Community" rightIcon={<TiLocationArrow />}
              containerClass="md:flex hidden items-center justify-center gap-1 ml-3" />
          </div>

          {/* Nav links + audio */}
          <div className="flex h-full items-center">
            <div className="hidden md:block">
              {navItems.map((item, i) => (
                <a key={i} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="nav-hover-btn">{item}</a>
              ))}
            </div>
            <button onClick={toggleAudioIndicator} className="ml-10 flex items-center space-x-0.5">
              <audio ref={audioElementRef} className="hidden" src="/audio/loop.mp3" loop />
              {[1, 2, 3, 4].map((bar) => (
                <div key={bar}
                  className={clsx("indicator-line", { active: isIndicatorActive })}
                  style={{ animationDelay: `${bar * 0.1}s` }} />
              ))}
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
