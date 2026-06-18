import { pgTable, serial, integer, text, real, timestamp, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { aiToolsTable } from "./aiTools";
import { usersTable } from "./users";

export const sessionsTable = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    // NOTE: nullable in the Drizzle schema so `drizzle-kit push` succeeds
    // on populated production tables before the one-time auth backfill
    // (`scripts/src/migrate-auth-backfill.ts`) runs. The backfill enforces
    // NOT NULL at the database level. Follow-up: tighten this column to
    // `.notNull()` in the schema once the backfill has run on all envs.
    userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
    toolId: integer("tool_id").notNull().references(() => aiToolsTable.id, { onDelete: "restrict" }),
    queryCount: integer("query_count").notNull(),
    complexity: text("complexity").notNull().default("medium"),
    activityType: text("activity_type"),
    durationMinutes: integer("duration_minutes"),
    waterMl: real("water_ml").notNull(),
    co2G: real("co2_g").notNull(),
    energyWh: real("energy_wh").notNull(),
    notes: text("notes"),
    sessionDate: date("session_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
