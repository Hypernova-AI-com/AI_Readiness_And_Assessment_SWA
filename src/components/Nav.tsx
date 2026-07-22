import { BRAND, NAV_LINKS } from "../data/content";

export default function Nav({ onCta }: { onCta: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-black/70 backdrop-blur-lg">
      <div className="container-x flex h-[74px] items-center justify-between gap-5">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label={`${BRAND.fullName} home`}>
          <span
            className="grid size-[42px] place-items-center rounded-full border border-lime/45 font-display text-[18px] tracking-wide text-lime"
            style={{
              background: "radial-gradient(circle, rgba(149,255,0,.28), rgba(21,23,26,.85) 62%)",
              boxShadow: "0 0 28px rgba(149,255,0,.22)",
            }}
          >
            {BRAND.mark}
          </span>
          <span className="hidden max-w-[232px] text-xs font-extrabold uppercase leading-[1.16] tracking-[0.02em] text-white sm:block">
            {BRAND.fullName}
            <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
              {BRAND.tagline}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-5 text-xs text-white/75 lg:flex" aria-label="Page sections">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-lime">
              {l.label}
            </a>
          ))}
        </nav>

        <button className="btn btn-primary" onClick={onCta}>
          Get My Assessment
        </button>
      </div>
    </header>
  );
}
