import { useState } from "react";
import { Link } from "wouter";
import { useGetStatsSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Droplets, Wind, Zap, Gauge, Sparkles, Leaf, ReceiptText } from "lucide-react";
import { formatWater, formatCo2, formatEnergy } from "@/lib/utils";
import { EnergyComparisons } from "@/components/energy-comparisons";
import { OffsetCatalog } from "@/components/offset-catalog";
import { WellnessSummary } from "@/components/wellness-summary";

export default function Practice() {
  const { data, isLoading } = useGetStatsSummary({ period: "week" });
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const energyWh = data?.totalEnergyWh ?? 0;
  const envTotals = data
    ? { co2G: data.totalCo2G, waterMl: data.totalWaterMl, energyWh: data.totalEnergyWh }
    : undefined;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Practice</h2>
          <p className="text-muted-foreground mt-1">
            Your last 7 days — the impact, what it compares to, and the practices you're choosing.
          </p>
        </div>
        <Link
          href="/receipt"
          className="inline-flex items-center gap-2 self-start rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <ReceiptText className="w-4 h-4" />
          Practice Receipt
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1 — Impact */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="w-4 h-4 text-primary" /> Your impact
            </CardTitle>
            <CardDescription>Measured over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric icon={<Zap className="w-4 h-4 text-chart-3" />} label="Energy" value={formatEnergy(energyWh)} />
            <Metric icon={<Wind className="w-4 h-4 text-chart-2" />} label="Carbon" value={formatCo2(data?.totalCo2G ?? 0)} />
            <Metric icon={<Droplets className="w-4 h-4 text-chart-1" />} label="Water" value={formatWater(data?.totalWaterMl ?? 0)} />
            <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
              <span>{data?.totalSessions ?? 0} sessions</span>
              <span>{data?.totalQueries ?? 0} queries</span>
            </div>
          </CardContent>
        </Card>

        {/* Panel 2 — Energy comparisons */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-4 h-4 text-primary" /> What it compares to
            </CardTitle>
            <CardDescription>The same energy, in things you already do online</CardDescription>
          </CardHeader>
          <CardContent>
            <EnergyComparisons energyWh={energyWh} />
          </CardContent>
        </Card>

        {/* Panel 3 — Offset catalog */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Leaf className="w-4 h-4 text-primary" /> Practices you can choose
            </CardTitle>
            <CardDescription>Whole-person offsets, tagged by the wellness they serve</CardDescription>
          </CardHeader>
          <CardContent>
            <OffsetCatalog onChange={() => setRefreshKey((k) => k + 1)} />
          </CardContent>
        </Card>
      </div>

      {/* Seven dimensions summary, below the three panels */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <WellnessSummary envTotals={envTotals} refreshKey={refreshKey} />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-xl font-bold font-mono">{value}</span>
    </div>
  );
}
