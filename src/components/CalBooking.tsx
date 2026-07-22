import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { PRIORITY_OPTIONS } from "../data/content";
import { CALCOM_LINK } from "../lib/config";
import { submitLead } from "../lib/api";

/* ── Inline icons (lime) — no icon lib, matches the anti-emoji rule ──────── */
function IconMail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#95ff00" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#95ff00" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  );
}

const inputCls =
  "w-full min-h-[46px] rounded-lg border border-hairline bg-[#0f1113] px-3.5 py-3 text-white outline-none placeholder:text-ink/60 focus:border-lime/60";
const labelCls = "mb-1.5 block text-xs text-white/60";
const cardCls = "rounded-2xl border border-hairline bg-surface-raised/60 p-6 md:p-8";

/* ── Left card: Send a message (POSTs to /api/lead → Graph email, no mail client) ── */
type SendStatus = "idle" | "sending" | "sent" | "error";

function SendMessageCard() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !company.trim() || !email.trim()) {
      setError("Name, company, and work email are required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    const res = await submitLead({
      name,
      business: company,
      email,
      priority: priority || undefined,
      pain: message || undefined,
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError(res.error ?? "Something went wrong — please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className={cardCls}>
        <div className="mb-1 flex items-center gap-2.5">
          <IconMail />
          <h3 className="font-display text-2xl uppercase tracking-wide text-white">Message sent</h3>
        </div>
        <p className="text-sm text-white/70">
          Thanks{name ? `, ${name.split(/\s+/)[0]}` : ""} — we've got your request and a
          confirmation is on its way to your inbox. We'll be in contact shortly.
        </p>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <div className="mb-1 flex items-center gap-2.5">
        <IconMail />
        <h3 className="font-display text-2xl uppercase tracking-wide text-white">Send a message</h3>
      </div>
      <p className="mb-6 text-sm text-white/55">Fill this in and we'll be in touch — no email client required.</p>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Full name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div>
            <label className={labelCls}>Company</label>
            <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company LLC" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Work email</label>
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div>
          <label className={labelCls}>Which outcome matters most? (optional)</label>
          <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Select an outcome...</option>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Where are you losing the most time?</label>
          <textarea
            className={`${inputCls} min-h-[120px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Repetitive tasks, scattered data, slow follow-up, or work your team dreads."
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary btn-block btn-lg mt-1 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message →"}
        </button>
      </form>
    </div>
  );
}

/* ── Right card: Schedule a time (LIVE Cal.com inline embed) ───────────────────
   Renders real Cal.com availability and writes the booking straight to the
   Cal.com calendar — confirmation email, timezone handling, and reschedule /
   cancel links are all managed by Cal.com. No mailto, nothing to reconcile by
   hand. Themed to match the brand (dark surface, lime accent). Falls back to a
   setup hint if VITE_CALCOM_LINK isn't configured. */
const CAL_NAMESPACE = CALCOM_LINK.split("/").pop() || "book";

function ScheduleCard() {
  useEffect(() => {
    if (!CALCOM_LINK) return;
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      if (cancelled) return;
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#95ff00" },
          dark: { "cal-brand": "#95ff00" },
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={cardCls}>
      <div className="mb-1 flex items-center gap-2.5">
        <IconCalendar />
        <h3 className="font-display text-2xl uppercase tracking-wide text-white">Schedule a time</h3>
      </div>
      <p className="mb-5 text-sm text-white/55">
        Pick a day and a slot — booked straight onto our calendar and confirmed by email instantly.
      </p>

      {CALCOM_LINK ? (
        <div className="overflow-hidden rounded-xl border border-hairline bg-[#0f1113]">
          <Cal
            namespace={CAL_NAMESPACE}
            calLink={CALCOM_LINK}
            style={{ width: "100%", height: "100%", minHeight: 560, overflow: "scroll" }}
            config={{ layout: "month_view", theme: "dark", name: "hello", email: "hello@hypernova-ai.com" }}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-hairline bg-[#0f1113] p-6 text-sm text-white/60">
          <p className="mb-2 font-medium text-white/80">Scheduler not configured yet.</p>
          <p>
            Set <code className="text-lime">VITE_CALCOM_LINK</code> to your Cal.com link
            (<code>handle/event-slug</code>) and the live booking calendar shows up here.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CalBooking() {
  return (
    <section id="book" className="border-t border-hairline/70 py-20">
      <div className="container-x">
        <div className="mb-9">
          <div className="kicker mb-3">Get started</div>
          <h2 className="font-display text-[clamp(34px,4.5vw,60px)] uppercase leading-[0.95] tracking-[0.04em] text-white text-balance">
            Two easy ways to <span className="text-lime">start</span>.
          </h2>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SendMessageCard />
          <ScheduleCard />
        </div>
      </div>
    </section>
  );
}
