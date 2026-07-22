/**
 * Client-side, build-time public config. Only `VITE_`-prefixed vars are
 * exposed to the browser by Vite. Everything secret (Stripe secret key,
 * Resend key) stays server-side in the /api functions.
 */

/** Your Calendly scheduling link, e.g. https://calendly.com/hypernova-ai/assessment (legacy). */
export const CALENDLY_URL: string = import.meta.env.VITE_CALENDLY_URL ?? "";

/**
 * Your Cal.com booking link as `handle/event-slug`, e.g. `hypernova/15min`.
 * Powers the inline scheduler embedded in the booking section.
 */
export const CALCOM_LINK: string = import.meta.env.VITE_CALCOM_LINK ?? "";

/** True when Stripe Checkout has been wired up server-side. */
export const STRIPE_ENABLED: boolean = import.meta.env.VITE_STRIPE_ENABLED === "true";

/**
 * Preview mode. When true, the booking flow is fully clickable WITHOUT a
 * backend or real keys: the form "succeeds" locally so the success screen
 * shows, and the Stripe button explains itself instead of calling the API.
 * Turn OFF (or delete VITE_DEMO) before going live.
 */
export const DEMO: boolean = import.meta.env.VITE_DEMO === "true";
