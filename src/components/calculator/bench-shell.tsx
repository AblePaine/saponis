import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SliderField } from "@/components/calculator/slider-field";
import { cn } from "@/lib/utils";

/** Page header shared by the balm / emulsion / cleanser benches. */
export function BenchHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-5">
      <Link to="/" search={{}} className="flex min-w-0 items-center gap-3">
        <BrandMark />
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
            {kicker}
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
        </div>
      </Link>
      <p className="max-w-2xl text-sm leading-relaxed text-muted">{lede}</p>
    </header>
  );
}

/** Sticky results panel shown beside the input steps on wide screens. */
export function BenchResults({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <section className="rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        <div className="px-4 py-3">
          <h2 className="font-display text-lg font-medium tracking-tight text-ink">
            {title}
          </h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <div className="border-t border-line px-4 pt-4 pb-4">{children}</div>
      </section>
    </aside>
  );
}

export function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function WarningList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {warnings.map((warning) => (
        <li
          key={warning}
          className="flex gap-2.5 rounded-xl bg-warn-soft px-3 py-3 text-sm leading-relaxed text-ink"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" />
          <span>{warning}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One ingredient row: a toggle plus a percent slider. Unchecked rows
 * contribute nothing.
 */
export function PercentRow({
  name,
  note,
  percent,
  onToggle,
  onPercent,
  max = 100,
}: {
  name: string;
  note?: string;
  percent: number | undefined;
  onToggle: (on: boolean) => void;
  onPercent: (percent: number) => void;
  max?: number;
}) {
  const on = percent !== undefined;
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 transition-colors",
        on ? "border-line bg-surface" : "border-line/60 bg-bg-subtle",
      )}
    >
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={on}
          onChange={(event) => onToggle(event.target.checked)}
          className="size-5 shrink-0 accent-[var(--color-primary)]"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {name}
          </span>
          {note ? (
            <span className="block truncate text-xs text-faint">{note}</span>
          ) : null}
        </span>
        <span className="font-mono text-sm tabular-nums text-muted">
          {on ? `${percent.toFixed(1)}%` : "—"}
        </span>
      </label>
      {on ? (
        <div className="mt-2">
          <SliderField
            min={0}
            max={max}
            step={0.5}
            value={percent}
            onChange={onPercent}
            unit="%"
            ariaLabel={`${name} percent`}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Two-column bench layout: input steps left, sticky results right. */
export function BenchLayout({
  steps,
  results,
}: {
  steps: ReactNode;
  results: ReactNode;
}) {
  return (
    <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col gap-4">{steps}</div>
      {results}
    </div>
  );
}
