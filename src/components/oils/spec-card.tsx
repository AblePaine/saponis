import type { ReactNode } from "react";

export function SpecCard({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">{kicker}</p>
      <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
