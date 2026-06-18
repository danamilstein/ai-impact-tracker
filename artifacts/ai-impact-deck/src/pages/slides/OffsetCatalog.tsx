const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function OffsetCatalog() {
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
          <span style={{ color: "#BAE6FD" }}>07 · OFFSET CATALOG</span>
          <span style={{ opacity: 0.6 }}>P.08</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5vw", fontWeight: 300, margin: "0 0 3vh", letterSpacing: "0.03em" }}>The Offset Catalog</h2>

          <div style={{ border: "1px solid rgba(255,255,255,0.5)", background: "rgba(186,230,253,0.08)", padding: "2.5vh 1.8vw", marginBottom: "3.5vh" }}>
            <div style={{ fontSize: "3vw", fontWeight: 300, lineHeight: 1.35, fontStyle: "italic", textWrap: "pretty" }}>
              "These offsets aren't simple binary choices — weather, safety, access, and ability all matter."
            </div>
          </div>

          <div style={{ display: "flex", gap: "2.5vw", alignItems: "flex-start" }}>
            <div style={{ flex: 1.5 }}>
              <div style={{ fontSize: "2.4vw", letterSpacing: "0.08em", color: "#BAE6FD", marginBottom: "2vh", fontFamily: mono }}>11 actions, dimension-tagged</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.4vh 1vw" }}>
                <div style={{ border: "1px solid rgba(255,255,255,0.3)", padding: "0.8vh 1vw", fontSize: "2.6vw" }}>Bike or walk</div>
                <div style={{ border: "1px solid rgba(255,255,255,0.3)", padding: "0.8vh 1vw", fontSize: "2.6vw" }}>Take transit</div>
                <div style={{ border: "1px solid rgba(255,255,255,0.3)", padding: "0.8vh 1vw", fontSize: "2.6vw" }}>Oat milk</div>
                <div style={{ border: "1px solid rgba(255,255,255,0.3)", padding: "0.8vh 1vw", fontSize: "2.6vw" }}>Plant-based lunch</div>
                <div style={{ border: "1px solid rgba(255,255,255,0.3)", padding: "0.8vh 1vw", fontSize: "2.6vw", opacity: 0.6 }}>+ 7 more</div>
              </div>
            </div>
            <div style={{ width: "1px", alignSelf: "stretch", background: "rgba(255,255,255,0.2)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "2.4vw", letterSpacing: "0.08em", color: "#BAE6FD", marginBottom: "2vh", fontFamily: mono }}>Framing</div>
              <div style={{ fontSize: "2.6vw", lineHeight: 1.35, fontWeight: 300 }}>Each action is tagged to the wellness dimensions it touches — context, not absolution.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>CONTEXTUAL</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
