import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

/**
 * POST /api/lead
 * Validates a booking submission, emails it to the team, and is structured so a
 * database write (Supabase / Vercel KV / Postgres) can be dropped into
 * `storeLead` later.
 *
 * Mail delivery picks a provider by which env vars are set:
 *   1. Microsoft Graph (preferred) — app-only client-credentials send.
 *        GRAPH_TENANT_ID      — Entra tenant ID
 *        GRAPH_CLIENT_ID      — app registration (client) ID
 *        GRAPH_CLIENT_SECRET  — client secret  (SERVER-ONLY — never VITE_)
 *        GRAPH_MAIL_SENDER    — mailbox to send FROM (must be a licensed
 *                               Exchange Online mailbox in this tenant)
 *   2. Resend (fallback)  — RESEND_API_KEY / LEAD_FROM_EMAIL
 * In both cases LEAD_TO_EMAIL sets the recipient (default hello@hypernovaai.com).
 * With none set, the lead is logged so nothing is lost during setup.
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

function leadHtml(lead: Lead): string {
  const rows: [string, string | undefined][] = [
    ["Name", lead.name],
    ["Business", lead.business],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Priority", lead.priority],
    ["Where time is lost", lead.pain],
  ];
  return `
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
}

/** Acquire an app-only Graph token via the client-credentials flow. */
async function graphToken(): Promise<string> {
  const tenant = process.env.GRAPH_TENANT_ID!;
  const body = new URLSearchParams({
    client_id: process.env.GRAPH_CLIENT_ID!,
    client_secret: process.env.GRAPH_CLIENT_SECRET!,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const resp = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) throw new Error(`Graph token request failed (${resp.status}): ${await resp.text()}`);
  return ((await resp.json()) as { access_token: string }).access_token;
}

/** Acknowledgement email sent back to the person who submitted the form. */
function acknowledgementHtml(lead: Lead): string {
  const firstName = lead.name.split(/\s+/)[0].replace(/</g, "&lt;");
  return `
    <div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">
      <p>Hi ${firstName},</p>
      <p>Thanks for reaching out to <b>HyperNova AI</b> — we've received your
      AI Readiness Assessment request${
        lead.business ? ` for <b>${lead.business.replace(/</g, "&lt;")}</b>` : ""
      } and a member of our team will be in contact with you shortly.</p>
      <p>If anything is time-sensitive in the meantime, just reply to this email and it
      will reach us directly.</p>
      <p style="margin-top:24px">— The HyperNova AI team</p>
    </div>`;
}

interface OutgoingMail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/** The team notification: lead details, delivered to the hello@ distribution list. */
function notificationMail(lead: Lead): OutgoingMail {
  return {
    to: process.env.LEAD_TO_EMAIL ?? "hello@hypernova-ai.com",
    subject: `New assessment lead — ${lead.business}`,
    html: leadHtml(lead),
    replyTo: lead.email, // team replies go straight to the prospect
  };
}

/** The auto-acknowledgement: confirmation, delivered to the prospect. */
function acknowledgementMail(lead: Lead): OutgoingMail {
  return {
    to: lead.email,
    subject: "We received your request — HyperNova AI",
    html: acknowledgementHtml(lead),
    replyTo: process.env.LEAD_TO_EMAIL ?? "hello@hypernova-ai.com", // their reply reaches the team
  };
}

async function sendViaGraph(token: string, sender: string, mail: OutgoingMail): Promise<void> {
  const payload = {
    message: {
      subject: mail.subject,
      body: { contentType: "HTML", content: mail.html },
      toRecipients: [{ emailAddress: { address: mail.to } }],
      ...(mail.replyTo ? { replyTo: [{ emailAddress: { address: mail.replyTo } }] } : {}),
    },
    saveToSentItems: true,
  };
  const resp = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  // sendMail returns 202 Accepted with an empty body on success.
  if (resp.status !== 202) throw new Error(`Graph sendMail failed (${resp.status}): ${await resp.text()}`);
}

async function sendViaResend(mail: OutgoingMail): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = process.env.LEAD_FROM_EMAIL ?? "HyperNova AI <onboarding@resend.dev>";
  await resend.emails.send({
    from,
    to: mail.to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    html: mail.html,
  });
}

/**
 * Sends two emails per submission:
 *   1. Team notification → the hello@ distribution list (must succeed).
 *   2. Acknowledgement    → the prospect (best-effort; a failure here never
 *                            loses the lead or fails the request).
 */
async function emailLead(lead: Lead): Promise<void> {
  const notification = notificationMail(lead);
  const acknowledgement = acknowledgementMail(lead);

  if (process.env.GRAPH_CLIENT_SECRET) {
    const token = await graphToken();
    const sender = process.env.GRAPH_MAIL_SENDER!;
    await sendViaGraph(token, sender, notification);
    try {
      await sendViaGraph(token, sender, acknowledgement);
    } catch (err) {
      console.error("[lead] acknowledgement email failed (lead was still delivered):", err);
    }
    return;
  }

  if (process.env.RESEND_API_KEY) {
    await sendViaResend(notification);
    try {
      await sendViaResend(acknowledgement);
    } catch (err) {
      console.error("[lead] acknowledgement email failed (lead was still delivered):", err);
    }
    return;
  }

  // No provider wired yet — surface the lead in the function logs so nothing
  // is lost during setup.
  console.log("[lead] (no mail provider configured) captured lead:", JSON.stringify(lead));
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
