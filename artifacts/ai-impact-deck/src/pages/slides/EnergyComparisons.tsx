const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function EnergyComparisons() {
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
          <span style={{ color: "#BAE6FD" }}>05 · REFERENCE LOADS</span>
          <span style={{ opacity: 0.6 }}>P.06</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5vw", fontWeight: 300, margin: "0 0 1vh", letterSpacing: "0.03em" }}>Energy in Familiar Terms</h2>
          <div style={{ fontSize: "2.4vw", opacity: 0.6, marginBottom: "4.5vh", fontFamily: mono }}>Watt-hours · bar length scaled to value</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3.2vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}>
              <div style={{ width: "30vw", fontSize: "2.7vw" }}>Minecraft on a gaming PC</div>
              <div style={{ flex: 1, height: "3vh", background: "rgba(186,230,253,0.35)", border: "1px solid rgba(255,255,255,0.5)" }} />
              <div style={{ width: "16vw", textAlign: "right", fontSize: "2.7vw", fontFamily: mono, fontWeight: 700 }}>150 Wh/hr</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}>
              <div style={{ width: "30vw", fontSize: "2.7vw" }}>One phone charge</div>
              <div style={{ flex: 1, height: "3vh", position: "relative" }}>
                <div style={{ width: "13.3%", height: "100%", background: "rgba(186,230,253,0.35)", border: "1px solid rgba(255,255,255,0.5)" }} />
              </div>
              <div style={{ width: "16vw", textAlign: "right", fontSize: "2.7vw", fontFamily: mono, fontWeight: 700 }}>20 Wh</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}>
              <div style={{ width: "30vw", fontSize: "2.7vw" }}>A Zoom class</div>
              <div style={{ flex: 1, height: "3vh", position: "relative" }}>
                <div style={{ width: "8.7%", height: "100%", background: "rgba(186,230,253,0.35)", border: "1px solid rgba(255,255,255,0.5)" }} />
              </div>
              <div style={{ width: "16vw", textAlign: "right", fontSize: "2.7vw", fontFamily: mono, fontWeight: 700 }}>13 Wh/hr</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}>
              <div style={{ width: "30vw", fontSize: "2.7vw" }}>30 min of TikTok</div>
              <div style={{ flex: 1, height: "3vh", position: "relative" }}>
                <div style={{ width: "2%", height: "100%", background: "rgba(186,230,253,0.35)", border: "1px solid rgba(255,255,255,0.5)" }} />
              </div>
              <div style={{ width: "16vw", textAlign: "right", fontSize: "2.7vw", fontFamily: mono, fontWeight: 700 }}>3 Wh</div>
            </div>
          </div>

          <div style={{ marginTop: "4.5vh", fontSize: "2.4vw", opacity: 0.7, fontWeight: 300 }}>Each comparison splits device energy from data-center energy.</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>BENCHMARKED</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
