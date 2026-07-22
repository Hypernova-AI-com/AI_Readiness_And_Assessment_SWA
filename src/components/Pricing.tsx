import { ASSESSMENT_FEATURES, CUSTOM_FEATURES } from "../data/content";
import SectionHead, { Green } from "./SectionHead";

function Check({ children }: { children: string }) {
  return (
    <li className="grid grid-cols-[20px_1fr] gap-2 text-xs leading-[1.4] text-white/80">
      <span className="font-extrabold text-lime">✓</span>
      <span>{children}</span>
    </li>
  );
}

export default function Pricing({ onAssessment, onCustom }: { onAssessment: () => void; onCustom: () => void }) {
  return (
    <section id="pricing" className="border-t border-hairline/70 py-20">
      <div className="container-x">
        <SectionHead
          kicker="Simple, transparent pricing"
          title={
            <>
              One assessment. One <Green>flat price</Green>.
            </>
          }
          lead="No mystery quotes and no hourly billing. Start with the assessment; if you want us to build what it finds, that's an optional next step."
        />
        <div className="grid items-stretch gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* Featured — the $199 assessment */}
          <div
            className="flex flex-col rounded-2xl border border-lime/60 p-7"
            style={{
              background: "linear-gradient(180deg, rgba(21,23,26,.95), rgba(0,0,0,.96))",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-lime">
              The assessment · Most popular
            </div>
            <div className="my-2 font-display text-[68px] leading-[0.9] text-white">
              $199<small className="font-body text-sm text-white/55"> flat</small>
            </div>
            <p className="mb-6 leading-[1.5] text-white/70">
              The full HyperNova AI Readiness and Tools Assessment — discovery session, complete report,
              and walkthrough call.
            </p>
            <ul className="mb-7 grid gap-3">
              {ASSESSMENT_FEATURES.map((f) => (
                <Check key={f}>{f}</Check>
              ))}
            </ul>
            <button className="btn btn-primary btn-block btn-lg mt-auto" onClick={onAssessment}>
              Start My Assessment
            </button>
            <div className="mt-3 text-center font-mono text-[11px] text-lime">
              ✓ 5 hours/week or your money back
            </div>
          </div>

          {/* Custom implementation */}
          <div className="flex flex-col rounded-2xl border border-hairline bg-surface-raised/80 p-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-lime">
              Optional next step
            </div>
            <div className="my-2 font-display text-[68px] leading-[0.9] text-white">Custom</div>
            <p className="mb-6 leading-[1.5] text-white/70">
              Love the roadmap and want it built? HyperNova AI implements the tools, automations, and
              agents for you.
            </p>
            <ul className="mb-7 grid gap-3">
              {CUSTOM_FEATURES.map((f) => (
                <Check key={f}>{f}</Check>
              ))}
            </ul>
            <button className="btn btn-secondary btn-block btn-lg mt-auto" onClick={onCustom}>
              Talk to HyperNova AI
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
