/**
 * Seven Dimensions of Wellness (v1.4 §4).
 *
 * Framework: Bill Hettler / National Wellness Institute (Hettler, 1976), with a
 * parallel in SAMHSA's Eight Dimensions of Wellness. The Tracker frames AI use
 * as one input across seven dimensions of personal wellbeing rather than as a
 * purely environmental question.
 *
 * All reflection + offset-practice data lives in localStorage only. It is for
 * the user's own attention — never scored, graded, or sent anywhere.
 */

export type DimensionKey =
  | "physical"
  | "emotional"
  | "intellectual"
  | "social"
  | "spiritual"
  | "occupational"
  | "environmental";

export interface WellnessDimension {
  key: DimensionKey;
  label: string;
  blurb: string;
  /** Solid hex color for bars / accents. */
  color: string;
  /** lucide-react icon name, mapped to a component at the call site. */
  icon: string;
}

export const SEVEN_DIMENSIONS: WellnessDimension[] = [
  { key: "physical", label: "Physical", blurb: "Energy, sleep, embodied experience. AI use affects screen time, posture, sleep displacement, and sedentary time.", color: "#E07A5F", icon: "HeartPulse" },
  { key: "emotional", label: "Emotional", blurb: "Mood, anxiety, capacity for difficult feelings. AI use can reduce cognitive load or amplify comparison and doomscrolling.", color: "#E9B949", icon: "Heart" },
  { key: "intellectual", label: "Intellectual / Brain Capital", blurb: "Cognitive practice, learning, thinking. AI use can stretch thinking or atrophy it, depending on what you offload.", color: "#81B29A", icon: "Brain" },
  { key: "social", label: "Social", blurb: "Connection, community, relational practice. AI use can scaffold connection or quietly replace it.", color: "#6A8EAE", icon: "Users" },
  { key: "spiritual", label: "Spiritual", blurb: "Meaning, purpose, alignment with values. AI use can serve work that matters or distract from it.", color: "#9B8BB4", icon: "Compass" },
  { key: "occupational", label: "Occupational", blurb: "Work, vocation, contribution. AI use can advance the work or fragment it.", color: "#C9A227", icon: "Briefcase" },
  { key: "environmental", label: "Environmental", blurb: "The dimension the Tracker has always measured: water, energy, carbon, the grid, the supply chain.", color: "#3D8361", icon: "Leaf" },
];

export const DIMENSION_BY_KEY: Record<DimensionKey, WellnessDimension> = Object.fromEntries(
  SEVEN_DIMENSIONS.map((d) => [d.key, d]),
) as Record<DimensionKey, WellnessDimension>;

export type ReflectionValue = "positive" | "neutral" | "negative";

export interface SessionReflection {
  ts: number;
  values: Partial<Record<DimensionKey, ReflectionValue>>;
}

export interface OffsetCompletion {
  id: string;
  ts: number;
  /** Dimensions the offset serves, captured at completion time. */
  dimensions: DimensionKey[];
}

export interface WellnessState {
  /** Per-session reflections, keyed by the log screen's sessionKey. */
  reflections: Record<string, SessionReflection>;
  /** Completed offset practices (most recent kept). */
  offsets: OffsetCompletion[];
}

const STORAGE_KEY = "ai-impact:wellness:v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 120 * DAY_MS;

function defaultState(): WellnessState {
  return { reflections: {}, offsets: [] };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function loadWellness(): WellnessState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return defaultState();
    const reflections = isPlainObject(parsed.reflections)
      ? (parsed.reflections as WellnessState["reflections"])
      : {};
    const offsets = Array.isArray(parsed.offsets)
      ? (parsed.offsets as WellnessState["offsets"])
      : [];
    return { reflections, offsets };
  } catch {
    return defaultState();
  }
}

export function saveWellness(state: WellnessState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable; reflections degrade gracefully */
  }
}

export function getReflection(sessionKey: string): SessionReflection | null {
  return loadWellness().reflections[sessionKey] ?? null;
}

/** Whether the user has ever logged a reflection (drives first-time expansion). */
export function hasAnyReflection(): boolean {
  return Object.keys(loadWellness().reflections).length > 0;
}

export function setReflectionValue(sessionKey: string, dim: DimensionKey, value: ReflectionValue): WellnessState {
  const now = Date.now();
  const state = loadWellness();
  const existing = state.reflections[sessionKey] ?? { ts: now, values: {} };
  const values = { ...existing.values };
  // Tapping the same value again clears it (toggle off).
  if (values[dim] === value) delete values[dim];
  else values[dim] = value;
  const next: WellnessState = {
    ...state,
    reflections: { ...state.reflections, [sessionKey]: { ts: existing.ts || now, values } },
  };
  saveWellness(next);
  return next;
}

export function isOffsetDone(id: string, sinceMs: number = Date.now() - 7 * DAY_MS): boolean {
  return loadWellness().offsets.some((o) => o.id === id && o.ts >= sinceMs);
}

export function toggleOffset(id: string, dimensions: DimensionKey[]): WellnessState {
  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const state = loadWellness();
  const doneThisWeek = state.offsets.some((o) => o.id === id && o.ts >= weekAgo);
  let offsets: OffsetCompletion[];
  if (doneThisWeek) {
    offsets = state.offsets.filter((o) => !(o.id === id && o.ts >= weekAgo));
  } else {
    offsets = [...state.offsets, { id, ts: now, dimensions }];
  }
  offsets = offsets.filter((o) => o.ts >= now - RETENTION_MS).slice(-500);
  const next: WellnessState = { ...state, offsets };
  saveWellness(next);
  return next;
}

export interface DimensionScore {
  key: DimensionKey;
  /** Net signal: reflection sentiment (+1/0/-1) + completed offsets (+1 each). */
  score: number;
  /** Count of any signals (for "have we got anything to show" checks). */
  signals: number;
}

/**
 * Aggregate reflections + offset completions within a window into a net
 * per-dimension score. Honest and low-precision by design: it counts the
 * signals the user chose to record, nothing more.
 */
export function aggregateScores(state: WellnessState, sinceMs: number, now: number = Date.now()): DimensionScore[] {
  const base: Record<DimensionKey, { score: number; signals: number }> = Object.fromEntries(
    SEVEN_DIMENSIONS.map((d) => [d.key, { score: 0, signals: 0 }]),
  ) as Record<DimensionKey, { score: number; signals: number }>;

  for (const r of Object.values(state.reflections)) {
    if (r.ts < sinceMs || r.ts > now) continue;
    for (const [k, v] of Object.entries(r.values)) {
      const key = k as DimensionKey;
      if (!base[key]) continue;
      base[key].signals += 1;
      base[key].score += v === "positive" ? 1 : v === "negative" ? -1 : 0;
    }
  }
  for (const o of state.offsets) {
    if (o.ts < sinceMs || o.ts > now) continue;
    for (const key of o.dimensions) {
      if (!base[key]) continue;
      base[key].signals += 1;
      base[key].score += 1;
    }
  }

  return SEVEN_DIMENSIONS.map((d) => ({ key: d.key, score: base[d.key].score, signals: base[d.key].signals }));
}
