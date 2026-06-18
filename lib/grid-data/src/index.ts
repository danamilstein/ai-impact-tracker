export type GridRegion = {
  id: string;
  label: string;
  region: string;
  /** Static fallback carbon intensity in gCO2/kWh. */
  intensityGPerKwh: number;
};

export const GRID_REGIONS: GridRegion[] = [
  { id: "US_AVERAGE", label: "US Average", region: "United States", intensityGPerKwh: 386 },
  { id: "CAISO", label: "California (CAISO)", region: "United States", intensityGPerKwh: 175 },
  { id: "ERCOT", label: "Texas (ERCOT)", region: "United States", intensityGPerKwh: 370 },
  { id: "PJM", label: "Mid-Atlantic & Midwest (PJM)", region: "United States", intensityGPerKwh: 440 },
  { id: "NYISO", label: "New York (NYISO)", region: "United States", intensityGPerKwh: 220 },
  { id: "ISO_NE", label: "New England (ISO-NE)", region: "United States", intensityGPerKwh: 240 },
  { id: "MISO", label: "Midwest (MISO)", region: "United States", intensityGPerKwh: 470 },
  { id: "SPP", label: "Great Plains (SPP)", region: "United States", intensityGPerKwh: 450 },
  { id: "SERC", label: "Southeast (SERC)", region: "United States", intensityGPerKwh: 440 },
  { id: "BPA", label: "Pacific Northwest (BPA)", region: "United States", intensityGPerKwh: 75 },
  { id: "EU_AVERAGE", label: "European Union (average)", region: "Europe", intensityGPerKwh: 250 },
  { id: "UK", label: "United Kingdom", region: "Europe", intensityGPerKwh: 185 },
  { id: "CANADA", label: "Canada (average)", region: "North America", intensityGPerKwh: 130 },
  { id: "AUSTRALIA", label: "Australia (average)", region: "Oceania", intensityGPerKwh: 490 },
];

export const BASE_INTENSITY_G_PER_KWH = 475;

export function getGrid(gridId: string): GridRegion {
  return GRID_REGIONS.find((g) => g.id === gridId) ?? GRID_REGIONS[0];
}

/**
 * Carbon multiplier applied to per-query CO2 coefficients. When an explicit
 * intensity is provided (e.g. live EIA data) it is used; otherwise the region's
 * static fallback intensity is used.
 */
export function carbonMultiplier(gridId: string, intensityGPerKwh?: number): number {
  const intensity =
    intensityGPerKwh !== undefined && Number.isFinite(intensityGPerKwh)
      ? intensityGPerKwh
      : getGrid(gridId).intensityGPerKwh;
  return intensity / BASE_INTENSITY_G_PER_KWH;
}

/**
 * Current flat water-usage baseline coefficient. Stored per-query water in the
 * catalog is computed at this rate (energy_Wh × 1.8). Note 1 L/kWh == 1 ml/Wh
 * exactly, so the WUE figures below (L/kWh) are directly comparable.
 */
export const BASE_WUE_L_PER_KWH = 1.8;

export type RegionWue = {
  /** Cloud data-center region this WUE is attributed to. */
  dataCenter: string;
  /** On-site cooling water, liters per kWh. */
  onSiteLPerKwh: number;
  /** Upstream (electricity-generation) water, liters per kWh. */
  upstreamLPerKwh: number;
  /** Total water-usage effectiveness, liters per kWh (== ml/Wh). */
  totalLPerKwh: number;
  source: string;
};

const WUE_PLACEHOLDER_SOURCE = "PLACEHOLDER — replace with Table 1 values pre-deploy";

/**
 * Location-dependent water-usage effectiveness (WUE) by grid region. Water is
 * attributed to the data-center region powering each query — the same location
 * attribution used for carbon intensity (v1.1). Grid regions are mapped to the
 * cloud data-center region that physically serves them.
 *
 * PLACEHOLDER values — replace with Table 1 (Li, Yang, Islam, & Ren 2023)
 * figures before deploy.
 */
