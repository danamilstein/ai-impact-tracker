import { db, sessionsTable, aiToolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  low: 0.5,
  medium: 1.0,
  high: 2.0,
};

async function main() {
  const tools = await db.select().from(aiToolsTable);
  const toolMap = new Map(tools.map((t) => [t.id, t]));

  const sessions = await db.select().from(sessionsTable);

  let updated = 0;
  let skipped = 0;

  for (const s of sessions) {
    const tool = toolMap.get(s.toolId);
    if (!tool) {
      skipped++;
      continue;
    }
    const mult = COMPLEXITY_MULTIPLIER[s.complexity] ?? 1.0;
    const waterMl = tool.waterPerQueryMl * s.queryCount * mult;
    const co2G = tool.co2PerQueryG * s.queryCount * mult;
    const energyWh = tool.energyPerQueryWh * s.queryCount * mult;

    const same =
      Math.abs(waterMl - s.waterMl) < 1e-6 &&
      Math.abs(co2G - s.co2G) < 1e-6 &&
      Math.abs(energyWh - s.energyWh) < 1e-6;

    if (same) {
      skipped++;
      continue;
    }

    await db
      .update(sessionsTable)
      .set({ waterMl, co2G, energyWh })
      .where(eq(sessionsTable.id, s.id));

    updated++;
    console.log(
      `#${s.id} ${tool.name} x${s.queryCount} (${s.complexity}) ` +
        `→ ${energyWh.toFixed(3)} Wh, ${co2G.toFixed(3)} g CO2, ${waterMl.toFixed(2)} ml water`,
    );
  }

  console.log(`\nDone. Updated ${updated} session(s), skipped ${skipped}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
