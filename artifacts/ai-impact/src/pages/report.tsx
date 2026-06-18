import { useState } from "react";
import { useGetWeeklyReport } from "@workspace/api-client-react";
import { formatWater, formatCo2, formatEnergy } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  Droplets, 
  Wind, 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Calendar,
  Activity,
  Award
} from "lucide-react";

type Period = "week" | "month";

export default function Report() {
  const [period, setPeriod] = useState<Period>("week");
  const { data, isLoading } = useGetWeeklyReport({ period });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isWeekly = period === "week";
  const title = isWeekly ? "Weekly Report" : "Monthly Report";

  const renderChangeBadge = (pct: number | null) => {
    if (pct === null) return <span className="text-xs text-muted-foreground">No prior data</span>;
    if (Math.abs(pct) < 5) return (
      <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20 gap-1 rounded-full px-2 py-0.5">
        <Minus className="w-3 h-3" />
        {pct > 0 ? "+" : ""}{pct.toFixed(1)}%
      </Badge>
    );
    if (pct > 0) return (
      <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive/20 gap-1 rounded-full px-2 py-0.5">
        <TrendingUp className="w-3 h-3" />
        +{pct.toFixed(1)}%
      </Badge>
    );
    return (
      <Badge variant="outline" className="text-chart-1 bg-chart-1/10 border-chart-1/20 gap-1 rounded-full px-2 py-0.5">
        <TrendingDown className="w-3 h-3" />
        {pct.toFixed(1)}%
      </Badge>
    );
  };

  const formatGoalValue = (metric: string, val: number) => {
    if (metric === "water_ml") return val >= 1000 ? `${(val / 1000).toFixed(1)} L` : `${Math.round(val)} ml`;
    if (metric === "co2_g") return val >= 1000 ? `${(val / 1000).toFixed(1)} kg` : `${Math.round(val)} g`;
    if (metric === "energy_wh") return val >= 1000 ? `${(val / 1000).toFixed(1)} kWh` : `${Math.round(val)} Wh`;
    return val.toString();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-1">{data.periodLabel}</p>
        </div>
        
        <ToggleGroup type="single" value={period} onValueChange={(val) => val && setPeriod(val as Period)} className="bg-muted p-1 rounded-lg">
          <ToggleGroupItem value="week" className="px-3 py-1 text-sm h-8">Week</ToggleGroupItem>
          <ToggleGroupItem value="month" className="px-3 py-1 text-sm h-8">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {data.current.sessions === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No AI usage logged for this period</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              You haven't tracked any AI tool usage during {data.periodLabel}. Start logging sessions to see your environmental impact.
            </p>
            <Link href="/log" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Log Session
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Water Footprint</CardTitle>
                <Droplets className="h-4 w-4 text-chart-1" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{formatWater(data.current.waterMl)}</div>
                <div className="mt-2 flex items-center">
                  {renderChangeBadge(data.changes.waterMlPct)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Emitted</CardTitle>
                <Wind className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{formatCo2(data.current.co2G)}</div>
                <div className="mt-2 flex items-center">
                  {renderChangeBadge(data.changes.co2GPct)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Energy Consumed</CardTitle>
                <Zap className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{formatEnergy(data.current.energyWh)}</div>
                <div className="mt-2 flex items-center">
                  {renderChangeBadge(data.changes.energyWhPct)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-sm bg-muted/30 border-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold">{data.current.sessions}</p>
                </div>
                <div>{renderChangeBadge(data.changes.sessionsPct)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-muted/30 border-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
                  <p className="text-2xl font-bold">{data.current.queries}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Top Tools by Carbon</CardTitle>
                  <CardDescription>Highest emission sources</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {data.topTools.length > 0 ? (
                  <div className="space-y-4">
                    {data.topTools.slice(0, 5).map((tool, i) => {
                      const maxCo2 = Math.max(...data.topTools.map(t => t.co2G));
                      const pctOfMax = maxCo2 > 0 ? (tool.co2G / maxCo2) * 100 : 0;
                      return (
                        <div key={tool.toolName} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium flex items-center gap-2">
                              <span className="text-muted-foreground text-xs w-4">{i + 1}.</span>
                              {tool.toolName}
                              <span className="text-xs text-muted-foreground font-normal">{tool.sessions} sessions</span>
                            </span>
                            <span className="font-mono text-xs">{formatCo2(tool.co2G)}</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-chart-2 rounded-full" style={{ width: `${pctOfMax}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tool data available.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Goals on Track</CardTitle>
                  <Link href="/goals" className="text-sm text-primary hover:underline">
                    Manage
                  </Link>
                </CardHeader>
                <CardContent>
                  {data.goalStatuses && data.goalStatuses.length > 0 ? (
                    <div className="space-y-4">
                      {data.goalStatuses.map(goal => {
                        const percent = Math.min(100, Math.max(0, goal.percentUsed));
                        const barColor = percent < 70 ? "bg-chart-1" : percent < 100 ? "bg-chart-4" : "bg-destructive";
                        
                        return (
                          <div key={goal.id} className="space-y-2 p-3 rounded-lg border bg-muted/10">
                            <div className="flex justify-between items-start text-sm">
                              <div>
                                <div className="font-medium">{goal.name}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {formatGoalValue(goal.metric, goal.currentValue)} / {formatGoalValue(goal.metric, goal.targetValue)}
                                </div>
                              </div>
                              {goal.onTrack ? (
                                <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20 font-normal">On Track</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-normal">Exceeded</Badge>
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-lg">
                      <Award className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground mb-2">No active goals</p>
                      <Link href="/goals" className="text-sm text-primary hover:underline font-medium">
                        Set a goal to track your limits
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {data.peakDay && (
                <Card className="shadow-sm border-primary/20 bg-primary/5">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-primary-foreground mb-1">Heaviest Day</h4>
                      <p className="text-sm font-medium mb-1">{format(new Date(data.peakDay.date), 'EEEE, MMM d')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCo2(data.peakDay.co2G)} CO2 • {formatWater(data.peakDay.waterMl)} Water • {data.peakDay.sessions} sessions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {!data.peakDay && (
                <Card className="shadow-sm border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No activity recorded</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
