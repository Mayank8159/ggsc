import { MapPin, Clock, Calendar } from "lucide-react";

const AboutSection = () => {
  return (
    <section
      id="about"
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "40px 12px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "16px solid #000000",
        boxSizing: "border-box",
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

      {/* Main Glassmorphic About Card Wrapper */}
      <div
        style={{
          maxWidth: "1360px",
          width: "100%",
          margin: "0 auto",
          background: "linear-gradient(135deg, rgba(22, 10, 48, 0.55) 0%, rgba(10, 5, 26, 0.75) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "32px",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {/* Left Column: Character Image (fits without cropping or distortion) */}
        <div
          style={{
            flex: "1.15 1 520px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: "580px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <img
            src="/img/about img.png"
            alt="Android Developer Character"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "690px",
              objectFit: "contain", // Preserves original aspect ratio without cropping
              display: "block",
            }}
          />
        </div>

        {/* Right Column: Title, Description, and Info Pills */}
        <div
          style={{
            flex: "1.2 1 500px",
            padding: "clamp(30px, 4.5vw, 60px) clamp(30px, 4.5vw, 60px) 20px clamp(30px, 4.5vw, 60px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
              fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
              fontWeight: 900,
              color: "#d946ef", // Vibrant magenta/purple matching reference photo
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "28px",
              textShadow: "0 0 20px rgba(217, 70, 239, 0.3)",
            }}
          >
            ABOUT
          </h2>

          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.1rem, 1.3vw, 1.25rem)",
              color: "#e9d5ff",
              lineHeight: 1.6,
              fontWeight: 600,
              letterSpacing: "0.02em",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            <p style={{ margin: 0 }}>
              CydroPreneur is an immersive, hands-on workshop designed to
              introduce you to learn Android development and its fundamentals
              and help you to build intelligent mobile applications from the
              ground up. Whether you're a beginner or an aspiring developer or
              eager to explore app creation, this workshop will equip you with
              practical skills to transform your ideas into real-world solutions.
            </p>
            <p style={{ margin: 0 }}>
              More than just a coding session, CydroPreneur is an opportunity
              to learn, collaborate, network and connect with like-minded
              innovators while gaining valuable insights into technology,
              entrepreneurship and product development.
            </p>
          </div>

          {/* Event Detail Pills */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Location Pill Row */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: "rgba(147, 51, 234, 0.35)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  boxShadow: "0 4px 20px rgba(147, 51, 234, 0.15)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                }}
              >
                <MapPin size={15} style={{ color: "#d8b4fe" }} />
                <span>IEM NEW TOWN, UEM KOLKATA</span>
              </div>
            </div>

            {/* Time & Date Pills Row */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                justifyContent: "flex-end",
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: "rgba(147, 51, 234, 0.35)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  boxShadow: "0 4px 20px rgba(147, 51, 234, 0.15)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                }}
              >
                <Clock size={15} style={{ color: "#d8b4fe" }} />
                <span>10:00 AM</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: "rgba(147, 51, 234, 0.35)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  boxShadow: "0 4px 20px rgba(147, 51, 234, 0.15)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Ethnocentric', 'Orbitron', sans-serif",
                }}
              >
                <Calendar size={15} style={{ color: "#d8b4fe" }} />
                <span>8th August</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organized-by Badge Container */}
        <div
          style={{
            flex: "1 1 100%",
            display: "flex",
            justifyContent: "flex-end",
            padding: "0 clamp(30px, 4.5vw, 60px) clamp(30px, 4.5vw, 60px) clamp(30px, 4.5vw, 60px)",
            boxSizing: "border-box",
          }}
        >
          {/* Organized-by Badge (Spans 2.5/4th width of the glass card wrapper) */}
          <div
            style={{
              width: "62.5%",
              background: "linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(192, 132, 252, 0.05) 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(192, 132, 252, 0.2)",
              borderRadius: "20px",
              padding: "20px 24px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              color: "#ffffff",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)",
              fontWeight: 600,
              lineHeight: 1.5,
              letterSpacing: "0.03em",
              boxSizing: "border-box",
            }}
          >
            Organized by: Google Student Club (GGSC) UEMK in
            collaboration with the Innovation & Entrepreneurship Development
            Cell and The Dept. of CST, CSIT, CSE (CS) & CSE (NW).
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
