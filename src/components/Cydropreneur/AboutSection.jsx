import { MapPin, Clock, Calendar } from "lucide-react";

const AboutSection = () => {
  return (
    <section
      id="about"
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "100px 32px",
        background: "#07030e",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background ambient radial glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1250px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "56px",
            alignItems: "center",
          }}
        >
          {/* Left Column: Title, Description, and Event Detail Pills */}
          <div>
            <h2
              style={{
                fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
                fontSize: "clamp(3.5rem, 6.5vw, 6.5rem)",
                fontWeight: 900,
                color: "#e879f9",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1,
                marginBottom: "32px",
                textShadow: "0 0 30px rgba(232, 121, 249, 0.5), 0 0 10px rgba(168, 85, 247, 0.8)",
              }}
            >
              ABOUT
            </h2>

            <p
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.15rem, 1.6vw, 1.35rem)",
                color: "#e9d5ff",
                lineHeight: 1.7,
                fontWeight: 600,
                letterSpacing: "0.03em",
                marginBottom: "40px",
                maxWidth: "600px",
              }}
            >
              Build AI-powered Android applications with Google AI Studio in an immersive, hands-on workshop led by Narendranath Chatterjee, Senior Android Developer at Ajaib. Learn modern Android development, integrate generative AI into your apps, and gain exclusive startup insights from experienced founders on building products that are ready for the real world.
            </p>

            {/* Event Detail Pills matching Figma design */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Location Pill */}
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    background: "rgba(147, 51, 234, 0.4)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(192, 132, 252, 0.4)",
                    boxShadow: "0 8px 24px rgba(147, 51, 234, 0.25)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  <MapPin size={15} className="text-purple-300" />
                  <span>IEM NEW TOWN, UEM KOLKATA</span>
                </div>
              </div>

              {/* Time & Date Pills Row */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    background: "rgba(147, 51, 234, 0.4)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(192, 132, 252, 0.4)",
                    boxShadow: "0 8px 24px rgba(147, 51, 234, 0.25)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  <Clock size={15} className="text-purple-300" />
                  <span>10:00 AM</span>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    background: "rgba(147, 51, 234, 0.4)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(192, 132, 252, 0.4)",
                    boxShadow: "0 8px 24px rgba(147, 51, 234, 0.25)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  <Calendar size={15} className="text-purple-300" />
                  <span>8th August</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Figma Image Asset */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "540px",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.3)",
                border: "1px solid rgba(192, 132, 252, 0.3)",
              }}
            >
              <img
                src="/img/About_section_image.png"
                alt="About Cydropreneur AI Workshop"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
