# HyperNova AI Readiness and Tools Assessment — Web App

Full-stack conversion of the original single-file marketing page into a
**React + TypeScript + Tailwind (v4)** SPA with **Vercel serverless functions**
for the backend. Same design system, same hand-written canvas animations
(Pixel Drift wordmark + Black Hole accretion disk), now componentized and with
a real lead-capture + payment flow behind the booking form.

## Stack

| Layer      | Tech                                                        |
| ---------- | ---------------------------------------------------------- |
| Frontend   | Vite, React 19, TypeScript, Tailwind CSS v4                |
| Animations | 2D canvas, ported 1:1 into React components                |
| Backend    | Vercel serverless functions in `/api`                      |
| Email      | Resend (`/api/lead`)                                        |
| Payments   | Stripe Checkout (`/api/checkout`)                           |
| Scheduling | Calendly (embedded link)                                   |

## Project layout

```
api/
  lead.ts          POST — validate + email (+ DB-ready) the booking form
  checkout.ts      POST — create a $199 Stripe Checkout session
public/            brand assets (favicon, OG image)
src/
  components/      Nav, Hero, PixelDriftWordmark, BlackHoleDisk, OfferCard,
                   TrustBar, PainPoints, HowItWorks, ReportPreview,
                   Guarantee, Pricing, BookForm, Footer, SectionHead
  data/content.ts  all marketing copy in one editable module
  lib/             api.ts (fetch helpers) + config.ts (public env)
  index.css        Tailwind theme (@theme design tokens) + base styles
  App.tsx          page composition
```

## Local development

```bash
npm install
npm run dev          # frontend only — http://localhost:5173
```

The `/api` functions don't run under plain `vite`. To exercise the full stack
locally, use the Vercel CLI:

```bash
npm i -g vercel
vercel dev           # serves the app + /api together
```

Without any env vars, the form still works end-to-end: submissions are logged
in the function output (so nothing is lost) and the Pay button stays hidden.

## Configuration

Copy `.env.example` → `.env` and fill in what you want to enable. Set the same
variables in **Vercel → Project → Settings → Environment Variables** for prod.

- **Email leads** — set `RESEND_API_KEY` (+ `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`).
- **Payments** — set `STRIPE_SECRET_KEY` and `VITE_STRIPE_ENABLED=true`.
- **Scheduling** — set `VITE_CALENDLY_URL` to your Calendly link.
- **Database** (optional) — implement `storeLead()` in `api/lead.ts`.

## Build & deploy

```bash
npm run build        # type-check + production build to /dist
npm run preview      # preview the built SPA
vercel               # deploy (or push to the connected Git repo)
```
