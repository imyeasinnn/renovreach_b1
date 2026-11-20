# RenovReach app (frontend mockup)

A clickable, frontend-only mockup of the logged-in RenovReach product. No backend, no auth,
no messaging, no payments — all data is fake and lives in the browser for the session.

> The marketing landing page in the repository root is a separate Vite app and is untouched.

## Run

```bash
cd renovreach_b1
bun install
bun run dev -- --port 3100
```

Open http://localhost:3100. On a fresh session the app opens on `/dashboard`.

## Build

```bash
bun run build
```

## Deploy to Vercel (separate from the landing page)

The landing page is its own Vercel project pointed at the repository root. This app must be a
**second** Vercel project so the two deployments never touch each other.

1. Push the repository (this folder included) to GitHub.
2. In Vercel, choose **Add New → Project** and import the same repository.
3. Set **Root Directory** to `renovreach_b1`.
4. Framework preset: **Next.js** (also declared in `renovreach_b1/vercel.json`).
5. No environment variables are needed for this mockup.
6. Deploy. The landing page project keeps its Root Directory at `.` and its existing Vite build.

Because the Vite build only reads `index.html`, `src/`, and `public/`, the extra `renovreach_b1/`
folder is ignored by the landing page deployment. Nothing in the repository root needs to change.

## Folder structure

```
renovreach_b1/
  app/
    (app)/                 authenticated-style shell
      dashboard/           group 1
      customers/           list, import wizard, detail page
      jobs/                placeholder until group 3
      review-requests/     placeholder until group 3
      reviews/             placeholder until group 4
      campaigns/           placeholder until group 4
      credits/             placeholder until group 5
      settings/            placeholder until group 5
      activity/            placeholder
  components/
    shell/                 sidebar, topbar, switchers, mobile nav
    dashboard/             KPI + chart cards
    ui/                    Button, Card, Badge, KpiCard, EmptyState, Toast, …
  hooks/                   small client hooks (dismissable popovers)
  lib/                     formatting and shared helpers
  mock-data/               every fake record, in one file
  services/                data-access layer (UI calls only these)
  store/                   Zustand in-memory store
  types/                   shared domain types (snake_case, DB-shaped)
```

## How data flows

```
UI component → /services (function or hook) → /store (Zustand) → /mock-data (seed)
```

- Components never import from `mock-data` (except the demo user identity in the user menu).
- Every service function carries a `// TODO: replace with Supabase query` comment.
- `services/dashboard.ts` keeps the KPI/chart math in a pure function
  (`buildDashboardSnapshot`) so it can become a Postgres view or RPC later.

## Replacing the mock with the real backend

1. Add `@supabase/supabase-js` + `@supabase/ssr` and environment variables.
2. Create `lib/supabase/client.ts` and `lib/supabase/server.ts`.
3. Replace each function in `/services` with a Supabase query that filters by the active
   organization; keep the same return types so components do not change.
4. Replace the Zustand store with:
   - server components for initial data, or
   - TanStack Query / SWR for client caching.
5. Keep `type` imports from `/types`; generate the same types from Postgres with
   `supabase gen types typescript`.
6. Delete `mock-data/` and the owner-only demo session.

The active organization/location is intentionally client state for the demo. In the real app it
must be stored in a cookie or URL segment and **always re-validated against memberships
server-side** — never trusted for authorization.

## Demo behaviors

- Organization and location switchers change every screen's data.
- The demo has a single access level: **Owner**. There is no role switcher and no staff/admin preview.
- "Reset demo data" restores the seed.
- Dashboard shows loading skeletons for ~650 ms on first paint.
- All mutations so far are in-memory (the app resets on a full page reload).

## Build status

| Group | Scope | Status |
| --- | --- | --- |
| 1 | Shell + dashboard | Ready for review |
| 2 | Customers + import | Ready for review |
| 3 | Jobs + review requests | Next |
| 4 | Reviews + campaigns | Pending |
| 5 | Credits + settings | Pending |
| 6 | Demo simulation + polish | Pending |

## Notes

- The logo is a placeholder in `components/shell/brand.tsx`.
- Phone numbers use the 555 range; emails use `example.com`.
- App copy is American English.
- This app is separate from the landing page and has no environment variables or secrets.
