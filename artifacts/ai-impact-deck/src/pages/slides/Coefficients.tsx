const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function Coefficients() {
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
          <span style={{ color: "#BAE6FD" }}>04 · COEFFICIENTS</span>
          <span style={{ opacity: 0.6 }}>P.05</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5vw", fontWeight: 300, margin: "0 0 3.5vh", letterSpacing: "0.03em" }}>Coefficients &amp; Data Sources</h2>

          <div style={{ display: "flex", gap: "3vw" }}>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.5vh 1.8vw" }}>
              <div style={{ fontSize: "2.4vw", letterSpacing: "0.1em", color: "#BAE6FD", marginBottom: "2.5vh", fontFamily: mono }}>COMPLEXITY ×</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2vh" }}>
                <span style={{ fontSize: "3vw" }}>Low</span>
                <span style={{ fontSize: "3vw", fontWeight: 700, fontFamily: mono }}>0.5×</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2vh" }}>
                <span style={{ fontSize: "3vw" }}>Medium</span>
                <span style={{ fontSize: "3vw", fontWeight: 700, fontFamily: mono }}>1×</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "3vw" }}>High</span>
                <span style={{ fontSize: "3vw", fontWeight: 700, fontFamily: mono }}>2×</span>
              </div>
            </div>

            <div style={{ flex: 1.25, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.5vh 1.8vw" }}>
              <div style={{ fontSize: "2.4vw", letterSpacing: "0.1em", color: "#BAE6FD", marginBottom: "2.5vh", fontFamily: mono }}>GRID · gCO₂/kWh</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.4vh" }}>
                <span style={{ fontSize: "2.7vw" }}>Global</span>
                <span style={{ fontSize: "2.7vw", fontWeight: 700, fontFamily: mono }}>475</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.4vh" }}>
                <span style={{ fontSize: "2.7vw" }}>United States</span>
                <span style={{ fontSize: "2.7vw", fontWeight: 700, fontFamily: mono }}>380</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.4vh" }}>
                <span style={{ fontSize: "2.7vw" }}>European Union</span>
                <span style={{ fontSize: "2.7vw", fontWeight: 700, fontFamily: mono }}>250</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.4vh" }}>
                <span style={{ fontSize: "2.7vw" }}>Coal</span>
                <span style={{ fontSize: "2.7vw", fontWeight: 700, fontFamily: mono }}>820</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "2.7vw" }}>Renewable</span>
                <span style={{ fontSize: "2.7vw", fontWeight: 700, fontFamily: mono }}>20</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "3vh", display: "flex", gap: "2.5vw" }}>
            <div style={{ flex: 1, fontSize: "2.4vw", opacity: 0.75, lineHeight: 1.4 }}>
              <span style={{ fontFamily: mono, color: "#BAE6FD" }}>&gt; </span>US grids pull live intensity from EIA data.
            </div>
            <div style={{ flex: 1, fontSize: "2.4vw", opacity: 0.75, lineHeight: 1.4 }}>
              <span style={{ fontFamily: mono, color: "#BAE6FD" }}>&gt; </span>Water factor from Li et al. 2023 (arXiv:2304.03271).
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>CALIBRATED</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
