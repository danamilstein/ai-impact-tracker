import { Link } from "wouter";
import { format } from "date-fns";
import { useGetStatsSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Leaf } from "lucide-react";
import { formatWater, formatCo2, formatEnergy } from "@/lib/utils";
import { WellnessSummary } from "@/components/wellness-summary";

export default function Receipt() {
  const { data, isLoading } = useGetStatsSummary({ period: "week" });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  const envTotals = data
    ? { co2G: data.totalCo2G, waterMl: data.totalWaterMl, energyWh: data.totalEnergyWh }
    : undefined;

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/practice" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to practice
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" /> Print / Save
        </Button>
      </div>

      <Card className="shadow-sm border-dashed">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-1 border-b border-dashed pb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
              <Leaf className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Practice Receipt</h2>
            <p className="text-xs text-muted-foreground font-mono">
              {format(weekAgo, "MMM d")} – {format(now, "MMM d, yyyy")}
            </p>
          </div>

          <div className="space-y-2 font-mono text-sm">
            <ReceiptRow label="Energy" value={formatEnergy(data?.totalEnergyWh ?? 0)} />
            <ReceiptRow label="Carbon" value={formatCo2(data?.totalCo2G ?? 0)} />
            <ReceiptRow label="Water" value={formatWater(data?.totalWaterMl ?? 0)} />
            <div className="border-t border-dashed my-2" />
            <ReceiptRow label="Sessions" value={String(data?.totalSessions ?? 0)} />
            <ReceiptRow label="Queries" value={String(data?.totalQueries ?? 0)} />
          </div>

          <div className="border-t border-dashed pt-5">
            <WellnessSummary envTotals={envTotals} />
          </div>

          <p className="text-center text-[11px] text-muted-foreground border-t border-dashed pt-4">
            An educational snapshot, not a score. The wellness dimensions are your own self-report and live only on
            this device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex-1 border-b border-dotted border-muted-foreground/30 mx-1 translate-y-[-3px]" />
      <span className="font-semibold">{value}</span>
    </div>
  );
}
