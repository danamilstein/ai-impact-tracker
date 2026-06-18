import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Droplets, Zap, Wind, Scale, Lightbulb, Info } from "lucide-react";
import { PurposeNote } from "@/components/purpose-note";

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
};

function MetricCard({ icon, label, value, unit, color }: MetricCardProps) {
  return (
    <div className={`flex flex-col items-center gap-1 p-4 rounded-xl border border-border bg-card`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground text-center leading-snug">
        {unit}
        <br />
        <span className="font-medium text-foreground/70">{label}</span>
      </p>
    </div>
  );
}

export default function Responsibility() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-10 pb-12">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Responsible Use Statement</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A tool for tracking AI's environmental impact should account for its own.
        </p>
      </header>

      <PurposeNote />

      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-muted-foreground">
          The numbers below use the same per-query coefficients this Tracker applies to your
          sessions — sourced from Luccioni et al. (2024), Li, Yang, Islam, &amp; Ren (2023), and Altman (2025).
          All estimates carry ±50% uncertainty; that's the honest range for query-level AI
          impact data right now.
        </AlertDescription>
      </Alert>

      {/* Session 1: Building the Tracker */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Building this tool</h2>
        <p className="text-muted-foreground">
          The AI Impact Tracker was built using Claude 3.5 Sonnet as the primary AI coding
          assistant — approximately 30 heavy coding sessions averaging ~200 queries each,
          totaling roughly 6,000 Claude queries. This covers initial scaffolding, iterative
          feature development, database design, API contracts, authentication, the tool
          catalog, methodology page, privacy page, this page, and all subsequent refinements.
        </p>
        <Card className="bg-muted/40 border-muted">
          <CardContent className="p-4 text-sm text-muted-foreground space-y-3">
            <div>
              <p className="font-medium text-foreground mb-1">Houston, TX — weekend afternoons, ~1–5 pm (ERCOT grid)</p>
              <p>
                This is actually good timing. Weekend afternoons in Texas are when ERCOT's
                large solar fleet peaks, pushing natural gas generation down and lowering the
                grid's carbon intensity. The{" "}
                <a
                  href="https://app.electricitymaps.com/zone/US-TEX-ERCO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Houston / ERCOT zone on Electricity Maps
                </a>{" "}
                typically shows its cleanest hours between noon and 5 pm on sunny days.
                Running heavy AI sessions during this window means a meaningfully lower
                carbon intensity than evening or overnight.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Three Rivers, CA — overnight, ~10 pm–4 am (CAISO grid)</p>
              <p>
                Also reasonably clean — and better than Texas overnight. California's CAISO
                grid runs hydro, geothermal (The Geysers), and nuclear around the clock, so
                even after solar drops off the evening carbon intensity stays relatively low
                by US standards. The{" "}
                <a
                  href="https://app.electricitymaps.com/zone/US-CAL-CISO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  California / CAISO zone on Electricity Maps
                </a>{" "}
                typically shows overnight carbon intensity well below the US average.
                Midday California would be cleaner still, but 10 pm–4 am on CAISO is a
                defensible window.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            icon={<Zap className="w-4 h-4" />}
            label="energy"
            value="~10.8"
            unit="kWh"
            color="bg-yellow-500/10 text-yellow-600"
          />
          <MetricCard
            icon={<Droplets className="w-4 h-4" />}
            label="water"
            value="~5.1"
            unit="gallons"
            color="bg-blue-500/10 text-blue-600"
          />
          <MetricCard
            icon={<Wind className="w-4 h-4" />}
            label="carbon"
            value="~5.1"
            unit="kg CO₂"
            color="bg-green-500/10 text-green-700"
          />
        </div>
        <p className="text-xs text-muted-foreground italic">
          Coefficients: Claude 3.5 Sonnet — 1.8 Wh · 3.24 ml · 0.855 g CO₂ per query
          (same values the Tracker uses for your logged Claude sessions).
        </p>

        <Alert className="bg-muted/40 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">A note on which grid actually matters.</p>
            <p>
              The carbon numbers above depend on the grid powering the{" "}
              <span className="font-medium text-foreground">data center</span> where the model runs —
              Claude on AWS, ChatGPT on Azure, Gemini on Google Cloud — not the grid where you're
              sitting. So the meaningful lever is when and where the provider's data center draws its
              power, which is what the Tracker's grid selector approximates. The grids named below
              (ERCOT, CAISO) are the builder's <span className="italic">local</span> grids; they
              govern the small slice of energy your own laptop or phone uses while you work, which is
              real but minor next to the data-center load.
            </p>
          </AlertDescription>
        </Alert>
      </section>

      {/* Session 2: Cowork */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Beta testing & documentation</h2>
        <p className="text-muted-foreground">
          Two hours on Cowork to beta test the Tracker end-to-end, file and debug issues, write
          the White Paper, and produce the Instructional Design Manual — approximately 80
          AI-assisted queries (writing, editing, and debugging combined).
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            icon={<Zap className="w-4 h-4" />}
            label="energy"
            value="~0.14"
            unit="kWh"
            color="bg-yellow-500/10 text-yellow-600"
          />
          <MetricCard
            icon={<Droplets className="w-4 h-4" />}
            label="water"
            value="~0.07"
            unit="gallons"
            color="bg-blue-500/10 text-blue-600"
          />
          <MetricCard
            icon={<Wind className="w-4 h-4" />}
            label="carbon"
            value="~0.07"
            unit="kg CO₂"
            color="bg-green-500/10 text-green-700"
          />
        </div>
        <p className="text-xs text-muted-foreground italic">
          Same Claude 3.5 Sonnet coefficients applied.
        </p>
      </section>

      {/* Totals */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Combined total</h2>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            icon={<Zap className="w-4 h-4" />}
            label="energy"
            value="~11"
            unit="kWh"
            color="bg-yellow-500/10 text-yellow-600"
          />
          <MetricCard
            icon={<Droplets className="w-4 h-4" />}
            label="water"
            value="~5.2"
            unit="gallons"
            color="bg-blue-500/10 text-blue-600"
          />
          <MetricCard
            icon={<Wind className="w-4 h-4" />}
            label="carbon"
            value="~5.2"
            unit="kg CO₂"
            color="bg-green-500/10 text-green-700"
          />
        </div>
      </section>

      {/* Context comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">How does this compare?</h2>
        <p className="text-muted-foreground text-sm mb-3">
          These numbers are real. They're also worth holding in context alongside other everyday
          activities.
        </p>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 flex gap-4 items-start">
              <Zap className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">11 kWh of energy</p>
                <p className="text-sm text-muted-foreground">
                  Roughly the same as running a laptop continuously for 55 hours — or one
                  cycle in a clothes dryer every day for a week and a half. It's real, but
                  it's within the range of ordinary household appliance use.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex gap-4 items-start">
              <Droplets className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">5.2 gallons of water</p>
                <p className="text-sm text-muted-foreground">
                  About the same as a 2½-minute shower. The water used to cool data centers
                  that processed these queries is largely non-consumptive (returned to
                  watersheds via cooling towers) — but the geographic and seasonal
                  distribution of that return matters in water-stressed regions.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex gap-4 items-start">
              <Wind className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">5.2 kg CO₂</p>
                <p className="text-sm text-muted-foreground">
                  About the same as driving a typical gasoline car ~25 miles, or
                  approximately 3 months of weekly one-hour video calls. For a tool that
                  helps many people make more informed AI choices, that's the tradeoff
                  this work is making — stated plainly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Green tip */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          One thing worth doing
        </h2>
        <Alert className="bg-primary/5 border-primary/20">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertDescription>
            <p className="font-medium text-foreground mb-1">Time heavy AI sessions to the data center's cleanest hours.</p>
            <p className="text-muted-foreground">
              Because the bulk of a query's energy is spent in the provider's data center, the grid
              worth timing against is the one powering that data center's region — not your local
              grid. Most major US inference runs in regions like Virginia (Azure/AWS US-East) and the
              Midwest (Google us-central1); those grids are typically cleanest midday when solar and
              wind peak. The builder's own sessions, run on ERCOT (Houston) and CAISO (California),
              were timed for their cleanest local windows for the device-side share. You can check
              live carbon intensity for any region:{" "}
              <a
                href="https://app.electricitymaps.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Electricity Maps
              </a>{" "}
              (free, real-time) shows your zone's carbon intensity hour by hour. A
              10-second check before a long session can cut its carbon footprint by
              20–40% — no offset required, no behavior change beyond timing.
            </p>
          </AlertDescription>
        </Alert>
        <p className="text-xs text-muted-foreground">
          This tip works because it reduces actual emissions rather than purchasing credits
          for reductions elsewhere. Naming where and when this tool was built — and whether
          those choices were good or bad — is the point.
        </p>
        <p className="text-sm text-muted-foreground">
          We are one of several tools in this space; see{" "}
          <Link href="/methodology#related-tools" className="text-primary hover:underline">
            Related Tools
          </Link>{" "}
          on the methodology page.
        </p>
      </section>
    </div>
  );
}
