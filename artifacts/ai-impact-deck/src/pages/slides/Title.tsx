const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function Title() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        background: "#1B3A5C",
        fontFamily: "'Inter', sans-serif",
        color: "#FFFFFF",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "5vw 5vh" }} />
      <div style={{ position: "absolute", top: "3.5vh", left: "3.5vw", right: "3.5vw", bottom: "3.5vh", border: "1px solid rgba(255,255,255,0.25)" }} />

      <div style={{ position: "relative", padding: "6vh 6vw", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: mono, fontSize: "2.3vw", letterSpacing: "0.08em" }}>
          <span style={{ color: "#BAE6FD" }}>AI-IMPACT-TRACKER</span>
          <span style={{ opacity: 0.6 }}>2026-06-17</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: mono, fontSize: "2.4vw", letterSpacing: "0.2em", color: "#BAE6FD", marginBottom: "2vh" }}>PROJECT TITLE</div>
          <h1 style={{ fontSize: "8vw", fontWeight: 300, lineHeight: 0.92, margin: 0, letterSpacing: "0.03em" }}>AI IMPACT</h1>
          <h1 style={{ fontSize: "8vw", fontWeight: 300, lineHeight: 0.92, margin: 0, letterSpacing: "0.03em" }}>TRACKER</h1>
          <div style={{ width: "14vw", height: "2px", background: "rgba(255,255,255,0.4)", margin: "3vh 0" }} />
          <p style={{ fontSize: "3vw", opacity: 0.8, margin: 0, maxWidth: "74vw", lineHeight: 1.4, fontWeight: 300, textWrap: "pretty" }}>
            Estimate the water, energy, and carbon footprint of everyday AI use — framed across the Seven Dimensions of Wellness.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>FOOTPRINT ESTIMATION ENGINE</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
