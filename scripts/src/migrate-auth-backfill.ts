/**
 * One-time auth backfill migration.
 *
 * Assigns all pre-existing rows in `sessions` and `goals` that have a
 * NULL `user_id` to a specific Clerk user (the project owner), then
 * enforces `NOT NULL` on those columns going forward.
 *
 * Usage (run once after deploying the auth changes):
 *
 *   export OWNER_CLERK_USER_ID=user_XXXXXXXXXXXXXXXXXXXX
 *   pnpm --filter @workspace/scripts run migrate-auth-backfill
 *
 * To find the owner's Clerk user id:
 *   1. Sign in to the deployed app once with the owner account.
 *   2. Open the Auth pane in the Replit workspace toolbar.
 *   3. Copy the user id (it looks like `user_xxxxxxxx`).
 *
 * The script is idempotent: re-running it with the same env var is safe
 * and a no-op if there are no NULL rows left.
 */

import { db, usersTable, sessionsTable, goalsTable } from "@workspace/db";
import { eq, isNull, sql } from "drizzle-orm";

async function main(): Promise<void> {
  const ownerId = process.env.OWNER_CLERK_USER_ID?.trim();

  if (!ownerId) {
    console.error(
      "Error: OWNER_CLERK_USER_ID environment variable is required.\n\n" +
        "Set it to the Clerk user id of the project owner (e.g. user_xxx)\n" +
        "and re-run this script. See the file header for details.",
    );
    process.exit(1);
  }

  console.log(`Backfilling legacy rows to user ${ownerId}...`);

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(8675309)`);

    // Ensure the owner user row exists.
    await tx
      .insert(usersTable)
      .values({ id: ownerId, email: null })
      .onConflictDoNothing();

    const sessionsRes = await tx
      .update(sessionsTable)
      .set({ userId: ownerId })
      .where(isNull(sessionsTable.userId))
      .returning({ id: sessionsTable.id });

    const goalsRes = await tx
      .update(goalsTable)
      .set({ userId: ownerId })
      .where(isNull(goalsTable.userId))
      .returning({ id: goalsTable.id });

    console.log(`  Assigned ${sessionsRes.length} sessions to owner.`);
    console.log(`  Assigned ${goalsRes.length} goals to owner.`);

    // Enforce NOT NULL on the database columns. Idempotent: if already
    // NOT NULL, this is a no-op.
    await tx.execute(sql`ALTER TABLE sessions ALTER COLUMN user_id SET NOT NULL`);
    await tx.execute(sql`ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL`);
  });

  console.log("Done. user_id is now NOT NULL on sessions and goals.");
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
