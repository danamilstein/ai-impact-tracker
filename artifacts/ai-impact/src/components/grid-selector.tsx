import { GRID_REGIONS } from "@/lib/grid-regions";
import { useGrid } from "@/contexts/grid-context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

const REGION_GROUPS = ["United States", "Europe", "North America", "Oceania"];

function formatAsOf(asOf: string | null): string {
  if (!asOf) return "";
  const d = new Date(asOf);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" });
}

export function GridSelector() {
  const { gridId, setGridId, grid, intensityGPerKwh, source, asOf } = useGrid();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3" />
        <span>Your electricity grid</span>
      </div>
      <Select value={gridId} onValueChange={setGridId}>
        <SelectTrigger className="w-full text-sm h-9">
          <SelectValue placeholder="Select grid region" />
        </SelectTrigger>
        <SelectContent>
          {REGION_GROUPS.map((regionGroup) => {
            const grids = GRID_REGIONS.filter((g) => g.region === regionGroup);
            if (grids.length === 0) return null;
            return (
              <SelectGroup key={regionGroup}>
                <SelectLabel>{regionGroup}</SelectLabel>
                {grids.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({g.intensityGPerKwh} g/kWh)
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Carbon intensity: {intensityGPerKwh} g CO₂/kWh — adjusts your carbon estimates
      </p>
      {source === "live" ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live from EIA{asOf ? ` · ${formatAsOf(asOf)}` : ""}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Static curated average{grid.region !== "United States" ? " (no live feed outside the US)" : ""}
        </p>
      )}
    </div>
  );
}
