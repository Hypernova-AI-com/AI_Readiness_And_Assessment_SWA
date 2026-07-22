# HyperNova AI Readiness and Tools Assessment — Web App

A **React + TypeScript + Tailwind (v4)** SPA with an **Azure Functions** backend,
designed to deploy on **Azure Static Web Apps**. Same design system and
hand-written canvas animations (Pixel Drift wordmark + Black Hole accretion
disk), with a real lead-capture + payment flow behind the booking form.

## Stack

| Layer      | Tech                                                        |
| ---------- | ---------------------------------------------------------- |
| Frontend   | Vite, React 19, TypeScript, Tailwind CSS v4                |
| Animations | 2D canvas, ported 1:1 into React components                |
| Backend    | Azure Functions (v4, TypeScript) in `/api`                 |
| Email      | Microsoft Graph app-only send (`/api/lead`); Resend fallback |
| Payments   | Stripe Checkout (`/api/checkout`)                           |
| Scheduling | Cal.com (embedded inline scheduler)                        |
| Hosting    | Azure Static Web Apps (SPA CDN + managed Functions)        |

## Project layout

```
api/                      Azure Functions app (its own package.json / build)
  host.json               Functions host config
  src/
    core/                 framework-agnostic logic (portable, testable)
      lead.ts             validate + email the booking form (Graph / Resend)
      checkout.ts         create a $199 Stripe Checkout session
    functions/            thin Azure Functions v4 HTTP adapters over core/
      lead.ts             POST /api/lead
      checkout.ts         POST /api/checkout
  local.settings.json     local Functions env (git-ignored)
staticwebapp.config.json  SWA routing (SPA fallback, /api passthrough)
public/                   brand assets (favicon, OG image)
src/
  components/             Nav, Hero, CalBooking, BookForm, … (UI)
  data/content.ts         all marketing copy in one editable module
  lib/                    api.ts (fetch helpers) + config.ts (public env)
  index.css               Tailwind theme (@theme design tokens) + base styles
  App.tsx                 page composition
vite.config.ts            SPA build + a dev-only bridge that runs the /api core
```

## Local development

```bash
npm install
npm run dev          # http://localhost:5173 — serves the SPA AND /api
```

`npm run dev` runs the Vite dev server, which mounts the same **core** logic the
Azure Functions use (reading env from `.env`), so `/api/lead` and `/api/checkout`
work locally with no extra tooling. It sends **real** email — test with your own
address.

### Optional: run the real Azure Functions host (production parity)

Requires [Azure Functions Core Tools v4] and the [SWA CLI], plus a Node LTS
(18/20/22 — the Functions host does not support newer odd-numbered releases):

```bash
npm i -g azure-functions-core-tools@4 @azure/static-web-apps-cli
cd api && npm run build && cd ..
swa start http://localhost:5173 --run "npm run dev" --api-location ./api
```

[Azure Functions Core Tools v4]: https://learn.microsoft.com/azure/azure-functions/functions-run-local
[SWA CLI]: https://azure.github.io/static-web-apps-cli/

## Configuration

Copy `.env.example` → `.env` (git-ignored) and fill in what you want to enable.
For the Functions host, the same values live in `api/local.settings.json`.

- **Email leads (Graph)** — set `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`,
  `GRAPH_CLIENT_SECRET`, `GRAPH_MAIL_SENDER` (a licensed/shared mailbox) and
  `LEAD_TO_EMAIL`. Falls back to `RESEND_API_KEY` if Graph isn't configured.
- **Payments** — set `STRIPE_SECRET_KEY` and `VITE_STRIPE_ENABLED=true`.
- **Scheduling** — set `VITE_CALCOM_LINK` (`handle/event-slug`).
- **Database** (optional) — implement `storeLead()` in `api/src/core/lead.ts`.

## Build & deploy (Azure Static Web Apps)

The SPA builds with `npm run build`; the Functions app builds with `tsc` in
`api/`. On Azure SWA these are wired by the deploy pipeline:

- **app_location:** `/`  ·  **api_location:** `api`  ·  **output_location:** `dist`

Set `VITE_*` as **build-time** env in the pipeline and all server secrets as SWA
application settings (Key Vault references recommended). See
[`docs/azure-migration.md`](docs/azure-migration.md) for the env/secrets map and
the managed-identity option that removes the Graph client secret entirely.
