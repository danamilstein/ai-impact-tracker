import { useState } from "react";
import {
  InsightBannerView,
  SettingsPrompt,
  InsightSettings,
  renderMessage,
} from "@/components/insight-banner";
import { MESSAGES, fillMessage, type InsightMode } from "@/lib/insights";

/**
 * DEV-only preview of the insight banner states. Renders the real components in
 * deterministic states so the v1.2 surfaces can be reviewed/screenshotted
 * without the authenticated, localStorage-driven selection flow. Not registered
 * in production (guarded by import.meta.env.DEV in App.tsx) and not linked in nav.
 */

const SAMPLE_TOKENS: Record<string, string | number> = {
  tool: "ChatGPT (GPT-4)",
  espressoCups: 6,
  fridgeMinutes: 18,
  weekDrivingMiles: 2.4,
  sessionWh: 3,
  phoneCharges: 2,
};

function messageText(id: string): string {
  const m = MESSAGES.find((x) => x.id === id);
  return m ? fillMessage(m.text, SAMPLE_TOKENS) : id;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}

export default function InsightsPreview() {
  const params = new URLSearchParams(window.location.search);
  const only = params.get("case");
  const [mode, setMode] = useState<InsightMode>("on");

  const comparison = (
    <Section title="(a) Comparison-context message">
      <InsightBannerView onDismiss={() => {}}>
        {renderMessage(messageText("c1-espresso"))}
      </InsightBannerView>
    </Section>
  );

  const methodology = (
    <Section title="(b) Methodology message — first-ever calculation">
      <InsightBannerView onDismiss={() => {}}>
        {renderMessage(messageText("c2-coeffs"))}
      </InsightBannerView>
    </Section>
  );

  const prompt = (
    <Section title="(c) Settings prompt — after three dismissals">
      <SettingsPrompt onChoose={() => {}} onClose={() => {}} />
    </Section>
  );

  const settings = (
    <Section title="(d) Settings toggle">
      <InsightSettings mode={mode} onChange={setMode} />
    </Section>
  );

  const cases: Record<string, React.ReactNode> = { comparison, methodology, prompt, settings };

  return (
    <div className="min-h-screen bg-background p-10">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-xl font-semibold">Insight banner preview (dev)</h1>
        {only && cases[only] ? cases[only] : (
          <>
            {comparison}
            {methodology}
            {prompt}
            {settings}
          </>
        )}
      </div>
    </div>
  );
}
