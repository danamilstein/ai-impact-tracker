const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function ProductOverview() {
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
          <span style={{ color: "#BAE6FD" }}>02 · SYSTEM LAYOUT</span>
          <span style={{ opacity: 0.6 }}>P.03</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5.5vw", fontWeight: 300, margin: "0 0 2.5vh", letterSpacing: "0.03em" }}>Product Overview</h2>
          <div style={{ fontFamily: mono, fontSize: "2.6vw", color: "#BAE6FD", marginBottom: "3vh" }}>ROOT · AI Impact Tracker</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.6vh" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "1.8vh 1.6vw" }}>
              <div style={{ fontSize: "3vw", fontWeight: 600, width: "38vw" }}>Tool Catalog</div>
              <div style={{ fontSize: "2.6vw", opacity: 0.75, lineHeight: 1.3, flex: 1 }}>Per-tool, per-query impact estimates</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "1.8vh 1.6vw" }}>
              <div style={{ fontSize: "3vw", fontWeight: 600, width: "38vw" }}>My Practice <span style={{ fontFamily: mono, fontSize: "2.3vw", color: "#BAE6FD", fontWeight: 400 }}>/practice</span></div>
              <div style={{ fontSize: "2.6vw", opacity: 0.75, lineHeight: 1.3, flex: 1 }}>A weekly view of your own usage</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "1.8vh 1.6vw" }}>
              <div style={{ fontSize: "3vw", fontWeight: 600, width: "38vw" }}>Practice Receipt <span style={{ fontFamily: mono, fontSize: "2.3vw", color: "#BAE6FD", fontWeight: 400 }}>/receipt</span></div>
              <div style={{ fontSize: "2.6vw", opacity: 0.75, lineHeight: 1.3, flex: 1 }}>A shareable weekly summary</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "1.8vh 1.6vw" }}>
              <div style={{ fontSize: "3vw", fontWeight: 600, width: "38vw" }}>Methodology · Privacy</div>
              <div style={{ fontSize: "2.6vw", opacity: 0.75, lineHeight: 1.3, flex: 1 }}>Responsible-use pages keep it transparent</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>SHIPPED</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
