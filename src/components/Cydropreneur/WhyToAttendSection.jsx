import { FiAward, FiSmartphone, FiCpu, FiTrendingUp } from "react-icons/fi";

const WhyToAttendSection = () => {
  const perks = [
    {
      icon: <FiCpu size={22} color="#f0abfc" />,
      title: "Hands-on AI Integration",
      desc: "Learn live prompt tuning and API integration with Google AI Studio.",
    },
    {
      icon: <FiSmartphone size={22} color="#c084fc" />,
      title: "Android Native Mastery",
      desc: "Build modern UI components using Jetpack Compose & Kotlin.",
    },
    {
      icon: <FiAward size={22} color="#e9d5ff" />,
      title: "Official Swag & Certificates",
      desc: "Earn Google Developer badges, certificates, and exclusive event merchandise.",
    },
    {
      icon: <FiTrendingUp size={22} color="#a855f7" />,
      title: "Venture Pitching",
      desc: "Pitch your AI application to industry mentors and tech founders.",
    },
  ];

  return (
    <section
      id="why-to-attend"
      style={{
        width: "100%",
        minHeight: "80vh",
        padding: "120px 24px",
        background: "#07030e",
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
            WHY TO ATTEND
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
            Accelerate your developer journey with skills that matter in the AI-first era.
          </p>
        </div>

        {/* Perks Grid Placeholder */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {perks.map((perk, index) => (
            <div
              key={index}
              style={{
                background: "rgba(18, 10, 36, 0.7)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(192, 132, 252, 0.2)",
                borderRadius: "20px",
                padding: "30px 24px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: "rgba(168, 85, 247, 0.15)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "18px",
                  border: "1px solid rgba(192, 132, 252, 0.25)",
                }}
              >
                {perk.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginBottom: "10px",
                }}
              >
                {perk.title}
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "#d8b4fe",
                  lineHeight: 1.6,
                }}
              >
                {perk.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyToAttendSection;
