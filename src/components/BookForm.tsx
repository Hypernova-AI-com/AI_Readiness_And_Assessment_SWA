import { useState } from "react";
import { BOOK_CHECKLIST, BRAND, PRIORITY_OPTIONS } from "../data/content";
import { CALENDLY_URL, DEMO, STRIPE_ENABLED } from "../lib/config";
import { createCheckout, submitLead, type LeadPayload } from "../lib/api";
import { Green } from "./SectionHead";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: LeadPayload = { name: "", business: "", email: "", phone: "", pain: "", priority: PRIORITY_OPTIONS[0] };

export default function BookForm() {
  const [form, setForm] = useState<LeadPayload>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [payLoading, setPayLoading] = useState(false);
  const [demoMsg, setDemoMsg] = useState<string>("");

  const set = (k: keyof LeadPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Preview mode: skip the backend so the success screen is viewable locally.
    if (DEMO) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    const res = await submitLead(form);
    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError(res.error ?? "Something went wrong.");
    }
  }

  async function handlePay() {
    // Preview mode: explain the button instead of calling the (unconfigured) API.
    if (DEMO) {
      setDemoMsg(`Preview mode — in production this opens Stripe Checkout for $${BRAND.price}.`);
      return;
    }
    setPayLoading(true);
    setError("");
    const res = await createCheckout(form);
    if (res.url) {
      window.location.href = res.url;
    } else {
      setError(res.error ?? "Could not start checkout.");
      setPayLoading(false);
    }
  }

  const inputCls =
    "w-full min-h-[46px] rounded-lg border border-hairline bg-[#0f1113] px-3.5 py-3 text-white placeholder:text-ink/75 focus:border-lime/60";

  return (
    <section id="book" className="border-t border-hairline/70 py-20">
      <div className="container-x grid items-start gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        {/* Left — pitch + direct contact */}
        <div>
          <div className="kicker mb-3">Book your assessment</div>
          <h2 className="font-display text-[clamp(38px,5.5vw,76px)] uppercase leading-[0.92] tracking-[0.04em] text-white text-balance">
            Find out if you're ready. <Green>Start today</Green>.
          </h2>
          <p className="mt-5 max-w-[640px] text-base leading-[1.6] text-white/70">
            Tell us about your business and we'll get started. The sooner you know where you stand, the
            sooner you can move — and it's backed by our 5-hour-a-week guarantee.
          </p>
          <ul className="mt-6 grid gap-3">
            {BOOK_CHECKLIST.map((c) => (
              <li key={c} className="grid grid-cols-[22px_1fr] gap-2.5 text-white/80">
                <span className="font-extrabold text-lime">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — the form / success state */}
        <div
          className="rounded-[18px] border border-lime/30 bg-surface-raised/80 p-6"
          style={{ borderColor: "rgba(149,255,0,.28)" }}
        >
          {DEMO && (
            <div className="mb-4 rounded-lg border border-lime/30 bg-lime/5 px-3 py-2 text-[11px] leading-[1.5] text-lime/90">
              Preview mode — Calendly &amp; Stripe are wired with placeholders. Submitting won't send real
              data; add your keys in <span className="font-mono">.env</span> to go live.
            </div>
          )}
          {status === "sent" ? (
            <div className="grid gap-4 py-6 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full border border-lime/50 text-3xl text-lime">
                ✓
              </div>
              <h3 className="font-display text-3xl uppercase text-white">You're in.</h3>
              <p className="mx-auto max-w-[420px] text-white/75">
                Thanks, {form.name || "there"} — we've got your details and will reach out at{" "}
                <span className="text-lime">{form.email}</span> to schedule your discovery session.
              </p>

              {STRIPE_ENABLED && (
                <button className="btn btn-primary btn-lg mx-auto mt-2" onClick={handlePay} disabled={payLoading}>
                  {payLoading ? "Starting secure checkout…" : `Pay $${BRAND.price} & lock your slot`}
                </button>
              )}
              {CALENDLY_URL && (
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg mx-auto">
                  Book your call time →
                </a>
              )}
              {demoMsg && <p className="text-sm text-lime/90">{demoMsg}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          ) : (
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 font-bold text-white/85">
                  Your name
                  <input className={inputCls} required autoComplete="name" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
                </label>
                <label className="grid gap-1.5 font-bold text-white/85">
                  Business name
                  <input className={inputCls} required autoComplete="organization" placeholder="Company LLC" value={form.business} onChange={set("business")} />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 font-bold text-white/85">
                  Email
                  <input className={inputCls} required type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={set("email")} />
                </label>
                <label className="grid gap-1.5 font-bold text-white/85">
                  Phone
                  <input className={inputCls} type="tel" autoComplete="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set("phone")} />
                </label>
              </div>
              <label className="grid gap-1.5 font-bold text-white/85">
                Where are you losing the most time?
                <textarea
                  className={`${inputCls} min-h-[110px] resize-y`}
                  placeholder="Repetitive tasks, bottlenecks, scattered data, slow follow-up, or work your team dreads."
                  value={form.pain}
                  onChange={set("pain")}
                />
              </label>
              <label className="grid gap-1.5 font-bold text-white/85">
                Which outcome matters most?
                <select className={inputCls} value={form.priority} onChange={set("priority")}>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>

              {status === "error" && <p className="text-sm text-red-400">{error}</p>}

              <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Book My Discovery Session"}
              </button>
              {CALENDLY_URL && (
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-sm text-white/70 transition-colors hover:text-lime"
                >
                  Prefer to talk first? Book a 15-min call →
                </a>
              )}
              <p className="text-[11px] leading-[1.5] text-white/50">
                We'll email you to confirm your discovery session. Your details are never sold or shared.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
