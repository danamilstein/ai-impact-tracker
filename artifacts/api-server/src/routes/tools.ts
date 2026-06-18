import { Router, type IRouter } from "express";
import { db, aiToolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetToolParams,
  GetToolResponse,
  ListToolsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tools", async (_req, res): Promise<void> => {
  const tools = await db.select().from(aiToolsTable).orderBy(aiToolsTable.provider, aiToolsTable.name);
  res.json(ListToolsResponse.parse(tools));
});

router.get("/tools/:id", async (req, res): Promise<void> => {
  const params = GetToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db.select().from(aiToolsTable).where(eq(aiToolsTable.id, params.data.id));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(GetToolResponse.parse(tool));
});

export default router;
