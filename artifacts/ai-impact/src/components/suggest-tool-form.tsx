import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

const RECIPIENT = "drdanamilstein@gmail.com";

export function SuggestToolForm() {
  const [toolName, setToolName] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = toolName.trim()
      ? `Tool suggestion: ${toolName.trim()}`
      : "AI Impact Tracker — tool suggestion";
    const bodyLines = [
      toolName.trim() ? `Tool: ${toolName.trim()}` : "",
      "",
      details.trim() || "(Please describe the tool and any energy/water/CO2 sources you know of.)",
    ];
    const body = bodyLines.join("\n");
    const href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body,
    )}`;
    window.location.href = href;
  };

  return (
    <Card id="suggest-a-tool" className="shadow-sm scroll-mt-24">
      <CardHeader>
        <CardTitle className="text-xl">Suggest a tool</CardTitle>
        <CardDescription>
          Missing a tool, or know of a better source for one of our coefficients? Send a request
          and it opens a pre-filled email to{" "}
          <a href={`mailto:${RECIPIENT}`} className="text-primary hover:underline">
            {RECIPIENT}
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="suggest-tool-name">Tool name</Label>
            <Input
              id="suggest-tool-name"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g. Perplexity, Midjourney v7"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suggest-tool-details">What should we know?</Label>
            <Textarea
              id="suggest-tool-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Why it belongs in the catalog, the model it's built on, or any published energy/water/CO2 figures."
              rows={4}
            />
          </div>
          <Button type="submit">
            <Mail className="w-4 h-4 mr-2" />
            Send suggestion
          </Button>
          <p className="text-xs text-muted-foreground">
            This opens your email app with the message pre-filled — nothing is sent until you press
            send.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
