import { pgTable, serial, text, real, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const goalsTable = pgTable(
  "goals",
  {
    id: serial("id").primaryKey(),
    // NOTE: nullable in the Drizzle schema so `drizzle-kit push` succeeds
    // on populated production tables before the one-time auth backfill
    // (`scripts/src/migrate-auth-backfill.ts`) runs. The backfill enforces
    // NOT NULL at the database level. Follow-up: tighten this column to
    // `.notNull()` in the schema once the backfill has run on all envs.
    userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    metric: text("metric").notNull(),
    period: text("period").notNull(),
    targetValue: real("target_value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("goals_user_id_idx").on(table.userId)],
);

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
