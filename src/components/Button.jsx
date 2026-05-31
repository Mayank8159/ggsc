import clsx from "clsx";

const Button = ({ id, title, rightIcon, leftIcon, containerClass, onClick, variant = "gradient" }) => {
  const baseClass = "group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full px-7 py-3 font-semibold text-xs uppercase tracking-widest transition-all duration-400";

  const variants = {
    gradient: {
      style: { background: "linear-gradient(135deg,#4285F4 0%,#EA4335 100%)", boxShadow: "0 4px 24px rgba(66,133,244,0.3)", fontFamily: "'Nanum Gothic', sans-serif" },
      textClass: "text-white"
    },
    outline: {
      style: { background: "transparent", border: "1.5px solid rgba(0,0,0,0.15)", boxShadow: "none", fontFamily: "'Nanum Gothic', sans-serif" },
      textClass: "text-black"
    },
    glass: {
      style: { background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)", fontFamily: "'Nanum Gothic', sans-serif" },
      textClass: "text-white"
    }
  };

  const v = variants[variant] || variants.gradient;

  return (
    <button id={id} onClick={onClick}
      className={clsx(baseClass, v.textClass, containerClass)}
      style={v.style}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))" }} />
      {leftIcon && <span className="relative z-10 mr-1.5 flex items-center">{leftIcon}</span>}
      <span className="relative z-10 inline-flex overflow-hidden" style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em" }}>
        <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">{title}</div>
        <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">{title}</div>
      </span>
      {rightIcon && <span className="relative z-10 ml-1.5 flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;
