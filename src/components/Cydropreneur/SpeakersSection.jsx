import { FiLinkedin, FiGithub } from "react-icons/fi";

const SpeakersSection = () => {
  const speakers = [
    {
      name: "David Chen",
      role: "Google Developer Expert (AI)",
      company: "Google AI Studio Mentor",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    },
    {
      name: "Lucy Vance",
      role: "Android Systems Architect",
      company: "Android Dev Rel",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    },
    {
      name: "Alex Rivera",
      role: "GGSC Lead Organizer",
      company: "Founder Track Host",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
    },
  ];

  return (
    <section
      id="speakers"
      style={{
        width: "100%",
        minHeight: "80vh",
        padding: "120px 24px",
        background: "#0b0518",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
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
            SPEAKERS & MENTORS
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

        {/* Speakers Grid Placeholder */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {speakers.map((speaker, index) => (
            <div
              key={index}
              style={{
                background: "rgba(22, 12, 44, 0.65)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(192, 132, 252, 0.2)",
                borderRadius: "24px",
                padding: "24px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  margin: "0 auto 20px",
                  border: "2px solid rgba(192, 132, 252, 0.5)",
                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                }}
              >
                <img
                  src={speaker.image}
                  alt={speaker.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginBottom: "4px",
                }}
              >
                {speaker.name}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#c084fc",
                  marginBottom: "4px",
                }}
              >
                {speaker.role}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#d8b4fe",
                  marginBottom: "16px",
                }}
              >
                {speaker.company}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <a
                  href="#"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(192, 132, 252, 0.3)",
                    display: "grid",
                    placeItems: "center",
                    color: "#e9d5ff",
                  }}
                >
                  <FiLinkedin size={14} />
                </a>
                <a
                  href="#"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(192, 132, 252, 0.3)",
                    display: "grid",
                    placeItems: "center",
                    color: "#e9d5ff",
                  }}
                >
                  <FiGithub size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
