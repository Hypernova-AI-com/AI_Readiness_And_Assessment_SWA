import { REPORT_SLIDES } from "../data/content";
import SectionHead, { Green } from "./SectionHead";

export default function ReportPreview() {
  return (
    <section id="report" className="border-t border-hairline/70 py-20">
      <div className="container-x">
        <SectionHead
          kicker="What you walk away with"
          title={
            <>
              A report that makes AI <Green>obvious</Green>.
            </>
          }
          lead="Not 'AI transformation' in the abstract — a clear, prioritized roadmap you can understand and act on Monday morning, whether you build it yourself or with us."
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-[360px_1fr]">
          <div
            className="flex min-h-[420px] flex-col justify-between rounded-2xl border border-lime/35 p-6"
            style={{
              background:
                "radial-gradient(circle at 82% 20%, rgba(149,255,0,.2), transparent 32%), #15171a",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">
              HyperNova AI · Readiness Report
            </div>
            <div className="font-display text-[50px] uppercase leading-[0.92] text-white">
              HyperNova AI <span className="text-lime">Readiness</span> and Tools Assessment
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">
              Built from your discovery session
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REPORT_SLIDES.map((s) => (
              <div
                key={s.n}
                className="min-h-[118px] rounded-lg border border-hairline bg-surface-raised/70 p-4"
              >
                <b className="font-mono text-[11px] text-lime">{s.n}</b>
                <span className="mt-3 block font-extrabold leading-[1.2] text-white">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
