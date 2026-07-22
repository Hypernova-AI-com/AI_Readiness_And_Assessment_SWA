import { OFFER_BULLETS } from "../data/content";

export default function OfferCard() {
  return (
    <aside
      className="relative overflow-hidden rounded-[18px] border border-lime/30 p-6"
      aria-label="Assessment offer"
      style={{
        background: "linear-gradient(180deg, rgba(21,23,26,.94), rgba(0,0,0,.96))",
        boxShadow: "0 0 64px rgba(149,255,0,.10), inset 0 0 0 1px rgba(255,255,255,.03)",
      }}
    >
      <span
        className="pointer-events-none absolute -right-20 -top-16 size-[190px]"
        style={{ background: "radial-gradient(circle, rgba(149,255,0,.24), transparent 68%)" }}
      />
      <div className="relative z-10 font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
        Book your assessment
      </div>
      <div className="relative z-10 mt-2.5 font-display text-[clamp(72px,9vw,112px)] leading-[0.85] tracking-[0.02em] text-white">
        <span className="text-lime">$</span>199
      </div>
      <p className="relative z-10 mt-2.5 text-white/70">
        One flat fee. A complete read on whether your business is ready for AI — and exactly what to do
        about it.
      </p>
      <ul className="relative z-10 my-6 grid gap-3">
        {OFFER_BULLETS.map((b) => (
          <li key={b} className="grid grid-cols-[20px_1fr] gap-2.5 leading-[1.4] text-white/85">
            <span className="text-lime">✦</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <p className="relative z-10 mt-2 text-[11px] leading-[1.5] text-white/50">
        Backed by our 5-hour-a-week money-back guarantee.
      </p>
    </aside>
  );
}
