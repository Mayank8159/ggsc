const SpeakersSection = () => {
  const topRowSpeakers = [
    { name: "Narendra Nath Chatterjee", img: "/img/narendra.png" },
    { name: "Shantanu Mukhopadhyay", img: "/img/shantanu.png" },
    { name: "Suman Mondal", img: "/img/suman front.png" },
  ];

  const bottomRowSpeakers = [
    { name: "Sayantan Samanta", img: "/img/sayantan.png" },
    { name: "Nilanjan Joarder", img: "/img/nilanjan.png" },
  ];

  return (
    <section
      id="speakers"
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "80px 16px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        border: "16px solid #000000",
      }}
    >
      <div
        style={{
          maxWidth: "1360px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h2
            style={{
              fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              textShadow: "0 0 25px rgba(168, 85, 247, 0.4)",
            }}
          >
            SPEAKERS
          </h2>
          <p
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              color: "#c084fc",
              fontSize: "17px",
              maxWidth: "600px",
              margin: "12px auto 0",
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}
          >
            Learn directly from Google Developer Experts and industry ecosystem leaders.
          </p>
        </div>

        {/* Speakers Grid Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "36px",
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* Top Row: 3 Speakers */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "36px",
              width: "100%",
            }}
          >
            {topRowSpeakers.map((speaker, index) => (
              <div
                key={index}
                style={{
                  width: "280px",
                  maxWidth: "100%",
                  borderRadius: "24px",
                  overflow: "hidden",
                  transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease",
                  cursor: "pointer",
                }}
                className="hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
              >
                <img
                  src={speaker.img}
                  alt={speaker.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Bottom Row: 2 Speakers */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "36px",
              width: "100%",
            }}
          >
            {bottomRowSpeakers.map((speaker, index) => (
              <div
                key={index}
                style={{
                  width: "280px",
                  maxWidth: "100%",
                  borderRadius: "24px",
                  overflow: "hidden",
                  transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease",
                  cursor: "pointer",
                }}
                className="hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
              >
                <img
                  src={speaker.img}
                  alt={speaker.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
