import { useListTools } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Wind, Zap } from "lucide-react";
import { formatWater, formatCo2, formatEnergy } from "@/lib/utils";
import { SuggestToolForm } from "@/components/suggest-tool-form";

export default function Tools() {
  const { data: tools, isLoading } = useListTools();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tool Catalog</h2>
        <p className="text-muted-foreground mt-1">Environmental coefficients per query for supported AI models.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse"></div>)}
        </div>
      ) : tools && tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <Card key={tool.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <CardDescription>{tool.provider}</CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">{tool.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><Droplets className="w-4 h-4 mr-2 text-chart-1" /> Water</span>
                    <span className="font-mono">{tool.waterPerQueryMl.toFixed(2)} ml</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><Wind className="w-4 h-4 mr-2 text-chart-2" /> CO2</span>
                    <span className="font-mono">{tool.co2PerQueryG.toFixed(2)} g</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><Zap className="w-4 h-4 mr-2 text-chart-3" /> Energy</span>
                    <span className="font-mono">{tool.energyPerQueryWh.toFixed(2)} Wh</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No tools available in the catalog.</p>
        </div>
      )}

      <SuggestToolForm />
    </div>
  );
}
