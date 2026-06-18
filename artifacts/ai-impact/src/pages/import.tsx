import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Wand2 } from "lucide-react";

type ActivityType = "queries" | "research" | "composing" | "visualizing" | "programming";
type Complexity = "low" | "medium" | "high";

interface ParsedDraft {
  tool: string;
  durationMinutes: number;
  complexity: Complexity;
  activity: ActivityType;
  messageCount: number | null;
}

const TOOL_KEYWORDS: { pattern: RegExp; tool: string }[] = [
  { pattern: /chat\s?gpt|openai|gpt-?\d|gpt\b/i, tool: "ChatGPT" },
  { pattern: /claude/i, tool: "Claude" },
  { pattern: /gemini|bard/i, tool: "Gemini" },
  { pattern: /perplexity/i, tool: "Perplexity" },
  { pattern: /copilot/i, tool: "Copilot" },
  { pattern: /grok/i, tool: "Grok" },
  { pattern: /midjourney/i, tool: "Midjourney" },
  { pattern: /dall-?e/i, tool: "DALL-E" },
  { pattern: /stable\s?diffusion/i, tool: "Stable Diffusion" },
  { pattern: /llama/i, tool: "Llama" },
  { pattern: /mistral/i, tool: "Mistral" },
];

function parseText(text: string): ParsedDraft {
  const lower = text.toLowerCase();

  let tool = "";
  for (const { pattern, tool: name } of TOOL_KEYWORDS) {
    if (pattern.test(text)) {
      tool = name;
      break;
    }
  }

  let durationMinutes = 0;
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|\bh\b)/);
  if (hourMatch) durationMinutes += Math.round(parseFloat(hourMatch[1]) * 60);
  const minMatch = lower.match(/(\d+)\s*(?:minutes?|mins?|\bmin\b)/);
  if (minMatch) durationMinutes += parseInt(minMatch[1], 10);
  if (durationMinutes === 0) {
    if (/half an hour|half-hour/.test(lower)) durationMinutes = 30;
    else if (/a couple (?:of )?hours/.test(lower)) durationMinutes = 120;
    else if (/an hour|one hour/.test(lower)) durationMinutes = 60;
  }
  if (durationMinutes === 0) durationMinutes = 15;

  const msgMatch = lower.match(/(\d+)\s*(?:messages?|prompts?|queries|turns?|exchanges?|responses?)/);
  const messageCount = msgMatch ? parseInt(msgMatch[1], 10) : null;

  let activity: ActivityType = "queries";
  if (/cod(?:e|ing)|program|debug|refactor|function|script|repo/i.test(text)) activity = "programming";
  else if (/research|sources?|cite|literature|paper|find(?:ing)? info/i.test(text)) activity = "research";
  else if (/writ|essay|draft|compos|email|blog|article|edit/i.test(text)) activity = "composing";
  else if (/image|picture|art|visual|logo|illustrat|render|video/i.test(text)) activity = "visualizing";

  let complexity: Complexity = "medium";
  if (/image|video|generat|render|long|complex|deep|reasoning/i.test(text)) complexity = "high";
  else if (/quick|simple|short|brief|fast|small/i.test(text)) complexity = "low";

  return { tool, durationMinutes, complexity, activity, messageCount };
}

const ACTIVITY_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "queries", label: "Asking questions / chatting" },
  { value: "research", label: "Research" },
  { value: "composing", label: "Writing / composing" },
  { value: "programming", label: "Programming / coding" },
  { value: "visualizing", label: "Generating images or visuals" },
];

export default function ImportPage() {
  const [, setLocation] = useLocation();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<ParsedDraft | null>(null);

  const handleParse = () => {
    setDraft(parseText(text));
  };

  const handleSave = () => {
    if (!draft) return;
    const params = new URLSearchParams();
    params.set("from", "import");
    if (draft.tool) params.set("tool", draft.tool);
    params.set("duration", String(draft.durationMinutes));
    params.set("complexity", draft.complexity);
    params.set("activity", draft.activity);
    if (draft.messageCount != null) {
      params.set("notes", `~${draft.messageCount} messages (imported)`);
    }
    setLocation(`/log?${params.toString()}`);
  };

  const inputClass =
    "w-full text-sm px-3 py-2 rounded-md border border-input bg-background";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Import from an AI session</h1>
        <p className="text-lg text-muted-foreground">
          Paste a description of what you just did — or a summary the AI gave you — and we'll turn it
          into a draft log entry you can review and save.
        </p>
      </header>

      <Card>
        <CardContent className="p-6 space-y-4">
          <label htmlFor="import-text" className="block text-sm font-medium">
            Paste your session text
          </label>
          <textarea
            id="import-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={`e.g. "Spent about 45 minutes with Claude refactoring a Python script — around 20 messages back and forth."`}
            className="w-full text-sm px-3 py-2 rounded-md border border-input bg-background resize-y"
          />
          <Button onClick={handleParse} disabled={!text.trim()}>
            <Wand2 className="h-4 w-4" />
            Parse into a draft
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Review the draft</h2>
            <p className="text-sm text-muted-foreground">
              We made our best guess. Adjust anything below, then continue to the log form to confirm
              and save.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="d-tool" className="text-xs font-medium text-muted-foreground">
                  Tool
                </label>
                <input
                  id="d-tool"
                  className={inputClass}
                  value={draft.tool}
                  placeholder="Pick in the log form"
                  onChange={(e) => setDraft({ ...draft, tool: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="d-duration" className="text-xs font-medium text-muted-foreground">
                  Duration (minutes)
                </label>
                <input
                  id="d-duration"
                  type="number"
                  min={1}
                  className={inputClass}
                  value={draft.durationMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, durationMinutes: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="d-activity" className="text-xs font-medium text-muted-foreground">
                  Activity
                </label>
                <select
                  id="d-activity"
                  className={inputClass}
                  value={draft.activity}
                  onChange={(e) => setDraft({ ...draft, activity: e.target.value as ActivityType })}
                >
                  {ACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="d-complexity" className="text-xs font-medium text-muted-foreground">
                  Complexity
                </label>
                <select
                  id="d-complexity"
                  className={inputClass}
                  value={draft.complexity}
                  onChange={(e) => setDraft({ ...draft, complexity: e.target.value as Complexity })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {draft.messageCount != null && (
              <p className="text-xs text-muted-foreground">
                Detected ~{draft.messageCount} messages — we'll add that as a note. The Tracker
                estimates queries from duration and activity, not the message count itself.
              </p>
            )}

            <Button onClick={handleSave} className="w-full sm:w-auto">
              Save to Tracker →
            </Button>
            <p className="text-xs text-muted-foreground">
              You'll confirm and save in the log form (sign-in required).
            </p>
          </CardContent>
        </Card>
      )}

      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-muted-foreground">
          This is a parsing convenience, not auto-tracking — it only reads the text you paste, and
          nothing is logged until you confirm it in the log form. Prefer one click from the page
          you're on? Try the{" "}
          <Link href="/bookmarklet" className="underline hover:text-foreground">
            Quick-Log bookmarklet
          </Link>
          .
        </AlertDescription>
      </Alert>
    </div>
  );
}
