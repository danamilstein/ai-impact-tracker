import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, getListGoalsQueryKey, GoalWithProgress } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Droplets, Wind, Zap, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  metric: z.enum(["water_ml", "co2_g", "energy_wh"]),
  period: z.enum(["weekly", "monthly"]),
  targetValue: z.coerce.number().min(0.1, "Must be greater than 0"),
});

export default function Goals() {
  const { data: goals, isLoading } = useListGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      metric: "co2_g",
      period: "weekly",
      targetValue: 10,
    }
  });

  const onSubmit = (data: z.infer<typeof goalSchema>) => {
    createGoal.mutate({
      data: {
        name: data.name,
        metric: data.metric,
        period: data.period,
        targetValue: data.targetValue,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Goal created" });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        form.reset();
      }
    });
  };

  const handleUpdate = (id: number, currentName: string, currentTarget: number) => {
    const newName = prompt("Goal name:", currentName) || currentName;
    const newTargetStr = prompt("Target value:", currentTarget.toString());
    
    if (!newTargetStr) return;
    const newTarget = parseFloat(newTargetStr);
    
    if (isNaN(newTarget) || newTarget <= 0) {
      toast({ title: "Invalid target value", variant: "destructive" });
      return;
    }

    updateGoal.mutate({
      id,
      data: { name: newName, targetValue: newTarget }
    }, {
      onSuccess: () => {
        toast({ title: "Goal updated" });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        setEditingId(null);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoal.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Goal deleted" });
          queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        }
      });
    }
  };

  const formatValue = (metric: string, val: number) => {
    if (metric === "water_ml") {
      return val >= 1000 ? `${(val / 1000).toFixed(1)} L` : `${Math.round(val)} ml`;
    }
    if (metric === "co2_g") {
      return val >= 1000 ? `${(val / 1000).toFixed(1)} kg` : `${Math.round(val)} g`;
    }
    if (metric === "energy_wh") {
      return val >= 1000 ? `${(val / 1000).toFixed(1)} kWh` : `${Math.round(val)} Wh`;
    }
    return val.toString();
  };

  const getMetricIcon = (metric: string) => {
    if (metric === "water_ml") return <Droplets className="w-4 h-4 text-chart-1" />;
    if (metric === "co2_g") return <Wind className="w-4 h-4 text-chart-2" />;
    if (metric === "energy_wh") return <Zap className="w-4 h-4 text-chart-3" />;
    return null;
  };

  const getUnitLabel = (metric: string) => {
    if (metric === "water_ml") return "ml";
    if (metric === "co2_g") return "g";
    if (metric === "energy_wh") return "Wh";
    return "";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
        <p className="text-muted-foreground mt-1">Set and track environmental impact limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full h-32 bg-muted rounded-xl animate-pulse"></div>
        ) : goals?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-xl bg-card">
            No goals set yet. Create one below.
          </div>
        ) : (
          goals?.map((goal: GoalWithProgress) => {
            const percent = Math.min(100, Math.max(0, goal.percentUsed));
            const barColor = percent < 70 ? "bg-chart-1" : percent < 100 ? "bg-chart-4" : "bg-destructive";
            
            return (
              <Card key={goal.id} className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {goal.name}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {goal.period}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      {getMetricIcon(goal.metric)}
                      <span className="capitalize">{goal.metric.replace('_ml', '').replace('_g', '').replace('_wh', '')}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleUpdate(goal.id, goal.name, goal.targetValue)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{formatValue(goal.metric, goal.currentValue)}</span>
                      <span className="text-muted-foreground">{formatValue(goal.metric, goal.targetValue)}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="shadow-sm mt-8 border-primary/20">
        <CardHeader>
          <CardTitle>Add a Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Weekly Carbon Budget" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metric"
                render={({ field }) => (
                  <FormItem className="w-full md:w-32">
                    <FormLabel>Metric</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="water_ml">Water</SelectItem>
                        <SelectItem value="co2_g">Carbon</SelectItem>
                        <SelectItem value="energy_wh">Energy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem className="w-full md:w-32">
                    <FormLabel>Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem className="w-full md:w-32">
                    <FormLabel>Limit ({getUnitLabel(form.watch("metric"))})</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto" disabled={createGoal.isPending}>
                Add Goal
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
