import { Router, type IRouter } from "express";
import { db, goalsTable, sessionsTable } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import {
  CreateGoalBody,
  UpdateGoalParams,
  UpdateGoalBody,
  UpdateGoalResponse,
  DeleteGoalParams,
  ListGoalsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function getPeriodStart(period: string): string {
  const now = new Date();
  if (period === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  }
  const d = new Date(now);
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

function metricColumn(metric: string) {
  switch (metric) {
    case "water_ml": return sessionsTable.waterMl;
    case "co2_g": return sessionsTable.co2G;
    case "energy_wh": return sessionsTable.energyWh;
    default: return sessionsTable.co2G;
  }
}

async function attachProgress(goal: typeof goalsTable.$inferSelect, userId: string) {
  const periodStart = getPeriodStart(goal.period);
  const col = metricColumn(goal.metric);

  const [agg] = await db
    .select({ total: sql<number>`coalesce(sum(${col}), 0)` })
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.userId, userId),
        gte(sessionsTable.sessionDate, periodStart),
      ),
    );

  const currentValue = Number(agg?.total ?? 0);
  const percentUsed = goal.targetValue > 0
    ? Math.round((currentValue / goal.targetValue) * 1000) / 10
    : 0;

  return {
    id: goal.id,
    name: goal.name,
    metric: goal.metric,
    period: goal.period,
    targetValue: goal.targetValue,
    currentValue,
    percentUsed,
    createdAt: goal.createdAt,
  };
}

router.get("/goals", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const goals = await db
    .select()
    .from(goalsTable)
    .where(eq(goalsTable.userId, userId))
    .orderBy(goalsTable.createdAt);
  const withProgress = await Promise.all(goals.map((g) => attachProgress(g, userId)));
  res.json(ListGoalsResponse.parse(withProgress));
});

router.post("/goals", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.userId!;

  const [goal] = await db
    .insert(goalsTable)
    .values({
      userId,
      name: parsed.data.name,
      metric: parsed.data.metric,
      period: parsed.data.period,
      targetValue: parsed.data.targetValue,
    })
    .returning();

  const withProgress = await attachProgress(goal, userId);
  res.status(201).json(withProgress);
});

router.patch("/goals/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateGoalParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateGoalBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const userId = req.userId!;

  const updateData: Record<string, unknown> = {};
  if (body.data.name !== undefined) updateData.name = body.data.name;
  if (body.data.targetValue !== undefined) updateData.targetValue = body.data.targetValue;

  const [updated] = await db
    .update(goalsTable)
    .set(updateData)
    .where(and(eq(goalsTable.id, params.data.id), eq(goalsTable.userId, userId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  const withProgress = await attachProgress(updated, userId);
  res.json(UpdateGoalResponse.parse(withProgress));
});

router.delete("/goals/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteGoalParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.userId!;

  const [deleted] = await db
    .delete(goalsTable)
    .where(and(eq(goalsTable.id, params.data.id), eq(goalsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
