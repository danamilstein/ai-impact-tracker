import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useListTools, useCreateSession, getListSessionsQueryKey, getGetStatsSummaryQueryKey, getGetStatsByToolQueryKey, getGetStatsTrendQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { EnvironmentalFact } from "@/components/environmental-fact";
import { Check, ChevronsUpDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isLowConfidence } from "@/lib/tool-sources";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CATEGORY_ORDER = ["code", "image", "audio", "video", "text", "multimodal", "productivity"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  text: "Text",
  code: "Code",
  image: "Image",
  audio: "Audio",
  video: "Video",
  multimodal: "Multimodal",
  productivity: "Productivity",
};

const ACTIVITY_TYPES = ["queries", "research", "composing", "visualizing", "programming"] as const;
const ACTIVITY_LABEL: Record<string, string> = {
  queries: "Asking questions / chatting",
  research: "Research",
  composing: "Writing / composing",
  visualizing: "Generating images or visuals",
  programming: "Programming / coding",
};

function todayLocalIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const logSchema = z.object({
  toolId: z.string().min(1, "Please select a tool"),
  activityType: z.enum(ACTIVITY_TYPES),
  durationMinutes: z.coerce.number().min(1, "Must be at least 1 minute"),
  complexity: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
  sessionDate: z.string().optional()
});

