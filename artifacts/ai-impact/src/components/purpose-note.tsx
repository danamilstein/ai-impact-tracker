import { Leaf } from "lucide-react";

export const PURPOSE_NOTE_TITLE = "A note on purpose";

export const PURPOSE_NOTE_BODY =
  "The AI Impact Tracker is an educational and informational tool. Its purpose is to make the environmental cost of AI use visible — not to tell you whether to use AI. We don't treat AI use as inherently good or bad; the value of any given query depends on context, purpose, and alternatives that only you can weigh. We provide the numbers — energy, water, and carbon — and the methodology behind them, and we leave the judgment to you. We do not interpret your data for you, score your behavior, or prescribe a \u201cright\u201d amount of use.";

/**
 * Educational-purpose disclaimer block. Uses the insight-banner visual family
 * (cream background, sage left border, sage leaf icon).
 */
export function PurposeNote() {
  return (
    <div
      className="rounded-md p-4 flex gap-3"
      style={{ backgroundColor: "#F5EFE6", borderLeft: "4px solid #7A8B6A" }}
    >
      <Leaf className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#7A8B6A" }} />
      <div className="space-y-1">
        <p className="font-semibold text-sm" style={{ color: "#5c6a4f" }}>
          {PURPOSE_NOTE_TITLE}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#5c6a4f" }}>
          {PURPOSE_NOTE_BODY}
        </p>
      </div>
    </div>
  );
}
