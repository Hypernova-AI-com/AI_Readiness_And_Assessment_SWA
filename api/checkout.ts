import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

/**
 * POST /api/checkout
 * Creates a Stripe Checkout session for the flat $199 assessment and returns
 * its hosted-payment URL. The client redirects the browser to it.
 *
 * Required env:
 *   STRIPE_SECRET_KEY     — sk_live_… / sk_test_…
 * Optional env:
 *   STRIPE_PRICE_ID       — a pre-made Price; otherwise an inline $199 line item is used
 *   ASSESSMENT_PRICE_CENTS (default 19900)
 *   CHECKOUT_SUCCESS_URL / CHECKOUT_CANCEL_URL — override the redirect targets
 *
 * Also expose VITE_STRIPE_ENABLED=true on the client so the Pay button renders.
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(501).json({ error: "Payments are not configured yet." });
  }

  const stripe = new Stripe(secret);

  const body = (typeof req.body === "object" && req.body !== null ? req.body : {}) as Record<string, unknown>;
  const email = typeof body.email === "string" && body.email.includes("@") ? body.email : undefined;

  const origin =
    (req.headers.origin as string | undefined) ??
    (req.headers.host ? `https://${req.headers.host}` : "http://localhost:5173");

  const successUrl = process.env.CHECKOUT_SUCCESS_URL ?? `${origin}/?paid=1#book`;
  const cancelUrl = process.env.CHECKOUT_CANCEL_URL ?? `${origin}/#book`;
  const priceId = process.env.STRIPE_PRICE_ID;
  const amount = Number(process.env.ASSESSMENT_PRICE_CENTS ?? 19900);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: amount,
                product_data: {
                  name: "HyperNova AI Readiness and Tools Assessment",
                  description: "Discovery session, full readiness report, and walkthrough call.",
                },
              },
            },
          ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[checkout] failed:", err);
    return res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
}
