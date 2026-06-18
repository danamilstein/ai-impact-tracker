import { useState } from "react";
import { useGetStatsSummary, useGetStatsByTool, useGetStatsTrend, useListSessions, useListGoals } from "@workspace/api-client-react";
import { formatWater, formatCo2, formatEnergy, formatDate, formatEquiv } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Droplets, Wind, Zap, Battery, Car, Droplet, ArrowRight, FileText, Lightbulb, Search, Tv, Info, ChevronDown } from "lucide-react";
import { useGrid } from "@/contexts/grid-context";
import { PurposeNote } from "@/components/purpose-note";
import { GridSelector } from "@/components/grid-selector";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

type Period = "week" | "month" | "year" | "all";

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [showWater, setShowWater] = useState(true);
  const [showCo2, setShowCo2] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);
  const [aboutOpen, setAboutOpen] = useState<boolean | null>(null);
  
  const { data: summary, isLoading: loadingSummary } = useGetStatsSummary({ period });
  const { data: tools, isLoading: loadingTools } = useGetStatsByTool({ period });
  const { data: trend, isLoading: loadingTrend } = useGetStatsTrend({ days: 30 });
  const { data: sessions, isLoading: loadingSessions } = useListSessions({ limit: 5 });
  const { data: goals, isLoading: loadingGoals } = useListGoals();
  const { multiplier, waterMultiplier, gridId } = useGrid();

  if (loadingSummary || loadingTools || loadingTrend || loadingSessions || loadingGoals) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Impact</h2>
          <p className="text-muted-foreground mt-1">Environmental footprint of your AI usage.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="w-full sm:w-56">
            <GridSelector />
          </div>
          <ToggleGroup type="single" value={period} onValueChange={(val) => val && setPeriod(val as Period)} className="bg-muted p-1 rounded-lg shrink-0">
            <ToggleGroupItem value="week" className="px-3 py-1 text-sm h-8">Week</ToggleGroupItem>
            <ToggleGroupItem value="month" className="px-3 py-1 text-sm h-8">Month</ToggleGroupItem>
            <ToggleGroupItem value="year" className="px-3 py-1 text-sm h-8">Year</ToggleGroupItem>
            <ToggleGroupItem value="all" className="px-3 py-1 text-sm h-8">All Time</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {(() => {
        const isFirstTime = !sessions || sessions.length === 0;
        const open = aboutOpen ?? isFirstTime;
        return (
          <div className="rounded-xl border bg-card">
            <button
              type="button"
              onClick={() => setAboutOpen(!open)}
              className="w-full flex items-center justify-between p-4 text-left"
              aria-expanded={open}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Info className="w-4 h-4 text-primary" />
                About this tool
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="px-4 pb-4">
                <PurposeNote />
              </div>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-chart-1 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Water Footprint
              {waterMultiplier !== 1 && (
                <span className="ml-1.5 text-[10px] font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">grid-adjusted</span>
              )}
            </CardTitle>
            <Droplets className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-chart-1">{summary ? formatWater(summary.totalWaterMl * waterMultiplier) : '0 ml'}</div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Droplet className="w-3 h-3 shrink-0" />
                {formatEquiv((summary?.equivalencies.bottlesOfWater ?? 0) * waterMultiplier)} × 500 ml water bottles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-chart-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carbon Emitted
              {gridId !== "US_AVERAGE" && (
                <span className="ml-1.5 text-[10px] font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">grid-adjusted</span>
              )}
            </CardTitle>
            <Wind className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-chart-2">
              {summary ? formatCo2(summary.totalCo2G * multiplier) : '0 g'}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Car className="w-3 h-3 shrink-0" />
                {formatEquiv((summary?.equivalencies.kmDriven ?? 0) * multiplier)} km driven (120 g/km)
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Search className="w-3 h-3 shrink-0" />
                {formatEquiv((summary?.equivalencies.googleSearches ?? 0) * multiplier)} Google searches
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-chart-3 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Energy Consumed</CardTitle>
            <Zap className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-chart-3">{summary ? formatEnergy(summary.totalEnergyWh) : '0 Wh'}</div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Battery className="w-3 h-3 shrink-0" />
                {formatEquiv(summary?.equivalencies.smartphoneCharges ?? 0)} phone charges (12 Wh each)
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-3 h-3 shrink-0" />
                {formatEquiv(summary?.equivalencies.ledBulbHours ?? 0)} hrs of a 9 W LED bulb
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Tv className="w-3 h-3 shrink-0" />
                {formatEquiv(summary?.equivalencies.minutesOfStreaming ?? 0)} min of HD streaming
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground italic">
        These figures cover operational (inference) impact only — the energy and water used each
        time you run a query. They do not include the one-time cost of{" "}
        <Link href="/methodology#training" className="text-primary hover:underline not-italic">
          training the models
        </Link>
        , which is significant but cannot be cleanly amortized per query.
      </p>

      {goals && goals.length > 0 && (
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Goals at a Glance</CardTitle>
            <Link href="/goals" className="text-sm text-primary hover:underline">
              Manage goals
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(goal => {
                const percent = Math.min(100, Math.max(0, goal.percentUsed));
                const barColor = percent < 70 ? "bg-chart-1" : percent < 100 ? "bg-chart-4" : "bg-destructive";
                
                const formatGoalValue = (metric: string, val: number) => {
                  if (metric === "water_ml") return val >= 1000 ? `${(val / 1000).toFixed(1)} L` : `${Math.round(val)} ml`;
                  if (metric === "co2_g") return val >= 1000 ? `${(val / 1000).toFixed(1)} kg` : `${Math.round(val)} g`;
                  if (metric === "energy_wh") return val >= 1000 ? `${(val / 1000).toFixed(1)} kWh` : `${Math.round(val)} Wh`;
                  return val.toString();
                };

                return (
                  <div key={goal.id} className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate pr-2">{goal.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatGoalValue(goal.metric, goal.currentValue)} / {formatGoalValue(goal.metric, goal.targetValue)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle>Daily Trend</CardTitle>
              <CardDescription>Impact over the last 30 days</CardDescription>
            </div>
            <div className="flex flex-col gap-2 bg-muted/50 p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox id="show-water" checked={showWater} onCheckedChange={(c) => setShowWater(!!c)} />
                <Label htmlFor="show-water" className="text-xs text-chart-1 font-medium cursor-pointer">Water</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="show-co2" checked={showCo2} onCheckedChange={(c) => setShowCo2(!!c)} />
                <Label htmlFor="show-co2" className="text-xs text-chart-2 font-medium cursor-pointer">CO2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="show-energy" checked={showEnergy} onCheckedChange={(c) => setShowEnergy(!!c)} />
                <Label htmlFor="show-energy" className="text-xs text-chart-3 font-medium cursor-pointer">Energy</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {trend && trend.length > 0 ? (
              (() => {
                const rows: Array<{
                  show: boolean;
                  key: "waterMl" | "co2G" | "energyWh";
                  name: string;
                  unit: string;
                  colorVar: string;
                  gradientId: string;
                  formatter: (v: number) => string;
                }> = [
                  { show: showWater, key: "waterMl", name: "Water", unit: "ml", colorVar: "--chart-1", gradientId: "colorWater", formatter: formatWater },
                  { show: showCo2, key: "co2G", name: "CO2", unit: "g", colorVar: "--chart-2", gradientId: "colorCo2", formatter: formatCo2 },
                  { show: showEnergy, key: "energyWh", name: "Energy", unit: "Wh", colorVar: "--chart-3", gradientId: "colorEnergy", formatter: formatEnergy },
                ];
                const visible = rows.filter(r => r.show);
                if (visible.length === 0) {
                  return (
                    <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                      Select a metric to see its trend.
                    </div>
                  );
                }
                const rowHeight = Math.max(110, Math.floor(280 / visible.length));
                return (
                  <div className="space-y-3">
                    {visible.map((row, idx) => (
                      <div key={row.key} style={{ height: rowHeight }}>
                        <div className="text-xs font-medium text-muted-foreground mb-1 pl-1">
                          <span style={{ color: `hsl(var(${row.colorVar}))` }}>{row.name}</span>{" "}
                          <span className="opacity-60">({row.unit})</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trend} margin={{ top: 4, right: 10, left: 0, bottom: idx === visible.length - 1 ? 0 : 0 }}>
                            <defs>
                              <linearGradient id={row.gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={`hsl(var(${row.colorVar}))`} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={`hsl(var(${row.colorVar}))`} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(val) => format(new Date(val), 'MMM d')}
                              axisLine={false}
                              tickLine={false}
                              tick={idx === visible.length - 1 ? { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } : false}
                              height={idx === visible.length - 1 ? 20 : 0}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              width={48}
                              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                              tickFormatter={(v: number) => row.formatter(v)}
                            />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                              labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                              formatter={(v: number) => [row.formatter(v), row.name]}
                            />
                            <Area
                              type="monotone"
                              name={`${row.name} (${row.unit})`}
                              dataKey={row.key}
                              stroke={`hsl(var(${row.colorVar}))`}
                              fillOpacity={1}
                              fill={`url(#${row.gradientId})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                <p>No trend data available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest tracked interactions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             {sessions && sessions.length > 0 ? (
               <div className="space-y-4">
                 {sessions.map(session => (
                   <div key={session.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                     <div>
                       <div className="font-medium text-sm">{session.toolName}</div>
                       <div className="text-xs text-muted-foreground flex gap-2">
                         {session.activityType && session.durationMinutes ? (
                           <span className="capitalize">{session.activityType} · {session.durationMinutes} min</span>
                         ) : (
                           <span>{session.queryCount} {session.queryCount === 1 ? "query" : "queries"}</span>
                         )}
                         <span>•</span>
                         <span className="capitalize">{session.complexity}</span>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-sm font-mono text-chart-2">{formatCo2(session.co2G)}</div>
                       <div className="text-xs text-muted-foreground">{session.sessionDate ? formatDate(session.sessionDate) : formatDate(session.createdAt)}</div>
                     </div>
                   </div>
                 ))}
                 <div className="pt-2">
                   <Link href="/history" className="text-sm text-primary flex items-center hover:underline">
                     View all history <ArrowRight className="w-4 h-4 ml-1" />
                   </Link>
                 </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                 <p className="mb-4">No sessions tracked yet.</p>
                 <Link href="/log" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
                   Log your first session
                 </Link>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      <Link href="/report">
        <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer mt-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-sm">Weekly Report</div>
              <div className="text-xs text-muted-foreground">Compare this week vs last, see goal progress and top tools</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>

    </div>
  );
}
