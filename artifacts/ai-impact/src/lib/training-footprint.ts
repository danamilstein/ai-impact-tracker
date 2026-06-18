export type TrainingConfidence = "Published" | "Disclosed" | "Modeled" | "Estimated";

export type TrainingFootprint = {
  model: string;
  /** Training carbon, tonnes CO2-equivalent. */
  carbonTCo2e: string;
  /** Training energy, megawatt-hours. */
  energyMWh: string;
  /** Training water, kiloliters (thousands of liters). */
  waterKL: string;
  confidence: TrainingConfidence;
  notes: string;
};

/**
 * Model-level training footprint. Training energy is significant but cannot be
 * cleanly amortized per query, so we present it separately from the per-query
 * (operational) estimates rather than baking it into them.
 */
export const TRAINING_FOOTPRINT: TrainingFootprint[] = [
  {
    model: "GPT-3 (175B)",
    carbonTCo2e: "552",
    energyMWh: "1,287",
    waterKL: "~700",
    confidence: "Published",
    notes: "Patterson et al. 2022 (carbon/energy); Li et al. 2023 (on-site training water).",
  },
  {
    model: "BLOOM (176B)",
    carbonTCo2e: "25 (≈50 incl. hardware)",
    energyMWh: "433",
    waterKL: "—",
    confidence: "Published",
    notes: "Luccioni et al. 2023. Low carbon thanks to France's nuclear-heavy grid.",
  },
  {
    model: "Llama 2 (70B)",
    carbonTCo2e: "62",
    energyMWh: "688",
    waterKL: "—",
    confidence: "Disclosed",
    notes: "Meta model card (location-based emissions; offset to net-zero by Meta).",
  },
  {
    model: "Llama 3.1 (70B)",
    carbonTCo2e: "~530 (est.)",
    energyMWh: "~5,700 (est.)",
    waterKL: "—",
    confidence: "Estimated",
    notes: "Scaled from Meta's Llama 3 family disclosures; not separately published.",
  },
  {
    model: "GPT-4 (class)",
    carbonTCo2e: "5,000–15,000 (est.)",
    energyMWh: "~50,000 (est.)",
    waterKL: "—",
    confidence: "Estimated",
    notes: "Not officially disclosed; range is the median of credible third-party estimates.",
  },
  {
    model: "Gemini 1.0 Ultra",
    carbonTCo2e: "not disclosed",
    energyMWh: "not disclosed",
    waterKL: "—",
    confidence: "Estimated",
    notes: "Google has not published training cost; comparable to GPT-4 class.",
  },
  {
    model: "Claude 3 (Opus class)",
    carbonTCo2e: "not disclosed",
    energyMWh: "not disclosed",
    waterKL: "—",
    confidence: "Estimated",
    notes: "Anthropic has not published training cost.",
  },
];

export const TRAINING_CONFIDENCE_STYLES: Record<TrainingConfidence, string> = {
  Published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Disclosed: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  Modeled: "bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20",
  Estimated: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};
