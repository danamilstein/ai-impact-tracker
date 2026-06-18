/**
 * Student-relevant energy comparison catalog (v1.4 §2).
 *
 * Each item is a real activity students do online in 2026, with its approximate
 * energy cost. Where a service has both a device-side draw (your phone/laptop/
 * console) and a data-center share (server compute + content delivery), both are
 * listed and `totalWh` is their sum. Figures are approximations drawn from
 * published service-energy studies (Cisco data-center reports, IEA digital-energy
 * 2023, and individual platform sustainability disclosures) plus device
 * efficiency benchmarks — they are order-of-magnitude anchors, not measurements.
 */
export interface EnergyComparison {
  id: string;
  /** Noun phrase completing "≈ N <unit>", e.g. "hours of Minecraft on PC". */
  unit: string;
  /** Total energy for one unit, in watt-hours. */
  totalWh: number;
  /** Device-side draw, if the service has a meaningful split. */
  deviceWh?: number;
  /** Data-center / server-side share, if applicable. */
  dataCenterWh?: number;
  source: string;
}

export const ENERGY_COMPARISONS: EnergyComparison[] = [
  { id: "minecraft-pc", unit: "hours of Minecraft on a PC", totalWh: 150, source: "Mojang/Microsoft sustainability brief + PC efficiency benchmarks" },
  { id: "minecraft-switch", unit: "hours of Minecraft on a Switch / handheld", totalWh: 7, source: "Nintendo eco-design page" },
  { id: "fortnite-pc", unit: "hours of Fortnite / Valorant / League on a gaming PC", totalWh: 300, source: "Gaming-PC power-draw benchmarks" },
  { id: "steam-laptop", unit: "hours of a Steam game on a gaming laptop", totalWh: 80, source: "Gaming-laptop power-draw benchmarks" },
  { id: "instagram-doomscroll", unit: "10-minute Instagram doomscrolls", totalWh: 0.9, deviceWh: 0.4, dataCenterWh: 0.5, source: "IEA digital-energy 2023; recommender + CDN delivery estimates" },
  { id: "tiktok", unit: "30-minute TikTok sessions", totalWh: 3, deviceWh: 1.5, dataCenterWh: 1.5, source: "IEA digital-energy 2023; video streaming + recommender estimates" },
  { id: "discord-voice", unit: "hours of Discord voice chat (no video)", totalWh: 6, deviceWh: 5, dataCenterWh: 1, source: "Platform disclosures + VoIP energy estimates" },
  { id: "discord-video", unit: "hours of Discord with screen-share or video", totalWh: 18, deviceWh: 15, dataCenterWh: 3, source: "Platform disclosures + video-conferencing energy estimates" },
  { id: "zoom-class", unit: "30-minute Zoom classes on a laptop", totalWh: 13, deviceWh: 10, dataCenterWh: 3, source: "Video-conferencing energy estimates" },
  { id: "youtube-phone", unit: "hours of YouTube on a phone over Wi-Fi", totalWh: 6, deviceWh: 5, dataCenterWh: 1, source: "IEA digital-energy 2023; streaming estimates" },
  { id: "youtube-short", unit: "5-minute YouTube videos on a phone", totalWh: 0.5, source: "IEA digital-energy 2023; streaming estimates" },
  { id: "music-stream", unit: "30-minute music-streaming sessions (Spotify, Apple Music)", totalWh: 0.5, deviceWh: 0.5, source: "Audio-streaming energy estimates" },
  { id: "pinterest", unit: "15-minute Pinterest browses", totalWh: 1, deviceWh: 0.5, dataCenterWh: 0.5, source: "IEA digital-energy 2023; image-feed delivery estimates" },
  { id: "lecture-tablet", unit: "hours of online lecture viewing on a tablet", totalWh: 11, deviceWh: 10, dataCenterWh: 1, source: "Streaming + tablet draw estimates" },
  { id: "laptop-work", unit: "hours of normal laptop work (Word, browser, email)", totalWh: 20, source: "Laptop power-draw benchmarks" },
  { id: "phone-charge", unit: "full phone charges", totalWh: 20, source: "Typical smartphone battery capacity" },
];

export interface ResolvedComparison extends EnergyComparison {
  /** How many of this unit the given energy equals. */
  count: number;
}

/**
 * Resolve a watt-hour figure into a handful of legible student comparisons.
 * Prefers items whose resulting count lands in a readable range (~0.2–500),
 * always returns at least the phone-charge anchor.
 */
export function resolveComparisons(energyWh: number, limit = 5): ResolvedComparison[] {
  if (!Number.isFinite(energyWh) || energyWh <= 0) return [];
  const resolved = ENERGY_COMPARISONS.map((c) => ({ ...c, count: energyWh / c.totalWh }));
  const legible = resolved
    .filter((c) => c.count >= 0.2 && c.count <= 500)
    .sort((a, b) => Math.abs(Math.log(a.count)) - Math.abs(Math.log(b.count)));
  const picked = legible.slice(0, limit);
  if (!picked.some((c) => c.id === "phone-charge")) {
    const charge = resolved.find((c) => c.id === "phone-charge");
    if (charge) picked.push(charge);
  }
  return picked;
}
