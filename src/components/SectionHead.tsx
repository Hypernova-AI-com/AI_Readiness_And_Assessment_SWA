import type { ReactNode } from "react";

/** Two-column section header (kicker + H2 on the left, lead paragraph right). */
export default function SectionHead({
  kicker,
  title,
  lead,
}: {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
}) {
  return (
    <div className="mb-9 grid items-end gap-7 md:grid-cols-[0.75fr_1fr]">
      <div>
        <div className="kicker mb-3">{kicker}</div>
        <h2 className="font-display text-[clamp(38px,5.5vw,76px)] uppercase leading-[0.92] tracking-[0.04em] text-white text-balance">
          {title}
        </h2>
      </div>
      <p className="max-w-[640px] text-base leading-[1.6] text-white/70">{lead}</p>
    </div>
  );
}

/** Highlighted lime span used inside headings. */
export function Green({ children }: { children: ReactNode }) {
  return (
    <span className="text-lime" style={{ textShadow: "0 0 34px rgba(149,255,0,.18)" }}>
      {children}
    </span>
  );
}