export const REGION_WUE: Record<string, RegionWue> = {
  PJM: {
    dataCenter: "East US (Virginia)",
    onSiteLPerKwh: 0.55,
    upstreamLPerKwh: 1.25,
    totalLPerKwh: 1.8,
    source: WUE_PLACEHOLDER_SOURCE,
  },
  BPA: {
    dataCenter: "West US 2 (Washington)",
    onSiteLPerKwh: 0.1,
    upstreamLPerKwh: 1.25,
    totalLPerKwh: 1.35,
    source: WUE_PLACEHOLDER_SOURCE,
  },
  ERCOT: {
    dataCenter: "South Central US (Texas)",
    onSiteLPerKwh: 0.85,
    upstreamLPerKwh: 1.25,
    totalLPerKwh: 2.1,
    source: WUE_PLACEHOLDER_SOURCE,
  },
};

/** Fallback WUE for regions without a region-specific data-center disclosure. */
export const FALLBACK_WUE: RegionWue = {
  dataCenter: "Fallback (global average)",
  onSiteLPerKwh: 0.49,
  upstreamLPerKwh: 1.31,
  totalLPerKwh: 1.8,
  source: WUE_PLACEHOLDER_SOURCE,
};

/** Resolve the WUE attributed to a grid region (region-specific or fallback). */
export function getWue(gridId: string): RegionWue {
  return REGION_WUE[gridId] ?? FALLBACK_WUE;
}

/**
 * Water multiplier applied to baseline per-query water (stored at
 * BASE_WUE_L_PER_KWH). Mirrors carbonMultiplier: scales by the attributed
 * region's total WUE relative to the baseline coefficient. Fallback regions
 * resolve to 1.0 (no change from the prior flat coefficient).
 */
export function waterMultiplier(gridId: string): number {
  return getWue(gridId).totalLPerKwh / BASE_WUE_L_PER_KWH;
}

/**
 * EIA balancing-authority respondent codes for grid regions with live coverage.
 * Regions absent from this map (EU, UK, Canada, Australia, SERC) always use the
 * static fallback intensity.
 */
export const EIA_RESPONDENT: Record<string, string> = {
  US_AVERAGE: "US48",
  CAISO: "CISO",
  ERCOT: "ERCO",
  PJM: "PJM",
  NYISO: "NYIS",
  ISO_NE: "ISNE",
  MISO: "MISO",
  SPP: "SWPP",
  BPA: "BPAT",
};

/**
 * Lifecycle emission factors in gCO2eq/kWh by EIA fuel-type code.
 * Values are IPCC AR5 (2014) lifecycle medians.
 */
export const EMISSION_FACTORS_G_PER_KWH: Record<string, number> = {
  COL: 820, // Coal
  NG: 490, // Natural gas
  OIL: 650, // Petroleum
  NUC: 12, // Nuclear
  SUN: 48, // Solar
  WND: 11, // Wind
  WAT: 24, // Hydro
  GEO: 38, // Geothermal
  OTH: 300, // Other / mixed
};

/** Fallback factor for any generating fuel type without an explicit factor. */
export const DEFAULT_FUEL_FACTOR_G_PER_KWH = 300;

/** Storage fuel types are excluded — they shift rather than generate energy. */
const STORAGE_FUEL_TYPES = new Set(["BAT", "PS"]);

export type FuelMixRow = { fueltype: string; value: number };

/**
 * Compute a generation-weighted average carbon intensity (gCO2eq/kWh) from an
 * hourly fuel-mix breakdown. Returns null when there is no usable generation.
 */
export function computeIntensityFromFuelMix(rows: FuelMixRow[]): number | null {
  let weighted = 0;
  let total = 0;
  for (const row of rows) {
    if (STORAGE_FUEL_TYPES.has(row.fueltype)) continue;
    if (!Number.isFinite(row.value) || row.value <= 0) continue;
    const factor = EMISSION_FACTORS_G_PER_KWH[row.fueltype] ?? DEFAULT_FUEL_FACTOR_G_PER_KWH;
    weighted += row.value * factor;
    total += row.value;
  }
  if (total <= 0) return null;
  return weighted / total;
}
