import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiToolsTable = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  category: text("category").notNull().default("text"),
  waterPerQueryMl: real("water_per_query_ml").notNull(),
  co2PerQueryG: real("co2_per_query_g").notNull(),
  energyPerQueryWh: real("energy_per_query_wh").notNull(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiToolSchema = createInsertSchema(aiToolsTable).omit({ id: true, createdAt: true });
export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type AiTool = typeof aiToolsTable.$inferSelect;
