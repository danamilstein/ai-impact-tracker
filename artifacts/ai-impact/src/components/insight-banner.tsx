import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useGrid } from "@/contexts/grid-context";
import { TOOL_SOURCES } from "@/lib/tool-sources";
import {
  loadState,
  saveState,
  recordAndSelect,
  registerDismissal,
  type InsightMode,
} from "@/lib/insights";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Renders message text, turning *…* spans into emphasis (italic for emphasis only). */
export function renderMessage(text: string): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/** Presentational banner shell — cream bg, sage left border, sage leaf icon, muted ×, 200ms fade. */
export function InsightBannerView({
  children,
  onDismiss,
}: {
  children: ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="relative animate-in fade-in duration-200 rounded-md pl-4 pr-8 py-3 flex items-start gap-3"
      style={{ backgroundColor: "#F5EFE6", borderLeft: "4px solid #7A8B6A" }}
      data-testid="insight-banner"
    >
      <LeafGlyph />
      <p
        className="leading-relaxed text-[#3f4a37]"
        style={{ fontSize: "14px", fontFamily: "Calibri, 'Segoe UI', system-ui, sans-serif" }}
      >
        {children}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss insight"
        className="absolute top-2 right-2 leading-none text-gray-400 hover:text-gray-600 transition-colors"
        style={{ fontSize: "12px" }}
      >
        ✕
      </button>
    </div>
  );
}

function LeafGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
      style={{ color: "#7A8B6A" }}
    >
      <path
        fill="currentColor"
        d="M5 21c0-7 5-13 14-14 0 9-6 14-13 14H5Zm3.5-2.2c4.6-.9 8-4 9-9.3-4.6.9-8 4-9 9.3Z"
      />
    </svg>
  );
}

/** One-time prompt after three consecutive dismissals. */
export function SettingsPrompt({
  onChoose,
  onClose,
}: {
  onChoose: (mode: InsightMode) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="relative animate-in fade-in duration-200 rounded-md pl-4 pr-8 py-3"
      style={{ backgroundColor: "#F5EFE6", borderLeft: "4px solid #7A8B6A" }}
      data-testid="insight-settings-prompt"
    >
      <p
        className="leading-relaxed text-[#3f4a37] mb-3"
        style={{ fontSize: "14px", fontFamily: "Calibri, 'Segoe UI', system-ui, sans-serif" }}
      >
        Would you like to turn off post-calculation insights? You can re-enable them anytime in{" "}
        <Link href="/settings" className="underline underline-offset-2">
          Settings
        </Link>
        .
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoose("off")}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#7A8B6A" }}
        >
          Turn off
        </button>
        <button
          type="button"
          onClick={() => onChoose("less")}
          className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ border: "1px solid #7A8B6A", color: "#5c6a4f" }}
        >
          Show less often
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Keep them on
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="absolute top-2 right-2 leading-none text-gray-400 hover:text-gray-600 transition-colors"
        style={{ fontSize: "12px" }}
      >
        ✕
      </button>
    </div>
  );
}

const MODE_OPTIONS: { value: InsightMode; label: string; description: string }[] = [
  { value: "on", label: "On", description: "Show an insight after every calculation (default)." },
  { value: "less", label: "Less frequent", description: "Show an insight on roughly every third calculation." },
  { value: "off", label: "Off", description: "Never show post-calculation insights." },
];

/** Shared settings control used by the Settings page and the preview. */
export function InsightSettings({
  mode,
  onChange,
}: {
  mode: InsightMode;
  onChange: (mode: InsightMode) => void;
}) {
  return (
    <div className="space-y-3" data-testid="insight-settings">
      {MODE_OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-start gap-3 rounded-md border p-4 cursor-pointer transition-colors ${
              active ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
            }`}
          >
            <input
              type="radio"
              name="insight-mode"
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="mt-1 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium">{opt.label}</span>
              <span className="block text-xs text-muted-foreground">{opt.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

/**
 * Smart banner used in the result area. Records the calculation in localStorage,
 * selects a single message via the v1.2 selection engine, and handles dismissal
 * + the three-strikes settings prompt. All client-side; no server calls.
 */
export function InsightBanner({
  energyWh,
  waterMl,
  co2G,
  toolName,
  sessionKey,
}: {
  energyWh: number;
  waterMl: number;
  co2G: number;
  toolName: string;
  sessionKey: string;
}) {
  const grid = useGrid();
  const [text, setText] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const ran = useRef<string | null>(null);

  useEffect(() => {
    if (ran.current === sessionKey) return;
    ran.current = sessionKey;

    const region = TOOL_SOURCES[toolName]?.dataCenterRegion ?? null;
    const { state, message } = recordAndSelect(loadState(), {
      energyWh,
      waterMl,
      co2G,
      tool: toolName,
      gridIntensity: grid.source === "live" ? grid.intensityGPerKwh : null,
      region,
      hasLiveGrid: grid.source === "live",
    }, sessionKey);
    saveState(state);
    setText(message ? message.filled : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  function handleDismiss() {
    const { state, showPrompt: prompt } = registerDismissal(loadState());
    saveState(state);
    setDismissed(true);
    if (prompt) setShowPrompt(true);
  }

  function handleChoose(mode: InsightMode) {
    const s = loadState();
    saveState({ ...s, mode });
    setShowPrompt(false);
  }

  if (showPrompt) {
    return <SettingsPrompt onChoose={handleChoose} onClose={() => setShowPrompt(false)} />;
  }
  if (!text || dismissed) return null;

  return <InsightBannerView onDismiss={handleDismiss}>{renderMessage(text)}</InsightBannerView>;
}

export { basePath as insightBasePath };
