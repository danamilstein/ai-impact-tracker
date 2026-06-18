import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, XCircle } from "lucide-react";
import { useListTools } from "@workspace/api-client-react";
import { getToolSource, SOURCE_CATEGORY_STYLES, CATALOG_REFRESH_DATE } from "@/lib/tool-sources";
import { REGION_WUE, FALLBACK_WUE } from "@/lib/grid-regions";
import { TRAINING_FOOTPRINT, TRAINING_CONFIDENCE_STYLES } from "@/lib/training-footprint";
import { markMethodologyVisited } from "@/lib/insights";
import { ENERGY_COMPARISONS } from "@/lib/energy-comparisons";
import { SEVEN_DIMENSIONS } from "@/lib/wellness";

const ACTIVITY_RATES: { activity: string; perMinute: number }[] = [
  { activity: "Asking questions / chatting", perMinute: 4 },
  { activity: "Research", perMinute: 2 },
  { activity: "Writing / composing", perMinute: 1.5 },
  { activity: "Programming / coding", perMinute: 2 },
  { activity: "Generating images or visuals", perMinute: 0.5 },
];

const CATEGORY_MODIFIERS: { category: string; modifier: number; note: string }[] = [
  { category: "Text chat", modifier: 1.0, note: "Baseline — short back-and-forth messages." },
  { category: "Code", modifier: 1.5, note: "Many rapid completions and edits per minute." },
  { category: "Productivity", modifier: 1.0, note: "Embedded assistants, chat-like cadence." },
  { category: "Multimodal", modifier: 0.8, note: "Mixed text + media, slightly heavier turns." },
  { category: "Image", modifier: 0.4, note: "A generation every minute or two." },
  { category: "Audio", modifier: 0.3, note: "Music / voice generation is slow." },
  { category: "Video", modifier: 0.2, note: "A few heavy generations per session." },
];

function gridDataSource(dataCenterRegion: string): "live" | "static" {
  return /china|europe|\beu\b|eu-|france|united kingdom|\buk\b/i.test(dataCenterRegion)
    ? "static"
    : "live";
}

const DATA_CENTER_TOOLS = [
  "ChatGPT (GPT-4o)",
  "Claude 3.5 Sonnet",
  "Gemini 2.0 Flash",
  "Microsoft Copilot",
  "GitHub Copilot",
  "Grok",
  "Perplexity AI",
  "Llama 3.1 (70B)",
] as const;

const RELATED_TOOLS: {
  name: string;
  url: string;
  purpose: string;
  audience: string;
  relationship: string;
}[] = [
  {
    name: "What Uses More",
    url: "https://what-uses-more.com/",
    purpose:
      "A web-based classroom comparison activity that asks students to choose between two options (e.g., one AI image generation vs. one Google search × 1,000) and reveals which uses more energy.",
    audience:
      "Faculty using the activity in a single class period for awareness and discussion; students engaging with AI environmental cost for the first time.",
    relationship:
      "Strongly complementary. What Uses More is a quick activity for awareness-building inside a single class session; the AI Impact Tracker is a longitudinal personal-reflection instrument logged across days or weeks. The two pair cleanly: What Uses More introduces the magnitude question; the Tracker scaffolds the ongoing practice. Developed by Jon Ippolito (University of Maine New Media).",
  },
  {
    name: "Does That Use a Lot of Energy?",
    url: "https://hannahritchie.github.io/energy-use-comparisons/",
    purpose:
      "A web tool that compares the daily energy consumption (and cost, by country) of common household products and activities — from boiling a kettle to charging a phone to running an air conditioner to one ChatGPT query — on a single visual chart.",
    audience:
      "Consumer-facing audiences who want to put their AI use in the context of their wider household energy footprint; faculty teaching general energy literacy alongside AI literacy.",
    relationship:
      "Complementary, with a different scope. Where the AI Impact Tracker focuses specifically on personal AI use across the major frontier and embedded-AI tools, Ritchie's calculator situates a single AI query inside the broader landscape of everyday electricity (LED bulbs, kettles, EVs, etc.). The two tools answer different questions cleanly: how much does this category of activity use compared to that one (Ritchie) versus what does my AI use look like across a week (the Tracker).",
  },
  {
    name: "CodeCarbon",
    url: "https://codecarbon.io/",
    purpose:
      "A Python library that measures the carbon footprint of compute jobs (model training, inference, general scientific computing) by tracking CPU/GPU power draw and regional grid intensity in real time.",
    audience:
      "Machine-learning researchers and engineers running their own model code who want to report carbon emissions in papers, dashboards, or sustainability reports.",
    relationship:
      "Adjacent and complementary. CodeCarbon measures what you actually ran, with code-level instrumentation. The Tracker estimates what a typical query would have cost, with user-facing simplicity. Different audiences; both methodologically rigorous. CodeCarbon's coefficients inform some of the Tracker's underlying literature; the tools share a research lineage through Sasha Luccioni and Hugging Face.",
  },
  {
    name: "ML CO2 Impact",
    url: "https://mlco2.github.io/impact/",
    purpose:
      "A web calculator that estimates CO₂ emissions for ML model training based on hardware, runtime, cloud provider, and region.",
    audience:
      "ML researchers reporting training emissions for papers, presentations, and grant applications; institutional teams comparing infrastructure choices.",
    relationship:
      "Training-side counterpart to the Tracker. Where the Tracker focuses on per-query inference cost across user-facing tools, ML CO2 Impact focuses on the upstream training cost. The two are methodologically aligned and serve different stakeholders. Authored by Alexandre Lacoste, Alexandra Luccioni, Victor Schmidt, and Thomas Dandres (2019).",
  },
  {
    name: "Green Algorithms",
    url: "http://www.green-algorithms.org/",
    purpose:
      "A web calculator that estimates the carbon footprint of computational tasks (broader than ML) based on runtime, hardware, location, and platform-specific power-usage efficiency.",
    audience:
      "Scientific computing teams; HPC users; researchers across disciplines who want to estimate the footprint of their compute jobs.",
    relationship:
      "Broader-scope companion. Green Algorithms covers all scientific computing, not just AI; users running mixed workloads (bioinformatics + ML, for instance) will find this more comprehensive than the Tracker for the non-AI portion of their work. Authored by Loïc Lannelongue, Jason Grealey, and Michael Inouye at the University of Cambridge (2021).",
  },
  {
    name: "Carbontracker",
    url: "https://github.com/lfwa/carbontracker",
    purpose:
      "A Python package that predicts and tracks the energy consumption and carbon footprint of deep learning models during training, with real-time grid-intensity integration.",
    audience:
      "Deep-learning researchers and engineers running their own training runs who want to monitor footprint during the run, not only after.",
    relationship:
      "Adjacent and complementary, with a slightly different mechanism than CodeCarbon: Carbontracker can predict footprint before a run completes, supporting decisions about whether and when to run. Authored by Lasse F. Wolff Anthony, Benjamin Kanding, and Raghavendra Selvan (2020).",
  },
  {
    name: "EcoLogits",
    url: "https://ecologits.ai/",
    purpose:
      "A library and calculator for estimating the environmental impact (energy, water, carbon, abiotic resources) of generative AI inference, with per-request granularity and a comparison view across major model APIs.",
    audience:
      "Developers integrating LLM APIs into applications who want to track or report per-request footprint; researchers comparing the operational cost of different commercial models.",
    relationship:
      "Adjacent and complementary. EcoLogits operates at the API-integration layer; the Tracker operates at the user-reflection layer. A developer using EcoLogits in their application's backend and the Tracker in their own personal practice would be a coherent pairing. EcoLogits is developed by GenAI Impact, an open-source nonprofit organization based in France.",
  },
  {
    name: "AI Energy Score",
    url: "https://huggingface.co/AIEnergyScore",
    purpose:
      "A leaderboard ranking AI models by energy efficiency, methodologically grounded in standardized benchmark inference runs across hardware configurations.",
    audience:
      "Model developers and procurement teams choosing among models on energy-efficiency grounds; researchers comparing across the model landscape.",
    relationship:
      "Methodology-facing counterpart. The AI Energy Score gives the field a comparable across-models benchmark; the Tracker translates that landscape into a user-facing per-session reflection. The two work together: when a user asks which model should I use for less energy?, the AI Energy Score is the authoritative benchmark answer. A collaboration between Salesforce, Hugging Face (Sasha Luccioni), Cohere, and Carnegie Mellon.",
  },
];

