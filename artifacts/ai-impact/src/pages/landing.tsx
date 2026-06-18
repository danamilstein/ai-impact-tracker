import { Link } from "wouter";
import { Leaf, Droplets, Wind, Zap, BarChart3, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">AI Impact Tracker</h1>
              <p className="text-xs text-muted-foreground font-mono">v1.1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24 pb-24 md:pb-24">
        <section className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Leaf className="w-3.5 h-3.5" />
            Personal environmental tracking
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            See the environmental cost of your AI usage.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track water, carbon, and energy across every AI tool you use at work. Set goals, compare tools, and learn where your footprint really comes from.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-base">Start tracking for free</Button>
            </Link>
            <Link href="/tools">
              <Button size="lg" variant="outline" className="text-base">Browse tool catalog</Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <FeatureCard icon={<Droplets className="w-5 h-5" />} title="Water, carbon, energy" color="chart-1">
            Three metrics for every session you log, computed from peer-reviewed coefficients.
          </FeatureCard>
          <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="Daily trends" color="chart-2">
            See where your footprint comes from across the last 30 days, broken out by metric.
          </FeatureCard>
          <FeatureCard icon={<Target className="w-5 h-5" />} title="Goals & weekly reports" color="chart-3">
            Set weekly or monthly limits and see whether you're staying inside them.
          </FeatureCard>
        </section>

        <section className="text-center py-12 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Or explore without an account:{" "}
            <Link href="/tools" className="text-primary hover:underline">tool catalog</Link>
            {" · "}
            <Link href="/methodology" className="text-primary hover:underline">methodology</Link>
          </p>
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-10 border-t border-border bg-card/80 backdrop-blur px-4 py-2 text-xs text-muted-foreground text-center">
        Designed by Dana Milstein Santoscoy, PhD, ACC. © 2026. All rights
        reserved.{" "}
        <Link href="/about" className="text-primary hover:underline">
          See Terms
        </Link>
        .
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className={`w-10 h-10 rounded-lg bg-${color}/10 text-${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
