import {
  GRID_REGIONS,
  EIA_RESPONDENT,
  computeIntensityFromFuelMix,
  type FuelMixRow,
} from "@workspace/grid-data";
import { logger } from "../lib/logger";

export type GridIntensityResult = {
  id: string;
  label: string;
  intensityGPerKwh: number;
  source: "live" | "static";
  asOf: string | null;
};

type EiaRow = {
  period: string;
  respondent: string;
  fueltype: string;
  value: string | number | null;
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour for live results
const FAILURE_TTL_MS = 5 * 60 * 1000; // 5 minutes before retrying after a failure
const EIA_TIMEOUT_MS = 8000;

let cache: { data: GridIntensityResult[]; expiresAt: number } | null = null;

function staticResults(): GridIntensityResult[] {
  return GRID_REGIONS.map((g) => ({
    id: g.id,
    label: g.label,
    intensityGPerKwh: g.intensityGPerKwh,
    source: "static" as const,
    asOf: null,
  }));
}

/** EIA hourly period like "2026-06-02T06" → ISO UTC timestamp. */
function periodToIso(period: string): string {
  return /^\d{4}-\d{2}-\d{2}T\d{2}$/.test(period) ? `${period}:00:00Z` : period;
}

/**
 * Fetch the latest fuel-mix rows for a single balancing authority. Querying per
 * respondent (rather than one global request) is essential: BAs report at
 * different lags — some are current to the hour, others trail by several days —
 * and a single period-sorted window would silently drop the laggards. length=48
 * comfortably covers the latest complete hour for every respondent's fuel types.
 */
async function fetchRespondent(apiKey: string, respondent: string): Promise<EiaRow[]> {
  const params = [
    `api_key=${encodeURIComponent(apiKey)}`,
    "frequency=hourly",
    "data[0]=value",
    `facets[respondent][]=${encodeURIComponent(respondent)}`,
    "sort[0][column]=period",
    "sort[0][direction]=desc",
    "length=48",
  ];
  const url = `https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/?${params.join("&")}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(EIA_TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`EIA responded ${res.status} for ${respondent}`);
  }
  const json = (await res.json()) as { response?: { data?: EiaRow[] } };
  return json.response?.data ?? [];
}

async function fetchEiaFuelMix(apiKey: string): Promise<EiaRow[]> {
  const respondents = Array.from(new Set(Object.values(EIA_RESPONDENT)));
  const settled = await Promise.allSettled(
    respondents.map((r) => fetchRespondent(apiKey, r)),
  );
  const rows: EiaRow[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      rows.push(...result.value);
    } else {
      logger.warn({ err: result.reason }, "EIA respondent fetch failed");
    }
  }
  if (rows.length === 0) {
    throw new Error("All EIA respondent fetches failed");
  }
  return rows;
}

function buildLiveResults(rows: EiaRow[]): GridIntensityResult[] {
  // Group rows by respondent, keeping only each respondent's most recent hour.
  const byRespondent = new Map<string, { period: string; rows: FuelMixRow[] }>();
  for (const row of rows) {
    const existing = byRespondent.get(row.respondent);
    const value = typeof row.value === "string" ? Number(row.value) : (row.value ?? NaN);
    const fuel: FuelMixRow = { fueltype: row.fueltype, value };
    if (!existing || row.period > existing.period) {
      byRespondent.set(row.respondent, { period: row.period, rows: [fuel] });
    } else if (row.period === existing.period) {
      existing.rows.push(fuel);
    }
  }

  return GRID_REGIONS.map((g) => {
    const respondent = EIA_RESPONDENT[g.id];
    const entry = respondent ? byRespondent.get(respondent) : undefined;
    const intensity = entry ? computeIntensityFromFuelMix(entry.rows) : null;
    if (entry && intensity !== null) {
      return {
        id: g.id,
        label: g.label,
        intensityGPerKwh: Math.round(intensity),
        source: "live" as const,
        asOf: periodToIso(entry.period),
      };
    }
    return {
      id: g.id,
      label: g.label,
      intensityGPerKwh: g.intensityGPerKwh,
      source: "static" as const,
      asOf: null,
    };
  });
}

/**
 * Returns carbon intensity for every grid region. US balancing authorities use
 * live EIA fuel-mix data (weighted by lifecycle emission factors); all other
 * regions and any EIA failure fall back to the curated static averages.
 */
export async function getGridIntensities(): Promise<GridIntensityResult[]> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  const apiKey = process.env["EIA_API_KEY"];
  if (!apiKey) {
    logger.warn("EIA_API_KEY not set — serving static grid intensities");
    const data = staticResults();
    cache = { data, expiresAt: Date.now() + FAILURE_TTL_MS };
    return data;
  }

  try {
    const rows = await fetchEiaFuelMix(apiKey);
    const data = buildLiveResults(rows);
    const anyLive = data.some((d) => d.source === "live");
    cache = {
      data,
      expiresAt: Date.now() + (anyLive ? CACHE_TTL_MS : FAILURE_TTL_MS),
    };
    return data;
  } catch (err) {
    logger.error({ err }, "Failed to fetch live EIA grid intensities — falling back to static");
    const data = staticResults();
    cache = { data, expiresAt: Date.now() + FAILURE_TTL_MS };
    return data;
  }
}
