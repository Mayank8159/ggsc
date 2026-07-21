import { useState } from "react";
import { FiSend, FiCheckCircle } from "react-icons/fi";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", track: "Android AI" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact-us"
      style={{
        width: "100%",
        minHeight: "85vh",
        padding: "120px 24px",
        backgroundImage: "url('/img/section%20image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dark gradient overlay for text readability and glassmorphism highlight */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(7, 3, 14, 0.75) 0%, rgba(7, 3, 14, 0.85) 50%, rgba(7, 3, 14, 0.95) 100%)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          maxWidth: "850px",
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
            CONTACT & REGISTER
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
            Secure your seat for the Cydropreneur AI Workshop. Limited seats available.
          </p>
        </div>

        {/* Form Placeholder Card */}
        <div
          style={{
            background: "rgba(18, 10, 36, 0.8)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(192, 132, 252, 0.3)",
            borderRadius: "28px",
            padding: "44px 36px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <FiCheckCircle size={56} color="#c084fc" style={{ margin: "0 auto 20px" }} />
              <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginBottom: "12px" }}>
                Registration Received!
              </h3>
              <p style={{ color: "#d8b4fe", fontSize: "15px", maxWidth: "450px", margin: "0 auto" }}>
                We've reserved your spot. Check your inbox for confirmation details and workshop prerequisites.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#d8b4fe", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    background: "rgba(7, 3, 14, 0.7)",
                    border: "1px solid rgba(192, 132, 252, 0.25)",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#d8b4fe", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    background: "rgba(7, 3, 14, 0.7)",
                    border: "1px solid rgba(192, 132, 252, 0.25)",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#d8b4fe", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Interest Track
                </label>
                <select
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    background: "rgba(7, 3, 14, 0.7)",
                    border: "1px solid rgba(192, 132, 252, 0.25)",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="Android AI">Android + Google AI Studio Track</option>
                  <option value="Prompt Engineering">Prompt Engineering & Gemini API</option>
                  <option value="Venture Pitch">Venture Pitch & Demo Day</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
                  marginTop: "12px",
                  padding: "16px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #9333ea 0%, #c084fc 100%)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)",
                }}
              >
                SUBMIT REGISTRATION <FiSend size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
