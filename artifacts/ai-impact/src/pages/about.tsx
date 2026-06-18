import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, BookOpen, Mail } from "lucide-react";

export default function About() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-10 pb-12">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">About & Terms</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Attribution, fair use, and what you can do with this tool.
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          © 2026 Dana Milstein Santoscoy, PhD, ACC. All rights reserved.
        </p>
      </header>

      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-muted-foreground">
          Short version: free for individual and classroom use, attribution
          required if you adopt or adapt it, and please ask first before
          commercial or institution-wide deployments.
        </AlertDescription>
      </Alert>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">About this tool</h2>
        <p className="text-muted-foreground">
          This tool was designed by{" "}
          <strong className="text-foreground">
            Dana Milstein Santoscoy, PhD, ACC
          </strong>
          , as part of a tiny experiment in vibe-coded instructional design
          tools supporting ethical AI stewardship in higher education. It is
          offered free of charge for individual use, classroom use, and
          good-faith professional development inside colleges, universities,
          and adjacent educational settings.
        </p>
        <p className="text-muted-foreground">
          It is one of several tools in a small, growing community of practice
          around AI environmental literacy — see{" "}
          <Link href="/methodology#related-tools" className="text-primary hover:underline">
            Related Tools
          </Link>{" "}
          for peer and adjacent projects doing related work.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Use and adaptation
        </h2>
        <p className="text-muted-foreground">
          You are welcome to use this tool with your students, share the link
          with colleagues, embed it in a course or workshop, and adapt the
          underlying ideas to your own teaching context. If you adopt this
          tool in a classroom, program, or institutional setting — or if you
          adapt its structure, statement bank, scoring approach, or
          accompanying documents into a tool, document, or workshop of your
          own — attribution is required.
        </p>
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-sm">
              Minimum acceptable credit
            </h3>
            <p className="text-sm text-muted-foreground italic">
              “Designed by Dana Milstein Santoscoy, PhD, ACC — a tiny
              experiment in vibe-coded instructional design tools supporting
              ethical AI stewardship in higher education. © 2026. All rights
              reserved.”
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          What this license does not grant
        </h2>
        <p className="text-muted-foreground">
          This is not an open-source release. The source code, statement
          banks, accompanying documents (White Paper, Faculty Workbook,
          Methodology page, outreach materials), brand design, and
          instructional architecture remain the intellectual property of the
          author.
        </p>
        <p className="text-muted-foreground">
          Commercial use, white-labeling, repackaging under a different
          author's name, or institutional adoption at scale (e.g., embedding
          across a department, program, or system as a standard tool)
          requires advance written permission. Reach out before you build
          something on top of this.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Future of the tool
        </h2>
        <p className="text-muted-foreground">
          These tools are currently free and will remain free for individual
          use and classroom use indefinitely. Whether the toolkit eventually
          offers institutional licensing, hosted versions, research
          partnerships, or other arrangements is an open question — but no
          version of the future of this work involves taking the free version
          away from the people currently using it.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2 flex items-center gap-2">
          <Mail className="w-5 h-5 text-muted-foreground" />
          Contact
        </h2>
        <p className="text-muted-foreground">
          Questions about adoption, adaptation, research partnerships, or
          institutional licensing:{" "}
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
