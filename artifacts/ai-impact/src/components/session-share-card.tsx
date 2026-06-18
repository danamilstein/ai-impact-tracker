import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCo2, formatWater, formatEnergy, formatEquiv } from "@/lib/utils";
import { Download, Copy, Check } from "lucide-react";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface SessionShareCardProps {
  toolName: string;
  co2G: number;
  waterMl: number;
  energyWh: number;
  activityType: string;
  durationMinutes: number;
  complexity: string;
}

const ACTIVITY_VERB: Record<string, string> = {
  queries: "asking questions",
  research: "researching",
  composing: "composing",
  visualizing: "generating visuals",
  programming: "programming",
};

export function buildSvg(props: SessionShareCardProps): string {
  const { toolName, co2G, waterMl, energyWh, activityType, durationMinutes, complexity } = props;
  const co2Label = escapeXml(formatCo2(co2G));
  const waterLabel = escapeXml(formatWater(waterMl));
  const energyLabel = escapeXml(formatEnergy(energyWh));
  const complexityLabel = escapeXml(complexity.charAt(0).toUpperCase() + complexity.slice(1));
  const activityLabel = escapeXml(ACTIVITY_VERB[activityType] ?? activityType);
  const date = escapeXml(
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  );

  const escapedToolName = escapeXml(toolName);
  const kmLabel = escapeXml(formatEquiv(co2G / 120));
  const bottlesLabel = escapeXml(formatEquiv(waterMl / 500));
  const chargesLabel = escapeXml(formatEquiv(energyWh / 12));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1080" y2="1080" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a1a0a"/>
      <stop offset="100%" stop-color="#162416"/>
    </linearGradient>
    <linearGradient id="cardGreen" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#22c55e" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="cardSlate" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#64748b" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#64748b" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="cardAmber" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.06"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#bg)"/>

  <!-- Grid lines -->
  <g stroke="#22c55e" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="180" x2="1080" y2="180"/>
    <line x1="0" y1="360" x2="1080" y2="360"/>
    <line x1="0" y1="540" x2="1080" y2="540"/>
    <line x1="0" y1="720" x2="1080" y2="720"/>
    <line x1="0" y1="900" x2="1080" y2="900"/>
    <line x1="180" y1="0" x2="180" y2="1080"/>
    <line x1="360" y1="0" x2="360" y2="1080"/>
    <line x1="540" y1="0" x2="540" y2="1080"/>
    <line x1="720" y1="0" x2="720" y2="1080"/>
    <line x1="900" y1="0" x2="900" y2="1080"/>
  </g>

  <!-- Glow orbs -->
  <circle cx="960" cy="120" r="200" fill="#22c55e" fill-opacity="0.06"/>
  <circle cx="120" cy="960" r="160" fill="#f59e0b" fill-opacity="0.05"/>

  <!-- Top bar -->
  <rect x="0" y="0" width="1080" height="6" fill="#22c55e" fill-opacity="0.5"/>

  <!-- Logo mark -->
  <rect x="60" y="60" width="56" height="56" rx="14" fill="#22c55e" fill-opacity="0.15" stroke="#22c55e" stroke-opacity="0.3" stroke-width="1"/>
  <path d="M88 106 C88 106 74 96 74 84 C74 77 81 72 88 72 C95 72 102 77 102 84 C102 96 88 106 88 106Z" fill="#22c55e" fill-opacity="0.85"/>
  <line x1="88" y1="106" x2="88" y2="86" stroke="#0a1a0a" stroke-width="2" stroke-linecap="round"/>

  <!-- Branding -->
  <text x="130" y="85" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="600" fill="#4ade80" letter-spacing="0.3">AI Impact</text>
  <text x="130" y="107" font-family="system-ui,-apple-system,sans-serif" font-size="12" fill="#4ade80" fill-opacity="0.5" letter-spacing="2">TRACKER</text>

  <!-- Date -->
  <text x="1020" y="90" font-family="system-ui,-apple-system,sans-serif" font-size="14" fill="#86efac" fill-opacity="0.4" text-anchor="end">${date}</text>

  <!-- Divider -->
  <line x1="60" y1="148" x2="1020" y2="148" stroke="#22c55e" stroke-opacity="0.12" stroke-width="1"/>

  <!-- Tool name & session info -->
  <text x="60" y="230" font-family="system-ui,-apple-system,sans-serif" font-size="14" fill="#86efac" fill-opacity="0.5" letter-spacing="2">SESSION IMPACT</text>
  <text x="60" y="310" font-family="system-ui,-apple-system,sans-serif" font-size="66" font-weight="700" fill="#f0fdf4" letter-spacing="-1">${escapedToolName}</text>
  <text x="60" y="360" font-family="system-ui,-apple-system,sans-serif" font-size="22" fill="#86efac" fill-opacity="0.6">${durationMinutes} min ${activityLabel} &#x2022; ${complexityLabel} complexity</text>

  <!-- Divider 2 -->
  <line x1="60" y1="400" x2="400" y2="400" stroke="#22c55e" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Metric cards -->
  <!-- CO2 card -->
  <rect x="60" y="432" width="300" height="160" rx="20" fill="url(#cardSlate)" stroke="#64748b" stroke-opacity="0.2" stroke-width="1"/>
  <text x="88" y="476" font-family="system-ui,-apple-system,sans-serif" font-size="12" fill="#94a3b8" fill-opacity="0.8" letter-spacing="1.5">CARBON EMITTED</text>
  <text x="88" y="550" font-family="system-ui,-apple-system,monospace" font-size="50" font-weight="700" fill="#cbd5e1">${co2Label}</text>
  <text x="88" y="578" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="#94a3b8" fill-opacity="0.5">CO&#x2082;</text>

  <!-- Water card -->
  <rect x="390" y="432" width="300" height="160" rx="20" fill="url(#cardGreen)" stroke="#22c55e" stroke-opacity="0.2" stroke-width="1"/>
  <text x="418" y="476" font-family="system-ui,-apple-system,sans-serif" font-size="12" fill="#86efac" fill-opacity="0.7" letter-spacing="1.5">WATER USED</text>
  <text x="418" y="550" font-family="system-ui,-apple-system,monospace" font-size="50" font-weight="700" fill="#4ade80">${waterLabel}</text>
  <text x="418" y="578" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="#86efac" fill-opacity="0.5">for cooling</text>

  <!-- Energy card -->
  <rect x="720" y="432" width="300" height="160" rx="20" fill="url(#cardAmber)" stroke="#f59e0b" stroke-opacity="0.2" stroke-width="1"/>
  <text x="748" y="476" font-family="system-ui,-apple-system,sans-serif" font-size="12" fill="#fcd34d" fill-opacity="0.8" letter-spacing="1.5">ENERGY CONSUMED</text>
  <text x="748" y="550" font-family="system-ui,-apple-system,monospace" font-size="50" font-weight="700" fill="#fde68a">${energyLabel}</text>
  <text x="748" y="578" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="#fcd34d" fill-opacity="0.5">electricity</text>

  <!-- Equivalency callout -->
  <rect x="60" y="632" width="960" height="80" rx="16" fill="#22c55e" fill-opacity="0.06" stroke="#22c55e" stroke-opacity="0.1" stroke-width="1"/>
  <text x="540" y="665" font-family="system-ui,-apple-system,sans-serif" font-size="15" fill="#86efac" fill-opacity="0.5" text-anchor="middle" letter-spacing="1">EQUIVALENT TO</text>
  <text x="540" y="696" font-family="system-ui,-apple-system,sans-serif" font-size="20" font-weight="500" fill="#d1fae5" text-anchor="middle">driving ${kmLabel} km &#x2022; ${bottlesLabel} &#xD7; 500 ml bottles &#x2022; ${chargesLabel} phone charges</text>

  <!-- Call to action / tagline -->
  <text x="540" y="800" font-family="system-ui,-apple-system,sans-serif" font-size="28" font-weight="600" fill="#f0fdf4" fill-opacity="0.85" text-anchor="middle">Every query has a footprint.</text>
  <text x="540" y="844" font-family="system-ui,-apple-system,sans-serif" font-size="22" fill="#86efac" fill-opacity="0.5" text-anchor="middle">Track yours with AI Impact Tracker.</text>

  <!-- Decorative leaf pattern -->
  <g opacity="0.08" transform="translate(880, 820)">
    <path d="M60 0 C60 0 0 40 0 90 C0 130 30 155 60 155 C90 155 120 130 120 90 C120 40 60 0 60 0Z" fill="#22c55e"/>
    <line x1="60" y1="155" x2="60" y2="60" stroke="#0a1a0a" stroke-width="4" stroke-linecap="round"/>
    <line x1="60" y1="100" x2="35" y2="80" stroke="#0a1a0a" stroke-width="3" stroke-linecap="round"/>
    <line x1="60" y1="120" x2="85" y2="100" stroke="#0a1a0a" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="1074" width="1080" height="6" fill="#22c55e" fill-opacity="0.4"/>
</svg>`;
}

async function svgToPngBlob(svgString: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error("Canvas toBlob failed"));
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function SessionShareCard(props: SessionShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleDownload = () => {
    const svg = buildSvg(props);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-impact-${props.toolName.replace(/\s+/g, "-").toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const svg = buildSvg(props);
      const pngBlob = await svgToPngBlob(svg);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: download instead
      handleDownload();
    } finally {
      setCopying(false);
    }
  };

  const svgPreview = buildSvg(props);
  const previewUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgPreview)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Share your impact</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={copying} className="gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5 text-chart-1" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : copying ? "Copying..." : "Copy Image"}
          </Button>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-border shadow-sm">
        <img
          src={previewUrl}
          alt="Session impact share card"
          className="w-full h-auto block"
          style={{ aspectRatio: "1 / 1" }}
        />
      </div>
    </div>
  );
}
