import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetMeResponse, UpdateMeBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email, gridRegion: usersTable.gridRegion })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const parsed = GetMeResponse.safeParse({
    id: user.id,
    email: user.email,
    gridRegion: user.gridRegion ?? "US_AVERAGE",
  });
  if (!parsed.success) {
    res.status(500).json({ error: "Response validation failed" });
    return;
  }
  res.json(parsed.data);
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ gridRegion: parsed.data.gridRegion })
    .where(eq(usersTable.id, req.userId!))
    .returning({ id: usersTable.id, email: usersTable.email, gridRegion: usersTable.gridRegion });

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const response = GetMeResponse.safeParse({
    id: updated.id,
    email: updated.email,
    gridRegion: updated.gridRegion ?? "US_AVERAGE",
  });
  if (!response.success) {
    res.status(500).json({ error: "Response validation failed" });
    return;
  }
  res.json(response.data);
});

export default router;
