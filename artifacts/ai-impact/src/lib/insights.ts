import bank from "@/data/insight-bank.json";

export type InsightMode = "on" | "less" | "off";

export interface InsightMessage {
  id: string;
  category: number;
  text: string;
  conditions?: {
    minSessions?: number;
    maxSessions?: number;
    requiresGridLive?: boolean;
    requiresCleanWindow?: boolean;
    notVisitedInfo?: boolean;
    notFirstOfDay?: boolean;
    energyWhMin?: number;
    energyWhMax?: number;
    co2gMin?: number;
    co2gMax?: number;
    waterMlMin?: number;
    waterMlMax?: number;
  };
}

export const MESSAGES: InsightMessage[] = (bank as { messages: InsightMessage[] }).messages;

interface HistoryEntry {
  ts: number;
  tool: string;
  energyWh: number;
  co2G: number;
  waterMl: number;
}

export interface InsightState {
  totalCalcs: number;
  history: HistoryEntry[];
  shownMessages: { id: string; ts: number }[];
  shownCategories: number[];
  sessionsShown: number;
  lastReflectiveSession: number;
  dismissalStreak: number;
  lastShownDismissed: boolean;
  hasShownBefore: boolean;
  settingsPromptShown: boolean;
  mode: InsightMode;
  lastRecordedKey: string | null;
  lastSelected: { key: string; messageId: string; filled: string } | null;
  visitedMethodology: boolean;
  lastSessionDayKey: string | null;
}

const STORAGE_KEY = "ai-impact:insights:v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_RETENTION_MS = 60 * DAY_MS;
const MESSAGE_RETENTION_MS = 14 * DAY_MS;

function defaultState(): InsightState {
  return {
    totalCalcs: 0,
    history: [],
    shownMessages: [],
    shownCategories: [],
    sessionsShown: 0,
    lastReflectiveSession: -999,
    dismissalStreak: 0,
    lastShownDismissed: false,
    hasShownBefore: false,
    settingsPromptShown: false,
    mode: "on",
    lastRecordedKey: null,
    lastSelected: null,
    visitedMethodology: false,
    lastSessionDayKey: null,
  };
}

export function loadState(): InsightState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<InsightState>) };
  } catch {
    return defaultState();
  }
}

export function saveState(state: InsightState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable; frequency control degrades gracefully */
  }
}

export function getMode(): InsightMode {
  return loadState().mode;
}

export function setMode(mode: InsightMode): void {
  const state = loadState();
  saveState({ ...state, mode });
}

