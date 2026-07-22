import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

/**
 * POST /api/lead
 * Validates a booking submission, emails it to the team (via Resend), and is
 * structured so a database write (Supabase / Vercel KV / Postgres) can be
 * dropped into `storeLead` later.
 *
 * Required env for delivery:
 *   RESEND_API_KEY   — from resend.com
 *   LEAD_TO_EMAIL    — where leads are sent (default: hello@hypernovaai.com)
 *   LEAD_FROM_EMAIL  — a verified Resend sender (default: onboarding@resend.dev)
 */

interface Lead {
  name: string;
  business: string;
  email: string;
  phone?: string;
  pain?: string;
  priority?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: unknown): { ok: true; lead: Lead } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid request body." };
  const b = body as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const business = String(b.business ?? "").trim();
  const email = String(b.email ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (!business) return { ok: false, error: "Business name is required." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "A valid email is required." };
  return {
    ok: true,
    lead: {
      name: name.slice(0, 200),
      business: business.slice(0, 200),
      email: email.slice(0, 200),
      phone: String(b.phone ?? "").trim().slice(0, 60) || undefined,
      pain: String(b.pain ?? "").trim().slice(0, 4000) || undefined,
      priority: String(b.priority ?? "").trim().slice(0, 200) || undefined,
    },
  };
}

/** Hook for persistence — wire to your DB of choice. */
async function storeLead(lead: Lead): Promise<void> {
  // e.g. await supabase.from("leads").insert(lead);
  // Left as a no-op until a datastore is chosen.
  void lead;
}

async function emailLead(lead: Lead): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // No provider wired yet — surface the lead in the function logs so nothing
    // is lost during setup. Add RESEND_API_KEY to enable real delivery.
    console.log("[lead] (no RESEND_API_KEY set) captured lead:", JSON.stringify(lead));
    return;
  }
  const resend = new Resend(key);
  const to = process.env.LEAD_TO_EMAIL ?? "hello@hypernovaai.com";
  const from = process.env.LEAD_FROM_EMAIL ?? "HyperNova AI <onboarding@resend.dev>";

  const rows: [string, string | undefined][] = [
    ["Name", lead.name],
    ["Business", lead.business],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Priority", lead.priority],
    ["Where time is lost", lead.pain],
  ];
  const html = `
    <h2 style="font-family:sans-serif">New AI Readiness Assessment lead</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top"><b>${k}</b></td><td style="padding:4px 0">${String(
              v,
            ).replace(/</g, "&lt;")}</td></tr>`,
        )
        .join("")}
    </table>`;

  await resend.emails.send({
    from,
    to,
    replyTo: lead.email,
    subject: `New assessment lead — ${lead.business}`,
    html,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const result = validate(req.body);
  if (!result.ok) return res.status(400).json({ ok: false, error: result.error });

  try {
    await storeLead(result.lead);
    await emailLead(result.lead);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[lead] failed:", err);
    return res.status(500).json({ ok: false, error: "Could not submit your details. Please email us directly." });
  }
}
