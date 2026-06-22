import { FaInstagram, FaLinkedin, FaYoutube, FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";

const socialLinks = [
  { href: "https://instagram.com/ggsc_uemk", icon: <FaInstagram />, label: "Instagram", color: "#EA4335" },
  { href: "https://linkedin.com", icon: <FaLinkedin />, label: "LinkedIn", color: "#4285F4" },
  { href: "https://youtube.com", icon: <FaYoutube />, label: "YouTube", color: "#EA4335" },
  { href: "https://github.com", icon: <FaGithub />, label: "GitHub", color: "#0a0a0a" },
  { href: "mailto:gambassador2025@gmail.com", icon: <MdEmail />, label: "Email", color: "#34A853" },
];

const Footer = () => (
  <footer className="w-screen bg-white border-t border-black/6 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-[2px]"
      style={{ background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)" }} />
    <div className="absolute inset-0 dot-grid-bg opacity-15 pointer-events-none" />

    <div className="relative z-10 container mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* brand */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm select-none"
              style={{ background: "linear-gradient(135deg,#4285F4,#EA4335)" }}>
              <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "14px" }}>G</span>
            </div>
            <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: "14px", letterSpacing: "0.12em", color: "#0a0a0a" }}>GGSC</span>
          </div>
          <p style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", color: "rgba(0,0,0,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Google Gemini Student Community</p>
          <p style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", color: "rgba(0,0,0,0.25)" }}>UEM Kolkata · IEM-UEM Group</p>
        </div>

        {/* nav links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/discussion"
            style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0a0a0a"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.4)"}>
            Discussion Board
          </Link>
          <Link to="/events"
            style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0a0a0a"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.4)"}>
            Events
          </Link>
          <Link to="/teams"
            style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0a0a0a"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.4)"}>
            Team
          </Link>
          <a href="/#contact"
            style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0a0a0a"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.4)"}>
            Contact
          </a>
          <a href="mailto:gambassador2025@gmail.com"
            style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#4285F4" }}>
            gambassador2025@gmail.com
          </a>
        </div>

        {/* socials */}
        <div className="flex gap-3">
          {socialLinks.map((link, i) => (
            <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ border: "1px solid rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.3)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.color = link.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; e.currentTarget.style.color = "rgba(0,0,0,0.3)"; }}>
              {link.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-2">
        <p style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", color: "rgba(0,0,0,0.3)" }}>
          © 2026 Google Gemini Student Community @ UEM Kolkata. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {["#4285F4","#EA4335","#FBBC05","#34A853"].map((c,i) => (
              <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "10px", color: "rgba(0,0,0,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            IEM-UEM Group · Google Ambassador Program
          </span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
