import Stripe from "stripe";

/**
 * Framework-agnostic Stripe Checkout: creates a session for the flat $199
 * assessment and returns its hosted-payment URL. The client redirects to it.
 *
 * Required env:
 *   STRIPE_SECRET_KEY     — sk_live_… / sk_test_…
 * Optional env:
 *   STRIPE_PRICE_ID       — a pre-made Price; otherwise an inline $199 line item
 *   ASSESSMENT_PRICE_CENTS (default 19900)
 *   CHECKOUT_SUCCESS_URL / CHECKOUT_CANCEL_URL — override the redirect targets
 */

export interface CoreResult {
  status: number;
  body: unknown;
}

export interface CheckoutInput {
  body: unknown;
  /** Request origin, used to build the success/cancel redirect URLs. */
  origin: string;
}

export async function handleCheckout(input: CheckoutInput): Promise<CoreResult> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return { status: 501, body: { error: "Payments are not configured yet." } };
  }

  const stripe = new Stripe(secret);

  const body = (typeof input.body === "object" && input.body !== null ? input.body : {}) as Record<
    string,
    unknown
  >;
  const email = typeof body.email === "string" && body.email.includes("@") ? body.email : undefined;

  const origin = input.origin;
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

    return { status: 200, body: { url: session.url } };
  } catch (err) {
    console.error("[checkout] failed:", err);
    return { status: 500, body: { error: "Could not start checkout. Please try again." } };
  }
}
