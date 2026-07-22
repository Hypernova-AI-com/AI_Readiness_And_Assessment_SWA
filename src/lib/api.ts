/** Typed helpers for the /api serverless endpoints. */

export interface LeadPayload {
  name: string;
  business: string;
  email: string;
  phone?: string;
  pain?: string;
  priority?: string;
}

export interface ApiResult {
  ok: boolean;
  error?: string;
}

/** POST a lead to /api/lead (validate → email → optional store). */
export async function submitLead(payload: LeadPayload): Promise<ApiResult> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResult;
    if (!res.ok) return { ok: false, error: data.error ?? `Request failed (${res.status}).` };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — please try again or email us directly." };
  }
}

/** Ask the server to create a Stripe Checkout session and return its URL. */
export async function createCheckout(payload: LeadPayload): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) return { error: data.error ?? `Checkout failed (${res.status}).` };
    return { url: data.url };
  } catch {
    return { error: "Network error — could not start checkout." };
  }
}
