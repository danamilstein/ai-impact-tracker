import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { Link } from "wouter";
import { formatCo2, formatWater } from "@/lib/utils";
import { SessionShareCard } from "@/components/session-share-card";
import { InsightBanner } from "@/components/insight-banner";
import { WellnessReflection } from "@/components/wellness-reflection";

const FACTS = [
  {
    fact: "Training GPT-3 emitted roughly 552 tonnes of CO₂ — equivalent to the lifetime emissions of five average American cars.",
    cta: "Prefer smaller models when a simple task doesn't need a large one."
  },
  {
    fact: "A single data center can use as much water as 100,000 homes in a year, primarily for cooling servers.",
    cta: "Ask your AI provider about their water recycling and cooling efficiency commitments."
  },
  {
    fact: "Generating one AI image can consume as much energy as charging a smartphone to full.",
    cta: "Batch your image requests and reuse outputs rather than regenerating similar variants."
  },
  {
    fact: "The global AI industry's electricity demand is projected to triple between 2023 and 2026.",
    cta: "Choose AI tools from providers who commit to renewable energy procurement."
  },
  {
    fact: "Asking an AI to write a poem uses roughly 10× less energy than asking it to generate a high-resolution image.",
    cta: "Match the model to the task — not every job needs the most powerful tool available."
  },
  {
    fact: "Microsoft reported that its water consumption increased 34% in 2022, largely driven by AI infrastructure growth.",
    cta: "Pressure the tools you use to publish annual environmental impact reports."
  },
  {
    fact: "Renewable energy now powers over 90% of Google's data centers on an annual basis — but only when averaged across regions.",
    cta: "Use AI tools during off-peak hours when grids run on cleaner energy mixes."
  },
  {
    fact: "A single LLM inference request can use between 0.001 and 0.01 kWh — roughly the same as leaving an LED bulb on for 6–60 minutes.",
    cta: "Write clearer, more specific prompts so you need fewer follow-up queries."
  },
  {
    fact: "The carbon footprint of a conversation with a large language model is roughly 4–8× higher than a standard web search.",
    cta: "Use traditional search for factual lookups and reserve AI for tasks that genuinely benefit from it."
  },
  {
    fact: "Data centers currently account for about 1–2% of global electricity consumption — a share expected to grow significantly with AI adoption.",
    cta: "Support legislation that requires data centers to report emissions and efficiency metrics."
  },
  {
    fact: "A single AI training run for a large model can consume more electricity than 100 US households use in an entire year.",
    cta: "Prefer fine-tuned or smaller specialized models over repeatedly prompting frontier models."
  },
  {
    fact: "Water stress affects 40% of the global population — data center water withdrawal puts pressure on local watersheds.",
    cta: "Check if your AI provider's data centers are located in water-stressed regions."
  },
  {
    fact: "The 'rebound effect' in AI — where efficiency gains lead to increased usage — could negate environmental improvements over time.",
    cta: "Set a monthly query budget for yourself and stick to it, regardless of how easy access becomes."
  },
  {
    fact: "Shorter prompts and fewer back-and-forth turns reduce inference cost. A single well-crafted prompt can replace 5–10 iterative ones.",
    cta: "Take 30 seconds to plan your prompt before typing — it pays off in both quality and efficiency."
  },
  {
    fact: "AI workloads are increasingly shifting to the edge — on-device models like those in phones use a fraction of the energy of cloud-hosted ones.",
    cta: "Use on-device AI features when they're available, such as those built into modern smartphones."
  },
  {
    fact: "The amount of CO₂ required to power a single ChatGPT query is equivalent to roughly 4 grams — small alone, but 10 million queries = 40 tonnes.",
    cta: "Collective individual choices at scale create measurable change. Your habits matter."
  },
  {
    fact: "GitHub Copilot uses significantly less energy per interaction than a full chat session, because it generates shorter completions.",
    cta: "For code tasks, prefer targeted completion tools over open-ended chat where possible."
  },
  {
    fact: "Some AI providers now offer 'efficiency modes' that route queries to smaller models when full capability isn't needed.",
    cta: "Check if your preferred tool has a low-power or efficiency mode and use it by default."
  },
  {
    fact: "The IEA estimates AI could add the equivalent of a new country's worth of electricity demand to global grids by 2026.",
    cta: "Advocate within your organization for an AI usage policy that includes environmental criteria."
  },
  {
    fact: "Quantized and distilled AI models can achieve 80–90% of the performance of full models at 10–20% of the energy cost.",
    cta: "When evaluating AI tools for your team, ask vendors about their model efficiency benchmarks."
  },
  {
    fact: "Running AI inference during nighttime hours in regions with high renewable penetration can cut carbon intensity by up to 50%.",
    cta: "Schedule non-urgent AI batch tasks for overnight processing if your tools allow it."
  },
  {
    fact: "A typical AI-assisted coding session generates more CO₂ than the entire compilation of the resulting code.",
    cta: "Keep a log of what you use AI for — awareness is the first step toward intentional use."
  },
  {
    fact: "Prompt caching — where providers reuse previous computations — can reduce energy use by up to 90% for repeated context.",
    cta: "Structure long conversations to start with stable context so caching can kick in."
  },
  {
    fact: "The average knowledge worker now uses AI tools daily. Aggregated across a company of 1,000, that's potentially tonnes of CO₂ per month.",
    cta: "Share this tracker with your team and propose a team-level carbon budget for AI use."
  },
  {
    fact: "Frontier model providers increasingly use nuclear and geothermal energy to power their data centers — low-carbon but not zero-carbon.",
    cta: "Ask your AI vendor what percentage of their energy mix is genuinely carbon-free."
  }
];

export function EnvironmentalFact({ 
  co2G, 
  waterMl,
  energyWh,
  toolName,
  activityType,
  durationMinutes,
  complexity,
  sessionKey,
  onReset 
}: { 
  co2G: number; 
  waterMl: number;
  energyWh: number;
  toolName: string;
  activityType: string;
  durationMinutes: number;
  complexity: string;
  sessionKey: string;
  onReset: () => void;
}) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    setFactIndex(Math.floor(Math.random() * FACTS.length));
  }, []);

  const currentFact = FACTS[factIndex];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <InsightBanner
        energyWh={energyWh}
        waterMl={waterMl}
        co2G={co2G}
        toolName={toolName}
        sessionKey={sessionKey}
      />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
          <Leaf className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Session Logged</h2>
        <p className="text-muted-foreground">
          This session generated approximately <span className="font-medium text-foreground">{formatCo2(co2G)}</span> of CO₂ and consumed <span className="font-medium text-foreground">{formatWater(waterMl)}</span> of water.
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20 shadow-none">
        <CardContent className="pt-6 space-y-4 text-center">
          <p className="text-lg font-medium text-foreground leading-relaxed">
            "{currentFact.fact}"
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            {currentFact.cta}
          </p>
        </CardContent>
      </Card>

      <SessionShareCard
        toolName={toolName}
        co2G={co2G}
        waterMl={waterMl}
        energyWh={energyWh}
        activityType={activityType}
        durationMinutes={durationMinutes}
        complexity={complexity}
      />

      <WellnessReflection sessionKey={sessionKey} />

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
          Log Another Session
        </Button>
        <Link href="/">
          <Button className="w-full sm:w-auto">
            View Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
