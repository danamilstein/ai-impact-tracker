import { db, aiToolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * May 2026 quarterly catalog refresh — adds the six confirmed (non-VERIFY)
 * model entries to the ai_tools catalog. Idempotent: skips any tool whose name
 * already exists, so it is safe to re-run against dev or production.
 *
 * Derived coefficients follow the methodology page:
 *   water_ml = energy_Wh × 1.8   (Li, Yang, Islam, & Ren 2023)
 *   co2_g    = energy_Wh × 0.475 (475 g CO₂ / kWh global average)
 */
const CO2_PER_WH = 0.475;
const ML_PER_WH = 1.8;

const NEW_TOOLS: {
  name: string;
  provider: string;
  category: string;
  energyPerQueryWh: number;
}[] = [
  { name: "Claude Opus 4.6", provider: "Anthropic", category: "text", energyPerQueryWh: 4.0 },
  { name: "Claude Sonnet 4.6", provider: "Anthropic", category: "text", energyPerQueryWh: 1.8 },
  { name: "Claude Haiku 4.5", provider: "Anthropic", category: "text", energyPerQueryWh: 0.3 },
  { name: "Claude 3.7 Sonnet", provider: "Anthropic", category: "text", energyPerQueryWh: 1.8 },
  { name: "Llama 3.3 (70B)", provider: "Meta", category: "text", energyPerQueryWh: 1.2 },
  { name: "DeepSeek V3", provider: "DeepSeek", category: "text", energyPerQueryWh: 1.5 },
];

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const t of NEW_TOOLS) {
    const existing = await db
      .select()
      .from(aiToolsTable)
      .where(eq(aiToolsTable.name, t.name));

    if (existing.length > 0) {
      skipped++;
      console.log(`skip (already present): ${t.name}`);
      continue;
    }

    await db.insert(aiToolsTable).values({
      name: t.name,
      provider: t.provider,
      category: t.category,
      energyPerQueryWh: t.energyPerQueryWh,
      co2PerQueryG: t.energyPerQueryWh * CO2_PER_WH,
      waterPerQueryMl: t.energyPerQueryWh * ML_PER_WH,
    });

    inserted++;
    console.log(
      `insert: ${t.name} (${t.provider}, ${t.category}) — ` +
        `${t.energyPerQueryWh} Wh, ${(t.energyPerQueryWh * CO2_PER_WH).toFixed(4)} g CO2, ` +
        `${(t.energyPerQueryWh * ML_PER_WH).toFixed(2)} ml water`,
    );
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
