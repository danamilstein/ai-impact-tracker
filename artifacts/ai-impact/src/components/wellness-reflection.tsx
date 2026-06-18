import { useState } from "react";
import {
  SEVEN_DIMENSIONS,
  getReflection,
  hasAnyReflection,
  setReflectionValue,
  type DimensionKey,
  type ReflectionValue,
} from "@/lib/wellness";
import { dimensionIcon } from "@/components/dimension-icon";
import { ChevronDown, Smile, Meh, Frown } from "lucide-react";

const VALUES: { value: ReflectionValue; label: string; Icon: typeof Smile; color: string }[] = [
  { value: "positive", label: "Helped", Icon: Smile, color: "#3D8361" },
  { value: "neutral", label: "Neutral", Icon: Meh, color: "#9CA3AF" },
  { value: "negative", label: "Cost", Icon: Frown, color: "#C2563A" },
];

/**
 * Optional per-session wellness reflection (v1.4 §4 Integration 1). Seven tiny
 * dimension rows, each with a positive / neutral / negative tap. Collapsed by
 * default; expanded automatically the first time (before any reflection exists)
 * so people discover it once. Stored in localStorage, keyed by sessionKey.
 * Never scored, never sent anywhere.
 */
export function WellnessReflection({ sessionKey }: { sessionKey: string }) {
  const [open, setOpen] = useState(() => !hasAnyReflection());
  const [values, setValues] = useState<Partial<Record<DimensionKey, ReflectionValue>>>(
    () => getReflection(sessionKey)?.values ?? {},
  );

  const handleSet = (dim: DimensionKey, value: ReflectionValue) => {
    const next = setReflectionValue(sessionKey, dim, value);
    setValues(next.reflections[sessionKey]?.values ?? {});
  };

  const answered = Object.keys(values).length;

  return (
    <div className="rounded-md border" style={{ borderColor: "#E5DFD3", backgroundColor: "#F5EFE6" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: "#5c6a4f" }}>
            How did this fit the rest of your life? <span className="font-normal">(optional)</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#7A8B6A" }}>
            A private note to yourself across seven dimensions of wellness{answered > 0 ? ` · ${answered} noted` : ""}
          </p>
        </div>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform"
          style={{ color: "#7A8B6A", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {SEVEN_DIMENSIONS.map((dim) => {
            const Icon = dimensionIcon(dim.icon);
            const current = values[dim.key];
            return (
              <div key={dim.key} className="flex items-center justify-between gap-3 py-1">
                <span className="flex items-center gap-2 text-sm min-w-0" style={{ color: "#5c6a4f" }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: dim.color }} />
                  <span className="truncate">{dim.label}</span>
                </span>
                <div className="flex gap-1 shrink-0">
                  {VALUES.map(({ value, label, Icon: VIcon, color }) => {
                    const active = current === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleSet(dim.key, value)}
                        aria-pressed={active}
                        aria-label={`${dim.label}: ${label}`}
                        title={label}
                        className="h-7 w-7 rounded-full flex items-center justify-center border transition-colors"
                        style={{
                          borderColor: active ? color : "#E5DFD3",
                          backgroundColor: active ? `${color}1F` : "transparent",
                        }}
                      >
                        <VIcon className="w-3.5 h-3.5" style={{ color: active ? color : "#A8A296" }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="text-xs pt-1" style={{ color: "#7A8B6A" }}>
            We're not measuring these dimensions — only you can. This stays on your device.
          </p>
        </div>
      )}
    </div>
  );
}
