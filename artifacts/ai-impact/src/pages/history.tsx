import { useState } from "react";
import { useListSessions, useDeleteSession, useListTools, getListSessionsQueryKey, getGetStatsSummaryQueryKey, getGetStatsByToolQueryKey, getGetStatsTrendQueryKey } from "@workspace/api-client-react";
import { formatWater, formatCo2, formatEnergy, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, AlertCircle, FilterX } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

export default function History() {
  const [page, setPage] = useState(1);
  const [toolFilter, setToolFilter] = useState<string>("all");
  
  const { data: tools } = useListTools();
  
  const queryParams = {
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
    ...(toolFilter !== "all" && { toolId: parseInt(toolFilter) })
  };

  const { data: sessions, isLoading } = useListSessions(queryParams);
  const deleteSession = useDeleteSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsByToolQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsTrendQueryKey() });
          toast({
            title: "Session deleted",
            description: "The session has been removed from your history.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete session.",
            variant: "destructive"
          });
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session History</h2>
          <p className="text-muted-foreground mt-1">A complete record of your tracked AI interactions.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={toolFilter} onValueChange={(v) => { setToolFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Filter by tool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              {tools?.map(tool => (
                <SelectItem key={tool.id} value={tool.id.toString()}>{tool.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {toolFilter !== "all" && (
            <Button variant="ghost" size="icon" onClick={() => { setToolFilter("all"); setPage(1); }} title="Clear filter">
              <FilterX className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse"></div>)}
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {sessions.map(session => (
              <Card key={session.id} className="shadow-sm">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{session.toolName}</h3>
                      <Badge variant="secondary" className="capitalize text-xs font-normal">{session.complexity}</Badge>
                      <span className="text-xs text-muted-foreground">{session.sessionDate ? formatDate(session.sessionDate) : formatDate(session.createdAt)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.activityType && session.durationMinutes ? (
                        <span className="capitalize">{session.activityType} &middot; {session.durationMinutes} min</span>
                      ) : (
                        <span>{session.queryCount} {session.queryCount === 1 ? "query" : "queries"}</span>
                      )}
                    </div>
                    {session.notes && (
                      <div className="mt-2 text-sm bg-muted/50 p-2 rounded-md border text-muted-foreground">
                        {session.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex gap-4 text-sm font-mono">
                      <div className="flex flex-col items-end">
                        <span className="text-chart-1 font-semibold">{formatWater(session.waterMl)}</span>
                        <span className="text-xs text-muted-foreground uppercase">Water</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-chart-2 font-semibold">{formatCo2(session.co2G)}</span>
                        <span className="text-xs text-muted-foreground uppercase">CO2</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-chart-3 font-semibold">{formatEnergy(session.energyWh)}</span>
                        <span className="text-xs text-muted-foreground uppercase">Energy</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(session.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      disabled={deleteSession.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => p + 1)}
              disabled={sessions.length < ITEMS_PER_PAGE}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-1">No sessions found</h3>
          <p className="text-muted-foreground max-w-sm">No recorded AI usage matches your filters.</p>
        </div>
      )}
    </div>
  );
}