export default function Methodology() {
  const { data: tools, isLoading: loadingTools } = useListTools();
  React.useEffect(() => {
    markMethodologyVisited();
  }, []);
  const sortedTools = React.useMemo(
    () => (tools ? [...tools].sort((a, b) => a.name.localeCompare(b.name)) : []),
    [tools],
  );
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-12 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="text-lg text-muted-foreground">
          How we estimate your AI environmental footprint.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-6 space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contents</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="#what-we-estimate" className="text-muted-foreground hover:text-foreground transition-colors">What this tracker estimates</a>
              <a href="#formulas" className="text-muted-foreground hover:text-foreground transition-colors">The Formulas</a>
              <a href="#coefficients" className="text-muted-foreground hover:text-foreground transition-colors">Per-Query Coefficients &amp; Sources</a>
              <a href="#queries" className="text-muted-foreground hover:text-foreground transition-colors">What counts as a query?</a>
              <a href="#data-centers" className="text-muted-foreground hover:text-foreground transition-colors">Where the energy is used</a>
              <a href="#training" className="text-muted-foreground hover:text-foreground transition-colors">Training footprint</a>
              <a href="#equivalents" className="text-muted-foreground hover:text-foreground transition-colors">Real-World Equivalents</a>
              <a href="#exclusions" className="text-muted-foreground hover:text-foreground transition-colors">What We Don't Count</a>
              <a href="#uncertainty" className="text-muted-foreground hover:text-foreground transition-colors">Uncertainty</a>
              <a href="#seven-dimensions" className="text-muted-foreground hover:text-foreground transition-colors">The Seven Dimensions of Wellness</a>
              <a href="#why-tag-offsets" className="text-muted-foreground hover:text-foreground transition-colors">Why we tag offsets with dimensions</a>
              <a href="#limits-self-report" className="text-muted-foreground hover:text-foreground transition-colors">The limits of self-report</a>
              <a href="#why-no-autopilot" className="text-muted-foreground hover:text-foreground transition-colors">Why we don't auto-track</a>
              <a href="#sources" className="text-muted-foreground hover:text-foreground transition-colors">Sources</a>
              <a href="#related-tools" className="text-muted-foreground hover:text-foreground transition-colors">Related Tools</a>
            </nav>
          </div>
        </aside>

        <main className="flex-1 space-y-16">
          <section id="what-we-estimate" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">What this tracker estimates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-500">Energy</h3>
                  <p className="text-sm">Electricity consumed by the model running your query, measured in watt-hours (Wh).</p>
                </CardContent>
              </Card>
              <Card className="border-slate-500/20 bg-slate-500/5">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-400">Carbon</h3>
                  <p className="text-sm">CO₂ equivalent emitted to generate that electricity. Uses your selected grid intensity.</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-500">Water</h3>
                  <p className="text-sm">Freshwater consumed for on-site cooling and upstream at the power plant, in ml.</p>
                </CardContent>
              </Card>
            </div>
            <Alert className="bg-muted/50 border-muted">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-muted-foreground">
                These are estimates, not measurements. AI companies don't publish official per-query figures. We show our math so you can decide how much to trust it.
              </AlertDescription>
            </Alert>
          </section>

          <section id="formulas" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">The Formulas</h2>
            <div className="p-4 bg-slate-950 text-emerald-400 rounded-md font-mono text-sm overflow-x-auto">
              <pre>
                {`energy_Wh = base_energy_per_query × queries × complexity_multiplier
carbon_g  = energy_Wh × (grid_gCO2_per_kWh ÷ 1000)
water_ml  = energy_Wh × 1.8`}
              </pre>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Complexity Multipliers</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium">Complexity</th>
                      <th className="text-left py-2 px-4 font-medium">Multiplier</th>
                      <th className="text-left py-2 px-4 font-medium">Typical use</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="bg-background">
                      <td className="py-2 px-4">Low</td>
                      <td className="py-2 px-4">0.5×</td>
                      <td className="py-2 px-4">Quick factual questions, short text</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-2 px-4">Medium</td>
                      <td className="py-2 px-4">1×</td>
                      <td className="py-2 px-4">Standard chat, coding, summarization</td>
                    </tr>
                    <tr className="bg-background">
                      <td className="py-2 px-4">High</td>
                      <td className="py-2 px-4">2×</td>
                      <td className="py-2 px-4">Image/video generation, long reasoning</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Grid Intensity</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium">Grid</th>
                      <th className="text-left py-2 px-4 font-medium">g CO₂ / kWh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="bg-background">
                      <td className="py-2 px-4">Global average (default)</td>
                      <td className="py-2 px-4">475</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-2 px-4">United States</td>
                      <td className="py-2 px-4">380</td>
                    </tr>
                    <tr className="bg-background">
                      <td className="py-2 px-4">European Union</td>
                      <td className="py-2 px-4">250</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-2 px-4">Renewable-heavy</td>
                      <td className="py-2 px-4">20</td>
                    </tr>
                    <tr className="bg-background">
                      <td className="py-2 px-4">Coal-heavy</td>
                      <td className="py-2 px-4">820</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              The numbers above are illustrative anchors. When you pick a U.S. grid region, the
              Tracker substitutes a <span className="font-medium text-foreground">live</span> hourly
              figure from the EIA grid monitor; other regions use curated static averages. See{" "}
              <a href="#data-centers" className="underline hover:text-foreground">Where the energy is used</a>{" "}
              for details.
            </p>
            <div className="space-y-3">
              <h3 className="font-semibold">Regional Water Intensity (WUE)</h3>
              <p className="text-sm text-muted-foreground">
                Water is attributed to the data-center region powering each query — the same
                location attribution used for carbon intensity. Each region's water-usage
                effectiveness (WUE) combines on-site cooling water with the upstream water embedded
                in the electricity it consumes. (Note: 1 L/kWh = 1 ml/Wh.)
              </p>
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium">Data-center region</th>
                      <th className="text-left py-2 px-4 font-medium">On-site WUE (L/kWh)</th>
                      <th className="text-left py-2 px-4 font-medium">Upstream (L/kWh)</th>
                      <th className="text-left py-2 px-4 font-medium">Total (L/kWh)</th>
                      <th className="text-left py-2 px-4 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[REGION_WUE.PJM, REGION_WUE.BPA, REGION_WUE.ERCOT, FALLBACK_WUE].map((w, i) => (
                      <tr key={w.dataCenter} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="py-2 px-4">{w.dataCenter}</td>
                        <td className="py-2 px-4 font-mono">{w.onSiteLPerKwh.toFixed(2)}</td>
                        <td className="py-2 px-4 font-mono">{w.upstreamLPerKwh.toFixed(2)}</td>
                        <td className="py-2 px-4 font-mono">{w.totalLPerKwh.toFixed(2)}</td>
                        <td className="py-2 px-4 text-xs text-muted-foreground">{w.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Water intensity is location-dependent: each query's water cost uses the total WUE of
              the data-center region powering it (table above), in place of a single flat
              coefficient. Source: Li, Yang, Islam, &amp; Ren (2023),{" "}
              <a
                href="https://arxiv.org/abs/2304.03271"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Making AI Less "Thirsty" (arXiv:2304.03271)
              </a>
              .
            </p>
            <p className="text-xs text-muted-foreground">
              Fallback: regions without a published region-specific WUE use a global average
              (1.80 L/kWh total), equal to the prior flat 1.8 ml/Wh coefficient — so their water
              estimates are unchanged.
            </p>
          </section>

          <section id="coefficients" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Per-Query Coefficients &amp; Sources</h2>
            <p className="text-muted-foreground">
              Every tool's per-query estimate carries a confidence label so you know how much it
              rests on real data versus inference. Hover the source note for each tool's
              underlying model and citation.
            </p>
            <div className="rounded-md border border-muted bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Catalog refresh policy.</span> The AI
                tool coefficient catalog is refreshed quarterly. The current refresh is{" "}
                <span className="font-medium text-foreground">{CATALOG_REFRESH_DATE}</span>. Each
                refresh adds newly released models, updates coefficients where vendor disclosure has
                improved, and stamps individual tool rows with an{" "}
                <span className="font-medium text-foreground">Updated</span> date. The next
                scheduled refresh is August 2026.
              </p>
              <p>
                Model releases occur on a faster cadence than this refresh; the catalog will always
                lag slightly behind the latest available tools. We treat this as an honest limit of
                a curated methodology rather than a flaw to chase. If a tool you use is missing,
                please submit it via the{" "}
                <Link
                  href="/tools#suggest-a-tool"
                  className="font-medium text-foreground underline hover:text-primary"
                >
                  Suggest a tool form
                </Link>{" "}
                below the catalog.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded border ${SOURCE_CATEGORY_STYLES.Published}`}>Published — peer-reviewed measurement</span>
              <span className={`px-2 py-0.5 rounded border ${SOURCE_CATEGORY_STYLES.Disclosed}`}>Disclosed — vendor figure</span>
              <span className={`px-2 py-0.5 rounded border ${SOURCE_CATEGORY_STYLES.Modeled}`}>Modeled — inferred from a known model</span>
              <span className={`px-2 py-0.5 rounded border ${SOURCE_CATEGORY_STYLES.Placeholder}`}>Placeholder — no public data (low confidence)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">A note on confidence labels.</span> Every
              entry in this catalog carries one of four confidence labels — Published, Disclosed,
              Modeled, Placeholder. <span className="font-medium text-foreground">Published</span>{" "}
              coefficients come from peer-reviewed measurement (e.g., Luccioni et al., 2023, on
              Stable Diffusion and BLOOM). <span className="font-medium text-foreground">Disclosed</span>{" "}
              coefficients come from vendor documentation (e.g., Google's August 2025
              inference-impact post; the OpenAI CEO's early-2025 ChatGPT per-query figure).{" "}
              <span className="font-medium text-foreground">Modeled</span> coefficients are inferred
              from a known underlying model where the vendor publishes nothing.{" "}
              <span className="font-medium text-foreground">Placeholder</span> coefficients have no
              public per-query data and are flagged low-confidence.
            </p>
            <div className="rounded-md border border-muted bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">A note on variability.</span> Per-query
                energy and water estimates are inherently variable. The actual cost of a single
                query depends on the size of the model serving it, the length of the prompt and the
                generated response, the provider's hardware and software efficiency (which improves
                rapidly), how heavily requests are batched and the data center is utilized at the
                moment of the query, and the grid and water profile of the region where it runs. The
                coefficients below are point-in-time central estimates, not guarantees; treat them as
                order-of-magnitude figures for comparing tools rather than precise measurements. For
                continuously updated, independently measured per-model inference energy, see the{" "}
                <a
                  href="https://ml.energy/leaderboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline hover:text-primary"
                >
                  ML.Energy Leaderboard
                </a>
                .
              </p>
            </div>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium">Tool</th>
                    <th className="text-right py-2 px-4 font-medium">Energy (Wh)</th>
                    <th className="text-right py-2 px-4 font-medium">CO₂ (g)</th>
                    <th className="text-right py-2 px-4 font-medium">Water (ml)</th>
                    <th className="text-left py-2 px-4 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loadingTools ? (
                    <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">Loading coefficients…</td></tr>
                  ) : sortedTools.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No tools available.</td></tr>
                  ) : sortedTools.map((tool, i) => {
                    const source = getToolSource(tool.name);
                    return (
                      <tr key={tool.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="py-2 px-4 align-top">{tool.name}</td>
                        <td className="py-2 px-4 text-right font-mono text-xs align-top">{tool.energyPerQueryWh.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-xs align-top">{tool.co2PerQueryG.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-xs align-top">{tool.waterPerQueryMl.toFixed(2)}</td>
                        <td className="py-2 px-4 align-top">
                          <div className="space-y-1 min-w-[180px]">
                            <Badge variant="outline" className={`text-[10px] font-normal ${SOURCE_CATEGORY_STYLES[source.sourceCategory]}`}>
                              {source.sourceCategory}
                            </Badge>
                            <p className="text-xs text-muted-foreground leading-snug">
                              <span className="text-foreground">{source.model}.</span> {source.note}
                            </p>
                            {source.updated && (
                              <p className="text-[10px] italic text-muted-foreground/70">
                                Updated {source.updated}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Footnote: CO₂ calculated using 475 g/kWh global grid average. Water uses 1.8 ml/Wh factor.
              "Placeholder" tools have no public per-query data and are flagged as low confidence in the log form.
            </p>
          </section>

          <section id="queries" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">What counts as a query?</h2>
            <p className="text-muted-foreground">
              A <span className="font-medium text-foreground">query</span> is one message you send and
              the response it generates — one turn of the conversation. The Tracker never asks you to
              count messages by hand. Instead it estimates the number of queries in a session from its{" "}
              <span className="font-medium text-foreground">duration</span> and{" "}
              <span className="font-medium text-foreground">activity type</span>, because different
              activities involve sending messages at different rates.
            </p>
            <p className="text-muted-foreground">
              Things that <span className="font-medium text-foreground">do</span> count as separate
              queries: follow-up messages, asking the model to revise or regenerate, and retries after
              an error. Things the estimate <span className="font-medium text-foreground">may
              under-count</span>: background calls a tool makes on your behalf — multi-step retrieval
              (e.g. Perplexity), agentic loops, and tool chains — because those aren't visible to you
              as individual messages.
            </p>

            <div className="space-y-4">
              <h3 className="font-semibold">Time-to-queries conversion</h3>
              <p className="text-sm text-muted-foreground">
                These are the rates the Tracker currently uses to turn a session's minutes into a
                query count.
              </p>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium">Activity</th>
                      <th className="text-right py-2 px-4 font-medium">Queries / minute</th>
                      <th className="text-right py-2 px-4 font-medium">A 15-min session ≈</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ACTIVITY_RATES.map((row, i) => (
                      <tr key={row.activity} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="py-2 px-4">{row.activity}</td>
                        <td className="py-2 px-4 text-right font-mono text-xs">{row.perMinute}</td>
                        <td className="py-2 px-4 text-right font-mono text-xs">{Math.round(row.perMinute * 15)} queries</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Tool-type adjustment</h3>
              <p className="text-sm text-muted-foreground">
                The activity rate above is then scaled by the{" "}
                <span className="font-medium text-foreground">tool's category</span>, because a minute
                of work produces very different numbers of model calls depending on the tool. A code
                assistant fires many short completions a minute; an image, audio, or video generator
                produces a handful of heavy generations. The final estimate is{" "}
                <span className="font-mono text-xs">activity rate × category modifier × minutes</span>.
              </p>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium">Tool category</th>
                      <th className="text-right py-2 px-4 font-medium">Modifier</th>
                      <th className="text-left py-2 px-4 font-medium">Why</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {CATEGORY_MODIFIERS.map((row, i) => (
                      <tr key={row.category} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="py-2 px-4">{row.category}</td>
                        <td className="py-2 px-4 text-right font-mono text-xs">×{row.modifier.toFixed(1)}</td>
                        <td className="py-2 px-4 text-muted-foreground text-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Alert className="bg-muted/50 border-muted">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-muted-foreground">
                  These modifiers are deliberately coarse — they vary by tool{" "}
                  <span className="font-medium text-foreground">category</span>, not by individual tool,
                  and they don't yet account for one fast vs. slow model within the same category.
                  Finer per-model rates are on the roadmap.
                </AlertDescription>
              </Alert>
            </div>
          </section>

          <section id="data-centers" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Where the energy is used</h2>
            <p className="text-muted-foreground">
              When you run a query, almost all of the energy is spent in the{" "}
              <span className="font-medium text-foreground">provider's data center</span>, not on your
              device. That means the carbon intensity that matters is the grid powering{" "}
              <span className="font-medium text-foreground">that data center</span> — not the grid
              where you happen to be sitting. Your own device draws a small but non-zero amount on top
              (covered under "What We Don't Count").
            </p>
            <p className="text-muted-foreground">
              The Tracker's grid selector therefore approximates the data center's grid, not your home
              grid. Below is where the major tools' inference runs, as best we can determine. Where a
              provider doesn't disclose a region, we fall back to a US-grid average.
            </p>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium">Tool</th>
                    <th className="text-left py-2 px-4 font-medium">Compute infrastructure</th>
                    <th className="text-left py-2 px-4 font-medium">Primary region(s)</th>
                    <th className="text-left py-2 px-4 font-medium">Grid data</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {DATA_CENTER_TOOLS.map((name, i) => {
                    const source = getToolSource(name);
                    const dataSource = gridDataSource(source.dataCenterRegion);
                    return (
                      <tr key={name} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="py-2 px-4 align-top">{name}</td>
                        <td className="py-2 px-4 align-top">{source.dataCenterInfra}</td>
                        <td className="py-2 px-4 align-top text-muted-foreground">{source.dataCenterRegion}</td>
                        <td className="py-2 px-4 align-top">
                          {dataSource === "live" ? (
                            <Badge variant="outline" className="text-[10px] font-normal border-emerald-500/40 text-emerald-700 dark:text-emerald-500 bg-emerald-500/5">
                              Live · EIA
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                              Static avg
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                Region attributions are approximate and change as providers add capacity. The{" "}
                <span className="font-medium text-foreground">Grid data</span> column shows whether
                that tool's region resolves to a live or static carbon-intensity figure.
              </p>
              <p>
                For U.S. balancing authorities (CAISO, ERCOT, PJM, MISO, and others) the Tracker now
                pulls <span className="font-medium text-foreground">live grid carbon intensity</span>{" "}
                from the U.S. Energy Information Administration (EIA) hourly grid monitor, computing a
                generation-weighted intensity from the current fuel mix (refreshed hourly). Regions
                outside the U.S. — and any region where the live feed is unavailable — fall back to
                the curated static averages shown in the grid selector.
              </p>
              <p>
                A paid Electricity Maps feed (which would extend live data to non-U.S. regions) is{" "}
                <span className="font-medium text-foreground">not</span> wired up. We may add its free
                non-commercial tier in a future revision; until then the configuration is EIA for the
                U.S. plus static curated averages everywhere else.
              </p>
            </div>
          </section>

          <section id="training" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Training footprint</h2>
            <p className="text-muted-foreground">
              Everything else on this page is <span className="font-medium text-foreground">operational</span>{" "}
              (inference) impact — the cost of running your queries. Training a model is a separate,
              one-time cost that is large but can't be cleanly divided across queries, so we report it
              on its own rather than baking it into your per-query totals.
            </p>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium">Model</th>
                    <th className="text-right py-2 px-4 font-medium">CO₂ (tonnes)</th>
                    <th className="text-right py-2 px-4 font-medium">Energy (MWh)</th>
                    <th className="text-right py-2 px-4 font-medium">Water (kL)</th>
                    <th className="text-left py-2 px-4 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {TRAINING_FOOTPRINT.map((row, i) => (
                    <tr key={row.model} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="py-2 px-4 align-top">{row.model}</td>
                      <td className="py-2 px-4 text-right font-mono text-xs align-top">{row.carbonTCo2e}</td>
                      <td className="py-2 px-4 text-right font-mono text-xs align-top">{row.energyMWh}</td>
                      <td className="py-2 px-4 text-right font-mono text-xs align-top">{row.waterKL}</td>
                      <td className="py-2 px-4 align-top">
                        <div className="space-y-1 min-w-[160px]">
                          <Badge variant="outline" className={`text-[10px] font-normal ${TRAINING_CONFIDENCE_STYLES[row.confidence]}`}>
                            {row.confidence}
                          </Badge>
                          <p className="text-xs text-muted-foreground leading-snug">{row.notes}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Most labs do not disclose training cost; "Estimated" rows reflect credible third-party
              ranges, not official figures. Amortized over the billions of queries a popular model
              serves, training adds only a small fraction to each query — but the absolute totals are
              substantial.
            </p>
          </section>

          <section id="equivalents" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Real-World Equivalents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                  <div className="text-2xl font-bold text-emerald-600">500 ml</div>
                  <div className="text-sm text-muted-foreground">Water = 1 standard water bottle</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                  <div className="text-2xl font-bold text-slate-600">120 g CO₂</div>
                  <div className="text-sm text-muted-foreground">Carbon = 1 km driven (EPA average US car)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                  <div className="text-2xl font-bold text-amber-600">12 Wh</div>
                  <div className="text-sm text-muted-foreground">Energy = 1 smartphone full charge</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                  <div className="text-2xl font-bold text-amber-600">9 Wh</div>
                  <div className="text-sm text-muted-foreground">Energy = 1 hour LED bulb (9W)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                  <div className="text-2xl font-bold text-amber-600">0.3 Wh</div>
                  <div className="text-sm text-muted-foreground">Energy = 1 Google search</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="font-semibold">Comparisons students actually recognize</h3>
              <p className="text-muted-foreground">
                Watt-hours are abstract. To make AI energy legible, we anchor it against everyday online activity
                rather than household appliances. These are order-of-magnitude figures drawn from the IEA's digital-
                energy work, platform sustainability disclosures, and device power-draw benchmarks — useful for
                comparison, not precise measurement.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Activity</th>
                      <th className="py-2 pr-4 font-medium">On your device</th>
                      <th className="py-2 pr-4 font-medium">In the data center</th>
                      <th className="py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ENERGY_COMPARISONS.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 pr-4 capitalize">{c.unit}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{c.deviceWh !== undefined ? `${c.deviceWh} Wh` : "—"}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{c.dataCenterWh !== undefined ? `${c.dataCenterWh} Wh` : "—"}</td>
                        <td className="py-2 font-mono text-xs font-semibold">{c.totalWh} Wh</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Most online activity splits its energy between the device in your hand and servers in a data center.
                We separate the two because AI tilts heavily toward the data-center side — the model runs on someone
                else's hardware, then the answer travels back to you. A dash means the device or server share is
                negligible or bundled into the total.
              </p>
            </div>
          </section>

          <section id="exclusions" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">What We Don't Count</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive/70" />
                <span className="line-through decoration-muted-foreground/40">
                  Training emissions in your per-query totals (reported separately in the{" "}
                  <a href="#training" className="underline decoration-muted-foreground/40 hover:text-foreground">Training footprint</a> section)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive/70" />
                <span className="line-through decoration-muted-foreground/40">Hardware manufacturing (GPUs, data centers, mining)</span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive/70" />
                <span className="line-through decoration-muted-foreground/40">Your device (laptop/phone energy — not AI-specific)</span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive/70" />
                <span className="line-through decoration-muted-foreground/40">Network transit (milliwatt-hours per query — negligible)</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground italic">
              Note: training is now reported on its own in the{" "}
              <a href="#training" className="not-italic text-primary hover:underline">Training footprint</a>{" "}
              section rather than folded into per-query totals. To approximate training + hardware
              embodied carbon as a single uplift on your operational totals, multiply by ~1.2–1.5×.
            </p>
          </section>

          <section id="uncertainty" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Uncertainty</h2>
            <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-400">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription>
                Hold these numbers loosely. Models change constantly. Query length varies widely. Vendors rarely publish per-query data. These estimates are accurate to within a factor of 2–3. They're good for comparing <em>orders of magnitude</em> and <em>relative tool impact</em> — not for claiming precise emissions.
              </AlertDescription>
            </Alert>
          </section>

          <section id="seven-dimensions" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">The Seven Dimensions of Wellness</h2>
            <p className="text-muted-foreground">
              Environmental cost is only one way AI use touches a life. Starting in v1.4, the Tracker frames AI use
              against the <strong>Seven Dimensions of Wellness</strong> — a model developed by Dr. Bill Hettler,
              co-founder of the National Wellness Institute, in 1976. The same whole-person idea appears in SAMHSA's
              Eight Dimensions of Wellness, widely used in U.S. behavioral-health practice. We use seven, folding
              financial concerns into the occupational dimension.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEVEN_DIMENSIONS.map((d) => (
                <Card key={d.key}>
                  <CardContent className="p-4 space-y-1">
                    <div className="font-semibold" style={{ color: d.color }}>{d.label}</div>
                    <p className="text-sm text-muted-foreground">{d.blurb}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              The environmental dimension is the one the Tracker measures directly. The other six are surfaced as an
              optional, private self-reflection — a way to notice trade-offs the numbers can't see, such as a coding
              session that advanced your work (occupational) at the cost of a walk you'd planned (physical).
            </p>
          </section>

          <section id="why-tag-offsets" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Why we tag offsets with dimensions</h2>
            <p className="text-muted-foreground">
              Traditional carbon offsets treat well-being as a single axis: do the greener thing, feel less guilty.
              That framing quietly turns every choice into a moral test you can pass or fail. We reject it. The offset
              catalog tags each practice with the wellness dimensions it tends to serve — biking a trip is
              environmental <em>and</em> physical <em>and</em>, sometimes, social and emotional — so the catalog reads
              as a menu for a whole person, not a penance for a carbon sin.
            </p>
            <p className="text-muted-foreground">
              Every offset also carries an honest context note, because <strong>offsets are not binary choices</strong>.
              Weather, safety, transit access, physical ability, financial constraint, security updates, and food
              sensitivity all shape whether a given practice is even available to a given person. Tagging dimensions
              and naming constraints is how we keep the catalog from becoming one more source of pressure.
            </p>
          </section>

          <section id="limits-self-report" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">The limits of self-report</h2>
            <p className="text-muted-foreground">
              The "Your week across seven dimensions" picture is built entirely from what you choose to record:
              optional after-session reflections (helped / neutral / cost) and the practices you check off. It is
              deliberately low-precision. We do not measure your sleep, your mood, your relationships, or your sense of
              meaning — only you can, and self-report is shaped by recall, framing, and the feeling of the moment.
            </p>
            <p className="text-muted-foreground">
              So the summary is a mirror, not a metric. We never score it, rank it, average it against other people,
              or send it anywhere — all of it lives in your browser's local storage on this device. Researchers have
              documented how climate and technology can drive real anxiety (Hickman et al., 2021; Pihkala, 2020;
              Cunsolo &amp; Ellis, 2018); a tool that quantified your inner life against that backdrop would do harm.
              The seven-dimension view exists to help you notice patterns for yourself, then put the phone down.
            </p>
          </section>

          <section id="why-no-autopilot" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Why we don't auto-track</h2>
            <p className="text-muted-foreground">
              The single most common feature request we receive is some form of automatic tracking:
              a browser extension or background service that would watch your AI use and log sessions
              for you, with no effort on your part. We have deliberately chosen not to build that. The
              reason is methodological, not technical.
            </p>
            <p className="text-muted-foreground">
              The act of logging <em>is</em> the practice. Pausing to name what you just did, estimate
              how long it took, and decide whether it was worth the footprint is the moment of
              reflection the Tracker exists to support. Automatic tracking would manufacture the data
              while removing the reflection — you would end up with a dashboard of numbers you never
              actually thought about. A meter that reads itself changes nothing about how you use the
              thing it measures.
            </p>
            <p className="text-muted-foreground">
              There is also a quieter cost. Background tracking means continuous observation, and
              continuous observation of your tool use is exactly the kind of monitoring this project
              does not want to normalize — even in service of a good cause. We would rather ask for a
              few seconds of your deliberate attention than silently watch over your shoulder.
            </p>
            <p className="text-muted-foreground">
              What we <em>have</em> done is remove the <em>friction</em> that has nothing to do with
              reflection. The{" "}
              <Link href="/bookmarklet" className="text-primary hover:underline">
                Quick-Log bookmarklet
              </Link>{" "}
              lets you start a log from whatever AI page you're on, with the tool already detected.
              The{" "}
              <Link href="/import" className="text-primary hover:underline">
                Import from an AI session
              </Link>{" "}
              page turns a quick paste into a draft entry. Both still open the log form for you to
              review and confirm — they speed up the typing, not the thinking. Nothing is recorded
              until you say so, and neither tool ever reads your conversations or runs in the
              background.
            </p>
          </section>

          <section id="sources" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Sources</h2>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>Luccioni, Jernite, Strubell (2024). Power Hungry Processing: Watts Driving the Cost of AI Deployment? arXiv:2311.16863 — per-query inference energy across model classes.</li>
              <li>Luccioni, Viguier, Ligozat (2023). Estimating the Carbon Footprint of BLOOM, a 176B Parameter Language Model. arXiv:2211.02001 — training energy/carbon.</li>
              <li>Patterson et al. (2022). The Carbon Footprint of Machine Learning Training Will Plateau, Then Shrink. IEEE Computer — GPT-3 training energy/carbon.</li>
              <li>Strubell, Ganesh, McCallum (2019). Energy and Policy Considerations for Deep Learning in NLP. ACL.</li>
              <li>
                Li, P., Yang, J., Islam, M. A., &amp; Ren, S. (2023). Making AI Less "Thirsty":
                Uncovering and Addressing the Secret Water Footprint of AI Models.{" "}
                <a
                  href="https://arxiv.org/abs/2304.03271"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  arXiv:2304.03271
                </a>{" "}
                — training &amp; inference water; location-specific WUE.
              </li>
              <li>Li, Yang, Islam, &amp; Ren (2023), Table 1 — region-specific water-usage effectiveness (on-site + upstream), used for location-dependent water attribution.</li>
              <li>
                ML.Energy Leaderboard —{" "}
                <a
                  href="https://ml.energy/leaderboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  ml.energy/leaderboard
                </a>{" "}
                — independently measured per-model inference energy benchmarks.
              </li>
              <li>Epoch AI (2025). How Much Energy Does ChatGPT Use?</li>
              <li>Altman (2025). ~0.34 Wh / ~0.000085 gal per average ChatGPT query (disclosed).</li>
              <li>de Vries (2023). The growing energy footprint of artificial intelligence. Joule.</li>
              <li>Google (Aug 2025). Measuring the environmental impact of AI inference.</li>
              <li>Meta. Llama 2 &amp; Llama 3 model cards — disclosed training emissions.</li>
              <li>Hugging Face model cards — open-model training disclosures (BLOOM, Llama, Mistral).</li>
              <li>Electricity Maps &amp; WattTime — regional grid carbon-intensity data.</li>
              <li>Heikkilä (2023). Making an image with generative AI uses as much energy as charging your phone. MIT Technology Review.</li>
              <li>Ritchie, Hannah (2025). "AI Electricity 2025." Sustainability by Numbers (Substack) — data-driven analysis of AI electricity demand and per-query energy.</li>
              <li>EPA (2024). Greenhouse Gas Equivalencies Calculator.</li>
              <li>IEA (2023). Electricity 2024 / Digital &amp; energy analysis — device-side vs. data-center energy shares for streaming and online activity.</li>
              <li>Adams, T., Bezner, J., &amp; Steinhardt, M. (1997). The conceptualization and measurement of perceived wellness. American Journal of Health Promotion — multidimensional wellness model.</li>
              <li>Hettler, B. (1976). The Six Dimensions of Wellness Model. National Wellness Institute — origin of the dimensions-of-wellness framework.</li>
              <li>SAMHSA. Creating a Healthier Life: A Step-by-Step Guide to Wellness — the Eight Dimensions of Wellness.</li>
              <li>Hickman, C., et al. (2021). Climate anxiety in children and young people and their beliefs about government responses to climate change. The Lancet Planetary Health.</li>
              <li>Pihkala, P. (2020). Anxiety and the Ecological Crisis: An Analysis of Eco-Anxiety and Climate Anxiety. Sustainability.</li>
              <li>Cunsolo, A., &amp; Ellis, N. R. (2018). Ecological grief as a mental health response to climate change-related loss. Nature Climate Change.</li>
              <li>Cifor, M., Garcia, P., Cowan, T. L., Rault, J., Sutherland, T., Chan, A., Rode, J., Hoffmann, A. L., Salehi, N., &amp; Nakamura, L. (2019). Feminist Data Manifest-No — on consent, refusal, and the ethics of data collection.</li>
              <li>Eubanks, V. (2018). Automating Inequality: How High-Tech Tools Profile, Police, and Punish the Poor. St. Martin's Press — on the harms of automated data systems.</li>
              <li>Selwyn, N. (2019). Should Robots Replace Teachers? AI and the Future of Education. Polity Press — critical perspective on AI in education.</li>
              <li>Watters, A. (2014). The Monsters of Educational Technology. Hack Education — on the politics of edtech and data.</li>
              <li>Whittaker, M., Crawford, K., Dobbe, R., Fried, G., Kaziunas, E., Mathur, V., West, S. M., Richardson, R., Schultz, J., &amp; Schwartz, O. (2018). AI Now Report 2018. AI Now Institute — accountability and the social implications of AI systems.</li>
            </ul>
          </section>

          <section id="related-tools" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Related Tools</h2>
            <p className="text-muted-foreground">
              The AI Impact Tracker is one tool in a small but growing community of practice around
              AI environmental literacy. As of June 2026, the Tracker is — to our knowledge — the
              only freely available instrument combining four features at once: longitudinal
              session-by-session personal tracking, peer-reviewed coefficients for roughly forty
              individual AI tools across text, image, audio, video, and code categories, tri-metric
              reporting (energy and water and carbon together), and live grid data for U.S. regions.
              But it is not the only tool, and for many questions another tool below is the better
              fit.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Where to go for what the Tracker doesn't do.</span>{" "}
              For a quick in-class comparison activity: What Uses More. For situating AI energy use
              inside everyday household and travel energy: Does That Use a Lot of Energy? For
              code-level instrumentation of your own training or inference runs: CodeCarbon or
              Carbontracker. For training-side emissions estimation: ML CO2 Impact or Green
              Algorithms. For per-request footprint tracking inside an LLM-using application:
              EcoLogits. For comparing models against each other on energy efficiency: AI Energy
              Score.
            </p>
            <div className="space-y-6">
              {RELATED_TOOLS.map((tool) => (
                <div key={tool.name} className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:underline"
                    >
                      {tool.name}
                    </a>
                  </p>
                  <p>
                    <span className="italic text-foreground/70">Purpose.</span> {tool.purpose}
                  </p>
                  <p>
                    <span className="italic text-foreground/70">Audience.</span> {tool.audience}
                  </p>
                  <p>
                    <span className="italic text-foreground/70">Relationship to the Tracker.</span>{" "}
                    {tool.relationship}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic pt-2">
              If you know of another tool that belongs here, please use the{" "}
              <Link href="/tools#suggest-a-tool" className="text-primary hover:underline not-italic">
                Suggest a tool form
              </Link>{" "}
              on the catalog page.
            </p>
          </section>

          <p className="text-sm text-muted-foreground text-center pt-4">
            Designed by Dana Milstein Santoscoy, PhD, ACC.{" "}
            <Link href="/about" className="text-primary hover:underline">
              About &amp; Terms →
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
