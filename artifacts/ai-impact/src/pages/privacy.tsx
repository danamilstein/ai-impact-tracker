import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Database, Download, Mail, Github, Info } from "lucide-react";

export default function Privacy() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-10 pb-12">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          What we store, what we don't, and how to get your data out.
        </p>
        <p className="text-xs text-muted-foreground font-mono">Last updated: May 2026</p>
      </header>

      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-muted-foreground">
          Short version: we store the sessions you log and the goals you set,
          tied to your account email. Nothing about your actual prompts or AI
          conversations. No ad trackers. You can export everything as a CSV and
          email us to delete it.
        </AlertDescription>
      </Alert>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">What we store</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-1">
              <h3 className="font-semibold text-sm">Sessions you log</h3>
              <p className="text-sm text-muted-foreground">
                Which AI tool, how many queries, complexity, optional notes you
                type, and the date — exactly what you fill in on the Log
                Session form.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-1">
              <h3 className="font-semibold text-sm">Goals you set</h3>
              <p className="text-sm text-muted-foreground">
                The name, metric (water / CO₂ / energy), period, and target
                value of any goal you create.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-1">
              <h3 className="font-semibold text-sm">Your account</h3>
              <p className="text-sm text-muted-foreground">
                Email address, display name, and avatar URL, supplied by your
                sign-in provider (Clerk). Used to keep your data scoped to
                you and to show your name in the sidebar.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-1">
              <h3 className="font-semibold text-sm">Standard server logs</h3>
              <p className="text-sm text-muted-foreground">
                Request paths and timestamps for debugging. No request bodies,
                no third-party analytics, no advertising pixels.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">What we don't store</h2>
        <ul className="space-y-2 text-muted-foreground list-disc pl-5">
          <li>
            <strong className="text-foreground">Your prompts or AI replies.</strong>{" "}
            We never see what you ask ChatGPT, Claude, Midjourney, etc. We have
            no integration with those services — you tell us how many queries
            you ran, and we estimate the impact.
          </li>
          <li>
            <strong className="text-foreground">Anything from the AI tools themselves.</strong>{" "}
            No tokens, no API keys, no conversation transcripts.
          </li>
          <li>
            <strong className="text-foreground">Third-party trackers.</strong>{" "}
            No Google Analytics, no Facebook pixel, no advertising cookies.
          </li>
          <li>
            <strong className="text-foreground">Payment info.</strong>{" "}
            The app is free; we don't process payments.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-muted-foreground" />
          Where it lives
        </h2>
        <p className="text-muted-foreground">
          Your data is stored in a PostgreSQL database hosted on Replit. It is
          not sold, rented, or shared with any third party. The only people
          with access are the project maintainers, and only for the purpose
          of keeping the app running.
        </p>
        <p className="text-muted-foreground">
          Authentication is handled by{" "}
          <a
            href="https://clerk.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Clerk
          </a>
          , which stores your sign-in credentials and session cookies under
          their own privacy policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2 flex items-center gap-2">
          <Download className="w-5 h-5 text-muted-foreground" />
          Export your data
        </h2>
        <p className="text-muted-foreground">
          From the{" "}
          <Link href="/history" className="text-primary hover:underline">
            History page
          </Link>{" "}
          you can download every session you've logged as a CSV file. That
          file contains everything we have about your usage.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2 flex items-center gap-2">
          <Mail className="w-5 h-5 text-muted-foreground" />
          Delete your data
        </h2>
        <p className="text-muted-foreground">
          To have your account and all associated sessions and goals erased,
          email{" "}
          <a
            href="mailto:drdanamilstein@gmail.com"
            className="text-primary hover:underline"
          >
            drdanamilstein@gmail.com
          </a>{" "}
          from the address you signed up with. We'll confirm and delete within
          7 days. Deletion is permanent and cannot be undone.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2 flex items-center gap-2">
          <Github className="w-5 h-5 text-muted-foreground" />
          Source & contact
        </h2>
        <p className="text-muted-foreground">
          Maintained by{" "}
          <strong className="text-foreground">
            Dana Milstein Santoscoy, PhD, ACC
          </strong>
          . AI Impact Tracker is an open project. The full source code is on{" "}
          <a
            href="https://github.com/replit/ai-impact-tracker"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            GitHub
          </a>{" "}
          so you can verify exactly what's collected and how. For questions,
          bug reports, or privacy concerns, email{" "}
          <a
            href="mailto:drdanamilstein@gmail.com"
            className="text-primary hover:underline"
          >
            drdanamilstein@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
