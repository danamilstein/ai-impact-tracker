import { useMemo } from "react";
import {
  SEVEN_DIMENSIONS,
  DIMENSION_BY_KEY,
  aggregateScores,
  loadWellness,
  type DimensionScore,
} from "@/lib/wellness";
import { dimensionIcon } from "@/components/dimension-icon";
import { formatCo2, formatEnergy, formatWater } from "@/lib/utils";

interface EnvTotals {
  co2G: number;
  waterMl: number;
  energyWh: number;
}

/**
 * "Your week across seven dimensions" (v1.4 §4 Integration 3). Renders seven
 * diverging bars from the net practice signal the user recorded (reflections +
 * tagged offsets). The environmental bar is additionally annotated with the
 * period's measured footprint. Honest and low-precision by design.
 *
 * `refreshKey` lets a parent force re-read of localStorage after edits.
 */
export function WellnessSummary({
  envTotals,
  refreshKey = 0,
}: {
  envTotals?: EnvTotals;
  refreshKey?: number;
}) {
  const scores = useMemo<DimensionScore[]>(() => {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return aggregateScores(loadWellness(), since);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const maxAbs = Math.max(3, ...scores.map((s) => Math.abs(s.score)));
  const anySignal = scores.some((s) => s.signals > 0);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Your week across seven dimensions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          AI use touches more than the environment. This is a rough picture of where your reflections and chosen
          practices landed this week — not a measurement, and not a score.
        </p>
      </div>

      <div className="space-y-3">
        {scores.map((s) => {
          const dim = DIMENSION_BY_KEY[s.key];
          const Icon = dimensionIcon(dim.icon);
          const pct = (Math.abs(s.score) / maxAbs) * 50;
          const positive = s.score >= 0;
          return (
            <div key={s.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: dim.color }} />
                  <span className="font-medium">{dim.label}</span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {s.signals === 0 ? "—" : `${s.score > 0 ? "+" : ""}${s.score}`}
                </span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                {s.signals > 0 && (
                  <div
                    className="absolute top-0 bottom-0 rounded-full"
                    style={{
                      width: `${pct}%`,
                      [positive ? "left" : "right"]: "50%",
                      backgroundColor: positive ? dim.color : "#C2563A",
                      opacity: 0.85,
                    }}
                  />
                )}
              </div>
              {s.key === "environmental" && envTotals && (
                <p className="text-xs text-muted-foreground pt-0.5">
                  Measured this week: {formatEnergy(envTotals.energyWh)} · {formatCo2(envTotals.co2G)} CO₂ ·{" "}
                  {formatWater(envTotals.waterMl)} water
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!anySignal && (
        <p className="text-sm text-muted-foreground rounded-md bg-muted/40 p-3">
          Nothing recorded yet this week. Add a quick reflection after logging a session, or check off a practice in
          the offset catalog, and it'll show up here.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Bars combine the reflections you logged (helped / neutral / cost) with the practices you checked off. Six of
        these dimensions are self-report — only you can judge them. Based on the Seven Dimensions of Wellness
        (Hettler, 1976).
      </p>
    </div>
  );
}
