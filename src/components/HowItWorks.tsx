import { STEPS } from "../data/content";
import SectionHead, { Green } from "./SectionHead";

export default function HowItWorks() {
  return (
    <section id="how" className="border-t border-hairline/70 py-20">
      <div className="container-x">
        <SectionHead
          kicker="How the assessment works"
          title={
            <>
              Diagnosis before the <Green>cure</Green>.
            </>
          }
          lead="Prescription without diagnosis is malpractice. In four simple steps we figure out where AI pays off first for your business — and hand you a plan you can act on."
        />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-hairline/90 bg-black/35 p-5">
              <strong className="mb-3 block font-mono text-base text-lime">{s.n}</strong>
              <h3 className="mb-1.5 text-base font-bold text-white">{s.title}</h3>
              <p className="leading-[1.5] text-white/70">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
