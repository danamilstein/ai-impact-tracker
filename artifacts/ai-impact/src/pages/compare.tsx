import { useMemo, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useListTools } from "@workspace/api-client-react";
import { ToolPicker } from "@/components/tool-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Info, Zap, Cloud, Droplets } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const COMPLEXITY_MULTIPLIERS = { low: 0.5, medium: 1.0, high: 2.0 };

function computeImpact(tool: any, queries: number, complexity: keyof typeof COMPLEXITY_MULTIPLIERS) {
  if (!tool) return { energyWh: 0, co2G: 0, waterMl: 0 };
  const mult = COMPLEXITY_MULTIPLIERS[complexity];
  return {
    energyWh: tool.energyPerQueryWh * queries * mult,
    co2G: tool.co2PerQueryG * queries * mult,
    waterMl: tool.waterPerQueryMl * queries * mult,
  };
}

export default function Compare() {
  const { data: tools = [], isLoading: toolsLoading } = useListTools();
  const searchString = useSearch();
  const [_, setLocation] = useLocation();

  const searchParams = new URLSearchParams(searchString);
  const queries = parseInt(searchParams.get("queries") || "10", 10);
  const complexity = (searchParams.get("complexity") as any) || "medium";

  // Resolve tool IDs from URL params (if valid against loaded tools), otherwise
  // fall back to friendly defaults once tools have loaded.
  const urlA = searchParams.get("a");
  const urlB = searchParams.get("b");
  const parsedA = urlA != null ? parseInt(urlA, 10) : NaN;
  const parsedB = urlB != null ? parseInt(urlB, 10) : NaN;
  const validA = tools.some(t => t.id === parsedA) ? parsedA : undefined;
  const validB = tools.some(t => t.id === parsedB) ? parsedB : undefined;
  const leftToolId =
    validA ??
    (tools.length > 0 ? (tools.find(t => t.name === "ChatGPT (GPT-4o)")?.id ?? tools[0]?.id) : undefined);
  const rightToolId =
    validB ??
    (tools.length > 0 ? (tools.find(t => t.name === "Gemini 1.5 Flash")?.id ?? tools[1]?.id ?? tools[0]?.id) : undefined);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchString);
    params.set(key, value);
    setLocation(`?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    if (tools.length === 0) return;
    const params = new URLSearchParams(searchString);
    let changed = false;
    if (validA === undefined && leftToolId !== undefined) {
      params.set("a", leftToolId.toString());
      changed = true;
    }
    if (validB === undefined && rightToolId !== undefined) {
      params.set("b", rightToolId.toString());
      changed = true;
    }
    if (!params.has("queries")) { params.set("queries", "10"); changed = true; }
    if (!params.has("complexity")) { params.set("complexity", "medium"); changed = true; }
    if (changed) setLocation(`?${params.toString()}`, { replace: true });
  }, [tools.length, searchString, setLocation, validA, validB, leftToolId, rightToolId]);

  const leftTool = tools.find(t => t.id === leftToolId);
  const rightTool = tools.find(t => t.id === rightToolId);

  const leftImpact = computeImpact(leftTool, queries, complexity);
  const rightImpact = computeImpact(rightTool, queries, complexity);

  const calculateRatio = (left: number, right: number) => {
    if (left === 0 && right === 0) return { leftPct: 50, rightPct: 50 };
    if (left === 0) return { leftPct: 0, rightPct: 100 };
    if (right === 0) return { leftPct: 100, rightPct: 0 };
    
    const max = Math.max(left, right);
    return {
      leftPct: (left / max) * 100,
      rightPct: (right / max) * 100
    };
  };

  const differenceRatio = useMemo(() => {
    if (!leftImpact.co2G || !rightImpact.co2G) return 1;
    return leftImpact.co2G > rightImpact.co2G 
      ? leftImpact.co2G / rightImpact.co2G 
      : rightImpact.co2G / leftImpact.co2G;
  }, [leftImpact, rightImpact]);

  const higherToolName = leftImpact.co2G > rightImpact.co2G ? leftTool?.name : rightTool?.name;
  const lowerToolName = leftImpact.co2G > rightImpact.co2G ? rightTool?.name : leftTool?.name;
  const savingsPct = Math.round((1 - (1 / differenceRatio)) * 100);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-8 pb-12">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Compare Tools</h1>
        <p className="text-lg text-muted-foreground">
          See how much your choice of AI model matters.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="queries">Number of Queries</Label>
              <Input 
                id="queries"
                type="number" 
                min="1" 
                value={queries} 
                onChange={e => updateUrl("queries", Math.max(1, parseInt(e.target.value) || 1).toString())} 
              />
            </div>
            <div className="space-y-2">
              <Label>Query Complexity</Label>
              <ToggleGroup 
                type="single" 
                value={complexity} 
                onValueChange={(v) => v && updateUrl("complexity", v)}
                className="justify-start"
              >
                <ToggleGroupItem value="low" aria-label="Low">Low</ToggleGroupItem>
                <ToggleGroupItem value="medium" aria-label="Medium">Medium</ToggleGroupItem>
                <ToggleGroupItem value="high" aria-label="High">High</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-0">
          <Card className="border-2 border-muted relative">
            <CardHeader className="pb-4">
              <ToolPicker
                tools={tools}
                value={leftToolId?.toString()}
                onChange={(v) => updateUrl("a", v)}
                loading={toolsLoading}
              />
              <div className="flex gap-2 pt-2">
                {leftTool && (
                  <>
                    <Badge variant="outline">{leftTool.provider}</Badge>
                    <Badge variant="secondary" className="capitalize">{leftTool.category}</Badge>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-500">
                  <Zap className="w-4 h-4 mr-2" /> Energy
                </div>
                <div className="text-3xl font-mono">{leftImpact.energyWh.toFixed(2)} <span className="text-sm text-muted-foreground">Wh</span></div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                  <Cloud className="w-4 h-4 mr-2" /> Carbon
                </div>
                <div className="text-3xl font-mono">{leftImpact.co2G.toFixed(2)} <span className="text-sm text-muted-foreground">g CO₂</span></div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-500">
                  <Droplets className="w-4 h-4 mr-2" /> Water
                </div>
                <div className="text-3xl font-mono">{leftImpact.waterMl.toFixed(2)} <span className="text-sm text-muted-foreground">ml</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted">
            <CardHeader className="pb-4">
              <ToolPicker
                tools={tools}
                value={rightToolId?.toString()}
                onChange={(v) => updateUrl("b", v)}
                loading={toolsLoading}
              />
              <div className="flex gap-2 pt-2">
                {rightTool && (
                  <>
                    <Badge variant="outline">{rightTool.provider}</Badge>
                    <Badge variant="secondary" className="capitalize">{rightTool.category}</Badge>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-500">
                  <Zap className="w-4 h-4 mr-2" /> Energy
                </div>
                <div className="text-3xl font-mono">{rightImpact.energyWh.toFixed(2)} <span className="text-sm text-muted-foreground">Wh</span></div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                  <Cloud className="w-4 h-4 mr-2" /> Carbon
                </div>
                <div className="text-3xl font-mono">{rightImpact.co2G.toFixed(2)} <span className="text-sm text-muted-foreground">g CO₂</span></div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-500">
                  <Droplets className="w-4 h-4 mr-2" /> Water
                </div>
                <div className="text-3xl font-mono">{rightImpact.waterMl.toFixed(2)} <span className="text-sm text-muted-foreground">ml</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-border font-bold text-muted-foreground shadow-sm">
          VS
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">
              {leftImpact.co2G === rightImpact.co2G ? (
                "Both tools have the same environmental impact."
              ) : (
                <span>
                  <span className="text-primary">{higherToolName}</span> uses <span className="font-mono text-2xl mx-1">{differenceRatio.toFixed(1)}×</span> more resources than <span className="text-primary">{lowerToolName}</span>
                </span>
              )}
            </h3>
            
            {differenceRatio >= 5 && savingsPct > 0 && (
              <p className="text-sm font-medium text-primary">
                Choosing {lowerToolName} for this task would save {savingsPct}% of the environmental impact.
              </p>
            )}
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Energy Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Energy</span>
              </div>
              <div className="flex gap-2 h-4 items-center">
                <div className="h-full bg-amber-500/80 rounded-sm transition-all duration-500" style={{ width: `${calculateRatio(leftImpact.energyWh, rightImpact.energyWh).leftPct}%` }} />
                <div className="w-px h-full bg-border" />
                <div className="h-full bg-amber-500/30 rounded-sm transition-all duration-500" style={{ width: `${calculateRatio(leftImpact.energyWh, rightImpact.energyWh).rightPct}%` }} />
              </div>
            </div>
            {/* Carbon Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Carbon</span>
              </div>
              <div className="flex gap-2 h-4 items-center">
                <div className="h-full bg-slate-500/80 rounded-sm transition-all duration-500" style={{ width: `${calculateRatio(leftImpact.co2G, rightImpact.co2G).leftPct}%` }} />
                <div className="w-px h-full bg-border" />
                <div className="h-full bg-slate-500/30 rounded-sm transition-all duration-500" style={{ width: `${calculateRatio(leftImpact.co2G, rightImpact.co2G).rightPct}%` }} />
              </div>
            </div>
            {/* Water Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Water</span>
              </div>
              <div className="flex gap-2 h-4 items-center">
                <div className="h-full bg-emerald-500/80 rounded-sm transition-all duration-500" style={{ width: `${calculateRatio(leftImpact.waterMl, rightImpact.waterMl).leftPct}%` }} />
                <div className="w-px h-full bg-border" />
                <div className="h-full bg-emerald-500/30 rounded-sm transition-all duration-500" style={{ width: `${calculateRatio(leftImpact.waterMl, rightImpact.waterMl).rightPct}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">Why this matters:</strong> Most AI tasks don't require the most powerful model. Using Gemini Flash or Claude Haiku instead of GPT-4o for everyday questions reduces per-query energy by up to 7×, with no meaningful quality difference for most use cases.
        </AlertDescription>
      </Alert>
    </div>
  );
}