export function markMethodologyVisited(): void {
  const state = loadState();
  if (!state.visitedMethodology) {
    saveState({ ...state, visitedMethodology: true });
  }
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function withinDays(history: HistoryEntry[], from: number, to: number, now: number): HistoryEntry[] {
  return history.filter((e) => e.ts >= now - to * DAY_MS && e.ts < now - from * DAY_MS);
}

function formatHourRange(hour: number): string {
  const fmt = (h: number) => {
    const hr = ((h % 24) + 24) % 24;
    const ampm = hr < 12 ? "am" : "pm";
    const display = hr % 12 === 0 ? 12 : hr % 12;
    return `${display}${ampm}`;
  };
  return `${fmt(hour)}–${fmt(hour + 3)}`;
}

/**
 * Resolve all known placeholder tokens from real data. Returns a map of
 * token -> value. A token resolving to `null` means we cannot honestly fill it,
 * so any message that references it becomes ineligible (no fabricated numbers,
 * no leaked "[X]" placeholders). Tokens we have no truthful source for
 * (clean-hour forecast, per-tool training footprint) intentionally stay null.
 */
function resolveTokens(state: InsightState, ctx: SessionContext, now: number): Record<string, string | number | null> {
  const { energyWh, waterMl, co2G, tool } = ctx;
  const history = state.history;
  const week = [...withinDays(history, 0, 7, now)];
  const prevWeek = withinDays(history, 7, 14, now);
  const month = withinDays(history, 0, 30, now);
  const prevMonth = withinDays(history, 30, 60, now);

  const weekCo2 = week.reduce((s, e) => s + e.co2G, 0);
  const toolWeekCount = week.filter((e) => e.tool === tool).length;
  const distinctTools = new Set(week.map((e) => e.tool)).size;
  const distinctDays = new Set(history.map((e) => dayKey(e.ts))).size;

  const weekTrendPct =
    prevWeek.length > 0 ? round(((week.length - prevWeek.length) / prevWeek.length) * 100) : null;

  const avg = (arr: HistoryEntry[]) => (arr.length ? arr.reduce((s, e) => s + e.energyWh, 0) / arr.length : 0);
  const monthAvg = avg(month);
  const prevMonthAvg = avg(prevMonth);
  const sizeTrendPct = prevMonthAvg > 0 ? round(((monthAvg - prevMonthAvg) / prevMonthAvg) * 100) : null;

  // Modal 3-hour bucket of session start times this week.
  let timeRange: string | null = null;
  if (week.length >= 3) {
    const buckets = new Array(8).fill(0) as number[];
    for (const e of week) buckets[Math.floor(new Date(e.ts).getHours() / 3)]++;
    let best = 0;
    for (let i = 1; i < buckets.length; i++) if (buckets[i] > buckets[best]) best = i;
    timeRange = formatHourRange(best * 3);
  }

  const espressoCups = round(waterMl / 30);
  const fridgeMinutes = round(energyWh * 0.4);
  const laptopBatteryMinutes = round(energyWh * 2);
  const phoneCharges = round(energyWh / 12);
  const weekDrivingMiles = round(weekCo2 / 120 / 1.609, 1);

  return {
    tool,
    sessionWh: round(energyWh),
    sessionKwh: round(energyWh / 1000, 4),
    espressoCups: espressoCups >= 1 ? espressoCups : null,
    fridgeMinutes: fridgeMinutes >= 1 ? fridgeMinutes : null,
    laptopBatteryMinutes: laptopBatteryMinutes >= 1 ? laptopBatteryMinutes : null,
    phoneCharges: phoneCharges >= 1 ? phoneCharges : null,
    weekDrivingMiles: weekDrivingMiles >= 0.1 ? weekDrivingMiles : null,
    toolWeekCount: toolWeekCount >= 2 ? toolWeekCount : null,
    distinctToolsWeek: distinctTools >= 2 ? distinctTools : null,
    weekCount: week.length >= 1 ? week.length : null,
    dayCount: distinctDays >= 1 ? ordinal(distinctDays) : null,
    weekTrendPct: weekTrendPct !== null && weekTrendPct > 0 ? weekTrendPct : null,
    monthSizeTrendPct: sizeTrendPct !== null && sizeTrendPct > 0 ? sizeTrendPct : null,
    timeRange,
    gridIntensity: ctx.gridIntensity ?? null,
    region: ctx.region ?? null,
    // No truthful source available — keep null so dependent messages stay dormant.
    cleanWindow: null,
    cleanPct: null,
    trainMwh: null,
    trainMultiple: null,
    trainTco2e: null,
  };
}

const TOKEN_RE = /\[([a-zA-Z][a-zA-Z0-9_]*)\]/g;

function tokensIn(text: string): string[] {
  return [...text.matchAll(TOKEN_RE)].map((m) => m[1]);
}

export function fillMessage(text: string, resolved: Record<string, string | number | null>): string {
  return text.replace(TOKEN_RE, (_, name: string) => String(resolved[name] ?? ""));
}

export interface SessionContext {
  energyWh: number;
  waterMl: number;
  co2G: number;
  tool: string;
  gridIntensity: number | null;
  region: string | null;
  hasLiveGrid: boolean;
}

function magnitudeOk(m: InsightMessage, ctx: SessionContext): boolean {
  const c = m.conditions;
  if (!c) return true;
  if (c.energyWhMin !== undefined && ctx.energyWh < c.energyWhMin) return false;
  if (c.energyWhMax !== undefined && ctx.energyWh > c.energyWhMax) return false;
  if (c.co2gMin !== undefined && ctx.co2G < c.co2gMin) return false;
  if (c.co2gMax !== undefined && ctx.co2G > c.co2gMax) return false;
  if (c.waterMlMin !== undefined && ctx.waterMl < c.waterMlMin) return false;
  if (c.waterMlMax !== undefined && ctx.waterMl > c.waterMlMax) return false;
  return true;
}

interface Eligible {
  message: InsightMessage;
  filled: string;
}

function buildEligible(
  state: InsightState,
  ctx: SessionContext,
  n: number,
  resolved: Record<string, string | number | null>,
  now: number,
): Map<number, Eligible[]> {
  const recentMsgIds = new Set(state.shownMessages.filter((s) => s.ts >= now - MESSAGE_RETENTION_MS).map((s) => s.id));
  const visitedInfo = state.visitedMethodology;
  const firstOfDay = state.lastSessionDayKey !== dayKey(now);
  const lastCategory = state.shownCategories.length ? state.shownCategories[state.shownCategories.length - 1] : null;
  const reflectiveAllowed = state.sessionsShown - state.lastReflectiveSession >= 5;

  const byCat = new Map<number, Eligible[]>();
  for (const m of MESSAGES) {
    if (recentMsgIds.has(m.id)) continue;
    const c = m.conditions ?? {};
    if (c.minSessions !== undefined && n < c.minSessions) continue;
    if (c.maxSessions !== undefined && n > c.maxSessions) continue;
    if (c.requiresGridLive && !ctx.hasLiveGrid) continue;
    if (c.requiresCleanWindow) continue; // no 24h forecast available — dormant by design
    if (c.notVisitedInfo && visitedInfo) continue;
    if (c.notFirstOfDay && firstOfDay) continue;
    if (!magnitudeOk(m, ctx)) continue;
    if (m.category === lastCategory) continue; // no same category two sessions in a row
    if (m.category === 8 && !reflectiveAllowed) continue; // reflective: <=1 per 5 shown
    const tokens = tokensIn(m.text);
    if (tokens.some((t) => resolved[t] === null || resolved[t] === undefined)) continue;
    const list = byCat.get(m.category) ?? [];
    list.push({ message: m, filled: fillMessage(m.text, resolved) });
    byCat.set(m.category, list);
  }
  return byCat;
}

function pickFrom(list: Eligible[], rand: () => number): Eligible {
  return list[Math.floor(rand() * list.length)];
}

/**
 * Selection engine — follows the v1.2 decision flow:
 * first-ever -> methodology; sessions 2-5 emphasize comparison + did-you-know
 * (methodology again around session 4); pattern/cross-poll/training unlock by
 * thresholds; weighted fallback across comparison, did-you-know, occasionally
 * reflective; did-you-know is the ultimate default.
 */
export function selectMessage(
  state: InsightState,
  ctx: SessionContext,
  n: number,
  now: number,
  rand: () => number = Math.random,
): Eligible | null {
  const resolved = resolveTokens(state, ctx, now);
  const byCat = buildEligible(state, ctx, n, resolved, now);
  if (byCat.size === 0) return null;

  // First-ever calculation -> Category 2 (methodology).
  if (n === 1 && byCat.has(2)) return pickFrom(byCat.get(2)!, rand);

  const weights: Record<number, number> = {};
  const add = (cat: number, w: number) => {
    if (byCat.has(cat)) weights[cat] = (weights[cat] ?? 0) + w;
  };

  if (n >= 2 && n <= 5) {
    add(1, 40);
    add(7, 40);
    if (n === 4) add(2, 30);
  }
  if (n >= 3) add(3, 25);
  if (ctx.hasLiveGrid) add(4, 20); // dormant until a clean-window forecast exists
  if (n >= 5 && !state.visitedMethodology) add(5, 10);
  if (n >= 10) add(6, 15);

  // Weighted fallback always available.
  add(1, 30);
  add(7, 30);
  add(8, 8);

  // Soft down-rank for categories shown in the last 3 sessions if alternatives exist.
  const recent3 = new Set(state.shownCategories.slice(-3));
  const cats = Object.keys(weights).map(Number);
  const hasAlternative = cats.some((c) => !recent3.has(c));
  if (hasAlternative) {
    for (const c of cats) if (recent3.has(c)) weights[c] *= 0.25;
  }

  const total = cats.reduce((s, c) => s + weights[c], 0);
  if (total > 0) {
    let r = rand() * total;
    for (const c of cats) {
      r -= weights[c];
      if (r <= 0) return pickFrom(byCat.get(c)!, rand);
    }
  }

  // Ultimate fallback order: did-you-know, comparison, then anything eligible.
  if (byCat.has(7)) return pickFrom(byCat.get(7)!, rand);
  if (byCat.has(1)) return pickFrom(byCat.get(1)!, rand);
  const first = byCat.values().next().value as Eligible[] | undefined;
  return first ? pickFrom(first, rand) : null;
}

/**
 * Records a completed calculation (idempotent per sessionKey) and selects the
 * banner message to show, applying mode gating. Returns the message + the
 * updated state to persist. Returns message=null when the banner should be
 * hidden this session (mode off / "less frequent" skip / nothing eligible).
 */
export function recordAndSelect(
  prev: InsightState,
  ctx: SessionContext,
  sessionKey: string,
  now: number = Date.now(),
  rand: () => number = Math.random,
): { state: InsightState; message: Eligible | null } {
  // Idempotent: a re-mount with the same key must not double-count. Replay the
  // previously selected message (StrictMode double-mount still shows one banner).
  if (prev.lastRecordedKey === sessionKey) {
    if (prev.lastSelected && prev.lastSelected.key === sessionKey) {
      const msg = MESSAGES.find((m) => m.id === prev.lastSelected!.messageId);
      return { state: prev, message: msg ? { message: msg, filled: prev.lastSelected.filled } : null };
    }
    return { state: prev, message: null };
  }

  const history = [...prev.history, { ts: now, tool: ctx.tool, energyWh: ctx.energyWh, co2G: ctx.co2G, waterMl: ctx.waterMl }]
    .filter((e) => e.ts >= now - HISTORY_RETENTION_MS)
    .slice(-300);

  const n = prev.totalCalcs + 1;
  const today = dayKey(now);

  const state: InsightState = {
    ...prev,
    history,
    totalCalcs: n,
    lastRecordedKey: sessionKey,
    lastSessionDayKey: today,
  };

  // Mode gating.
  if (prev.mode === "off") return { state, message: null };
  if (prev.mode === "less" && n % 3 !== 1) return { state, message: null };

  const selected = selectMessage(prev, ctx, n, now, rand);
  if (!selected) return { state, message: null };

  // Finalize previous session's dismissal streak: a shown-but-not-dismissed
  // session breaks the run.
  let dismissalStreak = prev.dismissalStreak;
  if (prev.hasShownBefore && !prev.lastShownDismissed) dismissalStreak = 0;

  const shownMessages = [...prev.shownMessages, { id: selected.message.id, ts: now }].filter(
    (s) => s.ts >= now - MESSAGE_RETENTION_MS,
  );
  const shownCategories = [...prev.shownCategories, selected.message.category].slice(-5);
  const sessionsShown = prev.sessionsShown + 1;
  const lastReflectiveSession = selected.message.category === 8 ? sessionsShown : prev.lastReflectiveSession;

  return {
    state: {
      ...state,
      shownMessages,
      shownCategories,
      sessionsShown,
      lastReflectiveSession,
      dismissalStreak,
      lastShownDismissed: false,
      hasShownBefore: true,
      lastSelected: { key: sessionKey, messageId: selected.message.id, filled: selected.filled },
    },
    message: selected,
  };
}

/**
 * Registers a dismissal. Returns updated state and whether the one-time
 * settings prompt should now surface (third consecutive dismissal).
 */
export function registerDismissal(prev: InsightState): { state: InsightState; showPrompt: boolean } {
  const dismissalStreak = prev.dismissalStreak + 1;
  const showPrompt = dismissalStreak >= 3 && !prev.settingsPromptShown && prev.mode !== "off";
  return {
    state: {
      ...prev,
      dismissalStreak,
      lastShownDismissed: true,
      settingsPromptShown: prev.settingsPromptShown || showPrompt,
    },
    showPrompt,
  };
}
