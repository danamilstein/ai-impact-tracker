# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## Authentication

- Replit-managed Clerk; configure providers/branding via the Auth pane in the workspace toolbar.
- Server: `clerkMiddleware` in `artifacts/api-server/src/app.ts`; `requireAuth` middleware (`artifacts/api-server/src/middlewares/requireAuth.ts`) gates `/api/sessions`, `/api/goals`, `/api/stats/*`. `/api/tools` and `/api/healthz` stay public.
- JIT user provisioning: every authenticated request ensures a row exists in `users` for the Clerk user id.
- `user_id` is a FK on `sessions` and `goals` to `users(id)` with `ON DELETE CASCADE`. It is **nullable in the Drizzle schema** (so `pnpm --filter db push` succeeds on populated production tables that have legacy NULL rows) but the migration script below promotes both columns to `NOT NULL` once those rows are owned. Application code always stamps and filters by `user_id`, so it's effectively non-null at the app boundary.
- Web client uses cookie auth (no `setAuthTokenGetter`) — same-origin via the shared proxy.
- The OpenAPI spec declares `cookieAuth` as the default security; `/healthz` and `/tools/*` opt out.

### Production migration sequence (run once)

1. Owner signs in to the deployed app once (Clerk creates their user).
2. Copy the owner's Clerk user id from the Auth pane in the workspace toolbar.
3. `export OWNER_CLERK_USER_ID=user_xxxxxxxx`
4. `pnpm --filter @workspace/scripts run migrate-auth-backfill` — assigns any pre-existing rows to the owner and enforces `NOT NULL`.
5. Idempotent: safe to re-run.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
