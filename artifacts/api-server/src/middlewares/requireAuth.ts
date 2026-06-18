import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const ensuredUserIds = new Set<string>();

async function ensureLocalUser(userId: string): Promise<void> {
  if (ensuredUserIds.has(userId)) return;

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!existing) {
    let email: string | null = null;
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      email = clerkUser.primaryEmailAddress?.emailAddress ?? null;
    } catch {
      email = null;
    }

    await db
      .insert(usersTable)
      .values({ id: userId, email })
      .onConflictDoNothing();
  }

  ensuredUserIds.add(userId);
}

export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = getAuth(req);
  const userId =
    (auth?.sessionClaims as { userId?: string } | undefined)?.userId ??
    auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await ensureLocalUser(userId);
  } catch (err) {
    req.log?.error({ err, userId }, "Failed to ensure local user");
    res.status(500).json({ error: "Failed to initialize user" });
    return;
  }

  req.userId = userId;
  next();
};
