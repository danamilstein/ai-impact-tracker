const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function EstimationModel() {
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
          <span style={{ color: "#BAE6FD" }}>03 · ESTIMATION MODEL</span>
          <span style={{ opacity: 0.6 }}>P.04</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5.5vw", fontWeight: 300, margin: "0 0 4vh", letterSpacing: "0.03em" }}>The Estimation Model</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.4vh" }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.2vh 1.8vw" }}>
              <div style={{ fontSize: "2.4vw", textTransform: "uppercase", letterSpacing: "0.12em", color: "#BAE6FD", marginBottom: "1.2vh" }}>Energy</div>
              <div style={{ fontSize: "3vw", fontFamily: mono, fontWeight: 500, lineHeight: 1.3, overflowWrap: "anywhere" }}>energy_Wh = base_energy_per_query × queries × complexity_multiplier</div>
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.2vh 1.8vw" }}>
              <div style={{ fontSize: "2.4vw", textTransform: "uppercase", letterSpacing: "0.12em", color: "#BAE6FD", marginBottom: "1.2vh" }}>Carbon</div>
              <div style={{ fontSize: "3vw", fontFamily: mono, fontWeight: 500, lineHeight: 1.3, overflowWrap: "anywhere" }}>carbon_g = energy_Wh × (grid_gCO2_per_kWh ÷ 1000)</div>
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.2vh 1.8vw" }}>
              <div style={{ fontSize: "2.4vw", textTransform: "uppercase", letterSpacing: "0.12em", color: "#BAE6FD", marginBottom: "1.2vh" }}>Water</div>
              <div style={{ fontSize: "3vw", fontFamily: mono, fontWeight: 500, lineHeight: 1.3, overflowWrap: "anywhere" }}>water_ml = energy_Wh × region_water_use_factor (WUE-based)</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>DERIVED</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
