const CydropreneurFooter = () => {
  return (
    <footer
      style={{
        width: "100%",
        padding: "40px 24px",
        background: "#000000",
        borderTop: "1px solid rgba(192, 132, 252, 0.15)",
        textAlign: "center",
        color: "#a855f7",
        fontSize: "13px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ fontWeight: 600, color: "#d8b4fe", marginBottom: "8px" }}>
          CYDROPRENEUR © 2026 — Google Student Club (GGSC)
        </p>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          Build AI-powered Android applications with Google AI Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default CydropreneurFooter;
