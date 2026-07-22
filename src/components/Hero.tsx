import { HERO_PILLS } from "../data/content";
import BlackHoleDisk from "./BlackHoleDisk";
import OfferCard from "./OfferCard";
import PixelDriftWordmark from "./PixelDriftWordmark";

export default function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative py-16 md:pt-20 md:pb-16">
      <div className="container-x grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_430px] lg:gap-16">
        {/* Left column — the pitch */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
            <span className="h-px w-7 bg-lime" style={{ boxShadow: "0 0 22px rgba(149,255,0,.9)" }} />
            HyperNova AI Readiness and Tools Assessment · $199 flat
          </div>

          <h1 className="max-w-[660px] font-display text-[length:var(--text-hero)] uppercase leading-[0.96] tracking-[0.04em] text-white text-balance">
            Is your business{" "}
            <span className="text-lime" style={{ textShadow: "0 0 44px rgba(149,255,0,.22)" }}>
              ready for AI
            </span>
            ? Find out before you're left behind.
          </h1>

          <p className="mt-5 font-display text-[clamp(22px,2.6vw,34px)] uppercase leading-[1.1] tracking-[0.05em] text-white/90 text-balance">
            Go from AI&#8209;curious to{" "}
            <span className="text-lime" style={{ textShadow: "0 0 34px rgba(149,255,0,.35)" }}>
              AI&#8209;ready
            </span>
            .
          </p>

          <p className="mt-5 max-w-[560px] text-lg leading-[1.55] text-white/80">
            AI is moving fast, and the businesses that learn to identify and leverage the right tools now
            will pull ahead of the ones that wait. The $199 HyperNova AI Readiness and Tools Assessment
            tells you exactly where your business stands, which tools fit, and how to start today — no
            guesswork, no jargon.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button className="btn btn-primary btn-lg" onClick={onCta}>
              Get My AI Readiness Assessment
            </button>
            <a className="btn btn-secondary btn-lg" href="#how">
              See how it works
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-lime">
              ✓ Know exactly where to start
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-xs text-lime">
              ✓ Start in days, not months
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5" aria-label="Assessment highlights">
            {HERO_PILLS.map((p) => (
              <span
                key={p}
                className="rounded-full border border-lime/25 bg-surface-raised/80 px-3 py-2 text-xs text-white/80"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Right column — wordmark, black hole, offer card */}
        <div className="flex flex-col items-stretch gap-5">
          <PixelDriftWordmark text="HyperNova AI" />
          <BlackHoleDisk />
          <OfferCard />
        </div>
      </div>
    </section>
  );
}
