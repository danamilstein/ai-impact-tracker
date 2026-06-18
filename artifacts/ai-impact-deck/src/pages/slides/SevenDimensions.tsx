const mono = "'JetBrains Mono', 'Courier New', monospace";

export default function SevenDimensions() {
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
          <span style={{ color: "#BAE6FD" }}>06 · WELLNESS FRAME</span>
          <span style={{ opacity: 0.6 }}>P.07</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "5vw", fontWeight: 300, margin: "0 0 4vh", letterSpacing: "0.03em" }}>Seven Dimensions of Wellness</h2>

          <div style={{ display: "flex", gap: "1.5vw", marginBottom: "1.5vh" }}>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.6vh 1vw", textAlign: "center" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1vh" }}>01</div>
              <div style={{ fontSize: "3vw", fontWeight: 500 }}>Physical</div>
            </div>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.6vh 1vw", textAlign: "center" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1vh" }}>02</div>
              <div style={{ fontSize: "3vw", fontWeight: 500 }}>Emotional</div>
            </div>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.6vh 1vw", textAlign: "center" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1vh" }}>03</div>
              <div style={{ fontSize: "3vw", fontWeight: 500 }}>Intellectual</div>
            </div>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.6vh 1vw", textAlign: "center" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1vh" }}>04</div>
              <div style={{ fontSize: "3vw", fontWeight: 500 }}>Social</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.5vw" }}>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.6vh 1vw", textAlign: "center" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1vh" }}>05</div>
              <div style={{ fontSize: "3vw", fontWeight: 500 }}>Spiritual</div>
            </div>
            <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)", padding: "2.6vh 1vw", textAlign: "center" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1vh" }}>06</div>
              <div style={{ fontSize: "3vw", fontWeight: 500 }}>Occupational</div>
            </div>
            <div style={{ flex: 2, border: "1px solid rgba(255,255,255,0.55)", background: "rgba(186,230,253,0.1)", padding: "2.6vh 1vw", textAlign: "center" }}>
              <div style={{ fontSize: "2.4vw", fontFamily: mono, color: "#BAE6FD", marginBottom: "1vh" }}>07 · MEASURED HERE</div>
              <div style={{ fontSize: "3vw", fontWeight: 600 }}>Environmental</div>
            </div>
          </div>

          <div style={{ marginTop: "4vh", display: "flex", gap: "2.5vw" }}>
            <div style={{ flex: 1, fontSize: "2.4vw", opacity: 0.75, lineHeight: 1.4 }}>
              <span style={{ fontFamily: mono, color: "#BAE6FD" }}>&gt; </span>Frame from Hettler (1976) and the National Wellness Institute.
            </div>
            <div style={{ flex: 1, fontSize: "2.4vw", opacity: 0.75, lineHeight: 1.4 }}>
              <span style={{ fontFamily: mono, color: "#BAE6FD" }}>&gt; </span>Environmental impact is one dimension among seven — not the whole picture.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: "2.3vw", opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1.5vh" }}>
          <span>FRAMED</span>
          <span>v1.4</span>
        </div>
      </div>
    </div>
  );
}