export default function LogSession() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tools, isLoading: loadingTools } = useListTools();
  const createSession = useCreateSession();
  const [toolPopoverOpen, setToolPopoverOpen] = useState(false);

  const toolsByCategory = useMemo(() => {
    const grouped = new Map<string, NonNullable<typeof tools>>();
    for (const tool of tools ?? []) {
      const list = grouped.get(tool.category) ?? [];
      list.push(tool);
      grouped.set(tool.category, list);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return CATEGORY_ORDER
      .filter((c) => grouped.has(c))
      .map((c) => ({ category: c as string, tools: grouped.get(c)! }));
  }, [tools]);

  const [submittedSession, setSubmittedSession] = useState<{
    co2G: number;
    waterMl: number;
    energyWh: number;
    toolName: string;
    activityType: string;
    durationMinutes: number;
    complexity: string;
    sessionKey: string;
  } | null>(null);

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      toolId: "",
      activityType: "queries",
      durationMinutes: 15,
      complexity: "medium",
      notes: "",
      sessionDate: todayLocalIso()
    }
  });

  const [prefillSource, setPrefillSource] = useState<string | null>(null);
  const prefillApplied = useRef(false);

  useEffect(() => {
    if (prefillApplied.current) return;
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (!from) return;
    if (!tools) return;
    prefillApplied.current = true;

    const toolParam = params.get("tool");
    if (toolParam) {
      const q = toolParam.toLowerCase();
      const match =
        tools.find((t) => t.name.toLowerCase().includes(q)) ??
        tools.find((t) => t.provider.toLowerCase().includes(q));
      if (match) form.setValue("toolId", match.id.toString());
    }

    const duration = Number(params.get("duration"));
    if (Number.isFinite(duration) && duration >= 1) {
      form.setValue("durationMinutes", duration);
    }

    const complexity = params.get("complexity");
    if (complexity === "low" || complexity === "medium" || complexity === "high") {
      form.setValue("complexity", complexity);
    }

    const activity = params.get("activity");
    if (activity && (ACTIVITY_TYPES as readonly string[]).includes(activity)) {
      form.setValue("activityType", activity as (typeof ACTIVITY_TYPES)[number]);
    }

    const notes = params.get("notes");
    if (notes) form.setValue("notes", notes);

    setPrefillSource(from);
  }, [tools, form]);

  const onSubmit = (data: z.infer<typeof logSchema>) => {
    createSession.mutate({
      data: {
        toolId: parseInt(data.toolId),
        activityType: data.activityType,
        durationMinutes: data.durationMinutes,
        complexity: data.complexity,
        notes: data.notes || null,
        sessionDate: data.sessionDate || null
      }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Session logged successfully",
          description: "Your impact has been recorded.",
        });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsByToolQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsTrendQueryKey() });
        
        const selectedTool = tools?.find(t => t.id === parseInt(form.getValues("toolId")));
        setSubmittedSession({
          co2G: data.co2G,
          waterMl: data.waterMl,
          energyWh: data.energyWh,
          toolName: selectedTool?.name ?? "AI Tool",
          activityType: form.getValues("activityType"),
          durationMinutes: form.getValues("durationMinutes"),
          complexity: form.getValues("complexity"),
          sessionKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        });
      },
      onError: (err) => {
        toast({
          title: "Failed to log session",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    });
  };

  if (submittedSession) {
    return (
      <EnvironmentalFact 
        co2G={submittedSession.co2G} 
        waterMl={submittedSession.waterMl}
        energyWh={submittedSession.energyWh}
        toolName={submittedSession.toolName}
        activityType={submittedSession.activityType}
        durationMinutes={submittedSession.durationMinutes}
        complexity={submittedSession.complexity}
        sessionKey={submittedSession.sessionKey}
        onReset={() => {
          form.reset();
          setSubmittedSession(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Log a Session</h2>
        <p className="text-muted-foreground mt-1">Record your AI tool usage to track its environmental footprint.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Faster ways to log:{" "}
          <Link href="/bookmarklet" className="text-primary hover:underline">
            Quick-Log bookmarklet
          </Link>{" "}
          ·{" "}
          <Link href="/import" className="text-primary hover:underline">
            Import from an AI session
          </Link>
        </p>
      </div>

      {prefillSource && (
        <Alert className="bg-primary/5 border-primary/20">
          <Check className="h-4 w-4 text-primary" />
          <AlertDescription className="text-muted-foreground">
            We pre-filled this form from your{" "}
            {prefillSource === "bookmarklet" ? "Quick-Log bookmarklet" : "imported session"}. Review
            the details below and save when they look right.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="toolId"
                render={({ field }) => {
                  const selectedTool = tools?.find(t => t.id.toString() === field.value);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>AI Tool</FormLabel>
                      <Popover open={toolPopoverOpen} onOpenChange={setToolPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              disabled={loadingTools}
                              className={cn(
                                "w-full justify-between font-normal",
                                !selectedTool && "text-muted-foreground"
                              )}
                            >
                              {selectedTool ? (
                                <span className="truncate flex items-center gap-2">
                                  <span className="truncate">
                                    {selectedTool.name}
                                    <span className="text-muted-foreground ml-2">({selectedTool.provider})</span>
                                  </span>
                                  {isLowConfidence(selectedTool.name) && (
                                    <Badge variant="outline" className="shrink-0 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-normal">
                                      low confidence
                                    </Badge>
                                  )}
                                </span>
                              ) : (
                                loadingTools ? "Loading tools..." : "Search or select a tool..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command
                            filter={(value, search) => {
                              if (!search) return 1;
                              return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                            }}
                          >
                            <CommandInput placeholder="Search by tool or provider..." />
                            <CommandList className="max-h-72">
                              <CommandEmpty>No tools found.</CommandEmpty>
                              {toolsByCategory.map(({ category, tools: catTools }, idx) => (
                                <div key={category}>
                                  {idx > 0 && <CommandSeparator />}
                                  <CommandGroup heading={CATEGORY_LABEL[category] ?? category}>
                                    {catTools.map(tool => (
                                      <CommandItem
                                        key={tool.id}
                                        value={`${tool.name} ${tool.provider}`}
                                        onSelect={() => {
                                          field.onChange(tool.id.toString());
                                          setToolPopoverOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === tool.id.toString() ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <span className="truncate flex items-center gap-2">
                                          <span className="truncate">
                                            {tool.name}
                                            <span className="text-muted-foreground ml-2">({tool.provider})</span>
                                          </span>
                                          {isLowConfidence(tool.name) && (
                                            <Badge variant="outline" className="shrink-0 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-normal">
                                              low confidence
                                            </Badge>
                                          )}
                                        </span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </div>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="activityType"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <FormLabel>Activity Type</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              aria-label="What counts as a query?"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-80 text-sm space-y-2">
                            <p className="font-medium text-foreground">What counts as a query?</p>
                            <p className="text-muted-foreground">
                              One query = one message you send to the tool (one prompt and its
                              response). The Tracker estimates how many queries your session
                              contained from its <span className="font-medium text-foreground">duration</span> and{" "}
                              <span className="font-medium text-foreground">activity type</span>, since
                              different activities involve different message rates.
                            </p>
                            <p className="text-muted-foreground">
                              Follow-up messages, regenerations, and retries each count as their own
                              query. Background calls a tool makes on its own (multi-step retrieval,
                              agent loops) aren't visible to you and may be under-counted.
                            </p>
                            <a href="/methodology#queries" className="text-primary hover:underline not-italic">
                              See the full breakdown →
                            </a>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {ACTIVITY_TYPES.map(type => (
                            <option key={type} value={type}>{ACTIVITY_LABEL[type]}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>What were you doing with the tool?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="15" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>How long was the session?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sessionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="md:max-w-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Complexity</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md">
                          <FormControl>
                            <RadioGroupItem value="low" />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="font-normal block cursor-pointer">Low Complexity</FormLabel>
                            <FormDescription className="text-xs">Simple questions, small text generation (0.5x multiplier)</FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="font-normal block cursor-pointer">Medium Complexity</FormLabel>
                            <FormDescription className="text-xs">Standard coding tasks, detailed research (1x multiplier)</FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md">
                          <FormControl>
                            <RadioGroupItem value="high" />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="font-normal block cursor-pointer">High Complexity</FormLabel>
                            <FormDescription className="text-xs">Image/video generation, massive context windows (2x multiplier)</FormDescription>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What were you working on?" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={createSession.isPending}>
                {createSession.isPending ? "Logging Session..." : "Log Impact"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
