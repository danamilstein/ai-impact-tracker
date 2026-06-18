import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Normalize `sslmode=require` (and the other aliases) to `verify-full` so we
// keep today's behavior explicitly and silence the pg v9 deprecation warning.
// See: https://www.postgresql.org/docs/current/libpq-ssl.html
function normalizeSslMode(connectionString: string): string {
  return connectionString.replace(
    /([?&]sslmode=)(require|prefer|verify-ca)\b/i,
    "$1verify-full",
  );
}

export const pool = new Pool({
  connectionString: normalizeSslMode(process.env.DATABASE_URL),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
