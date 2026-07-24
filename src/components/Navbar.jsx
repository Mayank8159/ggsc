import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TiLocationArrow } from "react-icons/ti";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Discussion Board", to: "/discussion" },
  { label: "Events", to: "/events" },
  { label: "Team", to: "/teams" },
];

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navContainerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();



  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      setMenuOpen(false);
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

  useEffect(() => {
    if (menuOpen) {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }
      );
    }
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <div ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 border-none transition-all duration-700 sm:inset-x-6">
      <header className="relative w-full">
        <nav className="flex items-center justify-between p-3 sm:p-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center select-none" style={{ background: "#000" }}>
                <img src="/img/main.png" alt="GGSC"
                  className="w-full h-full object-cover" />
              </div>
              <div className="flex sm:hidden flex-col leading-none">
                <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "11px", letterSpacing: "0.12em", color: "#0a0a0a" }}>
                  GGSC
                </span>
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "12px", letterSpacing: "0.15em", color: "#0a0a0a" }}>
                  GGSC
                </span>
                <span style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(0,0,0,0.4)", textTransform: "uppercase" }}>
                  UEM Kolkata
                </span>
              </div>
            </Link>

            {/* Join Community / User Avatar (desktop) */}
            <div className="hidden md:flex items-center ml-2 flex-nowrap">
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold select-none flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#4285F4,#34A853)" }}
                    title={user?.displayName}>
                    {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <button onClick={logout}
                    className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:opacity-60 flex-shrink-0"
                    style={{ color: "rgba(0,0,0,0.35)", background: "rgba(0,0,0,0.04)" }}>
                    <FiLogOut size={14} />
                  </button>
                </div>
              ) : (
                <Button id="product-button" title="Join Community" rightIcon={<TiLocationArrow />}
                  containerClass="items-center justify-center gap-1 flex-nowrap"
                  onClick={() => navigate('/login')} />
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:block">
              {navItems.map((item, i) => (
                <Link key={i} to={item.to}
                  className="nav-hover-btn"
                  style={location.pathname === item.to ? { color: "#0a0a0a" } : undefined}>{item.label}</Link>
              ))}
            </div>

            {/* Mobile Join Community (compact) */}
            <div className="flex md:hidden items-center">
              {isAuthenticated ? (
                <button onClick={logout}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
                  style={{ color: "rgba(0,0,0,0.35)", background: "rgba(0,0,0,0.04)" }}
                  title="Logout">
                  <FiLogOut size={14} />
                </button>
              ) : (
                <button onClick={() => navigate('/login')}
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{ color: "#fff", background: "linear-gradient(135deg,#4285F4,#EA4335)" }}>
                  Join
                </button>
              )}
            </div>

            {/* Desktop Audio Indicator (Visual Only) */}
            <div
              className="hidden sm:flex items-center ml-4 space-x-0.5"
              title="Music Indicator"
            >
              {[1, 2, 3, 4].map((bar) => (
                <div key={bar}
                  className={clsx("indicator-line", { active: true })}
                  style={{ animationDelay: `${bar * 0.1}s` }} />
              ))}
            </div>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
              style={{ color: "rgba(0,0,0,0.5)", background: "rgba(0,0,0,0.04)" }}>
              {menuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div ref={mobileMenuRef}
            className="absolute top-full left-3 right-3 sm:left-4 sm:right-4 mt-2 rounded-2xl overflow-hidden md:hidden"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 16px 48px rgba(0,0,0,0.1)" }}>
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to}
                  className="block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color: location.pathname === item.to ? "#0a0a0a" : "rgba(0,0,0,0.5)",
                    background: location.pathname === item.to ? "rgba(66,133,244,0.06)" : "transparent",
                  }}>
                  {item.label}
                </Link>
              ))}
              <hr style={{ borderColor: "rgba(0,0,0,0.06)", margin: "8px 0" }} />
              {isAuthenticated ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold select-none flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#4285F4,#34A853)" }}>
                    {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#0a0a0a" }}>{user?.displayName}</span>
                </div>
              ) : (
                <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all duration-200"
                  style={{ background: "linear-gradient(135deg,#4285F4,#EA4335)" }}>
                  Join Community
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default NavBar;
