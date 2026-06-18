import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightSettings } from "@/components/insight-banner";
import { getMode, setMode, type InsightMode } from "@/lib/insights";

export default function Settings() {
  const [mode, setModeState] = useState<InsightMode>(() => getMode());

  function handleChange(next: InsightMode) {
    setModeState(next);
    setMode(next);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Tune how the Tracker behaves for you.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Post-calculation insights</CardTitle>
          <CardDescription>
            A short, dismissible note that appears at the top of the result area after each calculation —
            context for the magnitude, a methodology pointer, or a small fact.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InsightSettings mode={mode} onChange={handleChange} />
          <p className="text-xs text-muted-foreground">
            How often you see these is decided entirely on your device. The Tracker keeps no record of which
            insights you see or dismiss.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
