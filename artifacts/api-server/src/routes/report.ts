import { Router, type IRouter } from "express";
import { db, sessionsTable, aiToolsTable, goalsTable } from "@workspace/db";
import { eq, sql, gte, lt, and } from "drizzle-orm";
import { GetWeeklyReportQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

async function getSnapshot(userId: string, start: string, end: string) {
  const [agg] = await db
    .select({
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
        gte(sessionsTable.sessionDate, start),
        lt(sessionsTable.sessionDate, end),
      ),
    );

  return {
    waterMl: Number(agg?.waterMl ?? 0),
    co2G: Number(agg?.co2G ?? 0),
    energyWh: Number(agg?.energyWh ?? 0),
    sessions: Number(agg?.sessions ?? 0),
    queries: Number(agg?.queries ?? 0),
  };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function dateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function offsetDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function formatLabel(start: Date, end: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const s = `${months[start.getMonth()]} ${start.getDate()}`;
  const e = `${months[end.getMonth()]} ${end.getDate() - 1}`;
  return `${s} – ${e}`;
}

router.get("/stats/report", requireAuth, async (req, res): Promise<void> => {
  const query = GetWeeklyReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const period = query.data.period ?? "week";
  const days = period === "week" ? 7 : 30;
  const userId = req.userId!;

  const now = new Date();
  const currentStart = offsetDays(now, -days);
  const previousStart = offsetDays(now, -days * 2);

  const currentStartStr = dateStr(currentStart);
  const previousStartStr = dateStr(previousStart);
  const nowStr = dateStr(now);

  const [current, previous] = await Promise.all([
    getSnapshot(userId, currentStartStr, nowStr),
    getSnapshot(userId, previousStartStr, currentStartStr),
  ]);

  const changes = {
    waterMlPct: pctChange(current.waterMl, previous.waterMl),
    co2GPct: pctChange(current.co2G, previous.co2G),
    energyWhPct: pctChange(current.energyWh, previous.energyWh),
    sessionsPct: pctChange(current.sessions, previous.sessions),
  };

  const topToolRows = await db
    .select({
      toolName: aiToolsTable.name,
      provider: aiToolsTable.provider,
      co2G: sql<number>`coalesce(sum(${sessionsTable.co2G}), 0)`,
      waterMl: sql<number>`coalesce(sum(${sessionsTable.waterMl}), 0)`,
      energyWh: sql<number>`coalesce(sum(${sessionsTable.energyWh}), 0)`,
      sessions: sql<number>`count(*)::int`,
    })
    .from(sessionsTable)
    .innerJoin(aiToolsTable, eq(sessionsTable.toolId, aiToolsTable.id))
    .where(
      and(
        eq(sessionsTable.userId, userId),
        gte(sessionsTable.sessionDate, currentStartStr),
      ),
    )
    .groupBy(aiToolsTable.name, aiToolsTable.provider)
    .orderBy(sql`sum(${sessionsTable.co2G}) DESC`)
    .limit(5);

  const topTools = topToolRows.map((r) => ({
    toolName: r.toolName,
    provider: r.provider,
    co2G: Number(r.co2G),
    waterMl: Number(r.waterMl),
    energyWh: Number(r.energyWh),
    sessions: Number(r.sessions),
  }));

  const peakDayRows = await db
    .select({
      date: sessionsTable.sessionDate,
      co2G: sql<number>`coalesce(sum(${sessionsTable.co2G}), 0)`,
      waterMl: sql<number>`coalesce(sum(${sessionsTable.waterMl}), 0)`,
      energyWh: sql<number>`coalesce(sum(${sessionsTable.energyWh}), 0)`,
      sessions: sql<number>`count(*)::int`,
    })
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.userId, userId),
        gte(sessionsTable.sessionDate, currentStartStr),
      ),
    )
    .groupBy(sessionsTable.sessionDate)
    .orderBy(sql`sum(${sessionsTable.co2G}) DESC`)
    .limit(1);

  const peakDay = peakDayRows[0]
    ? {
        date: peakDayRows[0].date,
        co2G: Number(peakDayRows[0].co2G),
        waterMl: Number(peakDayRows[0].waterMl),
        energyWh: Number(peakDayRows[0].energyWh),
        sessions: Number(peakDayRows[0].sessions),
      }
    : null;

  const goals = await db
    .select()
    .from(goalsTable)
    .where(eq(goalsTable.userId, userId));

  const metricColumn = (metric: string) => {
    switch (metric) {
      case "water_ml": return sessionsTable.waterMl;
      case "energy_wh": return sessionsTable.energyWh;
      default: return sessionsTable.co2G;
    }
  };

  const goalStatuses = await Promise.all(
    goals.map(async (goal) => {
      const col = metricColumn(goal.metric);
      const goalDays = goal.period === "weekly" ? 7 : 30;
      const goalStart = dateStr(offsetDays(now, -goalDays));

      const [agg] = await db
        .select({ total: sql<number>`coalesce(sum(${col}), 0)` })
        .from(sessionsTable)
        .where(
          and(
            eq(sessionsTable.userId, userId),
            gte(sessionsTable.sessionDate, goalStart),
          ),
        );

      const currentValue = Number(agg?.total ?? 0);
      const percentUsed =
        goal.targetValue > 0
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
        onTrack: percentUsed < 100,
      };
    })
  );

  res.json({
    period,
    periodLabel: formatLabel(currentStart, offsetDays(now, 1)),
    current,
    previous,
    changes,
    topTools,
    peakDay,
    goalStatuses,
  });
});

export default router;
