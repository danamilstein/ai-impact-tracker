import { resolveComparisons } from "@/lib/energy-comparisons";
import { formatEnergy, formatEquiv } from "@/lib/utils";
import { Gamepad2, Server, Smartphone } from "lucide-react";

/**
 * Student-relevant energy comparisons (v1.4 §2). Translates a watt-hour figure
 * into the everyday online activities students actually recognize, and explains
 * the device-side vs. data-center split.
 */
export function EnergyComparisons({ energyWh }: { energyWh: number }) {
  const comparisons = resolveComparisons(energyWh);

  if (comparisons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Log some AI use to see how its energy compares to things you already do online.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        The <span className="font-medium text-foreground">{formatEnergy(energyWh)}</span> behind this AI use is roughly the same energy as:
      </p>

      <ul className="space-y-2.5">
        {comparisons.map((c) => (
          <li key={c.id} className="flex items-baseline gap-3">
            <Gamepad2 className="w-4 h-4 text-primary shrink-0 translate-y-0.5" />
            <span className="text-sm">
              <span className="font-semibold font-mono">≈ {formatEquiv(c.count)}</span>{" "}
              <span className="text-foreground">{c.unit}</span>
              {c.deviceWh !== undefined && c.dataCenterWh !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {" "}
                  ({c.deviceWh} Wh on your device + {c.dataCenterWh} Wh in the data center each)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <Smartphone className="w-3.5 h-3.5" /> Device side <span className="text-muted-foreground">+</span>{" "}
          <Server className="w-3.5 h-3.5" /> Data-center side
        </p>
        <p>
          Most online activity splits its energy between the device in your hand and servers in a data center far
          away. AI tilts heavily toward the data-center side — the model runs on someone else's hardware, then the
          answer travels back to you. That's why a few seconds of typing can cost more than it feels like it should.
        </p>
      </div>
    </div>
  );
}
