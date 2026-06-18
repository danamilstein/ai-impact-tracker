import { Router, type IRouter } from "express";
import { db, sessionsTable, aiToolsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  ListSessionsQueryParams,
  ListSessionsResponse,
  CreateSessionBody,
  GetSessionParams,
  GetSessionResponse,
  UpdateSessionParams,
  UpdateSessionBody,
  UpdateSessionResponse,
  DeleteSessionParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  low: 0.5,
  medium: 1.0,
  high: 2.0,
};

const QUERIES_PER_MINUTE: Record<string, number> = {
  queries: 4,
  research: 2,
  composing: 1.5,
  programming: 2,
  visualizing: 0.5,
};

/**
 * Tool-category cadence modifier applied on top of the activity base rate.
 * A minute of work produces very different numbers of discrete model calls
 * depending on the tool type: a chat/code tool fires many short queries, while
 * an image/audio/video generator produces a handful of heavy generations.
 * Baseline (text chat) = 1.0. Values are deliberately coarse, not per-tool
 * precision, and are disclosed as such on the methodology page.
 */
const CATEGORY_RATE_MODIFIER: Record<string, number> = {
  text: 1.0,
  code: 1.5,
  productivity: 1.0,
  multimodal: 0.8,
  image: 0.4,
  audio: 0.3,
  video: 0.2,
};

function deriveQueryCount(
  activityType: string,
  durationMinutes: number,
  category: string
): number {
  const rate = QUERIES_PER_MINUTE[activityType] ?? 1;
  const modifier = CATEGORY_RATE_MODIFIER[category] ?? 1;
  return Math.max(1, Math.round(rate * modifier * durationMinutes));
}

function computeImpact(
  tool: { waterPerQueryMl: number; co2PerQueryG: number; energyPerQueryWh: number },
  queryCount: number,
  complexity: string
) {
  const mult = COMPLEXITY_MULTIPLIER[complexity] ?? 1.0;
  return {
    waterMl: tool.waterPerQueryMl * queryCount * mult,
    co2G: tool.co2PerQueryG * queryCount * mult,
    energyWh: tool.energyPerQueryWh * queryCount * mult,
  };
}

router.get("/sessions", requireAuth, async (req, res): Promise<void> => {
  const query = ListSessionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { limit = 50, offset = 0, toolId } = query.data;
  const userId = req.userId!;

  const conditions = [eq(sessionsTable.userId, userId)];
  if (toolId != null) conditions.push(eq(sessionsTable.toolId, toolId));

  const rows = await db
    .select({
      id: sessionsTable.id,
      toolId: sessionsTable.toolId,
      toolName: aiToolsTable.name,
      toolProvider: aiToolsTable.provider,
      queryCount: sessionsTable.queryCount,
      complexity: sessionsTable.complexity,
      activityType: sessionsTable.activityType,
      durationMinutes: sessionsTable.durationMinutes,
      waterMl: sessionsTable.waterMl,
      co2G: sessionsTable.co2G,
      energyWh: sessionsTable.energyWh,
      notes: sessionsTable.notes,
      sessionDate: sessionsTable.sessionDate,
      createdAt: sessionsTable.createdAt,
    })
    .from(sessionsTable)
    .innerJoin(aiToolsTable, eq(sessionsTable.toolId, aiToolsTable.id))
    .where(and(...conditions))
    .orderBy(desc(sessionsTable.sessionDate), desc(sessionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(ListSessionsResponse.parse(rows));
});

router.post("/sessions", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolId, activityType, durationMinutes, complexity, notes, sessionDate } = parsed.data;
  const userId = req.userId!;

  const [tool] = await db.select().from(aiToolsTable).where(eq(aiToolsTable.id, toolId));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  const queryCount = deriveQueryCount(activityType, durationMinutes, tool.category);
  const impact = computeImpact(tool, queryCount, complexity);
  const today = new Date().toISOString().split("T")[0];
  const sessionDateStr = sessionDate instanceof Date
    ? sessionDate.toISOString().split("T")[0]
    : (sessionDate ?? today);

  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId,
      toolId,
      queryCount,
      complexity,
      activityType,
      durationMinutes,
      notes: notes ?? null,
      sessionDate: sessionDateStr,
      ...impact,
    })
    .returning();

  const result = {
    ...session,
    toolName: tool.name,
    toolProvider: tool.provider,
  };

  res.status(201).json(GetSessionResponse.parse(result));
});

router.get("/sessions/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSessionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.userId!;

  const [row] = await db
    .select({
      id: sessionsTable.id,
      toolId: sessionsTable.toolId,
      toolName: aiToolsTable.name,
      toolProvider: aiToolsTable.provider,
      queryCount: sessionsTable.queryCount,
      complexity: sessionsTable.complexity,
      activityType: sessionsTable.activityType,
      durationMinutes: sessionsTable.durationMinutes,
      waterMl: sessionsTable.waterMl,
      co2G: sessionsTable.co2G,
      energyWh: sessionsTable.energyWh,
      notes: sessionsTable.notes,
      sessionDate: sessionsTable.sessionDate,
      createdAt: sessionsTable.createdAt,
    })
    .from(sessionsTable)
    .innerJoin(aiToolsTable, eq(sessionsTable.toolId, aiToolsTable.id))
    .where(and(eq(sessionsTable.id, params.data.id), eq(sessionsTable.userId, userId)));

  if (!row) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(GetSessionResponse.parse(row));
});

router.patch("/sessions/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSessionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateSessionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const userId = req.userId!;

  const [existing] = await db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, params.data.id), eq(sessionsTable.userId, userId)));

  if (!existing) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const [tool] = await db.select().from(aiToolsTable).where(eq(aiToolsTable.id, existing.toolId));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  const activityType = body.data.activityType ?? existing.activityType ?? "queries";
  const durationMinutes = body.data.durationMinutes ?? existing.durationMinutes ?? 0;
  const complexity = body.data.complexity ?? existing.complexity;
  const queryCount = durationMinutes > 0
    ? deriveQueryCount(activityType, durationMinutes, tool.category)
    : existing.queryCount;
  const impact = computeImpact(tool, queryCount, complexity);

  const updateData: Record<string, unknown> = {
    queryCount,
    complexity,
    activityType,
    ...impact,
  };
  if (body.data.durationMinutes !== undefined) updateData.durationMinutes = body.data.durationMinutes;
  if (body.data.notes !== undefined) updateData.notes = body.data.notes;

  const [updated] = await db
    .update(sessionsTable)
    .set(updateData)
    .where(and(eq(sessionsTable.id, params.data.id), eq(sessionsTable.userId, userId)))
    .returning();

  const result = {
    ...updated,
    toolName: tool.name,
    toolProvider: tool.provider,
  };

  res.json(UpdateSessionResponse.parse(result));
});

router.delete("/sessions/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSessionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.userId!;

  const [deleted] = await db
    .delete(sessionsTable)
    .where(and(eq(sessionsTable.id, params.data.id), eq(sessionsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
