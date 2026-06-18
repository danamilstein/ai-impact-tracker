import { Router, type IRouter } from "express";
import { db, sessionsTable, aiToolsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import {
  GetStatsSummaryQueryParams,
  GetStatsByToolQueryParams,
  GetStatsTrendQueryParams,
  GetStatsSummaryResponse,
  GetStatsByToolResponse,
  GetStatsTrendResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case "year": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    }
    default:
      return null;
  }
}

function computeEquivalencies(waterMl: number, co2G: number, energyWh: number) {
  return {
    bottlesOfWater: Math.round((waterMl / 500) * 10) / 10,
    kmDriven: Math.round((co2G / 120) * 100) / 100,
    smartphoneCharges: Math.round((energyWh / 12) * 10) / 10,
    minutesOfStreaming: Math.round((energyWh / 0.0966) * 10) / 10,
    ledBulbHours: Math.round((energyWh / 9) * 10) / 10,
    googleSearches: Math.round(energyWh / 0.3),
  };
}

router.get("/stats/summary", requireAuth, async (req, res): Promise<void> => {
  const query = GetStatsSummaryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const period = query.data.period ?? "month";
  const periodStart = getPeriodStart(period);
  const userId = req.userId!;

  const conditions = [eq(sessionsTable.userId, userId)];
  if (periodStart) {
    conditions.push(gte(sessionsTable.sessionDate, periodStart.toISOString().split("T")[0]));
  }

  const [agg] = await db
    .select({
      totalWaterMl: sql<number>`coalesce(sum(${sessionsTable.waterMl}), 0)`,
      totalCo2G: sql<number>`coalesce(sum(${sessionsTable.co2G}), 0)`,
      totalEnergyWh: sql<number>`coalesce(sum(${sessionsTable.energyWh}), 0)`,
      totalSessions: sql<number>`count(*)::int`,
      totalQueries: sql<number>`coalesce(sum(${sessionsTable.queryCount}), 0)::int`,
    })
    .from(sessionsTable)
    .where(and(...conditions));

  const w = Number(agg?.totalWaterMl ?? 0);
  const c = Number(agg?.totalCo2G ?? 0);
  const e = Number(agg?.totalEnergyWh ?? 0);

  const result = {
    totalWaterMl: w,
    totalCo2G: c,
    totalEnergyWh: e,
    totalSessions: Number(agg?.totalSessions ?? 0),
    totalQueries: Number(agg?.totalQueries ?? 0),
    equivalencies: computeEquivalencies(w, c, e),
  };

  res.json(GetStatsSummaryResponse.parse(result));
});

router.get("/stats/by-tool", requireAuth, async (req, res): Promise<void> => {
  const query = GetStatsByToolQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const period = query.data.period ?? "month";
  const periodStart = getPeriodStart(period);
  const userId = req.userId!;

  const conditions = [eq(sessionsTable.userId, userId)];
  if (periodStart) {
    conditions.push(gte(sessionsTable.sessionDate, periodStart.toISOString().split("T")[0]));
  }

  const rows = await db
    .select({
      toolId: sessionsTable.toolId,
      toolName: aiToolsTable.name,
      provider: aiToolsTable.provider,
      category: aiToolsTable.category,
      waterMl: sql<number>`coalesce(sum(${sessionsTable.waterMl}), 0)`,
      co2G: sql<number>`coalesce(sum(${sessionsTable.co2G}), 0)`,
      energyWh: sql<number>`coalesce(sum(${sessionsTable.energyWh}), 0)`,
      sessions: sql<number>`count(*)::int`,
      queries: sql<number>`coalesce(sum(${sessionsTable.queryCount}), 0)::int`,
    })
    .from(sessionsTable)
    .innerJoin(aiToolsTable, eq(sessionsTable.toolId, aiToolsTable.id))
    .where(and(...conditions))
    .groupBy(sessionsTable.toolId, aiToolsTable.name, aiToolsTable.provider, aiToolsTable.category)
    .orderBy(sql`sum(${sessionsTable.co2G}) DESC`);

  const mapped = rows.map((r) => ({
    toolId: r.toolId,
    toolName: r.toolName,
    provider: r.provider,
    category: r.category,
    waterMl: Number(r.waterMl),
    co2G: Number(r.co2G),
    energyWh: Number(r.energyWh),
    sessions: Number(r.sessions),
    queries: Number(r.queries),
  }));

  res.json(GetStatsByToolResponse.parse(mapped));
});

router.get("/stats/trend", requireAuth, async (req, res): Promise<void> => {
  const query = GetStatsTrendQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const days = query.data.days ?? 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const userId = req.userId!;

  const rows = await db
    .select({
      date: sessionsTable.sessionDate,
      waterMl: sql<number>`coalesce(sum(${sessionsTable.waterMl}), 0)`,
      co2G: sql<number>`coalesce(sum(${sessionsTable.co2G}), 0)`,
      energyWh: sql<number>`coalesce(sum(${sessionsTable.energyWh}), 0)`,
      sessions: sql<number>`count(*)::int`,
      queries: sql<number>`coalesce(sum(${sessionsTable.queryCount}), 0)::int`,
    })
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.userId, userId),
        gte(sessionsTable.sessionDate, startDate.toISOString().split("T")[0]),
      ),
    )
    .groupBy(sessionsTable.sessionDate)
    .orderBy(sessionsTable.sessionDate);

  const mapped = rows.map((r) => ({
    date: r.date,
    waterMl: Number(r.waterMl),
    co2G: Number(r.co2G),
    energyWh: Number(r.energyWh),
    sessions: Number(r.sessions),
    queries: Number(r.queries),
  }));

  res.json(GetStatsTrendResponse.parse(mapped));
});

export default router;
