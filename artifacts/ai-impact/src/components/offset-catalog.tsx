import { useState } from "react";
import { OFFSETS, OFFSET_CATALOG_INTRO } from "@/lib/offsets";
import { DIMENSION_BY_KEY } from "@/lib/wellness";
import { loadWellness, toggleOffset } from "@/lib/wellness";
import { Check } from "lucide-react";

/**
 * Offset catalog (v1.4 §3 + §4 Integration 2). Each practice carries an honest
 * italic context note (offsets aren't binary) and dimension tags showing which
 * of the Seven Dimensions of Wellness it tends to serve. Users can mark a
 * practice as done this week; completions feed the seven-dimension summary.
 */
export function OffsetCatalog({ onChange }: { onChange?: () => void }) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const [doneIds, setDoneIds] = useState<Set<string>>(() => {
    const state = loadWellness();
    return new Set(state.offsets.filter((o) => o.ts >= weekAgo).map((o) => o.id));
  });

  const handleToggle = (id: string, dimensions: typeof OFFSETS[number]["dimensions"]) => {
    toggleOffset(id, dimensions);
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    onChange?.();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground italic">{OFFSET_CATALOG_INTRO}</p>

      <ul className="space-y-3">
        {OFFSETS.map((offset) => {
          const done = doneIds.has(offset.id);
          return (
            <li key={offset.id} className="flex gap-3">
              <button
                type="button"
                onClick={() => handleToggle(offset.id, offset.dimensions)}
                aria-pressed={done}
                aria-label={done ? `Mark "${offset.label}" not done` : `Mark "${offset.label}" done this week`}
                className={`mt-0.5 h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                  done ? "bg-primary border-primary text-primary-foreground" : "border-input hover:border-primary"
                }`}
              >
                {done && <Check className="w-3.5 h-3.5" />}
              </button>
              <div className="space-y-1">
                <p className={`text-sm font-medium ${done ? "text-foreground" : ""}`}>{offset.label}</p>
                <p className="text-xs text-muted-foreground italic leading-relaxed">{offset.contextNote}</p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {offset.dimensions.map((key) => {
                    const dim = DIMENSION_BY_KEY[key];
                    return (
                      <span
                        key={key}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${dim.color}1A`, color: dim.color }}
                      >
                        {dim.label.split(" / ")[0]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        Marking a practice tags it across the dimensions it serves — it's a note to yourself, stored only on this
        device. Nothing here is scored or sent anywhere.
      </p>
    </div>
  );
}
