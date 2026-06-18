export type SourceCategory = "Published" | "Disclosed" | "Modeled" | "Placeholder";

export type ToolSource = {
  /** Underlying model, if disclosed or reasonably inferred. */
  model: string;
  /** How we sourced this tool's per-query coefficient. */
  sourceCategory: SourceCategory;
  /** One-line citation or assumption note. */
  note: string;
  /** Provider compute infrastructure (e.g. "Microsoft Azure"). */
  dataCenterInfra: string;
  /** Primary inference region(s), or fallback disclosure. */
  dataCenterRegion: string;
  /** Catalog refresh date this row was last reviewed (e.g. "May 2026"). */
  updated?: string;
};

/**
 * The current quarterly catalog refresh. Update this single string each quarter
 * to re-stamp the methodology page's refresh-policy block.
 */
export const CATALOG_REFRESH_DATE = "May 2026";

/**
 * Per-tool source attribution, keyed by the exact tool name in the database.
 * Frontier-model coefficients have published or disclosed sources; mid-tier and
 * embedded-AI tools are Modeled (inferred from an underlying model) or
 * Placeholder (no good source — conservative estimate flagged low-confidence).
 */
export const TOOL_SOURCES: Record<string, ToolSource> = {
  "Adobe Firefly": {
    model: "Proprietary diffusion model",
    sourceCategory: "Modeled",
    note: "Inferred from Stable Diffusion-class image generation (Luccioni 2024).",
    dataCenterInfra: "Adobe / Microsoft Azure",
    dataCenterRegion: "Not publicly disclosed; US-grid average used.",
  },
  "Amazon CodeWhisperer": {
    model: "Amazon code model",
    sourceCategory: "Modeled",
    note: "Inferred from short code-completion calls (Copilot-class).",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2 (AWS primary regions).",
  },
  "Asana AI": {
    model: "Embedded GPT-class model",
    sourceCategory: "Placeholder",
    note: "No public per-query data; conservative estimate flagged low-confidence.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Canva AI": {
    model: "Undisclosed (image + text)",
    sourceCategory: "Placeholder",
    note: "Canva Magic Studio publishes no per-generation data; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Character.AI": {
    model: "Proprietary LLM (mid-size)",
    sourceCategory: "Modeled",
    note: "Inferred from mid-size LLM inference.",
    dataCenterInfra: "Google Cloud",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "ChatGPT (GPT-3.5)": {
    model: "OpenAI GPT-3.5",
    sourceCategory: "Published",
    note: "Luccioni 2024 / Epoch AI per-query energy estimates.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
  "ChatGPT (GPT-4)": {
    model: "OpenAI GPT-4",
    sourceCategory: "Published",
    note: "Patterson 2022 / Epoch AI modeled per-query energy.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
  "ChatGPT (GPT-4o)": {
    model: "OpenAI GPT-4o",
    sourceCategory: "Disclosed",
    note: "Altman (early 2025) disclosed ~0.34 Wh per average ChatGPT query; Epoch AI (2025) independently estimates a ~0.3 Wh median.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
  "Claude 3 Haiku": {
    model: "Anthropic Claude 3 Haiku",
    sourceCategory: "Modeled",
    note: "Inferred from small-model inference; Anthropic publishes no per-query energy.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Claude 3 Opus": {
    model: "Anthropic Claude 3 Opus",
    sourceCategory: "Modeled",
    note: "Inferred from large-model inference; no Anthropic disclosure.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Claude 3.5 Haiku": {
    model: "Anthropic Claude 3.5 Haiku",
    sourceCategory: "Modeled",
    note: "Inferred from small-model inference; no Anthropic disclosure.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Claude 3.5 Sonnet": {
    model: "Anthropic Claude 3.5 Sonnet",
    sourceCategory: "Modeled",
    note: "Inferred from GPT-4-class inference; Anthropic publishes no per-query energy.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Claude 3.7 Sonnet": {
    model: "Anthropic Claude 3.7 Sonnet",
    sourceCategory: "Modeled",
    note: "GPT-4o-class inference; no Anthropic disclosure.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Claude Haiku 4.5": {
    model: "Anthropic Claude Haiku 4.5",
    sourceCategory: "Modeled",
    note: "Small-model inference; no Anthropic disclosure.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Claude Opus 4.6": {
    model: "Anthropic Claude Opus 4.6",
    sourceCategory: "Modeled",
    note: "Scaled from Claude 3 Opus inference; no Anthropic disclosure.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Claude Sonnet 4.6": {
    model: "Anthropic Claude Sonnet 4.6",
    sourceCategory: "Modeled",
    note: "GPT-4o-class inference; no Anthropic disclosure.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "us-east-1, us-west-2.",
    updated: "May 2026",
  },
  "Consensus": {
    model: "GPT-class over academic RAG",
    sourceCategory: "Placeholder",
    note: "Retrieval over LLM; no public data. Multi-call retrieval likely under-counted.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Cursor": {
    model: "GPT-4 / Claude class",
    sourceCategory: "Modeled",
    note: "Inferred from underlying frontier-model completions.",
    dataCenterInfra: "OpenAI/Anthropic (Azure/AWS)",
    dataCenterRegion: "US regions (Azure/AWS).",
    updated: "May 2026",
  },
  "DALL-E 3": {
    model: "OpenAI DALL-E 3",
    sourceCategory: "Modeled",
    note: "Inferred from diffusion image generation (Luccioni 2024).",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
  "DeepSeek R1": {
    model: "DeepSeek R1",
    sourceCategory: "Modeled",
    note: "Inferred from large reasoning-model inference.",
    dataCenterInfra: "DeepSeek (China)",
    dataCenterRegion: "China grid; not US. Regional average used.",
  },
  "DeepSeek V3": {
    model: "DeepSeek V3",
    sourceCategory: "Modeled",
    note: "MoE inference; published architecture (DeepSeek 2024) but no per-query energy disclosure.",
    dataCenterInfra: "DeepSeek (China)",
    dataCenterRegion: "China grid; not US. Regional average used.",
    updated: "May 2026",
  },
  "ElevenLabs": {
    model: "Proprietary TTS",
    sourceCategory: "Placeholder",
    note: "No public per-generation energy; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "GPT-4o mini": {
    model: "OpenAI GPT-4o mini",
    sourceCategory: "Modeled",
    note: "Scaled down from GPT-4o disclosure for the small-model class.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
  "Gemini 1.5 Flash": {
    model: "Google Gemini 1.5 Flash",
    sourceCategory: "Disclosed",
    note: "Google Aug 2025 AI-inference impact disclosure.",
    dataCenterInfra: "Google Cloud",
    dataCenterRegion: "us-central1 and regional Google inference.",
  },
  "Gemini 1.5 Pro": {
    model: "Google Gemini 1.5 Pro",
    sourceCategory: "Disclosed",
    note: "Google Aug 2025 disclosure (scaled to Pro tier).",
    dataCenterInfra: "Google Cloud",
    dataCenterRegion: "us-central1 and regional Google inference.",
  },
  "Gemini 2.0 Flash": {
    model: "Google Gemini 2.0 Flash",
    sourceCategory: "Disclosed",
    note: "Google Aug 2025 AI-inference impact disclosure.",
    dataCenterInfra: "Google Cloud",
    dataCenterRegion: "us-central1 and regional Google inference.",
  },
  "GitHub Copilot": {
    model: "OpenAI Codex / GPT-4 class",
    sourceCategory: "Modeled",
    note: "Inferred from short code-completion calls.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
  "Grammarly AI": {
    model: "Embedded GenAI features",
    sourceCategory: "Placeholder",
    note: "No public per-query data; conservative low estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Grok": {
    model: "xAI Grok",
    sourceCategory: "Modeled",
    note: "Inferred from GPT-4-class inference; no xAI disclosure.",
    dataCenterInfra: "xAI (Colossus)",
    dataCenterRegion: "Memphis, TN (TVA grid).",
    updated: "May 2026",
  },
  "HeyGen": {
    model: "Proprietary video generation",
    sourceCategory: "Placeholder",
    note: "No public per-generation data; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Hyperframes": {
    model: "Proprietary video generation",
    sourceCategory: "Placeholder",
    note: "No public per-generation data; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Ideogram": {
    model: "Proprietary diffusion model",
    sourceCategory: "Placeholder",
    note: "No public per-generation data; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Jasper": {
    model: "GPT-class wrapper",
    sourceCategory: "Placeholder",
    note: "No public per-query data; conservative estimate.",
    dataCenterInfra: "Undisclosed (OpenAI backend)",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Kling": {
    model: "Kuaishou video model",
    sourceCategory: "Placeholder",
    note: "No public per-generation data; conservative estimate.",
    dataCenterInfra: "Kuaishou (China)",
    dataCenterRegion: "China grid; not US. Regional average used.",
  },
  "Llama 3.1 (70B)": {
    model: "Meta Llama 3.1 70B",
    sourceCategory: "Published",
    note: "Luccioni 2024 open-model inference measurements.",
    dataCenterInfra: "Self-hosted / Meta",
    dataCenterRegion: "Varies by host; US-grid average used.",
  },
  "Llama 3.3 (70B)": {
    model: "Meta Llama 3.3 70B",
    sourceCategory: "Modeled",
    note: "Scaled from Meta Llama 3 family; Meta publishes training but not inference per-query energy.",
    dataCenterInfra: "Self-hosted / Meta",
    dataCenterRegion: "Varies by host; US-grid average used.",
    updated: "May 2026",
  },
  "Microsoft Copilot": {
    model: "OpenAI GPT-4 class",
    sourceCategory: "Modeled",
    note: "Inferred from GPT-4o; Microsoft publishes no per-query energy.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
    updated: "May 2026",
  },
  "Midjourney": {
    model: "Proprietary diffusion model",
    sourceCategory: "Modeled",
    note: "Inferred from Stable Diffusion-class image generation.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Mistral Large": {
    model: "Mistral Large",
    sourceCategory: "Modeled",
    note: "Inferred from open-model class (Luccioni 2024).",
    dataCenterInfra: "Mistral / Microsoft Azure",
    dataCenterRegion: "EU regions; EU-grid average used.",
  },
  "Notion AI": {
    model: "OpenAI GPT-4 class",
    sourceCategory: "Modeled",
    note: "Notion AI runs on OpenAI models; inferred from GPT-4-class inference.",
    dataCenterInfra: "Microsoft Azure (via OpenAI)",
    dataCenterRegion: "East US, West US 2, South Central US.",
    updated: "May 2026",
  },
  "Perplexity AI": {
    model: "GPT-4 / Claude class + RAG",
    sourceCategory: "Modeled",
    note: "Inferred from frontier model + retrieval; multi-call retrieval under-counted.",
    dataCenterInfra: "Amazon AWS",
    dataCenterRegion: "US regions (AWS).",
  },
  "Replit AI": {
    model: "Frontier code model",
    sourceCategory: "Modeled",
    note: "Inferred from short code-completion calls.",
    dataCenterInfra: "Google Cloud / partner models",
    dataCenterRegion: "US regions.",
  },
  "Runway": {
    model: "Proprietary video model",
    sourceCategory: "Placeholder",
    note: "No public per-generation data; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Stable Diffusion": {
    model: "Stability AI Stable Diffusion",
    sourceCategory: "Published",
    note: "Luccioni 2024 measured diffusion image-generation energy.",
    dataCenterInfra: "Self-hosted / Stability",
    dataCenterRegion: "Varies by host; US-grid average used.",
  },
  "Suno": {
    model: "Proprietary music model",
    sourceCategory: "Placeholder",
    note: "No public per-generation data; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Udio": {
    model: "Proprietary music model",
    sourceCategory: "Placeholder",
    note: "No public per-generation data; conservative estimate.",
    dataCenterInfra: "Undisclosed",
    dataCenterRegion: "Not disclosed; US-grid average used.",
  },
  "Whisper (transcription)": {
    model: "OpenAI Whisper",
    sourceCategory: "Modeled",
    note: "Inferred from lightweight transcription inference.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
  "o1": {
    model: "OpenAI o1",
    sourceCategory: "Modeled",
    note: "Inferred from large reasoning-model inference; extended thinking under-counted.",
    dataCenterInfra: "Microsoft Azure",
    dataCenterRegion: "East US, West US 2, South Central US.",
  },
};

const FALLBACK_SOURCE: ToolSource = {
  model: "Undisclosed",
  sourceCategory: "Placeholder",
  note: "No public per-query data; conservative estimate flagged low-confidence.",
  dataCenterInfra: "Undisclosed",
  dataCenterRegion: "Not disclosed; US-grid average used.",
};

export function getToolSource(toolName: string): ToolSource {
  return TOOL_SOURCES[toolName] ?? FALLBACK_SOURCE;
}

export function isLowConfidence(toolName: string): boolean {
  return getToolSource(toolName).sourceCategory === "Placeholder";
}

export const SOURCE_CATEGORY_STYLES: Record<SourceCategory, string> = {
  Published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Disclosed: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  Modeled: "bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20",
  Placeholder: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};
