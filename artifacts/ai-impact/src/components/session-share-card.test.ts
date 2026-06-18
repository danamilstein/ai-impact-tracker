import { describe, it, expect } from "vitest";
import { escapeXml, buildSvg } from "./session-share-card";

describe("escapeXml", () => {
  it("escapes all XML-significant characters", () => {
    expect(escapeXml(`< > & " '`)).toBe("&lt; &gt; &amp; &quot; &apos;");
  });

  it("escapes ampersands before the entities they introduce", () => {
    expect(escapeXml("Tom & Jerry <chat>")).toBe("Tom &amp; Jerry &lt;chat&gt;");
  });

  it("leaves plain text untouched", () => {
    expect(escapeXml("ChatGPT 4o")).toBe("ChatGPT 4o");
  });
});

const baseProps = {
  toolName: "ChatGPT (GPT-4o)",
  co2G: 12,
  waterMl: 500,
  energyWh: 60,
  activityType: "queries",
  durationMinutes: 10,
  complexity: "medium",
};

describe("buildSvg", () => {
  it("produces well-formed SVG text when an equivalence rounds to '< 0.1'", () => {
    // Tiny water volume → formatEquiv returns "< 0.1"; the raw "<" must be escaped
    // or it opens a bogus tag inside the <text> node and breaks rendering/export.
    const svg = buildSvg({ ...baseProps, waterMl: 20 });
    expect(svg).toContain("&lt; 0.1");
    // The unescaped sequence would have looked like "&#x2022; < 0.1 &#xD7;"
    expect(svg).not.toMatch(/•?\s<\s0\.1/);
    expect(svg).not.toContain("> < 0.1");
  });

  it("escapes XML-significant characters in the tool name", () => {
    const svg = buildSvg({ ...baseProps, toolName: "A & B <model>" });
    expect(svg).toContain("A &amp; B &lt;model&gt;");
    expect(svg).not.toContain("A & B <model>");
  });

  it("renders large equivalence values as whole numbers", () => {
    const svg = buildSvg({ ...baseProps, waterMl: 20000 });
    // 20000 / 500 = 40 bottles
    expect(svg).toContain("40 &#xD7; 500 ml bottles");
  });

  it("escapes raw '<' in the metric cards when impact values round to '<0.1'", () => {
    // formatCo2/formatWater/formatEnergy return strings like "<0.1 g" for tiny
    // values. Those land in the metric-card <text> nodes, so the "<" must be
    // escaped or it breaks the SVG exactly as the equivalence path could.
    const svg = buildSvg({ ...baseProps, co2G: 0.01, waterMl: 0.01, energyWh: 0.01 });
    expect(svg).toContain("&lt;0.1");
    // No unescaped "<0.1" should survive anywhere in the document.
    expect(svg).not.toMatch(/<0\.1/);
  });

  it("always emits a single root <svg> element", () => {
    const svg = buildSvg(baseProps);
    expect(svg.trim().startsWith("<svg")).toBe(true);
    expect(svg.trim().endsWith("</svg>")).toBe(true);
  });
});
