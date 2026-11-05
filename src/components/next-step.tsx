import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

// One clear workflow next step after a bench's results (engine chains,
// Brad's ruling 2026-11-05). A recipe's natural next step is what it
// costs — every bench points at the costing suite, the hub.
export function NextStep({
  to,
  label,
  blurb,
}: {
  to: string;
  label: string;
  blurb: string;
}) {
  return (
    <Link
      to={to}
      className="mt-10 block rounded-2xl bg-primary-soft p-5 transition-opacity hover:opacity-90 sm:p-6"
    >
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
        Next step
      </p>
      <p className="mt-2 inline-flex items-center gap-2 font-display text-2xl font-medium tracking-tight text-ink">
        {label}
        <ArrowRight className="size-5 text-primary" />
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {blurb}
      </p>
    </Link>
  );
}
