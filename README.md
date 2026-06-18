# AI Impact Tracker

A personal-reflection tool that estimates the environmental footprint — energy, carbon, and water — of your everyday AI use, one session at a time. It is built for students and anyone who wants to notice, not be scored by, the cost of the tools they use.

Designed by Dana Milstein Santoscoy, PhD, ACC.

## What it does

- **Log sessions** — record which AI tool you used, for how long, the kind of activity, and the complexity. The Tracker estimates queries from duration and activity, then computes energy (Wh), carbon (g CO₂), and water (ml).
- **Quarterly-refreshed coefficient catalog** — per-query estimates for ~40 AI tools across text, code, image, audio, and video, each carrying a confidence label (Published / Disclosed / Modeled / Placeholder).
- **Live U.S. grid intensity** — carbon intensity for U.S. balancing authorities pulled hourly from the EIA grid monitor; curated static averages elsewhere.
- **Location-dependent water** — per-region water-usage effectiveness, based on Li, Yang, Islam & Ren (2023).
- **Seven Dimensions of Wellness** — an optional, private way to notice trade-offs the numbers can't see.
- **Quick-Log bookmarklet & Import** — low-friction ways to start a log that always open the form for you to review and confirm. The Tracker never auto-tracks or reads your conversations.

A full, sourced explanation of every estimate lives on the in-app **Methodology** page.

## Methodology, in brief

```
energy_Wh = base_energy_per_query × queries × complexity_multiplier
carbon_g  = energy_Wh × (grid_gCO2_per_kWh ÷ 1000)
water_ml  = energy_Wh × region_WUE
```

These are estimates, not measurements — good for comparing orders of magnitude and relative tool impact, accurate to within a factor of 2–3. See the Methodology page for coefficients, sources, and limits.

## Tech stack

This is a pnpm monorepo (Node.js 24, TypeScript 5.9).

- **Web app** (`artifacts/ai-impact`) — Vite + React, wouter, Tailwind, shadcn/ui, Clerk auth, TanStack Query.
- **API server** (`artifacts/api-server`) — Express 5, PostgreSQL + Drizzle ORM, Zod validation.
- **API contract** — OpenAPI-first; React Query hooks and Zod schemas generated via Orval.

## Running locally

```bash
pnpm install
pnpm --filter @workspace/api-server run dev   # API (reads DATABASE_URL)
pnpm --filter @workspace/ai-impact run dev    # web app
pnpm run typecheck                            # full typecheck across packages
```

Required environment: `DATABASE_URL` (Postgres). U.S. live grid data additionally uses an EIA API key.

## License

Code is released under the [MIT License](./LICENSE). The AI Impact Tracker name, branding, and written content remain © 2026 Dana Milstein Santoscoy.
