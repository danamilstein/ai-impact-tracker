const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function PrivacySources() {
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
          <span style={{ color: "#BAE6FD" }}>08 · INTEGRITY &amp; SOURCES</span>
          <span style={{ opacity: 0.6 }}>P.09</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5vw", fontWeight: 300, margin: "0 0 4vh", letterSpacing: "0.03em" }}>Privacy, Limits &amp; Sources</h2>

          <div style={{ display: "flex", gap: "2.5vw", marginBottom: "4vh" }}>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "3vh 1.8vw" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1.5vh" }}>PRIVACY</div>
              <div style={{ fontSize: "3vw", fontWeight: 400, lineHeight: 1.35, textWrap: "pretty" }}>Wellness reflections and offsets are stored locally only — no account required for that data.</div>
            </div>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "3vh 1.8vw" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1.5vh" }}>LIMITS</div>
              <div style={{ fontSize: "3vw", fontWeight: 400, lineHeight: 1.35, textWrap: "pretty" }}>Estimates are approximations, clearly labeled as low-precision throughout the tool.</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.25)", paddingTop: "2.5vh" }}>
            <div style={{ fontSize: "2.4vw", letterSpacing: "0.1em", color: "#BAE6FD", marginBottom: "1.5vh", fontFamily: mono }}>SOURCES</div>
            <div style={{ fontSize: "2.6vw", fontFamily: mono, opacity: 0.85, lineHeight: 1.45, overflowWrap: "anywhere" }}>
              Hettler 1976 · Li et al. 2023 · EIA · IEA · National Wellness Institute · SAMHSA
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>FINAL</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
