import { CLIENT_TYPES, TRUST_METRICS } from "../data/content";

export default function TrustBar() {
  return (
    <div className="border-t border-hairline/70 py-8">
      <div className="container-x flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-7">
          {TRUST_METRICS.map((m) => (
            <div key={m.value}>
              <b className="block font-display text-3xl leading-none text-lime">{m.value}</b>
              <span className="text-xs text-white/60">{m.label}</span>
            </div>
          ))}
        </div>
        <div
          className="flex flex-wrap items-center gap-5 font-mono text-xs uppercase tracking-[0.1em] text-white/40"
          aria-label="Client types"
        >
          {CLIENT_TYPES.map((c) => (
            <span key={c} className="rounded-lg border border-dashed border-white/15 px-3.5 py-2">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
