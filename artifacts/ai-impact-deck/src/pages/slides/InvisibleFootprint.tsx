const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function InvisibleFootprint() {
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
          <span style={{ color: "#BAE6FD" }}>01 · PROBLEM STATEMENT</span>
          <span style={{ opacity: 0.6 }}>P.02</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5.5vw", fontWeight: 300, margin: "0 0 5vh", letterSpacing: "0.03em", textWrap: "balance" }}>The Invisible Footprint</h2>

          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.03)", padding: "3vh 1.6vw" }}>
              <div style={{ fontSize: "2.6vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1.5vh" }}>01</div>
              <div style={{ fontSize: "3vw", fontWeight: 400, lineHeight: 1.35, textWrap: "pretty" }}>Every AI query draws real energy and water — but the cost is hidden.</div>
            </div>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.03)", padding: "3vh 1.6vw" }}>
              <div style={{ fontSize: "2.6vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1.5vh" }}>02</div>
              <div style={{ fontSize: "3vw", fontWeight: 400, lineHeight: 1.35, textWrap: "pretty" }}>People have no intuitive sense of what a single chatbot session costs.</div>
            </div>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.55)", background: "rgba(186,230,253,0.1)", padding: "3vh 1.6vw" }}>
              <div style={{ fontSize: "2.6vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1.5vh" }}>03</div>
              <div style={{ fontSize: "3vw", fontWeight: 400, lineHeight: 1.35, textWrap: "pretty" }}>The tracker makes that footprint visible, comparable, and personal.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>OBSERVED</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
