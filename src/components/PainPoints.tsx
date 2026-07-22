import { PAINS } from "../data/content";
import SectionHead, { Green } from "./SectionHead";

/** The 6 pain cards use an asymmetric span pattern at wide widths, matching
 *  the original 12-col layout (4/2 · 3/3 · 2/4). */
const SPAN = [
  "xl:col-span-4",
  "xl:col-span-2",
  "xl:col-span-3",
  "xl:col-span-3",
  "xl:col-span-2",
  "xl:col-span-4",
];

export default function PainPoints() {
  return (
    <section id="pains" className="border-t border-hairline/70 py-20">
      <div className="container-x">
        <SectionHead
          kicker="Why now"
          title={
            <>
              The gap between <Green>AI-ready</Green> businesses and everyone else is widening.
            </>
          }
          lead="Every month you wait, the businesses that figured out AI pull further ahead. This gets you off the sidelines — the assessment finds out where you really stand, uncovers the pain points holding your business back, and shows you the AI tools that fix them."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
          {PAINS.map((p, i) => (
            <div
              key={p.n}
              className={`rounded-lg border border-hairline bg-surface-raised/70 p-5 ${SPAN[i]}`}
            >
              <b className="font-mono text-[11px] text-lime">{p.n}</b>
              <h3 className="mb-2 mt-2.5 text-base font-bold text-white">{p.title}</h3>
              <p className="text-xs leading-[1.5] text-white/65">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
