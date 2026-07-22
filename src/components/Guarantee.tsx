import { Green } from "./SectionHead";

export default function Guarantee() {
  return (
    <section
      id="guarantee"
      className="border-t border-hairline/70 py-20"
      style={{
        background:
          "linear-gradient(135deg, rgba(149,255,0,.12), rgba(0,0,0,0) 60%), rgba(21,23,26,.6)",
      }}
    >
      <div className="container-x grid items-center gap-8 md:grid-cols-[190px_1fr]">
        <div
          className="mx-auto grid size-[180px] place-items-center rounded-full border-2 border-lime/50 text-center font-display uppercase leading-[0.95] text-white md:mx-0"
          style={{
            background: "radial-gradient(circle, rgba(149,255,0,.18), rgba(0,0,0,.5) 70%)",
            boxShadow: "var(--shadow-glow), inset 0 0 30px rgba(149,255,0,.15)",
          }}
        >
          <div>
            <b className="block text-[42px] leading-none text-lime">100%</b>
            <span className="mt-1.5 block text-[22px] leading-none tracking-[0.04em]">Risk-Free</span>
            <small className="mt-2 block font-mono text-[11px] tracking-[0.12em] text-white/70">
              Guarantee
            </small>
          </div>
        </div>
        <div>
          <div className="kicker mb-3">One less thing to worry about</div>
          <h2 className="mb-4 font-display text-[clamp(38px,5.5vw,76px)] uppercase leading-[0.92] tracking-[0.04em] text-white text-balance">
            Finding out if you're ready is <Green>risk-free</Green>.
          </h2>
          <p className="max-w-[640px] text-base leading-[1.6] text-white/80">
            We're confident the assessment pays for itself many times over. So if we can't identify a
            realistic way to save your business at least 5 hours a week, we'll refund your $199 in full.
            The only real risk is waiting while everyone else gets ahead.
          </p>
        </div>
      </div>
    </section>
  );
}
