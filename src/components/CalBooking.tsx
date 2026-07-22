import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { BRAND, PRIORITY_OPTIONS } from "../data/content";
import { CALCOM_LINK } from "../lib/config";

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

/* ── Left card: Send a message (opens the visitor's mail client, prefilled) ── */
function SendMessageCard() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");

  const lines = [`Name: ${name}`, `Company: ${company}`, `Email: ${email}`];
  if (priority) lines.push(`Priority: ${priority}`);
  lines.push("", message);
  const mailto = `mailto:${BRAND.email}?subject=${encodeURIComponent(
    `AI Readiness inquiry${name ? ` — ${name}` : ""}`,
  )}&body=${encodeURIComponent(lines.join("\n"))}`;

  return (
    <div className={cardCls}>
      <div className="mb-1 flex items-center gap-2.5">
        <IconMail />
        <h3 className="font-display text-2xl uppercase tracking-wide text-white">Send a message</h3>
      </div>
      <p className="mb-6 text-sm text-white/55">We'll open your email client with everything pre-filled.</p>

      <div className="grid gap-4">
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
        <a href={mailto} className="btn btn-primary btn-block btn-lg mt-1">
          Send message →
        </a>
      </div>
    </div>
  );
}

/* ── Right card: Schedule a time (live Cal.com, shrunk to fit) ───────────── */
function ScheduleCard() {
  useEffect(() => {
    if (!CALCOM_LINK) return;
    (async () => {
      const cal = await getCalApi({ namespace: "hna" });
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: { light: { "cal-brand": "#95ff00" }, dark: { "cal-brand": "#95ff00" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className={cardCls}>
      <div className="mb-1 flex items-center gap-2.5">
        <IconCalendar />
        <h3 className="font-display text-2xl uppercase tracking-wide text-white">Schedule a time</h3>
      </div>
      <p className="mb-5 text-sm text-white/55">Pick a day, then scroll to an open time - you'll get a Microsoft Teams invite.</p>

      {CALCOM_LINK ? (
        <>
          <div
            className="calscroll rounded-xl border border-hairline"
            style={{ height: 560, overflowY: "auto", overflowX: "hidden" }}
          >
            <Cal
              namespace="hna"
              calLink={CALCOM_LINK}
              style={{ width: "100%" }}
              config={{ layout: "month_view", theme: "dark" }}
            />
          </div>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-lime">
            <span aria-hidden="true">↓</span> Scroll for open times
          </p>
        </>
      ) : (
        <div className="grid min-h-[540px] place-items-center rounded-xl border border-hairline p-8 text-center">
          <p className="max-w-[360px] text-white/60">
            Set <span className="font-mono text-lime">VITE_CALCOM_LINK</span> (e.g.{" "}
            <span className="font-mono text-white">your-handle/15min</span>) and the calendar goes live.
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
